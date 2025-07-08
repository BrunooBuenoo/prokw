<template>
  <div class="users-view">
    <div class="users-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <font-awesome-icon :icon="['fas', 'users']" class="title-icon" />
            Gerenciamento de Usuários
          </h1>
          <p class="page-subtitle">Gerencie usuários, perfis de acesso e permissões do sistema</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" @click="openCreateModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Novo Usuário
          </button>
        </div>
      </div>
    </div>

    <div class="users-content">
      <!-- Filtros e Busca -->
      <div class="filters-section">
        <div class="filters-row">
          <div class="search-box">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input
              type="text"
              placeholder="Buscar por nome, email ou departamento..."
              v-model="searchQuery"
              class="search-input"
            />
          </div>
          
          <div class="filter-group">
            <select v-model="selectedRole" class="filter-select">
              <option value="">Todos os Perfis</option>
              <option value="admin">Admin TI</option>
              <option value="tecnico">Técnico TI</option>
              <option value="diretor">Diretor</option>
              <option value="visualizador">Visualizador</option>
            </select>
            
            <select v-model="selectedStatus" class="filter-select">
              <option value="">Todos os Status</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          
          <div class="action-buttons">
            <button class="btn btn-secondary" @click="exportToCSV">
              <font-awesome-icon :icon="['fas', 'download']" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      <!-- Estatísticas -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon admin">
            <font-awesome-icon :icon="['fas', 'user-shield']" />
          </div>
          <div class="stat-content">
            <h3>{{ userStats.admin }}</h3>
            <p>Administradores</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon tecnico">
            <font-awesome-icon :icon="['fas', 'user-cog']" />
          </div>
          <div class="stat-content">
            <h3>{{ userStats.tecnico }}</h3>
            <p>Técnicos</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon diretor">
            <font-awesome-icon :icon="['fas', 'user-tie']" />
          </div>
          <div class="stat-content">
            <h3>{{ userStats.diretor }}</h3>
            <p>Diretores</p>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon visualizador">
            <font-awesome-icon :icon="['fas', 'user']" />
          </div>
          <div class="stat-content">
            <h3>{{ userStats.visualizador }}</h3>
            <p>Visualizadores</p>
          </div>
        </div>
      </div>

      <!-- Lista de Usuários -->
      <div class="users-table-container">
        <div v-if="isLoading" class="loading-state">
          <font-awesome-icon :icon="['fas', 'spinner']" class="loading-icon" />
          <p>Carregando usuários...</p>
        </div>
        
        <div v-else-if="filteredUsers.length === 0" class="empty-state">
          <font-awesome-icon :icon="['fas', 'users']" class="empty-icon" />
          <h3>Nenhum usuário encontrado</h3>
          <p>Não há usuários que correspondam aos filtros selecionados.</p>
          <button class="btn btn-primary" @click="openCreateModal">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Criar Primeiro Usuário
          </button>
        </div>
        
        <div v-else class="users-table">
          <div class="table-header">
            <div class="header-cell">Usuário</div>
            <div class="header-cell">Perfil</div>
            <div class="header-cell">Departamento</div>
            <div class="header-cell">Status</div>
            <div class="header-cell">Último Acesso</div>
            <div class="header-cell">Ações</div>
          </div>
          
          <div class="table-body">
            <div 
              v-for="user in filteredUsers" 
              :key="user.uid" 
              class="table-row"
              :class="{ 'inactive': user.status === 'inativo' }"
            >
              <div class="cell user-cell">
                <div class="user-avatar">
                  <img 
                    v-if="user.photoURL" 
                    :src="user.photoURL" 
                    :alt="user.name"
                    class="avatar-image"
                  />
                  <font-awesome-icon v-else :icon="['fas', 'user']" />
                </div>
                <div class="user-info">
                  <h4>{{ user.name }}</h4>
                  <p>{{ user.email }}</p>
                  <span v-if="user.phone" class="user-phone">{{ formatPhone(user.phone) }}</span>
                </div>
              </div>
              
              <div class="cell">
                <span class="role-badge" :class="user.role">
                  {{ getRoleText(user.role) }}
                </span>
              </div>
              
              <div class="cell">
                <span class="department">{{ user.department || 'Não informado' }}</span>
              </div>
              
              <div class="cell">
                <span class="status-badge" :class="user.status || 'ativo'">
                  {{ user.status === 'inativo' ? 'Inativo' : 'Ativo' }}
                </span>
              </div>
              
              <div class="cell">
                <span class="last-login">
                  {{ user.lastLogin ? formatDate(user.lastLogin) : 'Nunca' }}
                </span>
              </div>
              
              <div class="cell actions-cell">
                <button 
                  class="action-btn view-btn" 
                  @click="viewUser(user)"
                  title="Ver detalhes"
                >
                  <font-awesome-icon :icon="['fas', 'eye']" />
                </button>
                <button 
                  class="action-btn edit-btn" 
                  @click="editUser(user)"
                  title="Editar usuário"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" />
                </button>
                <button 
                  class="action-btn delete-btn" 
                  @click="confirmDeleteUser(user)"
                  title="Excluir usuário"
                  :disabled="user.uid === currentUser?.uid"
                >
                   <font-awesome-icon :icon="['fas', 'trash']" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Criação/Edição -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            <font-awesome-icon :icon="['fas', isEditing ? 'edit' : 'plus']" />
            {{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}
          </h2>
          <button class="close-btn" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <div class="modal-body">
          <form @submit.prevent="saveUser" class="user-form">
            <!-- Informações Básicas -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'user']" />
                Informações Básicas
              </h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    v-model="userForm.name"
                    class="form-input"
                    :class="{ 'error': errors.name }"
                    placeholder="Digite o nome completo"
                    required
                  />
                  <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Email *</label>
                  <input
                    type="email"
                    v-model="userForm.email"
                    class="form-input"
                    :class="{ 'error': errors.email }"
                    placeholder="usuario@empresa.com"
                    required
                    :disabled="isEditing"
                  />
                  <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                  <small v-if="isEditing" class="form-help">O email não pode ser alterado</small>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Telefone</label>
                  <input
                    type="tel"
                    v-model="userForm.phone"
                    class="form-input"
                    placeholder="(11) 99999-9999"
                    @input="formatPhoneInput"
                  />
                </div>
                
                <div class="form-group">
                  <label class="form-label">Departamento</label>
                  <input
                    type="text"
                    v-model="userForm.department"
                    class="form-input"
                    placeholder="Ex: TI, Administrativo, Vendas"
                  />
                </div>
              </div>
            </div>

            <!-- Perfil de Acesso -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'shield']" />
                Perfil de Acesso
              </h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Perfil *</label>
                  <select
                    v-model="userForm.role"
                    class="form-select"
                    :class="{ 'error': errors.role }"
                    required
                  >
                    <option value="">Selecione um perfil</option>
                    <option value="admin">Admin TI</option>
                    <option value="tecnico">Técnico TI</option>
                    <option value="diretor">Diretor</option>
                    <option value="visualizador">Visualizador</option>
                  </select>
                  <span v-if="errors.role" class="error-message">{{ errors.role }}</span>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select v-model="userForm.status" class="form-select">
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
              
              <!-- Preview das Permissões -->
              <div v-if="userForm.role" class="permissions-preview">
                <h4>Permissões do Perfil: {{ getRoleText(userForm.role) }}</h4>
                <div class="permissions-grid">
                  <div 
                    v-for="permission in getRolePermissions(userForm.role)" 
                    :key="permission.key"
                    class="permission-item"
                    :class="{ 'allowed': permission.allowed }"
                  >
                    <font-awesome-icon 
                      :icon="permission.allowed ? ['fas', 'check'] : ['fas', 'times']" 
                      class="permission-icon"
                    />
                    <span>{{ permission.label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Senha (apenas para novos usuários) -->
            <div v-if="!isEditing" class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'lock']" />
                Senha de Acesso
              </h3>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Senha *</label>
                  <div class="password-input-group">
                    <input
                      :type="showPassword ? 'text' : 'password'"
                      v-model="userForm.password"
                      class="form-input"
                      :class="{ 'error': errors.password }"
                      placeholder="Digite a senha"
                      required
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="showPassword = !showPassword"
                    >
                      <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                    </button>
                  </div>
                  <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>
                
                <div class="form-group">
                  <label class="form-label">Confirmar Senha *</label>
                  <div class="password-input-group">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      v-model="userForm.confirmPassword"
                      class="form-input"
                      :class="{ 'error': errors.confirmPassword }"
                      placeholder="Confirme a senha"
                      required
                    />
                    <button
                      type="button"
                      class="password-toggle"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <font-awesome-icon :icon="['fas', showConfirmPassword ? 'eye-slash' : 'eye']" />
                    </button>
                  </div>
                  <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                </div>
              </div>
            </div>

            <!-- Aviso para edição -->
            <div v-if="isEditing" class="form-section">
              <div class="edit-notice">
                <font-awesome-icon :icon="['fas', 'info-circle']" />
                <p>Durante a edição, apenas os dados do perfil são atualizados. Para alterar senhas, use o Firebase Console.</p>
              </div>
            </div>
          </form>
        </div>
        
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn btn-primary" 
            @click="saveUser"
            :disabled="isSaving"
          >
            <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="loading-icon" />
            {{ isSaving ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Usuário') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast de Notificação -->
    <div v-if="showToast" class="toast" :class="toastType">
      <div class="toast-content">
        <font-awesome-icon :icon="toastIcon" class="toast-icon" />
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore'
import { 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth'
import { auth, db } from '../firebase/config'
import { useAuth } from '../composables/useAuth'
import type { User } from '../types'

const { currentUser } = useAuth()

// Estados principais
const users = ref<(User & { status?: string; phone?: string; department?: string })[]>([])
const isLoading = ref(false)
const isSaving = ref(false)
const isDeleting = ref(false)

// Estados dos modais
const showModal = ref(false)
const showViewModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const selectedUser = ref<User | null>(null)
const userToDelete = ref<User | null>(null)

// SOLUÇÃO: Armazenar UID separadamente para evitar perda de referência
const editingUserId = ref<string | null>(null)

// Estados de formulário
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Estados de toast
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')
const toastIcon = ref(['fas', 'check'])

// Filtros
const searchQuery = ref('')
const selectedRole = ref('')
const selectedStatus = ref('')

// Formulário de usuário
const userForm = ref({
  name: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  status: 'ativo',
  password: '',
  confirmPassword: ''
})

// Erros de validação
const errors = ref<Record<string, string>>({})

// Estatísticas de usuários
const userStats = computed(() => {
  const stats = {
    admin: 0,
    tecnico: 0,
    diretor: 0,
    visualizador: 0
  }
  
  users.value.forEach(user => {
    if (user.status !== 'inativo') {
      stats[user.role as keyof typeof stats]++
    }
  })
  
  return stats
})

// Usuários filtrados
const filteredUsers = computed(() => {
  let filtered = users.value
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(user =>
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.department && user.department.toLowerCase().includes(query))
    )
  }
  
  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }
  
  if (selectedStatus.value) {
    filtered = filtered.filter(user => (user.status || 'ativo') === selectedStatus.value)
  }
  
  return filtered
})

// Carregar usuários
const loadUsers = async () => {
  isLoading.value = true
  try {
    const usersQuery = query(collection(db, 'usuarios'), orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(usersQuery)
    
    users.value = querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        uid: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        lastLogin: data.lastLogin?.toDate?.()?.toISOString()
      }
    }) as (User & { status?: string; phone?: string; department?: string })[]
    
    console.log('Usuários carregados:', users.value.length)
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    showToastMessage('Erro ao carregar usuários', 'error')
  } finally {
    isLoading.value = false
  }
}

