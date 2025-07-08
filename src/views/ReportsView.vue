<template>
  <div class="reports-view">
    <div class="reports-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Relatórios</h1>
          <p>Análise detalhada de manutenções e equipamentos</p>
        </div>
        <div class="export-buttons">
          <button class="btn btn-secondary" @click="exportToExcel" :disabled="isLoading">
            <font-awesome-icon :icon="['fas', 'file-excel']" />
            <span class="btn-text">Excel</span>
          </button>
          <button class="btn btn-error" @click="exportToPDF" :disabled="isLoading">
            <font-awesome-icon :icon="['fas', 'file-pdf']" />
            <span class="btn-text">PDF</span>
          </button>
          <button class="btn btn-primary" @click="loadReportsData" :disabled="isLoading">
            <font-awesome-icon :icon="['fas', 'sync-alt']" :class="{ 'fa-spin': isLoading }" />
            <span class="btn-text">Atualizar</span>
          </button>
        </div>
      </div>
    </div>
        
    <div class="reports-filters">
      <div class="filter-group">
        <div class="filter-item">
          <label class="filter-label">Data de:</label>
          <input 
            type="date"
            v-model="dateFromInput"
            class="form-input"
            @change="updateDateFilters"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">Data até:</label>
          <input 
            type="date"
            v-model="dateToInput"
            class="form-input"
            @change="updateDateFilters"
          />
        </div>
        <div class="filter-item">
          <label class="filter-label">Loja:</label>
          <select v-model="selectedStore" class="form-select" @change="updateStoreFilter">
            <option value="">Todas as lojas</option>
            <option v-for="store in stores" :key="store" :value="store">
              {{ store }}
            </option>
          </select>
        </div>
        <div class="filter-item">
          <label class="filter-label">Período:</label>
          <select v-model="selectedPeriod" class="form-select" @change="updatePeriodFilter">
            <option value="3">Últimos 3 meses</option>
            <option value="6">Últimos 6 meses</option>
            <option value="12">Último ano</option>
            <option value="24">Últimos 2 anos</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner">
        <font-awesome-icon :icon="['fas', 'chart-bar']" class="loading-icon" />
      </div>
      <p>Carregando dados dos relatórios...</p>
    </div>
        
    <div v-else class="reports-content">
      <div class="report-cards">
        <!-- Gastos com Manutenção -->
        <div class="card chart-card">
          <div class="card-header">
            <div class="header-info">
              <h3>Gastos com Manutenção</h3>
              <p>Evolução dos custos ao longo do tempo</p>
            </div>
          </div>
          <div class="card-body">
            <div v-if="maintenanceCostsByMonth.length === 0" class="empty-state">
              <font-awesome-icon :icon="['fas', 'chart-line']" class="empty-icon" />
              <h4>Nenhum dado de custo</h4>
              <p>Registre manutenções com custos para visualizar o gráfico</p>
            </div>
            <div v-else>
              <div class="chart-container">
                <div class="month-chart">
                  <div 
                    v-for="(item, index) in maintenanceCostsByMonth.slice(-12)" 
                    :key="item.month"
                    class="month-bar"
                  >
                    <div class="bar-container">
                      <div 
                        class="bar-fill"
                        :style="{ 
                          height: `${(item.cost / maxMonthlyCost) * 100}%` 
                        }"
                        :title="`${item.monthName}: ${formatCurrency(item.cost)}`"
                      ></div>
                    </div>
                    <div class="month-label">
                      {{ item.monthName.split(' ')[0].substring(0, 3) }}
                    </div>
                  </div>
                </div>
              </div>
              <div class="summary-stats">
                <div class="stat">
                  <span class="stat-label">Total gasto:</span>
                  <span class="stat-value">{{ formatCurrency(totalMaintenanceCost) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Média mensal:</span>
                  <span class="stat-value">{{ formatCurrency(averageMonthlyCost) }}</span>
                </div>
                <div class="stat">
                  <span class="stat-label">Variação:</span>
                  <span class="stat-value" :class="costVariation >= 0 ? 'text-error' : 'text-success'">
                    {{ costVariation >= 0 ? '+' : '' }}{{ costVariation.toFixed(1) }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
                
        <!-- Garantias -->
        <div class="card">
          <div class="card-header">
            <div class="header-info">
              <h3>Status de Garantias</h3>
              <p>Equipamentos com garantia vencida ou vencendo</p>
            </div>
          </div>
          <div class="card-body">
            <div class="warranty-tabs">
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'expired' }"
                @click="activeTab = 'expired'"
              >
                Vencidas ({{ warrantyExpired.length }})
              </button>
              <button 
                class="tab-button" 
                :class="{ active: activeTab === 'expiring' }"
                @click="activeTab = 'expiring'"
              >
                Vencendo ({{ warrantyExpiringSoon.length }})
              </button>
            </div>
            
            <div v-if="activeTab === 'expired'" class="warranty-content">
              <div v-if="warrantyExpired.length === 0" class="empty-state">
                <font-awesome-icon :icon="['fas', 'check-circle']" class="empty-icon success" />
                <h4>Nenhuma garantia vencida</h4>
                <p>Todos os equipamentos estão com garantia válida</p>
              </div>
              <div v-else class="warranty-list">
                <div class="warranty-item" v-for="item in warrantyExpired" :key="item.id">
                  <div class="warranty-info">
                    <span class="equipment-name">{{ item.name }}</span>
                    <span class="equipment-location">{{ item.location }}</span>
                  </div>
                  <div class="warranty-date expired">
                    Venceu em {{ formatDate(item.warrantyEnd) }}
                  </div>
                </div>
              </div>
            </div>
            
            <div v-if="activeTab === 'expiring'" class="warranty-content">
              <div v-if="warrantyExpiringSoon.length === 0" class="empty-state">
                <font-awesome-icon :icon="['fas', 'calendar-check']" class="empty-icon success" />
                <h4>Nenhuma garantia vencendo</h4>
                <p>Não há garantias vencendo nos próximos 30 dias</p>
              </div>
              <div v-else class="warranty-list">
                <div class="warranty-item" v-for="item in warrantyExpiringSoon" :key="item.id">
                  <div class="warranty-info">
                    <span class="equipment-name">{{ item.name }}</span>
                    <span class="equipment-location">{{ item.location }}</span>
                  </div>
                  <div class="warranty-date expiring">
                    {{ item.daysRemaining }} dias restantes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
            
      <div class="report-tables">
        <!-- Frequência de Manutenções por Loja -->
        <div class="card">
          <div class="card-header">
            <div class="header-info">
              <h3>Manutenções por Loja</h3>
              <p>Frequência e custos de manutenção por unidade</p>
            </div>
          </div>
          <div class="card-body">
            <div v-if="storeMaintenanceStats.length === 0" class="empty-state">
              <font-awesome-icon :icon="['fas', 'store']" class="empty-icon" />
              <h4>Nenhuma manutenção registrada</h4>
              <p>Registre manutenções para visualizar as estatísticas por loja</p>
            </div>
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Loja</th>
                    <th>Preventivas</th>
                    <th>Corretivas</th>
                    <th>Total</th>
                    <th>Custo Total</th>
                    <th>Custo Médio</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="store in storeMaintenanceStats" :key="store.name">
                    <td class="store-name">{{ store.name }}</td>
                    <td class="preventive-count">{{ store.preventive }}</td>
                    <td class="corrective-count">{{ store.corrective }}</td>
                    <td class="total-count">{{ store.total }}</td>
                    <td class="total-cost">{{ formatCurrency(store.totalCost) }}</td>
                    <td class="average-cost">
                      {{ store.total > 0 ? formatCurrency(store.totalCost / store.total) : 'R$ 0,00' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
                
        <!-- Equipamentos Críticos -->
        <div class="card">
          <div class="card-header">
            <div class="header-info">
              <h3>Equipamentos Críticos</h3>
              <p>Equipamentos com maior frequência de manutenções</p>
            </div>
          </div>
          <div class="card-body">
            <div v-if="criticalEquipments.length === 0" class="empty-state">
              <font-awesome-icon :icon="['fas', 'tools']" class="empty-icon" />
              <h4>Nenhum equipamento crítico</h4>
              <p>Não há equipamentos com 3 ou mais manutenções no período</p>
            </div>
            <div v-else class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    <th>Equipamento</th>
                    <th>Loja</th>
                    <th>Manutenções</th>
                    <th>Último Reparo</th>
                    <th>Custo Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="equipment in criticalEquipments" :key="equipment.id">
                    <td class="equipment-name">{{ equipment.name }}</td>
                    <td class="store-name">{{ equipment.store }}</td>
                    <td class="maintenance-count">
                      <span class="count-badge">{{ equipment.maintenanceCount }}</span>
                    </td>
                    <td class="last-maintenance">
                      {{ equipment.lastMaintenance ? formatDate(equipment.lastMaintenance) : 'Nunca' }}
                    </td>
                    <td class="total-cost">{{ formatCurrency(equipment.totalMaintenanceCost) }}</td>
                    <td>
                      <span class="status-badge" :class="equipment.status">
                        {{ getStatusText(equipment.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useReports } from '../composables/useReports'

const {
  isLoading,
  stores,
  warrantyExpired,
  warrantyExpiringSoon,
  storeMaintenanceStats,
  criticalEquipments,
  maintenanceCostsByMonth,
  totalMaintenanceCost,
  averageMonthlyCost,
  costVariation,
  loadReportsData,
  updateFilters,
  exportToExcel,
  exportToPDF,
  setupRealtimeListeners
} = useReports()

// Estados locais
const activeTab = ref<'expired' | 'expiring'>('expired')
const dateFromInput = ref('')
const dateToInput = ref('')
const selectedStore = ref('')
const selectedPeriod = ref('6')

// Cleanup function para listeners
let cleanupListeners: (() => void) | null = null

// Computed
const maxMonthlyCost = computed(() => {
  const costs = maintenanceCostsByMonth.value.map(item => item.cost)
  return Math.max(...costs, 1)
})

// Funções
const formatDate = (date: Date) => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const getStatusText = (status: string) => {
  const statusMap = {
    'ativo': 'Ativo',
    'manutencao': 'Em Manutenção',
    'inativo': 'Inativo',
    'descartado': 'Descartado'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const updateDateFilters = () => {
  const filters: any = {}
  
  if (dateFromInput.value) {
    filters.dateFrom = new Date(dateFromInput.value)
  }
  
  if (dateToInput.value) {
    filters.dateTo = new Date(dateToInput.value)
  }
  
  updateFilters(filters)
}

const updateStoreFilter = () => {
  updateFilters({ store: selectedStore.value || undefined })
}

const updatePeriodFilter = () => {
  updateFilters({ period: parseInt(selectedPeriod.value) })
}

onMounted(async () => {
  cleanupListeners = setupRealtimeListeners()
  await loadReportsData()
})

onUnmounted(() => {
  if (cleanupListeners) {
    cleanupListeners()
  }
})
</script>

<style scoped>
.reports-view {
  padding: var(--space-4);
  min-height: 100vh;
  background: #e5eaee !important;
}

.reports-header {
  margin-bottom: var(--space-6);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: var(--space-6);
  background: var(--color-white);
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

.export-buttons {
  display: flex;
  gap: var(--space-3);
}

.btn-text {
  display: inline;
}

.reports-filters {
  margin-bottom: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
}

.filter-group {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
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

.reports-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.report-cards {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-6);
}

.card {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
  transition: all var(--transition-fast);
}

.card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
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
  margin: 0;
}

.chart-container {
  height: 300px;
  margin-bottom: var(--space-6);
}

.month-chart {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 100%;
  gap: var(--space-2);
  padding: var(--space-4) 0;
}

.month-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: end;
  min-height: 200px;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, var(--color-black), var(--color-gray-700));
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  transition: height var(--transition-slow);
  min-height: 4px;
}

.month-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  margin-top: var(--space-2);
  text-align: center;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
}

.stat {
  text-align: center;
  padding: var(--space-4);
  background: var(--color-gray-50);
  border-radius: var(--radius-xl);
}

.stat-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--space-2);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-gray-900);
}

.text-success {
  color: var(--color-success) !important;
}

.text-error {
  color: var(--color-error) !important;
}

.warranty-tabs {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.tab-button {
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--color-gray-300);
  background: var(--color-white);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.tab-button:hover {
  background: var(--color-gray-50);
}

.tab-button.active {
  background: var(--color-black);
  color: var(--color-white);
  border-color: var(--color-black);
}

.warranty-content {
  min-height: 200px;
}

.warranty-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.warranty-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
}

.warranty-item:hover {
  background: var(--color-gray-50);
  transform: translateY(-1px);
}

.warranty-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.equipment-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
  font-size: var(--font-size-sm);
}

.equipment-location {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
}

.warranty-date {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.warranty-date.expired {
  color: var(--color-error);
}

.warranty-date.expiring {
  color: var(--color-warning);
}

.report-tables {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: var(--space-3) var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--color-gray-200);
}

.table th {
  background: var(--color-gray-50);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
}

.table tbody tr:hover {
  background: var(--color-gray-50);
}

.store-name,
.equipment-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-900);
}

