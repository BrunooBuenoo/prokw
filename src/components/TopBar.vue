<template>
  <header class="topbar">
    <div class="topbar-content">
      <div class="topbar-left">
        <button class="mobile-menu-btn" @click="$emit('toggleMobileMenu')">
          <font-awesome-icon :icon="['fas', 'bars']" />
        </button>
        
        <div class="search-container">
          <div class="search-box" :class="{ 'search-focused': isSearchFocused }">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input 
              type="text" 
              placeholder="Buscar equipamentos, lojas, usuários..."
              @input="handleSearch"
              @focus="isSearchFocused = true"
              @blur="isSearchFocused = false"
              class="search-input"
              v-model="searchQuery"
            />
            <div class="search-suggestions" v-if="isSearchFocused && searchQuery.length > 2">
              <div class="suggestion-item" v-for="suggestion in searchSuggestions" :key="suggestion.id">
                <font-awesome-icon :icon="suggestion.icon" class="suggestion-icon" />
                <div class="suggestion-content">
                  <span class="suggestion-title">{{ suggestion.title }}</span>
                  <span class="suggestion-type">{{ suggestion.type }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="topbar-right">
        <div class="topbar-actions">
          <button class="action-btn notification-btn" @click="toggleNotifications">
            <font-awesome-icon :icon="['fas', 'bell']" />
            <span class="notification-badge" v-if="notificationCount > 0">{{ notificationCount }}</span>
          </button>
          
          <div class="notifications-dropdown" v-if="showNotifications" @click.stop>
            <div class="notifications-header">
              <h3>Notificações</h3>
              <button class="mark-all-read" @click="markAllAsRead">
                Marcar todas como lidas
              </button>
            </div>
            <div class="notifications-list">
              <div class="notification-item" v-for="notification in notifications" :key="notification.id" :class="{ 'unread': !notification.read }">
                <div class="notification-icon" :class="notification.type">
                  <font-awesome-icon :icon="notification.icon" />
                </div>
                <div class="notification-content">
                  <p class="notification-text">{{ notification.message }}</p>
                  <span class="notification-time">{{ formatTime(notification.time) }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="user-menu" @click="toggleUserMenu">
            <div class="user-avatar">
              <img 
                v-if="currentUser?.photoURL" 
                :src="currentUser.photoURL" 
                :alt="currentUser.name"
                class="avatar-image"
              />
              <font-awesome-icon v-else :icon="['fas', 'user']" />
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.name || 'Usuário' }}</span>
              <span class="user-role">{{ getRoleText(currentUser?.role || '') }}</span>
            </div>
            <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-arrow" :class="{ 'rotated': showUserMenu }" />
          </div>
          
          <div class="user-dropdown" v-if="showUserMenu" @click.stop>
            <div class="dropdown-header">
              <div class="user-avatar-large">
                <img 
                  v-if="currentUser?.photoURL" 
                  :src="currentUser.photoURL" 
                  :alt="currentUser.name"
                  class="avatar-image"
                />
                <font-awesome-icon v-else :icon="['fas', 'user']" />
              </div>
              <div class="user-details">
                <h4>{{ currentUser?.name || 'Usuário' }}</h4>
                <p>{{ currentUser?.email }}</p>
                <span class="role-badge">{{ getRoleText(currentUser?.role || '') }}</span>
              </div>
            </div>
            <div class="dropdown-menu">
              <a href="#" class="dropdown-item">
                <font-awesome-icon :icon="['fas', 'user-cog']" />
                Perfil
              </a>
              <a href="#" class="dropdown-item">
                <font-awesome-icon :icon="['fas', 'cog']" />
                Configurações
              </a>
              <div class="dropdown-divider"></div>
              <button class="dropdown-item logout-item" @click="handleLogout">
                <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'

const { currentUser, logout } = useAuth()

const emit = defineEmits(['search', 'toggleMobileMenu'])

const searchQuery = ref('')
const isSearchFocused = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const notificationCount = ref(3)

const notifications = ref([
  {
    id: 1,
    message: 'Equipamento Dell OptiPlex precisa de manutenção',
    time: new Date(Date.now() - 1000 * 60 * 30),
    type: 'warning',
    icon: ['fas', 'exclamation-triangle'],
    read: false
  },
  {
    id: 2,
    message: 'Nova empresa terceira cadastrada',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2),
    type: 'info',
    icon: ['fas', 'building'],
    read: false
  },
  {
    id: 3,
    message: 'Relatório mensal gerado com sucesso',
    time: new Date(Date.now() - 1000 * 60 * 60 * 24),
    type: 'success',
    icon: ['fas', 'check-circle'],
    read: true
  }
])