// Mostrar toast
const showToastMessage = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
  toastMessage.value = message
  toastType.value = type
  
  const icons = {
    success: ['fas', 'check'],
    error: ['fas', 'times'],
    warning: ['fas', 'exclamation-triangle']
  }
  
  toastIcon.value = icons[type]
  showToast.value = true
  
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// Abrir modal de criação
const openCreateModal = () => {
  isEditing.value = false
  editingUserId.value = null
  selectedUser.value = null
  resetForm()
  showModal.value = true
}

// FUNÇÃO CORRIGIDA - Editar usuário
const editUser = (user: User) => {
  console.log('🔧 EDITANDO usuário:', user)
  
  isEditing.value = true
  selectedUser.value = user
  editingUserId.value = user.uid // SOLUÇÃO: Armazenar UID separadamente
  
  console.log('📝 selectedUser definido como:', selectedUser.value)
  console.log('🆔 editingUserId definido como:', editingUserId.value)
  
  userForm.value = {
    name: user.name,
    email: user.email,
    phone: (user as any).phone || '',
    department: (user as any).department || '',
    role: user.role,
    status: (user as any).status || 'ativo',
    password: '',
    confirmPassword: ''
  }
  
  closeViewModal()
  showModal.value = true
  
  console.log('✅ Modal de edição aberto para:', user.name)
}

