<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Dashboard</h1>
          <p>Visão geral do sistema de gestão de equipamentos</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="refreshData" :disabled="isRefreshing">
            <font-awesome-icon :icon="['fas', 'sync-alt']" :class="{ 'fa-spin': isRefreshing }" />
            <span class="btn-text">Atualizar</span>
          </button>
          <button class="btn btn-primary" @click="$router.push('/equipamentos')">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span class="btn-text">Novo Equipamento</span>
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
      <!-- Main Stats Grid -->
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
          :trend="warrantyTrend"
          :clickable="true"
        />

        <StatsCard
          :icon="['fas', 'dollar-sign']"
          label="Custos do Mês"
          :value="stats.monthlyMaintenanceCost"
          variant="success"
          description="Manutenções realizadas"
          format="currency"
          :trend="costTrend"
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
          :clickable="canManageUsers"
          @click="canManageUsers && $router.push('/usuarios')"
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
                  <p class="maintenance-description">{{ maintenance.description || 'Sem descrição' }}</p>
                  <div class="maintenance-meta">
                    <span class="maintenance-date">{{ formatDate(maintenance.startDate) }}</span>
                    <span class="maintenance-status" :class="maintenance.status">
                      {{ getStatusText(maintenance.status) }}
                    </span>
                    <span v-if="maintenance.cost" class="maintenance-cost">
                      {{ formatCurrency(maintenance.cost) }}
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
            <button class="btn btn-ghost btn-sm" @click="clearAllAlerts" v-if="alerts.length > 0">
              <font-awesome-icon :icon="['fas', 'check']" />
              <span class="btn-text">Limpar Todos</span>
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

const { canViewReports, canManageUsers } = useAuth()
const { stats, recentMaintenances, alerts, isLoading, loadDashboardData } = useDashboard()

const isRefreshing = ref(false)
const selectedPeriod = ref('30')
const warrantyTrend = ref(0)
const costTrend = ref(0)

const maxEquipmentCount = computed(() => {
  const counts = Object.values(stats.value.equipmentsByStore)
  return Math.max(...counts, 1)
})

const formatDate = (date: string | Date) => {
  if (!date) return 'Data não informada'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR', {
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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
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
    console.log('🔄 Atualizando dados do dashboard...')
    await loadDashboardData()
    // Simular tempo de carregamento para melhor UX
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('✅ Dados atualizados com sucesso!')
  } finally {
    isRefreshing.value = false
  }
}

const clearAllAlerts = () => {
  alerts.value.splice(0)
}

const dismissAlert = (index: number) => {
  alerts.value.splice(index, 1)
}

onMounted(() => {
  console.log('🚀 Montando Dashboard...')
  loadDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: var(--space-4);
  min-height: 100vh;
  background: #e5eaee !important;
}

.dashboard-header {
  margin-bottom: var(--space-8);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: var(--space-6);
  background: var(--color-white) !important;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
}

.header-text h1 {
  font-size: var(--font-size-3xl);
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
  font-size: var(--font-size-base);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.btn-text {
  display: inline;
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
  gap: var(--space-6);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-4);
}

.secondary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
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
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.header-info h3 {
  font-size: var(--font-size-lg);
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
  padding: var(--space-6);
  background: var(--color-white);
}

.empty-state {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-gray-500);
}

.empty-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--space-4);
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
  margin: 0 0 var(--space-4) 0;
}

.store-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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
  font-size: var(--font-size-sm);
}

.store-count {
  font-size: var(--font-size-xs);
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
  gap: var(--space-4);
}

.timeline-item {
  display: flex;
  gap: var(--space-3);
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 28px;
  bottom: -16px;
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
  flex-wrap: wrap;
  gap: var(--space-2);
}

.maintenance-header h4 {
  font-size: var(--font-size-sm);
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
  margin: 0 0 var(--space-2) 0;
  line-height: var(--line-height-relaxed);
}

.maintenance-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-2);
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

.maintenance-cost {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-success);
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.alert-item {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4);
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
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-content h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--space-1) 0;
}

.alert-content p {
  font-size: var(--font-size-sm);
  margin: 0 0 var(--space-1) 0;
}

.alert-time {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.alert-dismiss {
  background: none;
  border: none;
  color: var(--color-gray-400);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.alert-dismiss:hover {
  color: var(--color-gray-600);
  background: rgba(0, 0, 0, 0.1);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-align: left;
}

.action-item:hover {
  background: var(--color-white);
  border-color: var(--color-gray-300);
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
  flex-shrink: 0;
}

.action-icon.primary {
  background: var(--color-black);
  color: var(--color-white);
}

.action-icon.success {
  background: var(--color-success);
  color: var(--color-white);
}

.action-icon.warning {
  background: var(--color-warning);
  color: var(--color-white);
}

.action-icon.secondary {
  background: var(--color-gray-600);
  color: var(--color-white);
}

.action-content h4 {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  margin: 0 0 var(--space-1) 0;
}

.action-content p {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: var(--space-3);
  }

  .header-content {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
    padding: var(--space-4);
  }

  .header-text h1 {
    font-size: var(--font-size-2xl);
  }

  .header-actions {
    justify-content: center;
  }

  .btn-text {
    display: none;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-3);
  }

  .secondary-stats {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .dashboard-grid {
    gap: var(--space-4);
  }

  .card-header {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
    padding: var(--space-4);
  }

  .card-body {
    padding: var(--space-4);
  }

  .maintenance-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .maintenance-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .action-item {
    padding: var(--space-3);
  }

  .action-icon {
    width: 40px;
    height: 40px;
    font-size: var(--font-size-lg);
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: var(--space-2);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .secondary-stats {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }

  .store-info {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .alert-item {
    flex-direction: column;
    text-align: center;
  }

  .alert-dismiss {
    align-self: flex-end;
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
  }
}

/* Dark mode support (future enhancement) */
@media (prefers-color-scheme: dark) {
  .dashboard {
    background: var(--color-gray-900);
  }

  .dashboard-card {
    background: var(--color-gray-800);
    border-color: var(--color-gray-700);
  }

  .header-content {
    background: var(--color-gray-800);
    border-color: var(--color-gray-700);
  }
}
</style>