.preventive-count {
  color: var(--color-info);
  font-weight: var(--font-weight-medium);
}

.corrective-count {
  color: var(--color-warning);
  font-weight: var(--font-weight-medium);
}

.total-count {
  font-weight: var(--font-weight-bold);
}

.total-cost,
.average-cost {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-900);
}

.count-badge {
  background: var(--color-error-light);
  color: var(--color-error);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.maintenance-count {
  text-align: center;
}

.last-maintenance {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.status-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.status-badge.ativo {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.manutencao {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.status-badge.inativo {
  background: var(--color-gray-200);
  color: var(--color-gray-600);
}

.status-badge.descartado {
  background: var(--color-error-light);
  color: var(--color-error);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .report-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .reports-view {
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
  
  .export-buttons {
    justify-content: center;
  }
  
  .btn-text {
    display: none;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
  
  .card-header,
  .card-body {
    padding: var(--space-4);
  }
  
  .warranty-tabs {
    flex-direction: column;
  }
  
  .warranty-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .table-container {
    font-size: var(--font-size-sm);
  }
  
  .table th,
  .table td {
    padding: var(--space-2) var(--space-3);
  }
}

@media (max-width: 480px) {
  .reports-view {
    padding: var(--space-2);
  }
  
  .month-chart {
    gap: var(--space-1);
  }
  
  .month-label {
    font-size: var(--font-size-2xs);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