// Visualizar usuário
const viewUser = (user: User) => {
  selectedUser.value = user
  showViewModal.value = true
}

// Confirmar exclusão
const confirmDeleteUser = (user: User) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

// FUNÇÃO SAVEUSER COMPLETAMENTE CORRIGIDA
const saveUser = async () => {
  console.log('=== INÍCIO SAVEUSER ===')
  console.log('isEditing:', isEditing.value)
  console.log('selectedUser:', selectedUser.value)
  console.log('editingUserId:', editingUserId.value)
  
  if (!validateForm()) {
    console.log('❌ Validação falhou')
    return
  }
  
  isSaving.value = true
  
  try {
    // SOLUÇÃO: Usar editingUserId em vez de selectedUser
    if (isEditing.value && editingUserId.value) {
      // ============ MODO EDIÇÃO ============
      console.log('🔄 EDITANDO usuário existente:', editingUserId.value)
      
      const updates = {
        name: userForm.value.name,
        phone: userForm.value.phone.replace(/\D/g, ''),
        department: userForm.value.department,
        role: userForm.value.role,
        status: userForm.value.status,
        updatedAt: serverTimestamp()
      }
      
      // Atualizar APENAS no Firestore
      const userDocRef = doc(db, 'usuarios', editingUserId.value)
      await updateDoc(userDocRef, updates)
      
      console.log('✅ Usuário atualizado no Firestore')
      
      // Atualizar lista local
      const index = users.value.findIndex(u => u.uid === editingUserId.value)
      if (index !== -1) {
        users.value[index] = { 
          ...users.value[index], 
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
      
      showToastMessage('Usuário atualizado com sucesso!')
      
    } else {
      // ============ MODO CRIAÇÃO ============
      console.log('🆕 CRIANDO novo usuário')
      
      if (!userForm.value.password) {
        throw new Error('Senha é obrigatória para novos usuários')
      }
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userForm.value.email,
        userForm.value.password
      )
      
      await updateProfile(userCredential.user, {
        displayName: userForm.value.name
      })
      
      const userData = {
        uid: userCredential.user.uid,
        name: userForm.value.name,
        email: userForm.value.email,
        phone: userForm.value.phone.replace(/\D/g, ''),
        department: userForm.value.department,
        role: userForm.value.role,
        status: userForm.value.status,
        createdAt: serverTimestamp(),
        lastLogin: null
      }
      
      await setDoc(doc(db, 'usuarios', userCredential.user.uid), userData)
      
      users.value.unshift({
        ...userData,
        createdAt: new Date().toISOString()
      } as any)
      
      console.log('✅ Novo usuário criado')
      showToastMessage('Usuário criado com sucesso!')
    }
    
    closeModal()
    
  } catch (error) {
    console.error('❌ Erro ao salvar usuário:', error)
    
    let errorMessage = 'Erro ao salvar usuário'
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'Este email já está em uso'
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'A senha deve ter pelo menos 6 caracteres'
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Email inválido'
    } else if (error.message === 'Senha é obrigatória para novos usuários') {
      errorMessage = 'Senha é obrigatória para novos usuários'
    }
    
    showToastMessage(errorMessage, 'error')
  } finally {
    isSaving.value = false
    console.log('=== FIM SAVEUSER ===')
  }
}

