import { ref } from 'vue'
import type { DashboardStats, Equipment, Maintenance, Store } from '../types'
import { useEquipments } from './useEquipments'
import { useStores } from './useStores'
import { useCompanies } from './useCompanies'

export function useDashboard() {
  const stats = ref<DashboardStats>({
    totalEquipments: 0,
    equipmentsByStore: {},
    inMaintenanceCount: 0,
    warrantyExpiringSoon: 0,
    noMaintenanceCount: 0,
    monthlyMaintenanceCost: 0,
    totalUsers: 4, // Usuários mocados
    totalStores: 0,
    totalCompanies: 0
  })
  
  const recentMaintenances = ref<any[]>([])
  const alerts = ref<any[]>([])
  const isLoading = ref(false)

  const { equipments, loadEquipments } = useEquipments()
  const { stores, loadStores } = useStores()
  const { companies, loadCompanies } = useCompanies()

  const loadDashboardData = async () => {
    isLoading.value = true
    try {
      await Promise.all([
        loadEquipmentStats(),
        loadMaintenanceStats(),
        loadRecentMaintenances(),
        loadAlerts(),
        loadStoreCount(),
        loadCompanyCount()
      ])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      isLoading.value = false
    }
  }

  const loadEquipmentStats = async () => {
    try {
      await loadEquipments()
      await loadStores()
      
      // Calculate stats
      stats.value.totalEquipments = equipments.value.length
      
      // Count equipments by store
      const equipmentsByStore: { [key: string]: number } = {}
      equipments.value.forEach(equipment => {
        const store = stores.value.find(s => s.name === equipment.store)
        const storeName = store?.name || equipment.store || 'Loja não encontrada'
        equipmentsByStore[storeName] = (equipmentsByStore[storeName] || 0) + 1
      })
      stats.value.equipmentsByStore = equipmentsByStore
      
      // Count equipments in maintenance
      stats.value.inMaintenanceCount = equipments.value.filter(eq => eq.status === 'manutencao').length
      
      // Count warranty expiring soon (next 30 days)
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
      stats.value.warrantyExpiringSoon = equipments.value.filter(eq => {
        if (!eq.warrantyUntil) return false
        const warrantyDate = new Date(eq.warrantyUntil)
        return warrantyDate >= today && warrantyDate <= thirtyDaysFromNow
      }).length
    } catch (error) {
      console.error('Error loading equipment stats:', error)
    }
  }

  const loadMaintenanceStats = async () => {
    try {
      // Mock maintenance cost for current month
      stats.value.monthlyMaintenanceCost = 7546.67
    } catch (error) {
      console.error('Error loading maintenance stats:', error)
    }
  }

  const loadRecentMaintenances = async () => {
    try {
      // Mock recent maintenances
      recentMaintenances.value = [
        {
          id: '1',
          equipmentName: 'Computador Dell OptiPlex',
          type: 'preventiva',
          description: 'Limpeza e verificação geral do sistema',
          startDate: '2024-01-10',
          status: 'concluida'
        },
        {
          id: '2',
          equipmentName: 'Impressora HP LaserJet',
          type: 'corretiva',
          description: 'Substituição do toner e limpeza',
          startDate: '2024-01-08',
          status: 'em-andamento'
        },
        {
          id: '3',
          equipmentName: 'Roteador TP-Link',
          type: 'corretiva',
          description: 'Configuração de rede e atualização firmware',
          startDate: '2024-01-05',
          status: 'pendente'
        }
      ]
    } catch (error) {
      console.error('Error loading recent maintenances:', error)
    }
  }

  const loadAlerts = async () => {
    try {
      const alertsList = []
      
      // Warranty expiring alerts
      if (stats.value.warrantyExpiringSoon > 0) {
        alertsList.push({
          type: 'warning',
          icon: ['fas', 'exclamation-triangle'],
          title: 'Garantias Vencendo',
          message: `${stats.value.warrantyExpiringSoon} equipamentos com garantia vencendo em 30 dias`,
          time: new Date()
        })
      }
      
      // Equipment in maintenance alerts
      if (stats.value.inMaintenanceCount > 0) {
        alertsList.push({
          type: 'info',
          icon: ['fas', 'wrench'],
          title: 'Equipamentos em Manutenção',
          message: `${stats.value.inMaintenanceCount} equipamentos em manutenção`,
          time: new Date()
        })
      }
      
      // High monthly cost alert
      if (stats.value.monthlyMaintenanceCost > 5000) {
        alertsList.push({
          type: 'error',
          icon: ['fas', 'dollar-sign'],
          title: 'Custos Elevados',
          message: `Custos de manutenção do mês: R$ ${stats.value.monthlyMaintenanceCost.toFixed(2)}`,
          time: new Date()
        })
      }
      
      alerts.value = alertsList
    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const loadStoreCount = async () => {
    try {
      stats.value.totalStores = stores.value.length
    } catch (error) {
      console.error('Error loading store count:', error)
    }
  }

  const loadCompanyCount = async () => {
    try {
      stats.value.totalCompanies = companies.value.length
    } catch (error) {
      console.error('Error loading company count:', error)
    }
  }

  return {
    stats,
    recentMaintenances,
    alerts,
    isLoading,
    loadDashboardData
  }
}
