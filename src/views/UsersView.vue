<template>
  <div class="users-view">
    <div class="users-header">
      <h1>Usuários</h1>
      <button class="btn btn-primary" @click="showAddModal = true">
        <font-awesome-icon :icon="['fas', 'user-plus']" />
        Novo Usuário
      </button>
    </div>
    
    <div class="users-content">
      <div class="card">
        <div class="card-header">
          <h3>Usuários do Sistema</h3>
          <div class="search-box">
            <input 
              type="text" 
              placeholder="Buscar usuário..." 
              class="form-input"
              v-model="searchQuery"
            />
          </div>
        </div>
        
        <div class="card-body">
          <table class="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Último Acesso</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" :class="user.role">
                    {{ getRoleText(user.role) }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" :class="user.status">
                    {{ user.status }}
                  </span>
                </td>
                <td>{{ formatDate(user.lastAccess) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-secondary" @click="viewUser(user)">
                      <font-awesome-icon :icon="['fas', 'eye']" />
                    </button>
                    <button class="btn btn-sm btn-primary" @click="editUser(user)">
                      <font-awesome-icon :icon="['fas', 'edit']" />
                    </button>
                    <button 
                      class="btn btn-sm btn-error" 
                      @click="toggleUserStatus(user)"
                      :title="user.status === 'ativo' ? 'Desativar' : 'Ativar'"
                    >
                      <font-awesome-icon 
                        :icon="user.status === 'ativo' ? ['fas', 'user-slash'] : ['fas', 'user-check']" 
                      />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const showAddModal = ref(false)
const searchQuery = ref('')

// Mock data
const users = ref([
  {
    id: '1',
    name: 'João Silva',
    email: 'joao@empresa.com',
    role: 'admin',
    status: 'ativo',
    lastAccess: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Maria Santos',
    email: 'maria@empresa.com',
    role: 'tecnico',
    status: 'ativo',
    lastAccess: '2024-01-14T16:45:00Z'
  },
  {
    id: '3',
    name: 'Pedro Oliveira',
    email: 'pedro@empresa.com',
    role: 'diretor',
    status: 'ativo',
    lastAccess: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    name: 'Ana Costa',
    email: 'ana@empresa.com',
    role: 'visualizador',
    status: 'inativo',
    lastAccess: '2024-01-10T14:20:00Z'
  }
])

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  )
})

const getRoleText = (role: string) => {
  const roles = {
    admin: 'Admin TI',
    tecnico: 'Técnico TI',
    diretor: 'Diretor',
    visualizador: 'Visualizador'
  }
  return roles[role as keyof typeof roles] || role
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const viewUser = (user: any) => {
  console.log('View user:', user)
}

const editUser = (user: any) => {
  console.log('Edit user:', user)
}

const toggleUserStatus = (user: any) => {
  user.status = user.status === 'ativo' ? 'inativo' : 'ativo'
  console.log('Toggle user status:', user)
}
</script>

<style scoped>
.users-view {
  padding: var(--spacing-6);
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.users-header h1 {
  margin: 0;
  color: var(--neutral-900);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-box {
  width: 300px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--neutral-200);
}

.table th {
  background-color: var(--neutral-50);
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-700);
}

.table tbody tr:hover {
  background-color: var(--neutral-50);
}

.role-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.role-badge.admin {
  background-color: var(--error-100);
  color: var(--error-700);
}

.role-badge.tecnico {
  background-color: var(--primary-100);
  color: var(--primary-700);
}

.role-badge.diretor {
  background-color: var(--accent-100);
  color: var(--accent-700);
}

.role-badge.visualizador {
  background-color: var(--neutral-100);
  color: var(--neutral-700);
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.status-badge.ativo {
  background-color: var(--success-100);
  color: var(--success-700);
}

.status-badge.inativo {
  background-color: var(--neutral-100);
  color: var(--neutral-700);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-2);
}

@media (max-width: 768px) {
  .users-view {
    padding: var(--spacing-4);
  }
  
  .users-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }
  
  .card-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
  
  .table {
    font-size: var(--font-size-sm);
  }
}
</style>