// Excluir usuário
const deleteUser = async () => {
  if (!userToDelete.value) return
  
  isDeleting.value = true
  try {
    // Remover do Firestore
    await deleteDoc(doc(db, 'usuarios', userToDelete.value.uid))
    
    // Remover da lista local
    const index = users.value.findIndex(u => u.uid === userToDelete.value!.uid)
    if (index !== -1) {
      users.value.splice(index, 1)
    }
    
    showToastMessage('Usuário excluído com sucesso!')
    closeDeleteModal()
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    showToastMessage('Erro ao excluir usuário', 'error')
  } finally {
    isDeleting.value = false
  }
}

// VALIDAÇÃO CORRIGIDA
const validateForm = () => {
  console.log('=== VALIDAÇÃO ===')
  console.log('isEditing:', isEditing.value)
  
  errors.value = {}
  
  if (!userForm.value.name.trim()) {
    errors.value.name = 'Nome é obrigatório'
  }
  
  if (!userForm.value.email.trim()) {
    errors.value.email = 'Email é obrigatório'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.value.email)) {
    errors.value.email = 'Email inválido'
  }
  
  if (!userForm.value.role) {
    errors.value.role = 'Perfil é obrigatório'
  }
  
  // SENHA OBRIGATÓRIA APENAS PARA NOVOS USUÁRIOS
  if (!isEditing.value) {
    console.log('🔒 Validando senha para NOVO usuário')
    if (!userForm.value.password) {
      errors.value.password = 'Senha é obrigatória'
    } else if (userForm.value.password.length < 6) {
      errors.value.password = 'Senha deve ter pelo menos 6 caracteres'
    }
    
    if (userForm.value.password !== userForm.value.confirmPassword) {
      errors.value.confirmPassword = 'Senhas não coincidem'
    }
  } else {
    console.log('✏️ Editando usuário - senha não obrigatória')
  }
  
  const isValid = Object.keys(errors.value).length === 0
  console.log('Validação resultado:', isValid)
  console.log('Erros:', errors.value)
  
  return isValid
}

