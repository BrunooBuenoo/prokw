<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Dashboard</h1>
          <p>Visão geral do sistema de gestão de equipamentos</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="refreshData">
            <font-awesome-icon :icon="['fas', 'sync-alt']" :class="{ 'fa-spin': isRefreshing }" />
            Atualizar
          </button>
          <button class="btn btn-primary" @click="$router.push('/equipamentos')">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Novo Equipamento
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <font-awesome-icon :icon="['fas', 'cogs']" class="loading-icon" />
      </div>
      <p>Carregando dados do dashboard...</p>
    </div>
    
    <div v-else class="dashboard-content">
      <!-- Stats Cards -->
      <div class="stats-grid">
        <StatsCard
          :icon="['fas', 'desktop']"
          label="Total de Equipamentos"
          :value="stats.totalEquipments"
          variant="primary"
          description="Equipamentos cadastrados no sistema"
          :clickable="true"
          @click="$router.push('/equipamentos')"
        />
        
        <StatsCard
          :icon="['fas', 'wrench']"
          label="Em Manutenção"
          :value="stats.inMaintenanceCount"
          variant="warning"
          description="Equipamentos em reparo"
          :clickable="true"
          @click="$router.push('/manutencoes')"
        />
        
        <StatsCard
          :icon="['fas', 'exclamation-triangle']"
          label="Garantias Vencendo"
          :value="stats.warrantyExpiringSoon"
          variant="error"
          description="Próximos 30 dias"
          :trend="-15"
          :clickable="true"
        />
        
        <StatsCard
          :icon="['fas', 'dollar-sign']"
          label="Custos do Mês"
          :value="stats.monthlyMaintenanceCost"
          variant="success"
          description="Manutenções realizadas"
          format="currency"
          :trend="8"
          :clickable="true"
          @click="$router.push('/relatorios')"
        />
      </div>
      
      <!-- Secondary Stats -->
      <div class="secondary-stats">
        <StatsCard
          :icon="['fas', 'store']"
          label="Lojas Ativas"
          :value="stats.totalStores"
          variant="secondary"
          description="Unidades em operação"
          :clickable="true"
          @click="$router.push('/lojas')"
        />
        
        <StatsCard
          :icon="['fas', 'building']"
          label="Empresas Parceiras"
          :value="stats.totalCompanies"
          variant="secondary"
          description="Prestadores de serviço"
          :clickable="true"
          @click="$router.push('/empresas')"
        />
        
        <StatsCard
          :icon="['fas', 'users']"
          label="Usuários Ativos"
          :value="stats.totalUsers"
          variant="secondary"
          description="Usuários do sistema"
          :clickable="true"
          @click="$router.push('/usuarios')"
        />
      </div>
      
      <!-- Main Content Grid -->
      <div class="dashboard-grid">
        <!-- Equipment by Store Chart -->
        <div class="dashboard-card chart-card">
          <div class="card-header">
            <div class="header-info">
              <h3>Equipamentos por Loja</h3>
              <p>Distribuição de equipamentos nas unidades</p>
            </div>
            <div class="header-actions">
              <select v-model="selectedPeriod" class="form-select">
                <option value="30">Últimos 30 dias</option>
                <option value="90">Últimos 3 meses</option>
                <option value="365">Último ano</option>
              </select>
            </div>
          </div>
          <div class="card-body">
            <div v-if="Object.keys(stats.equipmentsByStore).length === 0" class="empty-state">
              <font-awesome-icon :icon="['fas', 'store']" class="empty-icon" />
              <h4>Nenhuma loja com equipamentos</h4>
              <p>Cadastre equipamentos para visualizar a distribuição</p>
              <button class="btn btn-primary btn-sm" @click="$router.push('/equipamentos')">
                Cadastrar Equipamento
              </button>
            </div>
            <div v-else class="store-chart">
              <div 
                v-for="(count, store) in stats.equipmentsByStore" 
                :key="store"
                class="store-bar"
              >
                <div class="store-info">
                  <div class="store-name">{{ store }}</div>
                  <div class="store-count">{{ count }} equipamentos</div>
                </div>
                <div class="bar-container">
                  <div 
                    class="bar-fill" 
                    :style="{ width: `${(count / maxEquipmentCount) * 100}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recent Maintenances -->
        <div class="dashboard-card">
          <div class="card-header">
            <div class="header-info">
              <h3>Manutenções Recentes</h3>
              <p>Últimas atividades de manutenção</p>
            </div>
            <router-link to="/manutencoes" class="btn btn-ghost btn-sm">
              Ver Todas
              <font-awesome-icon :icon="['fas', 'arrow-right']" />
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="recentMaintenances.length === 0" class="empty-state">
              <font-awesome-icon :icon="['fas', 'wrench']" class="empty-icon" />
              <h4>Nenhuma manutenção registrada</h4>
              <p>Registre manutenções para acompanhar o histórico</p>
              <button class="btn btn-primary btn-sm" @click="$router.push('/manutencoes')">
                Registrar Manutenção
              </button>
            </div>
            <div v-else class="maintenance-timeline">
              <div 
                v-for="maintenance in recentMaintenances" 
                :key="maintenance.id"
                class="timeline-item"
              >
                <div class="timeline-marker" :class="maintenance.status"></div>
                <div class="timeline-content">
                  <div class="maintenance-header">
                    <h4>{{ maintenance.equipmentName }}</h4>
                    <span class="maintenance-type" :class="maintenance.type">
                      {{ maintenance.type }}
                    </span>
                  </div>
                  <p class="maintenance-description">{{ maintenance.description }}</p>
                  <div class="maintenance-meta">
                    <span class="maintenance-date">{{ formatDate(maintenance.startDate) }}</span>
                    <span class="maintenance-status" :class="maintenance.status">
                      {{ getStatusText(maintenance.status) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Alerts and Notifications -->
        <div class="dashboard-card alerts-card">
          <div class="card-header">
            <div class="header-info">
              <h3>Alertas do Sistema</h3>
              <p>Notificações importantes</p>
            </div>
            <button class="btn btn-ghost btn-sm" @click="clearAllAlerts">
              <font-awesome-icon :icon="['fas', 'check']" />
              Limpar Todos
            </button>
          </div>
          <div class="card-body">
            <div v-if="alerts.length === 0" class="empty-state">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="empty-icon success" />
              <h4>Tudo funcionando perfeitamente!</h4>
              <p>Nenhum alerta no momento</p>
            </div>
            <div v-else class="alerts-list">
              <div 
                v-for="(alert, index) in alerts" 
                :key="index"
                class="alert-item" 
                :class="alert.type"
              >
                <div class="alert-icon">
                  <font-awesome-icon :icon="alert.icon" />
                </div>
                <div class="alert-content">
                  <h4>{{ alert.title }}</h4>
                  <p>{{ alert.message }}</p>
                  <span class="alert-time">{{ formatTime(alert.time) }}</span>
                </div>
                <button class="alert-dismiss" @click="dismissAlert(index)">
                  <font-awesome-icon :icon="['fas', 'times']" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Quick Actions -->
        <div class="dashboard-card actions-card">
          <div class="card-header">
            <div class="header-info">
              <h3>Ações Rápidas</h3>
              <p>Acesso rápido às principais funcionalidades</p>
            </div>
          </div>
          <div class="card-body">
            <div class="actions-grid">
              <button class="action-item" @click="$router.push('/equipamentos')">
                <div class="action-icon primary">
                  <font-awesome-icon :icon="['fas', 'search']" />
                </div>
                <div class="action-content">
                  <h4>Buscar Equipamento</h4>
                  <p>Localizar equipamentos no sistema</p>
                </div>
              </button>
              
              <button class="action-item" @click="$router.push('/relatorios')" v-if="canViewReports">
                <div class="action-icon success">
                  <font-awesome-icon :icon="['fas', 'file-pdf']" />
                </div>
                <div class="action-content">
                  <h4>Gerar Relatório</h4>
                  <p>Criar relatórios personalizados</p>
                </div>
              </button>
              
              <button class="action-item" @click="$router.push('/lojas')">
                <div class="action-icon warning">
                  <font-awesome-icon :icon="['fas', 'store']" />
                </div>
                <div class="action-content">
                  <h4>Gerenciar Lojas</h4>
                  <p>Administrar unidades</p>
                </div>
              </button>
              
              <button class="action-item" @click="$router.push('/empresas')">
                <div class="action-icon secondary">
                  <font-awesome-icon :icon="['fas', 'building']" />
                </div>
                <div class="action-content">
                  <h4>Empresas Terceiras</h4>
                  <p>Gerenciar prestadores</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useDashboard } from '../composables/useDashboard'
import StatsCard from '../components/StatsCard.vue'
import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  where,
  onSnapshot
} from 'firebase/firestore'
import { db } from '../firebase/config'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { canViewReports } = useAuth()
const { stats, recentMaintenances, alerts, isLoading, loadDashboardData } = useDashboard()

