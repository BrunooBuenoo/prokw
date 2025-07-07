<template>
  <aside class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }">
    <div class="sidebar-header">
      <div class="logo" @click="toggleSidebar">
        <div class="logo-icon">
          <font-awesome-icon :icon="['fas', 'cogs']" />
        </div>
        <div class="logo-text" v-show="!isCollapsed">
          <span class="logo-title">InfraKW</span>
          <span class="logo-subtitle">Gestão de TI</span>
        </div>
      </div>
      <button class="collapse-btn" @click="toggleSidebar" v-show="!isMobile">
        <font-awesome-icon :icon="isCollapsed ? ['fas', 'chevron-right'] : ['fas', 'chevron-left']" />
      </button>
    </div>
    
    <nav class="sidebar-nav">
      <div class="nav-section">
        <h3 class="nav-section-title" v-show="!isCollapsed">Principal</h3>
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/dashboard" class="nav-link" v-tooltip="isCollapsed ? 'Dashboard' : ''">
              <div class="nav-icon">
                <font-awesome-icon :icon="['fas', 'chart-line']" />
              </div>
              <span class="nav-text" v-show="!isCollapsed">Dashboard</span>
              <div class="nav-indicator"></div>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link to="/equipamentos" class="nav-link" v-tooltip="isCollapsed ? 'Equipamentos' : ''">
              <div class="nav-icon">
                <font-awesome-icon :icon="['fas', 'desktop']" />
              </div>
              <span class="nav-text" v-show="!isCollapsed">Equipamentos</span>
              <div class="nav-indicator"></div>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link to="/manutencoes" class="nav-link" v-tooltip="isCollapsed ? 'Manutenções' : ''">
              <div class="nav-icon">
                <font-awesome-icon :icon="['fas', 'wrench']" />
              </div>
              <span class="nav-text" v-show="!isCollapsed">Manutenções</span>
              <div class="nav-indicator"></div>
            </router-link>
          </li>
        </ul>
      </div>
      
      <div class="nav-section">
        <h3 class="nav-section-title" v-show="!isCollapsed">Gestão</h3>
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/lojas" class="nav-link" v-tooltip="isCollapsed ? 'Lojas' : ''">
              <div class="nav-icon">
                <font-awesome-icon :icon="['fas', 'store']" />
              </div>
              <span class="nav-text" v-show="!isCollapsed">Lojas</span>
              <div class="nav-indicator"></div>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link to="/empresas" class="nav-link" v-tooltip="isCollapsed ? 'Empresas' : ''">
              <div class="nav-icon">
                <font-awesome-icon :icon="['fas', 'building']" />
              </div>
              <span class="nav-text" v-show="!isCollapsed">Empresas</span>
              <div class="nav-indicator"></div>
            </router-link>
          </li>
          
          <li class="nav-item">
            <router-link to="/usuarios" class="nav-link" v-tooltip="isCollapsed ? 'Usuários' : ''">
              <div class="nav-icon">
                <font-awesome-icon :icon="['fas', 'users']" />
              </div>
              <span class="nav-text" v-show="!isCollapsed">Usuários</span>
              <div class="nav-indicator"></div>
            </router-link>
          </li>
        </ul>
      </div>
      
      <div class="nav-section">
        <h3 class="nav-section-title" v-show="!isCollapsed">Relatórios</h3>
        <ul class="nav-list">
          <li class="nav-item">
            <router-link to="/relatorios" class="nav-link" v-tooltip="isCollapsed ? 'Relatórios' : ''">
              <div class="nav-icon">
                <font-awesome-icon :icon="['fas', 'chart-bar']" />
              </div>
              <span class="nav-text" v-show="!isCollapsed">Relatórios</span>
              <div class="nav-indicator"></div>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
    
    <div class="sidebar-footer" v-show="!isCollapsed">
      <div class="user-card">
        <div class="user-avatar">
          <font-awesome-icon :icon="['fas', 'user']" />
        </div>
        <div class="user-info">
          <span class="user-name">Sistema InfraKW</span>
          <span class="user-status">Online</span>
        </div>
      </div>
    </div>
  </aside>
  
  <!-- Mobile Overlay -->
  <div v-if="isMobileMenuOpen" class="mobile-overlay" @click="closeMobileMenu"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isCollapsed = ref(false)