// Resetar formulário
const resetForm = () => {
  userForm.value = {
    name: '',
    email: '',
    phone: '',
    department: '',
    role: '',
    status: 'ativo',
    password: '',
    confirmPassword: ''
  }
  errors.value = {}
  showPassword.value = false
  showConfirmPassword.value = false
}

// Fechar modais
const closeModal = () => {
  console.log('🚪 Fechando modal')
  showModal.value = false
  resetForm()
  selectedUser.value = null
  editingUserId.value = null
  isEditing.value = false
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedUser.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  userToDelete.value = null
}

// Formatação
const formatPhone = (phone: string) => {
  if (!phone) return ''
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

const formatPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  
  if (value.length <= 11) {
    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`
    }
    userForm.value.phone = value
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('pt-BR')
}

const getRoleText = (role: string) => {
  const roles = {
    admin: 'Admin TI',
    tecnico: 'Técnico TI',
    diretor: 'Diretor',
    visualizador: 'Visualizador'
  }
  return roles[role as keyof typeof roles] || 'Usuário'
}

// Permissões por perfil
const getRolePermissions = (role: string) => {
  const allPermissions = [
    { key: 'view_dashboard', label: 'Visualizar Dashboard', description: 'Acesso ao painel principal' },
    { key: 'manage_equipment', label: 'Gerenciar Equipamentos', description: 'Criar, editar e excluir equipamentos' },
    { key: 'manage_maintenance', label: 'Gerenciar Manutenções', description: 'Registrar e acompanhar manutenções' },
    { key: 'manage_stores', label: 'Gerenciar Lojas', description: 'Cadastrar e editar informações de lojas' },
    { key: 'manage_companies', label: 'Gerenciar Empresas', description: 'Cadastrar empresas terceirizadas' },
    { key: 'view_reports', label: 'Visualizar Relatórios', description: 'Acesso a relatórios e estatísticas' },
    { key: 'manage_users', label: 'Gerenciar Usuários', description: 'Criar e editar contas de usuário' },
    { key: 'system_settings', label: 'Configurações do Sistema', description: 'Alterar configurações gerais' }
  ]
  
  const rolePermissions: Record<string, string[]> = {
    admin: ['view_dashboard', 'manage_equipment', 'manage_maintenance', 'manage_stores', 'manage_companies', 'view_reports', 'manage_users', 'system_settings'],
    tecnico: ['view_dashboard', 'manage_equipment', 'manage_maintenance', 'manage_stores', 'manage_companies'],
    diretor: ['view_dashboard', 'view_reports', 'manage_stores'],
    visualizador: ['view_dashboard']
  }
  
  const allowedPermissions = rolePermissions[role] || []
  
  return allPermissions.map(permission => ({
    ...permission,
    allowed: allowedPermissions.includes(permission.key)
  }))
}

// Exportar CSV
const exportToCSV = () => {
  const headers = ['Nome', 'Email', 'Perfil', 'Departamento', 'Status', 'Telefone', 'Último Acesso']
  const rows = filteredUsers.value.map(user => [
    user.name,
    user.email,
    getRoleText(user.role),
    user.department || '',
    user.status === 'inativo' ? 'Inativo' : 'Ativo',
    user.phone || '',
    user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'
  ])
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Carregar dados ao montar
onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
/* Mantendo todos os estilos originais */
.users-view {
  padding: var(--space-6);
  max-width: 100%;
  margin: 0 auto;
}

.users-header {
  margin-bottom: var(--space-8);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-6);
}

.header-left {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
  margin: 0 0 var(--space-2) 0;
}

.title-icon {
  color: var(--color-gray-600);
}

.page-subtitle {
  font-size: var(--font-size-lg);
  color: var(--color-gray-600);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.users-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.filters-section {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
}

.filters-row {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
}

.search-input {
  width: 100%;
  padding: var(--space-3) var(--space-4) var(--space-3) var(--space-12);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  gap: var(--space-3);
}

.filter-select {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  background: var(--color-white);
  min-width: 150px;
}

.action-buttons {
  display: flex;
  gap: var(--space-3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: var(--color-white);
}

.stat-icon.admin {
  background: var(--color-error);
}

.stat-icon.tecnico {
  background: var(--color-info);
}

.stat-icon.diretor {
  background: var(--color-warning);
}

.stat-icon.visualizador {
  background: var(--color-success);
}

.stat-content h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
  margin: 0;
}

.stat-content p {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0;
}

.users-table-container {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  overflow: hidden;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-16);
  text-align: center;
}

.loading-icon {
  font-size: var(--font-size-2xl);
  color: var(--color-gray-400);
  margin-bottom: var(--space-4);
  animation: spin 1s linear infinite;
}

.empty-icon {
  font-size: var(--font-size-5xl);
  color: var(--color-gray-300);
  margin-bottom: var(--space-4);
}

.empty-state h3 {
  font-size: var(--font-size-xl);
  color: var(--color-gray-700);
  margin: 0 0 var(--space-2) 0;
}

.empty-state p {
  color: var(--color-gray-500);
  margin: 0 0 var(--space-6) 0;
}

.users-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 100px 150px 120px;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  background: var(--color-gray-50);
  border-bottom: 1px solid var(--color-gray-200);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
}

.table-body {
  display: flex;
  flex-direction: column;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 100px 150px 120px;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  transition: background var(--transition-fast);
  align-items: center;
}

.table-row:hover {
  background: var(--color-gray-50);
}

.table-row.inactive {
  opacity: 0.6;
}

.table-row:last-child {
  border-bottom: none;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-900);
  margin: 0 0 var(--space-1) 0;
}

.user-info p {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin: 0;
}

.user-phone {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  display: block;
}

.role-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-badge.admin {
  background: var(--color-error-light);
  color: var(--color-error);
}

.role-badge.tecnico {
  background: var(--color-info-light);
  color: var(--color-info);
}

.role-badge.diretor {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.role-badge.visualizador {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-badge.ativo {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.inativo {
  background: var(--color-gray-200);
  color: var(--color-gray-600);
}

.department {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
}

.last-login {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.actions-cell {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.view-btn {
  background: var(--color-info-light);
  color: var(--color-info);
}

.view-btn:hover {
  background: var(--color-info);
  color: var(--color-white);
}

.edit-btn {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.edit-btn:hover {
  background: var(--color-warning);
  color: var(--color-white);
}

.delete-btn {
  background: var(--color-error-light);
  color: var(--color-error);
}

.delete-btn:hover:not(:disabled) {
  background: var(--color-error);
  color: var(--color-white);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal-content {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-200);
}

.modal-header h2 {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin: 0;
}

.close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-gray-500);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-6);
  border-top: 1px solid var(--color-gray-200);
}

/* Form Styles */
.user-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin: 0;
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-gray-200);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input,
.form-select {
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.form-input.error,
.form-select.error {
  border-color: var(--color-error);
}

.form-help {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--color-error);
}

.password-input-group {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: var(--space-1);
}

.edit-notice {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-info-light);
  border: 1px solid var(--color-info);
  border-radius: var(--radius-lg);
  color: var(--color-info);
}

.edit-notice p {
  margin: 0;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
}

/* Permissions Preview */
.permissions-preview {
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  margin-top: var(--space-2);
}

.permissions-preview h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
  margin: 0 0 var(--space-3) 0;
}

.permissions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-2);
}

.permission-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
}

.permission-item.allowed {
  background: var(--color-success-light);
  color: var(--color-success);
}

.permission-item:not(.allowed) {
  background: var(--color-gray-200);
  color: var(--color-gray-500);
}

.permission-icon {
  font-size: var(--font-size-xs);
}

/* Toast */
.toast {
  position: fixed;
  top: var(--space-6);
  right: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-gray-200);
  padding: var(--space-4);
  z-index: 1100;
  animation: slideIn 0.3s ease-out;
}

.toast.success {
  border-left: 4px solid var(--color-success);
}

.toast.error {
  border-left: 4px solid var(--color-error);
}

.toast.warning {
  border-left: 4px solid var(--color-warning);
}

.toast-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.toast-icon {
  font-size: var(--font-size-lg);
}

.toast.success .toast-icon {
  color: var(--color-success);
}

.toast.error .toast-icon {
  color: var(--color-error);
}

.toast.warning .toast-icon {
  color: var(--color-warning);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .users-view {
    padding: var(--space-4);
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .filter-group {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 1fr;
    gap: var(--space-2);
  }
  
  .table-header {
    display: none;
  }
  
  .table-row {
    display: flex;
    flex-direction: column;
    padding: var(--space-4);
    border: 1px solid var(--color-gray-200);
    border-radius: var(--radius-lg);
    margin-bottom: var(--space-2);
  }
  
  .modal-content {
    margin: var(--space-4);
    max-height: calc(100vh - 2rem);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .toast {
    top: var(--space-4);
    right: var(--space-4);
    left: var(--space-4);
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
