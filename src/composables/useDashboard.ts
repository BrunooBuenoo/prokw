import { ref } from 'vue'
import { 
  collection, 
  getDocs, 
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { DashboardStats, Equipment, Maintenance, Store } from '../types'

export function useDashboard() {
  const stats = ref<DashboardStats>({
    totalEquipments: 0,
    equipmentsByStore: {},
    inMaintenanceCount: 0,
    warrantyExpiringSoon: 0,
    noMaintenanceCount: 0,
    monthlyMaintenanceCost: 0,
    totalUsers: 0,
    totalStores: 0,
    totalCompanies: 0
  })
  
  const recentMaintenances = ref<any[]>([])
  const alerts = ref<any[]>([])
  const isLoading = ref(false)

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
      // Load all equipments
      const equipmentsQuery = query(collection(db, 'equipamentos'))
      const equipmentsSnapshot = await getDocs(equipmentsQuery)
      const equipments = equipmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Equipment[]

      // Load stores to get names
      const storesQuery = query(collection(db, 'lojas'))
      const storesSnapshot = await getDocs(storesQuery)
      const stores = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[]

      // Calculate stats
      stats.value.totalEquipments = equipments.length
      
      // Count equipments by store
      const equipmentsByStore: { [key: string]: number } = {}
      equipments.forEach(equipment => {
        const store = stores.find(s => s.id === equipment.store)
        const storeName = store?.name || 'Loja não encontrada'
        equipmentsByStore[storeName] = (equipmentsByStore[storeName] || 0) + 1
      })
      stats.value.equipmentsByStore = equipmentsByStore

      // Count equipments in maintenance
      stats.value.inMaintenanceCount = equipments.filter(eq => eq.status === 'manutencao').length

      // Count warranty expiring soon (next 30 days)
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000))
      stats.value.warrantyExpiringSoon = equipments.filter(eq => {
        const warrantyDate = new Date(eq.warrantyUntil)
        return warrantyDate >= today && warrantyDate <= thirtyDaysFromNow
      }).length

    } catch (error) {
      console.error('Error loading equipment stats:', error)
    }
  }

  const loadMaintenanceStats = async () => {
    try {
      // Get current month's maintenances
      const currentMonth = new Date()
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      const maintenancesQuery = query(
        collection(db, 'manutencoes'),
        where('startDate', '>=', firstDayOfMonth.toISOString()),
        where('startDate', '<=', lastDayOfMonth.toISOString())
      )
      
      const maintenancesSnapshot = await getDocs(maintenancesQuery)
      const maintenances = maintenancesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Maintenance[]

      // Calculate monthly cost
      stats.value.monthlyMaintenanceCost = maintenances.reduce((total, maintenance) => {
        return total + (maintenance.cost || 0)
      }, 0)

    } catch (error) {
      console.error('Error loading maintenance stats:', error)
    }
  }

  const loadRecentMaintenances = async () => {
    try {
      const maintenancesQuery = query(
        collection(db, 'manutencoes'),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      
      const maintenancesSnapshot = await getDocs(maintenancesQuery)
      const maintenances = maintenancesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Maintenance[]

      // Load equipment names
      const equipmentIds = maintenances.map(m => m.equipmentId)
      const equipmentPromises = equipmentIds.map(async (id) => {
        const equipmentQuery = query(collection(db, 'equipamentos'), where('__name__', '==', id))
        const equipmentSnapshot = await getDocs(equipmentQuery)
        return equipmentSnapshot.docs[0]?.data()
      })

      const equipments = await Promise.all(equipmentPromises)

      recentMaintenances.value = maintenances.map((maintenance, index) => ({
        ...maintenance,
        equipmentName: equipments[index]?.name || 'Equipamento não encontrado'
      }))

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
          message: `${stats.value.warrantyExpiringSoon} equipamentos com garantia vencendo em 30 dias`
        })
      }

      // Equipment in maintenance alerts
      if (stats.value.inMaintenanceCount > 0) {
        alertsList.push({
          type: 'info',
          icon: ['fas', 'wrench'],
          message: `${stats.value.inMaintenanceCount} equipamentos em manutenção`
        })
      }

      // High monthly cost alert
      if (stats.value.monthlyMaintenanceCost > 10000) {
        alertsList.push({
          type: 'error',
          icon: ['fas', 'dollar-sign'],
          message: `Custos de manutenção do mês acima de R$ 10.000`
        })
      }

      alerts.value = alertsList

    } catch (error) {
      console.error('Error loading alerts:', error)
    }
  }

  const loadStoreCount = async () => {
    try {
      const storesQuery = query(collection(db, 'lojas'))
      const storesSnapshot = await getDocs(storesQuery)
      stats.value.totalStores = storesSnapshot.size
    } catch (error) {
      console.error('Error loading store count:', error)
    }
  }

  const loadCompanyCount = async () => {
    try {
      const companiesQuery = query(collection(db, 'empresas'))
      const companiesSnapshot = await getDocs(companiesQuery)
      stats.value.totalCompanies = companiesSnapshot.size
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