const isRefreshing = ref(false)
const selectedPeriod = ref('30')

const maxEquipmentCount = computed(() => {
  const counts = Object.values(stats.value.equipmentsByStore)
  return Math.max(...counts, 1)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
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

const getStatusText = (status: string) => {
  const statusMap = {
    'pendente': 'Pendente',
    'em-andamento': 'Em Andamento',
    'concluida': 'Concluída'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const refreshData = async () => {
  isRefreshing.value = true
  try {
    await loadDashboardData()
    // Simulate loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000))
  } finally {
    isRefreshing.value = false
  }
}

const clearAllAlerts = () => {
  alerts.value = []
}

const dismissAlert = (index: number) => {
  alerts.value.splice(index, 1)
}

// Firebase integration for real-time updates
const setupRealtimeListeners = () => {
  // Listen to equipment changes
  const equipmentQuery = query(collection(db, 'equipamentos'))
  onSnapshot(equipmentQuery, (snapshot) => {
    stats.value.totalEquipments = snapshot.size
    
    // Update equipment by store
    const equipmentsByStore: Record<string, number> = {}
    snapshot.docs.forEach(doc => {
      const data = doc.data()
      const store = data.store || 'Sem loja'
      equipmentsByStore[store] = (equipmentsByStore[store] || 0) + 1
    })
    stats.value.equipmentsByStore = equipmentsByStore
  })
  
  // Listen to maintenance changes
  const maintenanceQuery = query(
    collection(db, 'manutencoes'),
    orderBy('createdAt', 'desc'),
    limit(5)
  )
  onSnapshot(maintenanceQuery, (snapshot) => {
    recentMaintenances.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      equipmentName: doc.data().equipmentName || 'Equipamento não identificado',
      description: doc.data().description || 'Manutenção realizada'
    }))
    
    // Count in maintenance
    const inMaintenanceQuery = query(
      collection(db, 'manutencoes'),
      where('status', '==', 'em-andamento')
    )
    getDocs(inMaintenanceQuery).then(snapshot => {
      stats.value.inMaintenanceCount = snapshot.size
    })
  })
  
  // Listen to users changes
  const usersQuery = query(collection(db, 'usuarios'))
  onSnapshot(usersQuery, (snapshot) => {
    stats.value.totalUsers = snapshot.size
  })
}

onMounted(() => {
  loadDashboardData()
  setupRealtimeListeners()
})
</script>

<style scoped>
.dashboard {
  padding: var(--space-8);
  background: var(--color-gray-50);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: var(--space-10);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: var(--space-8);
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
}

.header-text h1 {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0 0 var(--space-2) 0;
  background: linear-gradient(135deg, var(--color-black), var(--color-gray-700));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  color: var(--color-gray-600);
  font-size: var(--font-size-lg);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-4);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20);
  color: var(--color-gray-500);
}

