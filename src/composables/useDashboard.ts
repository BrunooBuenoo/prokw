import { ref, computed } from "vue"
import { collection, query, where, getDocs, orderBy, limit, Timestamp } from "firebase/firestore"
import { db } from "../firebase/config"
import type { Equipment, Maintenance } from "../types"

interface DashboardStats {
  totalEquipments: number
  inMaintenanceCount: number
  warrantyExpiringSoon: number
  monthlyMaintenanceCost: number
  totalStores: number
  totalCompanies: number
  totalUsers: number
  equipmentsByStore: Record<string, number>
}

interface DashboardAlert {
  type: "warning" | "error" | "info" | "success"
  icon: string[]
  title: string
  message: string
  time: Date
}

interface MaintenanceWithEquipment extends Maintenance {
  equipmentName: string
  equipmentCode?: string
  companyName?: string
}

export function useDashboard() {
  const stats = ref<DashboardStats>({
    totalEquipments: 0,
    inMaintenanceCount: 0,
    warrantyExpiringSoon: 0,
    monthlyMaintenanceCost: 0,
    totalStores: 0,
    totalCompanies: 0,
    totalUsers: 0,
    equipmentsByStore: {},
  })
  const recentMaintenances = ref<MaintenanceWithEquipment[]>([])
  const alerts = ref<DashboardAlert[]>([])
  const isLoading = ref(false)

  // Função para calcular custos mensais de forma consistente
  const calculateMonthlyMaintenanceCost = async (): Promise<number> => {
    try {
      const now = new Date()
      const currentYear = now.getFullYear()
      const currentMonth = now.getMonth()
      // Primeiro e último dia do mês atual
      const startOfMonth = new Date(currentYear, currentMonth, 1)
      const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59)

      console.log("🔍 Calculando custos mensais:", {
        startOfMonth: startOfMonth.toISOString(),
        endOfMonth: endOfMonth.toISOString(),
      })

      // Query precisa para manutenções do mês atual
      const monthlyQuery = query(
        collection(db, "maintenances"),
        where("createdAt", ">=", Timestamp.fromDate(startOfMonth)),
        where("createdAt", "<=", Timestamp.fromDate(endOfMonth)),
      )

      const snapshot = await getDocs(monthlyQuery)
      let totalCost = 0
      const maintenanceDetails: any[] = []

      snapshot.docs.forEach((doc) => {
        const data = doc.data()
        const cost = Number(data.cost) || 0
        totalCost += cost
        maintenanceDetails.push({
          id: doc.id,
          cost,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || "N/A",
          equipmentId: data.equipmentId || "N/A",
        })
      })

      console.log("💰 Detalhes dos custos mensais:", {
        totalMaintenances: snapshot.size,
        totalCost,
        maintenanceDetails,
      })

      return totalCost
    } catch (error) {
      console.error("❌ Erro ao calcular custos mensais:", error)
      return 0
    }
  }

  // Função para carregar equipamentos e manutenções ativas - CORRIGIDA
  const loadEquipments = async () => {
    try {
      console.log("📦 Carregando equipamentos...")
      const equipmentsQuery = query(collection(db, "equipments"))
      const snapshot = await getDocs(equipmentsQuery)
      const equipments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Equipment[]

      console.log("📊 Equipamentos encontrados:", equipments.length)

      // Estatísticas básicas
      stats.value.totalEquipments = equipments.length

      // NOVA LÓGICA: Verificar manutenções ativas ao invés de apenas status do equipamento
      console.log("🔧 Verificando manutenções ativas...")

      // Buscar manutenções pendentes e em andamento
      const activeMaintenancesQuery = query(
        collection(db, "maintenances"),
        where("status", "in", ["pendente", "em-andamento", "em_andamento"]),
      )

      const activeMaintenancesSnapshot = await getDocs(activeMaintenancesQuery)
      const activeMaintenances = activeMaintenancesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log("🔧 Manutenções ativas encontradas:", {
        total: activeMaintenances.length,
        maintenances: activeMaintenances.map((m) => ({
          id: m.id,
          status: m.status,
          equipmentId: m.equipmentId,
        })),
      })

      // Contar equipamentos únicos em manutenção
      const equipmentsInMaintenance = new Set()
      activeMaintenances.forEach((maintenance) => {
        if (maintenance.equipmentId) {
          equipmentsInMaintenance.add(maintenance.equipmentId)
        }
      })

      stats.value.inMaintenanceCount = equipmentsInMaintenance.size

      console.log("🔧 Equipamentos em manutenção:", {
        uniqueEquipments: equipmentsInMaintenance.size,
        equipmentIds: Array.from(equipmentsInMaintenance),
      })

      // Equipamentos por loja
      const equipmentsByStore: Record<string, number> = {}
      equipments.forEach((equipment) => {
        const store = equipment.store || "Sem loja"
        equipmentsByStore[store] = (equipmentsByStore[store] || 0) + 1
      })
      stats.value.equipmentsByStore = equipmentsByStore

      // Garantias vencendo (próximos 30 dias)
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      const expiringSoon = equipments.filter((equipment) => {
        if (!equipment.warrantyUntil) return false
        const warrantyDate = new Date(equipment.warrantyUntil)
        return warrantyDate >= today && warrantyDate <= thirtyDaysFromNow
      })
      stats.value.warrantyExpiringSoon = expiringSoon.length

      console.log("📊 Estatísticas finais de equipamentos:", {
        total: equipments.length,
        inMaintenance: stats.value.inMaintenanceCount,
        expiringSoon: expiringSoon.length,
        byStore: equipmentsByStore,
      })
    } catch (error) {
      console.error("❌ Erro ao carregar equipamentos:", error)
    }
  }

  // Função para carregar manutenções recentes - MELHORADA
  const loadRecentMaintenances = async () => {
    try {
      console.log("🔧 Carregando manutenções recentes...")
      const maintenancesQuery = query(
        collection(db, "maintenances"),
        orderBy("createdAt", "desc"),
        limit(10), // Aumentei para 10 para ter mais dados
      )
      const snapshot = await getDocs(maintenancesQuery)

      console.log("🔧 Manutenções encontradas:", snapshot.size)

      const maintenancesList = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Buscar nome do equipamento
          let equipmentName = "Equipamento não identificado"
          let equipmentCode = undefined

          if (data.equipmentId) {
            try {
              // Buscar equipamento por ID
              const equipmentQuery = query(collection(db, "equipments"))
              const equipmentSnapshot = await getDocs(equipmentQuery)

              const equipment = equipmentSnapshot.docs.find((equipDoc) => equipDoc.id === data.equipmentId)

              if (equipment) {
                const equipmentData = equipment.data()
                equipmentName = equipmentData.name || "Nome não encontrado"
                equipmentCode = equipmentData.internalCode || equipmentData.code
              }
            } catch (error) {
              console.error("Erro ao buscar equipamento:", error)
            }
          }

          return {
            id: doc.id,
            ...data,
            equipmentName,
            equipmentCode,
            startDate: data.startDate || data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          }
        }),
      )

      // Pegar apenas as 5 mais recentes para exibir
      recentMaintenances.value = maintenancesList.slice(0, 5) as MaintenanceWithEquipment[]

      console.log("🔧 Manutenções recentes carregadas:", {
        total: maintenancesList.length,
        displayed: recentMaintenances.value.length,
        statuses: recentMaintenances.value.map((m) => m.status),
      })
    } catch (error) {
      console.error("❌ Erro ao carregar manutenções recentes:", error)
    }
  }

  // Função para carregar outras estatísticas
  const loadOtherStats = async () => {
    try {
      console.log("📈 Carregando outras estatísticas...")

      // Carregar lojas ativas
      const storesQuery = query(collection(db, "stores"), where("status", "==", "ativo"))
      const storesSnapshot = await getDocs(storesQuery)
      stats.value.totalStores = storesSnapshot.size

      // Carregar empresas ativas
      const companiesQuery = query(collection(db, "companies"), where("status", "==", "ativo"))
      const companiesSnapshot = await getDocs(companiesQuery)
      stats.value.totalCompanies = companiesSnapshot.size

      // Carregar usuários
      const usersQuery = query(collection(db, "users"))
      const usersSnapshot = await getDocs(usersQuery)
      stats.value.totalUsers = usersSnapshot.size

      console.log("📈 Outras estatísticas carregadas:", {
        stores: stats.value.totalStores,
        companies: stats.value.totalCompanies,
        users: stats.value.totalUsers,
      })
    } catch (error) {
      console.error("❌ Erro ao carregar outras estatísticas:", error)
    }
  }

  // Função para gerar alertas baseados nos dados - MELHORADA
  const generateAlerts = () => {
    const alertsList: DashboardAlert[] = []

    // Alerta de garantias vencendo
    if (stats.value.warrantyExpiringSoon > 0) {
      alertsList.push({
        type: "warning",
        icon: ["fas", "exclamation-triangle"],
        title: "Garantias Vencendo",
        message: `${stats.value.warrantyExpiringSoon} equipamento${stats.value.warrantyExpiringSoon > 1 ? "s" : ""} com garantia vencendo em 30 dias`,
        time: new Date(),
      })
    }

    // Alerta de equipamentos em manutenção - MELHORADO
    if (stats.value.inMaintenanceCount > 0) {
      alertsList.push({
        type: "info",
        icon: ["fas", "wrench"],
        title: "Equipamentos em Manutenção",
        message: `${stats.value.inMaintenanceCount} equipamento${stats.value.inMaintenanceCount > 1 ? "s" : ""} em manutenção ativa`,
        time: new Date(),
      })
    }

    // Alerta de custos elevados
    if (stats.value.monthlyMaintenanceCost > 5000) {
      alertsList.push({
        type: "error",
        icon: ["fas", "dollar-sign"],
        title: "Custos Elevados",
        message: `Custos de manutenção do mês: R$ ${stats.value.monthlyMaintenanceCost.toFixed(2)}`,
        time: new Date(),
      })
    }

    // Alerta de sistema vazio
    if (stats.value.totalEquipments === 0) {
      alertsList.push({
        type: "info",
        icon: ["fas", "desktop"],
        title: "Nenhum Equipamento",
        message: "Cadastre equipamentos para começar a usar o sistema",
        time: new Date(),
      })
    }

    // Alerta de manutenções pendentes
    const pendingMaintenances = recentMaintenances.value.filter((m) => m.status === "pendente")
    if (pendingMaintenances.length > 0) {
      alertsList.push({
        type: "warning",
        icon: ["fas", "clock"],
        title: "Manutenções Pendentes",
        message: `${pendingMaintenances.length} manutenção${pendingMaintenances.length > 1 ? "ões" : ""} aguardando início`,
        time: new Date(),
      })
    }

    alerts.value = alertsList
  }

  // Função principal para carregar todos os dados
  const loadDashboardData = async () => {
    isLoading.value = true
    try {
      console.log("🚀 Iniciando carregamento do dashboard...")

      // Carregar dados em paralelo para melhor performance
      await Promise.all([loadEquipments(), loadRecentMaintenances(), loadOtherStats()])

      // Calcular custos mensais (separado para garantir consistência)
      stats.value.monthlyMaintenanceCost = await calculateMonthlyMaintenanceCost()

      // Gerar alertas baseados nos dados carregados
      generateAlerts()

      console.log("✅ Dashboard carregado com sucesso!")
      console.log("📊 Estatísticas finais:", {
        totalEquipments: stats.value.totalEquipments,
        inMaintenanceCount: stats.value.inMaintenanceCount,
        warrantyExpiringSoon: stats.value.warrantyExpiringSoon,
        monthlyMaintenanceCost: stats.value.monthlyMaintenanceCost,
        recentMaintenances: recentMaintenances.value.length,
        alerts: alerts.value.length,
      })
    } catch (error) {
      console.error("❌ Erro ao carregar dashboard:", error)
    } finally {
      isLoading.value = false
    }
  }

  return {
    stats: computed(() => stats.value),
    recentMaintenances: computed(() => recentMaintenances.value),
    alerts: computed(() => alerts.value),
    isLoading: computed(() => isLoading.value),
    loadDashboardData,
    calculateMonthlyMaintenanceCost,
  }
}
