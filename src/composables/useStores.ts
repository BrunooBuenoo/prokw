import { ref } from "vue"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase/config"
import type { Store } from "../types"

export function useStores() {
  const stores = ref<Store[]>([])
  const isLoading = ref(false)

  const loadStores = async (filters?: { status?: string }) => {
    isLoading.value = true
    try {
      let storeQuery = query(collection(db, "stores"), orderBy("createdAt", "desc"))

      if (filters?.status) {
        storeQuery = query(
          collection(db, "stores"),
          where("status", "==", filters.status),
          orderBy("createdAt", "desc"),
        )
      }

      const querySnapshot = await getDocs(storeQuery)

      stores.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Store[]
    } catch (error) {
      console.error("Error loading stores:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addStore = async (store: Omit<Store, "id">) => {
    try {
      isLoading.value = true

      const docRef = await addDoc(collection(db, "stores"), {
        ...store,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const newStore: Store = {
        ...store,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      stores.value.unshift(newStore)
      return docRef.id
    } catch (error) {
      console.error("Error adding store:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateStore = async (id: string, updates: Partial<Store>) => {
    try {
      isLoading.value = true

      await updateDoc(doc(db, "stores", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      const index = stores.value.findIndex((store) => store.id === id)
      if (index !== -1) {
        stores.value[index] = {
          ...stores.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error("Error updating store:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteStore = async (id: string) => {
    try {
      isLoading.value = true

      await deleteDoc(doc(db, "stores", id))

      const index = stores.value.findIndex((store) => store.id === id)
      if (index !== -1) {
        stores.value.splice(index, 1)
      }
    } catch (error) {
      console.error("Error deleting store:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getStoreById = (id: string) => {
    return stores.value.find((store) => store.id === id)
  }

  return {
    stores,
    isLoading,
    loadStores,
    addStore,
    updateStore,
    deleteStore,
    getStoreById,
  }
}
