import { ref, computed } from "vue"
import { collection, query, where, orderBy, getDocs, onSnapshot } from "firebase/firestore"
import { db } from "../firebase/config"

interface MaintenanceData {
  id: string
  equipmentId: string
  equipmentName: string
  store: string
  type: "preventiva" | "corretiva"
  cost: number
  startDate: Date
  endDate?: Date
  status: "pendente" | "em-andamento" | "concluida"
  description: string
  createdAt: Date
}

interface EquipmentData {
  id: string
  name: string
  store: string
  status: string
  warrantyUntil?: Date
  maintenanceCount: number
  lastMaintenance?: Date
  totalMaintenanceCost: number
}

interface StoreStats {
  name: string
  preventive: number
  corrective: number
  total: number
  totalCost: number
}

interface ReportFilters {
  dateFrom?: Date
  dateTo?: Date
  store?: string
  period: number // months
}

export function useReports() {
  const isLoading = ref(false)
  const maintenances = ref<MaintenanceData[]>([])
  const equipments = ref<EquipmentData[]>([])
  const stores = ref<string[]>([])

  // Filtros
  const filters = ref<ReportFilters>({
    period: 6,
  })

  // Dados computados
  const warrantyExpired = computed(() => {
    const today = new Date()
    return equipments.value
      .filter((eq) => {
        if (!eq.warrantyUntil) return false
        return eq.warrantyUntil < today
      })
      .map((eq) => ({
        id: eq.id,
        name: eq.name,
        location: eq.store,
        warrantyEnd: eq.warrantyUntil!,
      }))
  })

  const warrantyExpiringSoon = computed(() => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    return equipments.value
      .filter((eq) => {
        if (!eq.warrantyUntil) return false
        return eq.warrantyUntil >= today && eq.warrantyUntil <= thirtyDaysFromNow
      })
      .map((eq) => ({
        id: eq.id,
        name: eq.name,
        location: eq.store,
        warrantyEnd: eq.warrantyUntil!,
        daysRemaining: Math.ceil((eq.warrantyUntil!.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)),
      }))
  })

  const storeMaintenanceStats = computed((): StoreStats[] => {
    const storeStats: Record<string, StoreStats> = {}

    // Inicializar stats para todas as lojas
    stores.value.forEach((store) => {
      storeStats[store] = {
        name: store,
        preventive: 0,
        corrective: 0,
        total: 0,
        totalCost: 0,
      }
    })

    // Filtrar manutenções por período
    const filteredMaintenances = getFilteredMaintenances()

    filteredMaintenances.forEach((maintenance) => {
      const store = maintenance.store || "Sem loja"

      if (!storeStats[store]) {
        storeStats[store] = {
          name: store,
          preventive: 0,
          corrective: 0,
          total: 0,
          totalCost: 0,
        }
      }

      const stats = storeStats[store]
      stats.total++
      stats.totalCost += maintenance.cost || 0

      if (maintenance.type === "preventiva") {
        stats.preventive++
      } else {
        stats.corrective++
      }
    })

    return Object.values(storeStats).sort((a, b) => b.total - a.total)
  })

  const criticalEquipments = computed(() => {
    return equipments.value
      .filter((eq) => eq.maintenanceCount >= 3)
      .sort((a, b) => b.maintenanceCount - a.maintenanceCount)
      .slice(0, 10) // Top 10 equipamentos críticos
  })

  const maintenanceCostsByMonth = computed(() => {
    const monthlyData: Record<string, number> = {}
    const filteredMaintenances = getFilteredMaintenances()

    filteredMaintenances.forEach((maintenance) => {
      const monthKey = maintenance.startDate.toISOString().substring(0, 7) // YYYY-MM
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + (maintenance.cost || 0)
    })

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cost]) => ({
        month,
        cost,
        monthName: new Date(month + "-01").toLocaleDateString("pt-BR", {
          month: "long",
          year: "numeric",
        }),
      }))
  })

  const totalMaintenanceCost = computed(() => {
    return getFilteredMaintenances().reduce((total, maintenance) => {
      return total + (maintenance.cost || 0)
    }, 0)
  })

  const averageMonthlyCost = computed(() => {
    const monthlyData = maintenanceCostsByMonth.value
    if (monthlyData.length === 0) return 0
    return totalMaintenanceCost.value / monthlyData.length
  })

  const costVariation = computed(() => {
    const monthlyData = maintenanceCostsByMonth.value
    if (monthlyData.length < 2) return 0

    const lastMonth = monthlyData[monthlyData.length - 1]?.cost || 0
    const previousMonth = monthlyData[monthlyData.length - 2]?.cost || 0

    if (previousMonth === 0) return 0
    return ((lastMonth - previousMonth) / previousMonth) * 100
  })

  // Funções auxiliares
  const getFilteredMaintenances = () => {
    let filtered = maintenances.value

    // Filtrar por período
    if (filters.value.period) {
      const periodStart = new Date()
      periodStart.setMonth(periodStart.getMonth() - filters.value.period)
      filtered = filtered.filter((m) => m.startDate >= periodStart)
    }

    // Filtrar por data específica
    if (filters.value.dateFrom) {
      filtered = filtered.filter((m) => m.startDate >= filters.value.dateFrom!)
    }

    if (filters.value.dateTo) {
      filtered = filtered.filter((m) => m.startDate <= filters.value.dateTo!)
    }

    // Filtrar por loja
    if (filters.value.store) {
      filtered = filtered.filter((m) => m.store === filters.value.store)
    }

    return filtered
  }

  // Carregar dados
  const loadMaintenances = async () => {
    try {
      const maintenancesQuery = query(collection(db, "maintenances"), orderBy("startDate", "desc"))

      const snapshot = await getDocs(maintenancesQuery)
      const maintenancesList: MaintenanceData[] = []

      for (const doc of snapshot.docs) {
        const data = doc.data()

        // Buscar nome do equipamento
        let equipmentName = "Equipamento não identificado"
        let equipmentStore = "Sem loja"

        if (data.equipmentId) {
          try {
            const equipmentQuery = query(collection(db, "equipments"), where("__name__", "==", data.equipmentId))
            const equipmentSnapshot = await getDocs(equipmentQuery)

            if (!equipmentSnapshot.empty) {
              const equipmentData = equipmentSnapshot.docs[0].data()
              equipmentName = equipmentData.name || equipmentName
              equipmentStore = equipmentData.store || equipmentStore
            }
          } catch (error) {
            console.error("Erro ao buscar equipamento:", error)
          }
        }

        maintenancesList.push({
          id: doc.id,
          equipmentId: data.equipmentId || "",
          equipmentName,
          store: equipmentStore,
          type: data.type || "corretiva",
          cost: data.cost || 0,
          startDate: data.startDate?.toDate?.() || new Date(),
          endDate: data.endDate?.toDate?.(),
          status: data.status || "pendente",
          description: data.description || "",
          createdAt: data.createdAt?.toDate?.() || new Date(),
        })
      }

      maintenances.value = maintenancesList
    } catch (error) {
      console.error("Erro ao carregar manutenções:", error)
    }
  }

  const loadEquipments = async () => {
    try {
      const equipmentsQuery = query(collection(db, "equipments"))
      const snapshot = await getDocs(equipmentsQuery)
      const equipmentsList: EquipmentData[] = []
      const storeSet = new Set<string>()

      for (const doc of snapshot.docs) {
        const data = doc.data()

        // Contar manutenções do equipamento
        const maintenanceCount = maintenances.value.filter((m) => m.equipmentId === doc.id).length

        // Última manutenção
        const equipmentMaintenances = maintenances.value
          .filter((m) => m.equipmentId === doc.id)
          .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())

        const lastMaintenance = equipmentMaintenances[0]?.startDate

        // Custo total de manutenções
        const totalMaintenanceCost = maintenances.value
          .filter((m) => m.equipmentId === doc.id)
          .reduce((total, m) => total + (m.cost || 0), 0)

        const equipment: EquipmentData = {
          id: doc.id,
          name: data.name || "Equipamento sem nome",
          store: data.store || "Sem loja",
          status: data.status || "ativo",
          warrantyUntil: data.warrantyUntil?.toDate?.(),
          maintenanceCount,
          lastMaintenance,
          totalMaintenanceCost,
        }

        equipmentsList.push(equipment)

        if (equipment.store) {
          storeSet.add(equipment.store)
        }
      }

      equipments.value = equipmentsList
      stores.value = Array.from(storeSet).sort()
    } catch (error) {
      console.error("Erro ao carregar equipamentos:", error)
    }
  }

  const loadReportsData = async () => {
    isLoading.value = true
    try {
      await Promise.all([loadMaintenances(), loadEquipments()])
    } finally {
      isLoading.value = false
    }
  }

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const exportToExcel = () => {
    // Implementar exportação para Excel
    const data = {
      storeStats: storeMaintenanceStats.value,
      criticalEquipments: criticalEquipments.value,
      warrantyExpired: warrantyExpired.value,
      monthlyCosts: maintenanceCostsByMonth.value,
    }

    console.log("Exportando para Excel:", data)
    // Aqui você implementaria a lógica real de exportação
  }

  const exportToPDF = () => {
    // Implementar exportação para PDF
    console.log("Exportando para PDF...")
    // Aqui você implementaria a lógica real de exportação
  }

  // Setup real-time listeners
  const setupRealtimeListeners = () => {
    // Listener para manutenções
    const maintenancesUnsubscribe = onSnapshot(
      query(collection(db, "maintenances"), orderBy("startDate", "desc")),
      () => {
        loadMaintenances()
      },
      (error) => {
        console.error("Erro no listener de manutenções:", error)
      },
    )

    // Listener para equipamentos
    const equipmentsUnsubscribe = onSnapshot(
      query(collection(db, "equipments")),
      () => {
        loadEquipments()
      },
      (error) => {
        console.error("Erro no listener de equipamentos:", error)
      },
    )

    return () => {
      maintenancesUnsubscribe()
      equipmentsUnsubscribe()
    }
  }

  return {
    // Estados
    isLoading,
    filters,
    stores,

    // Dados computados
    warrantyExpired,
    warrantyExpiringSoon,
    storeMaintenanceStats,
    criticalEquipments,
    maintenanceCostsByMonth,
    totalMaintenanceCost,
    averageMonthlyCost,
    costVariation,

    // Funções
    loadReportsData,
    updateFilters,
    exportToExcel,
    exportToPDF,
    setupRealtimeListeners,
  }
}
