import { ref, computed } from 'vue'
import type { User } from '../types'

// USUÁRIOS MOCADOS PARA DESENVOLVIMENTO
const mockUsers = {
  'admin@teste.com': {
    uid: 'mock-admin-123',
    email: 'admin@teste.com',
    name: 'Admin Teste',
    role: 'admin' as const,
    password: '123456',
    photoURL: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  'tecnico@teste.com': {
    uid: 'mock-tecnico-456',
    email: 'tecnico@teste.com',
    name: 'Técnico Teste',
    role: 'tecnico' as const,
    password: '123456',
    photoURL: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  'diretor@teste.com': {
    uid: 'mock-diretor-789',
    email: 'diretor@teste.com',
    name: 'Diretor Teste',
    role: 'diretor' as const,
    password: '123456',
    photoURL: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  },
  'visualizador@teste.com': {
    uid: 'mock-visualizador-101',
    email: 'visualizador@teste.com',
    name: 'Visualizador Teste',
    role: 'visualizador' as const,
    password: '123456',
    photoURL: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  }
}

const currentUser = ref<User | null>(null)
const isLoading = ref(false)

export function useAuth() {
  const login = async (email: string, password: string): Promise<boolean> => {
    isLoading.value = true
    
    try {
      // Verificar se é um usuário mocado
      const mockUser = mockUsers[email as keyof typeof mockUsers]
      if (mockUser && mockUser.password === password) {
        // Login com usuário mocado
        const { password: _, ...userWithoutPassword } = mockUser
        currentUser.value = userWithoutPassword as User
        
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        return true
      }
      
      // Se não for usuário mocado, retornar erro
      return false
      
    } catch (error) {
      console.error('Error logging in:', error)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const loginWithGoogle = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Para desenvolvimento, simular login com Google usando usuário admin
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const mockUser = mockUsers['admin@teste.com']
      const { password: _, ...userWithoutPassword } = mockUser
      currentUser.value = userWithoutPassword as User
      
      return { success: true, user: currentUser.value }
    } catch (error: any) {
      console.error('Error with Google login:', error)
      return { success: false, error: 'Erro ao fazer login com Google' }
    }
  }

  const logout = async (): Promise<void> => {
    try {
      currentUser.value = null
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!currentUser.value) return false
    return requiredRoles.includes(currentUser.value.role)
  }

  const canManageEquipments = computed(() => 
    hasPermission(['admin', 'tecnico'])
  )

  const canViewReports = computed(() => 
    hasPermission(['admin', 'diretor'])
  )

  const canManageUsers = computed(() => 
    hasPermission(['admin'])
  )

  return {
    currentUser,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    hasPermission,
    canManageEquipments,
    canViewReports,
    canManageUsers
  }
}