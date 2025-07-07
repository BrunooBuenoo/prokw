import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import LoginView from '../views/LoginView.vue'
import Dashboard from '../views/Dashboard.vue'
import EquipmentView from '../views/EquipmentView.vue'
import StoresView from '../views/StoresView.vue'
import CompaniesView from '../views/CompaniesView.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/equipamentos',
    name: 'Equipamentos',
    component: EquipmentView,
    meta: { requiresAuth: true }
  },
  {
    path: '/lojas',
    name: 'Lojas',
    component: StoresView,
    meta: { requiresAuth: true }
  },
  {
    path: '/empresas',
    name: 'Empresas',
    component: CompaniesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/manutencoes',
    name: 'Manutencoes',
    component: () => import('../views/MaintenanceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/relatorios',
    name: 'Relatorios',
    component: () => import('../views/ReportsView.vue'),
    meta: { requiresAuth: true, roles: ['admin', 'diretor'] }
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true, roles: ['admin'] }
  },
  {
    path: '/',
    redirect: '/dashboard'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { currentUser, isLoading, hasPermission } = useAuth()

  // Wait for auth state to be determined
  if (isLoading.value) {
    await new Promise(resolve => {
      const unwatch = isLoading.value ? 
        setTimeout(() => resolve(true), 100) : 
        resolve(true)
    })
  }

  if (to.meta.requiresAuth) {
    if (!currentUser.value) {
      next('/login')
      return
    }

    if (to.meta.roles && !hasPermission(to.meta.roles as string[])) {
      next('/dashboard')
      return
    }
  }

  if (to.path === '/login' && currentUser.value) {
    next('/dashboard')
    return
  }

  next()
})

export default router