.loading-spinner {
  margin-bottom: var(--space-6);
}

.loading-icon {
  font-size: var(--font-size-5xl);
  color: var(--color-black);
  animation: spin 2s linear infinite;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.secondary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--space-6);
}

.dashboard-card {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.dashboard-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-8);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.header-info h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0 0 var(--space-1) 0;
}

.header-info p {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  margin: 0;
}

.card-body {
  padding: var(--space-8);
}

.empty-state {
  text-align: center;
  padding: var(--space-12);
  color: var(--color-gray-500);
}

.empty-icon {
  font-size: var(--font-size-5xl);
  margin-bottom: var(--space-6);
  color: var(--color-gray-300);
}

.empty-icon.success {
  color: var(--color-success);
}

.empty-state h4 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  margin: 0 0 var(--space-2) 0;
}

.empty-state p {
  margin: 0 0 var(--space-6) 0;
}

.store-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.store-bar {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.store-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.store-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
}

.store-count {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.bar-container {
  height: 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-black), var(--color-gray-700));
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.maintenance-timeline {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.timeline-item {
  display: flex;
  gap: var(--space-4);
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 32px;
  bottom: -24px;
  width: 2px;
  background: var(--color-gray-200);
}

.timeline-marker {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  margin-top: var(--space-1);
}

.timeline-marker.pendente {
  background: var(--color-gray-300);
}

.timeline-marker.em-andamento {
  background: var(--color-warning);
}

.timeline-marker.concluida {
  background: var(--color-success);
}

.timeline-content {
  flex: 1;
}

.maintenance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.maintenance-header h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin: 0;
}

.maintenance-type {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.maintenance-type.preventiva {
  background: var(--color-info-light);
  color: var(--color-info);
}

.maintenance-type.corretiva {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.maintenance-description {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-3) 0;
  line-height: var(--line-height-relaxed);
}

.maintenance-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.maintenance-date {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.maintenance-status {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.maintenance-status.pendente {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.maintenance-status.em-andamento {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.maintenance-status.concluida {
  background: var(--color-success-light);
  color: var(--color-success);
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.alert-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  border: 1px solid;
  position: relative;
  transition: all var(--transition-fast);
}

.alert-item:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.alert-item.warning {
  background: var(--color-warning-light);
  border-color: var(--color-warning);
}

.alert-item.error {
  background: var(--color-error-light);
  border-color: var(--color-error);
}

.alert-item.info {
  background: var(--color-info-light);
  border-color: var(--color-info);
}

.alert-icon {
  width: 40px;
  height: 40px;
}

.alert-content {
  flex: 1;
}

.alert-time {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}
</style>