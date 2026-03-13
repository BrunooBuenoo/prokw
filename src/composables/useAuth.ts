import { ref, computed, onMounted } from "vue"
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"
import { auth, googleProvider, db } from "../firebase/config"
import type { User } from "../types"

const currentUser = ref<User | null>(null)
const isLoading = ref(true)

export function useAuth() {
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // CORRIGIDO: Usar 'usuarios' em vez de 'users'
      const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        currentUser.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name || firebaseUser.displayName || "Usuário",
          role: userData.role || "visualizador",
          photoURL: firebaseUser.photoURL ?? undefined,
          createdAt: userData.createdAt,
          lastLogin: new Date().toISOString(),
        }

        // Update last login
        await setDoc(
          doc(db, "usuarios", firebaseUser.uid), // CORRIGIDO
          {
            ...userData,
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        )

        return true
      } else {
        // Create user document if it doesn't exist
        const newUserData = {
          name: firebaseUser.displayName || "Usuário",
          email: firebaseUser.email,
          role: "visualizador",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        }

        await setDoc(doc(db, "usuarios", firebaseUser.uid), newUserData) // CORRIGIDO

        currentUser.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          name: newUserData.name,
          role: newUserData.role as 'admin' | 'tecnico' | 'diretor' | 'visualizador',
          photoURL: firebaseUser.photoURL ?? undefined,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString(),
        }

        return true
      }
    } catch (error: any) {
      console.error("Error logging in:", error)

      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new Error("Email ou senha incorretos")
        case "auth/too-many-requests":
          throw new Error("Muitas tentativas. Tente novamente mais tarde.")
        case "auth/user-disabled":
          throw new Error("Conta desabilitada. Entre em contato com o suporte.")
        default:
          throw new Error("Erro ao fazer login. Tente novamente.")
      }
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      isLoading.value = true

      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      // CORRIGIDO: Usar 'usuarios' em vez de 'users'
      const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid))

      let userData
      if (userDoc.exists()) {
        userData = userDoc.data()
        // Update last login
        await setDoc(
          doc(db, "usuarios", firebaseUser.uid), // CORRIGIDO
          {
            ...userData,
            lastLogin: serverTimestamp(),
          },
          { merge: true },
        )
      } else {
        // Create new user document
        userData = {
          name: firebaseUser.displayName || "Usuário",
          email: firebaseUser.email,
          role: "visualizador",
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
        }
        await setDoc(doc(db, "usuarios", firebaseUser.uid), userData) // CORRIGIDO
      }

      const user: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name: userData.name || firebaseUser.displayName || "Usuário",
        role: userData.role || "visualizador",
        photoURL: firebaseUser.photoURL ?? undefined,
        createdAt: userData.createdAt,
        lastLogin: new Date().toISOString(),
      }

      currentUser.value = user
      return { success: true, user }
    } catch (error: any) {
      console.error("Error with Google login:", error)

      if (error.code === "auth/popup-closed-by-user") {
        return { success: false, error: "Login cancelado pelo usuário" }
      }

      return { success: false, error: "Erro ao fazer login com Google" }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      isLoading.value = true

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update display name
      await updateProfile(firebaseUser, { displayName: name })

      // Create user document in Firestore
      const userData = {
        name,
        email,
        role: "visualizador",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      }

      await setDoc(doc(db, "usuarios", firebaseUser.uid), userData) // CORRIGIDO

      currentUser.value = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!,
        name,
        role: "visualizador",
        photoURL: firebaseUser.photoURL ?? undefined,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      }

      return true
    } catch (error: any) {
      console.error("Error registering:", error)

      switch (error.code) {
        case "auth/email-already-in-use":
          throw new Error("Este email já está em uso")
        case "auth/weak-password":
          throw new Error("A senha deve ter pelo menos 6 caracteres")
        case "auth/invalid-email":
          throw new Error("Email inválido")
        default:
          throw new Error("Erro ao criar conta. Tente novamente.")
      }
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
      currentUser.value = null
    } catch (error) {
      console.error("Error logging out:", error)
      throw new Error("Erro ao fazer logout")
    }
  }

  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!currentUser.value) return false
    return requiredRoles.includes(currentUser.value.role)
  }

  const canManageEquipments = computed(() => hasPermission(["admin", "tecnico"]))
  const canViewReports = computed(() => hasPermission(["admin", "diretor"]))
  const canManageUsers = computed(() => hasPermission(["admin"]))

  // Initialize auth state listener
  onMounted(() => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // CORRIGIDO: Usar 'usuarios' em vez de 'users'
          const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            currentUser.value = {
              uid: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || firebaseUser.displayName || "Usuário",
              role: userData.role || "visualizador",
              photoURL: firebaseUser.photoURL ?? undefined,
              createdAt: userData.createdAt,
              lastLogin: userData.lastLogin,
            }
          }
        } catch (error) {
          console.error("Error loading user data:", error)
        }
      } else {
        currentUser.value = null
      }
      isLoading.value = false
    })
  })

  return {
    currentUser,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    hasPermission,
    canManageEquipments,
    canViewReports,
    canManageUsers,
  }
}