const searchSuggestions = computed(() => {
  if (searchQuery.value.length < 2) return []
  
  return [
    {
      id: 1,
      title: 'Computador Dell OptiPlex',
      type: 'Equipamento',
      icon: ['fas', 'desktop']
    },
    {
      id: 2,
      title: 'Loja Centro',
      type: 'Loja',
      icon: ['fas', 'store']
    },
    {
      id: 3,
      title: 'João Silva',
      type: 'Usuário',
      icon: ['fas', 'user']
    }
  ].filter(item => 
    item.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  searchQuery.value = target.value
  emit('search', target.value)
}

const toggleNotifications = () => {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

const markAllAsRead = () => {
  notifications.value.forEach(notification => {
    notification.read = true
  })
  notificationCount.value = 0
}

const formatTime = (time: Date) => {
  const now = new Date()
  const diff = now.getTime() - time.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) return `${minutes}min atrás`
  if (hours < 24) return `${hours}h atrás`
  return `${days}d atrás`
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

const handleLogout = async () => {
  await logout()
  showUserMenu.value = false
}

const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  if (!target.closest('.topbar-actions')) {
    showNotifications.value = false
    showUserMenu.value = false
  }
  if (!target.closest('.search-container')) {
    isSearchFocused.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.topbar {
  height: 95px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: var(--backdrop-blur);
  /* border-bottom: 1px solid var(--color-gray-100); */
  position: sticky;
  top: 0;
  z-index: 50;
  /* box-shadow: var(--shadow-sm); */
}

.topbar-content {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  max-width: 100%;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  flex: 1;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-gray-600);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.mobile-menu-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-black);
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 500px;
}

.search-box {
  position: relative;
  transition: all var(--transition-fast);
}

.search-box.search-focused {
  transform: scale(1.02);
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
  z-index: 1;
  transition: color var(--transition-fast);
}

.search-focused .search-icon {
  color: var(--color-black);
}

.search-input {
  width: 100%;
  padding: var(--space-4) var(--space-6) var(--space-4) var(--space-12);
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-black);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.1);
}

.search-input::placeholder {
  color: var(--color-gray-400);
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  margin-top: var(--space-2);
  overflow: hidden;
  z-index: 1000;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid var(--color-gray-100);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: var(--color-gray-50);
}

.suggestion-icon {
  color: var(--color-gray-400);
  font-size: var(--font-size-lg);
}

.suggestion-content {
  display: flex;
  flex-direction: column;
}

.suggestion-title {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
}

.suggestion-type {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  position: relative;
}

.action-btn {
  position: relative;
  background: none;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-gray-600);
  font-size: var(--font-size-lg);
}

.action-btn:hover {
  background: var(--color-gray-100);
  color: var(--color-black);
  transform: scale(1.1);
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-error);
  color: var(--color-white);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  padding: 2px 6px;
  border-radius: var(--radius-full);
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 380px;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  margin-top: var(--space-2);
  z-index: 1000;
  overflow: hidden;
}

.notifications-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notifications-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin: 0;
}

.mark-all-read {
  background: none;
  border: none;
  color: var(--color-gray-600);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: color var(--transition-fast);
}

.mark-all-read:hover {
  color: var(--color-black);
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-100);
  transition: background var(--transition-fast);
  cursor: pointer;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background: var(--color-gray-50);
}

.notification-item.unread {
  background: var(--color-gray-50);
  border-left: 4px solid var(--color-black);
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.notification-icon.warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.notification-icon.info {
  background: var(--color-info-light);
  color: var(--color-info);
}

.notification-icon.success {
  background: var(--color-success-light);
  color: var(--color-success);
}

.notification-content {
  flex: 1;
}

.notification-text {
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
  margin: 0 0 var(--space-1) 0;
  line-height: var(--line-height-snug);
}

.notification-time {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
}

.user-menu:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-200);
}

.user-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  display: flex;
  flex-direction: column;
  text-align: left;
}

.user-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
  line-height: 1.2;
}

.user-role {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  text-transform: capitalize;
}

.dropdown-arrow {
  color: var(--color-gray-400);
  font-size: var(--font-size-sm);
  transition: transform var(--transition-fast);
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 280px;
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  margin-top: var(--space-2);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  text-align: center;
}

.user-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-full);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  font-size: var(--font-size-2xl);
  margin: 0 auto var(--space-4) auto;
}

.user-details h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin: 0 0 var(--space-1) 0;
}

.user-details p {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin: 0 0 var(--space-3) 0;
}

.role-badge {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.dropdown-menu {
  padding: var(--space-2);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--color-gray-700);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  border: none;
  background: none;
  width: 100%;
  cursor: pointer;
}

.dropdown-item:hover {
  background: var(--color-gray-100);
  color: var(--color-black);
}

.logout-item {
  color: var(--color-error);
}

.logout-item:hover {
  background: var(--color-error-light);
  color: var(--color-error);
}

.dropdown-divider {
  height: 1px;
  background: var(--color-gray-200);
  margin: var(--space-2) 0;
}

@media (max-width: 768px) {
  .topbar-content {
    padding: 0 var(--space-4);
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .search-container {
    max-width: 200px;
  }
  
  .user-info {
    display: none;
  }
  
  .notifications-dropdown,
  .user-dropdown {
    width: 300px;
    right: -50px;
  }
  
  .search-input {
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .search-container {
    display: none;
  }
  
  .notifications-dropdown,
  .user-dropdown {
    width: calc(100vw - 2rem);
    right: -1rem;
  }
}
</style>