const isMobile = ref(false)
const isMobileMenuOpen = ref(false)

const toggleSidebar = () => {
  if (isMobile.value) {
    isMobileMenuOpen.value = !isMobileMenuOpen.value
  } else {
    isCollapsed.value = !isCollapsed.value
  }
}

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768
  if (isMobile.value) {
    isCollapsed.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<style scoped>
.sidebar {
  width: 280px;
  background: var(--color-white);
  /* border-right: 1px solid var(--color-gray-100); */
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
  /* box-shadow: var(--shadow-lg); */
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logo:hover {
  transform: scale(1.02);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--color-black), var(--color-gray-800));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  color: var(--color-white);
  /* box-shadow: var(--shadow-md); */
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.logo-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  line-height: 1.2;
}

.logo-subtitle {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.collapse-btn {
  background: var(--color-gray-100);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-gray-600);
}

.collapse-btn:hover {
  background: var(--color-gray-200);
  color: var(--color-black);
  transform: scale(1.1);
}

.sidebar-nav {
  flex: 1;
  padding: var(--space-6) 0;
  overflow-y: auto;
}

.nav-section {
  margin-bottom: var(--space-8);
}

.nav-section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 var(--space-6) var(--space-4) var(--space-6);
}

.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-item {
  margin-bottom: var(--space-1);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-6);
  color: var(--color-gray-600);
  text-decoration: none;
  transition: all var(--transition-fast);
  position: relative;
  border-radius: 0;
}

.nav-link:hover {
  background: var(--color-gray-50);
  color: var(--color-black);
  transform: translateX(4px);
}

.nav-link.router-link-active {
  background: linear-gradient(90deg, var(--color-black), transparent);
  color: var(--color-white);
  font-weight: var(--font-weight-medium);
}

.nav-link.router-link-active .nav-icon {
  color: var(--color-white);
}

.nav-link.router-link-active .nav-indicator {
  opacity: 1;
  transform: scaleY(1);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.nav-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-indicator {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%) scaleY(0);
  width: 4px;
  height: 24px;
  background: var(--color-white);
  border-radius: var(--radius-full);
  opacity: 0;
  transition: all var(--transition-fast);
}

.sidebar-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-gray-100);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
}

.user-card:hover {
  background: var(--color-gray-100);
  transform: translateY(-1px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600);
  font-size: var(--font-size-lg);
}

.user-info {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.user-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-900);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  font-size: var(--font-size-xs);
  color: var(--color-success);
}

.mobile-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: var(--backdrop-blur-sm);
  z-index: 99;
  display: none;
}

/* Collapsed state adjustments */
.sidebar-collapsed .nav-link {
  justify-content: center;
  padding: var(--space-4);
}

.sidebar-collapsed .nav-section-title {
  display: none;
}

/* Mobile styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    z-index: 101;
  }
  
  .sidebar.mobile-open {
    transform: translateX(0);
  }
  
  .mobile-overlay {
    display: block;
  }
  
  .collapse-btn {
    display: none;
  }
}

/* Tooltip for collapsed state */
[v-tooltip] {
  position: relative;
}

[v-tooltip]:hover::after {
  content: attr(v-tooltip);
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: var(--color-black);
  color: var(--color-white);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  z-index: 1000;
  margin-left: var(--space-2);
  opacity: 0;
  animation: tooltipFadeIn var(--transition-fast) forwards;
}

@keyframes tooltipFadeIn {
  to {
    opacity: 1;
  }
}

/* Scrollbar customization */
.sidebar-nav::-webkit-scrollbar {
  width: 4px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--color-gray-300);
  border-radius: var(--radius-full);
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: var(--color-gray-400);
}
</style>