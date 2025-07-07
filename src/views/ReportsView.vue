<template>
  <div class="reports-view">
    <div class="reports-header">
      <h1>Relatórios</h1>
      <div class="export-buttons">
        <button class="btn btn-secondary" @click="exportToExcel">
          <font-awesome-icon :icon="['fas', 'file-excel']" />
          Exportar Excel
        </button>
        <button class="btn btn-error" @click="exportToPDF">
          <font-awesome-icon :icon="['fas', 'file-pdf']" />
          Exportar PDF
        </button>
      </div>
    </div>
    
    <div class="reports-filters">
      <div class="filter-group">
        <input 
          type="date" 
          v-model="dateFrom" 
          class="form-input"
          placeholder="Data de"
        />
        <input 
          type="date" 
          v-model="dateTo" 
          class="form-input"
          placeholder="Data até"
        />
        <select v-model="selectedStore" class="form-select">
          <option value="">Todas as lojas</option>
          <option value="Centro">Centro</option>
          <option value="Shopping Norte">Shopping Norte</option>
          <option value="Matriz">Matriz</option>
          <option value="Filial Sul">Filial Sul</option>
        </select>
        <button class="btn btn-primary" @click="generateReport">
          <font-awesome-icon :icon="['fas', 'chart-bar']" />
          Gerar Relatório
        </button>
      </div>
    </div>
    
    <div class="reports-content">
      <div class="report-cards">
        <div class="card">
          <div class="card-header">
            <h3>Gastos com Manutenção</h3>
            <select v-model="maintenancePeriod" class="form-select">
              <option value="3">Últimos 3 meses</option>
              <option value="6">Últimos 6 meses</option>
              <option value="12">Último ano</option>
            </select>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="maintenanceChart"></canvas>
            </div>
            <div class="summary-stats">
              <div class="stat">
                <span class="stat-label">Total gasto:</span>
                <span class="stat-value">R$ 45.280,00</span>
              </div>
              <div class="stat">
                <span class="stat-label">Média mensal:</span>
                <span class="stat-value">R$ 7.546,67</span>
              </div>
              <div class="stat">
                <span class="stat-label">Variação:</span>
                <span class="stat-value text-success">-12%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>Equipamentos Fora de Garantia</h3>
          </div>
          <div class="card-body">
            <div class="warranty-list">
              <div class="warranty-item" v-for="item in warrantyExpired" :key="item.id">
                <div class="warranty-info">
                  <span class="equipment-name">{{ item.name }}</span>
                  <span class="equipment-location">{{ item.location }}</span>
                </div>
                <div class="warranty-date">
                  Venceu em {{ formatDate(item.warrantyEnd) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="report-tables">
        <div class="card">
          <div class="card-header">
            <h3>Frequência de Manutenções por Loja</h3>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Loja</th>
                  <th>Preventivas</th>
                  <th>Corretivas</th>
                  <th>Total</th>
                  <th>Custo Total</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="store in storeMaintenanceStats" :key="store.name">
                  <td>{{ store.name }}</td>
                  <td>{{ store.preventive }}</td>
                  <td>{{ store.corrective }}</td>
                  <td>{{ store.total }}</td>
                  <td>{{ formatCurrency(store.totalCost) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>Equipamentos Críticos</h3>
            <small>Equipamentos com mais de 3 manutenções no período</small>
          </div>
          <div class="card-body">
            <table class="table">
              <thead>
                <tr>
                  <th>Equipamento</th>
                  <th>Loja</th>
                  <th>Manutenções</th>
                  <th>Último Reparo</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="equipment in criticalEquipments" :key="equipment.id">
                  <td>{{ equipment.name }}</td>
                  <td>{{ equipment.store }}</td>
                  <td>{{ equipment.maintenanceCount }}</td>
                  <td>{{ formatDate(equipment.lastMaintenance) }}</td>
                  <td>
                    <span class="status-badge" :class="equipment.status">
                      {{ equipment.status }}
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
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const dateFrom = ref('')
const dateTo = ref('')
const selectedStore = ref('')
const maintenancePeriod = ref('6')

// Mock data
const warrantyExpired = ref([
  {
    id: '1',
    name: 'Computador Dell OptiPlex',
    location: 'Centro',
    warrantyEnd: '2023-12-15'
  },
  {
    id: '2',
    name: 'Impressora HP LaserJet',
    location: 'Matriz',
    warrantyEnd: '2023-11-20'
  },
  {
    id: '3',
    name: 'Nobreak SMS',
    location: 'Shopping Norte',
    warrantyEnd: '2023-10-08'
  }
])

const storeMaintenanceStats = ref([
  {
    name: 'Centro',
    preventive: 12,
    corrective: 8,
    total: 20,
    totalCost: 8420.00
  },
  {
    name: 'Shopping Norte',
    preventive: 15,
    corrective: 6,
    total: 21,
    totalCost: 9150.00
  },
  {
    name: 'Matriz',
    preventive: 18,
    corrective: 12,
    total: 30,
    totalCost: 15230.00
  },
  {
    name: 'Filial Sul',
    preventive: 10,
    corrective: 4,
    total: 14,
    totalCost: 5680.00
  }
])

const criticalEquipments = ref([
  {
    id: '1',
    name: 'Computador Dell Centro #001',
    store: 'Centro',
    maintenanceCount: 5,
    lastMaintenance: '2024-01-10',
    status: 'ativo'
  },
  {
    id: '2',
    name: 'Impressora HP Matriz #003',
    store: 'Matriz',
    maintenanceCount: 4,
    lastMaintenance: '2024-01-08',
    status: 'manutencao'
  },
  {
    id: '3',
    name: 'Roteador TP-Link Norte #002',
    store: 'Shopping Norte',
    maintenanceCount: 6,
    lastMaintenance: '2024-01-05',
    status: 'ativo'
  }
])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const generateReport = () => {
  console.log('Generating report with filters:', {
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    selectedStore: selectedStore.value
  })
}

const exportToExcel = () => {
  console.log('Exporting to Excel...')
}

const exportToPDF = () => {
  console.log('Exporting to PDF...')
}

onMounted(() => {
  // Initialize charts and load data
  console.log('Loading reports data...')
})
</script>

<style scoped>
.reports-view {
  padding: var(--spacing-6);
}

.reports-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.reports-header h1 {
  margin: 0;
  color: var(--neutral-900);
}

.export-buttons {
  display: flex;
  gap: var(--spacing-3);
}

.reports-filters {
  margin-bottom: var(--spacing-6);
}

.filter-group {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: var(--spacing-4);
}

.reports-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.report-cards {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--spacing-6);
}

.chart-container {
  height: 300px;
  margin-bottom: var(--spacing-4);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--neutral-50);
  border-radius: var(--border-radius-base);
  color: var(--neutral-500);
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

.stat {
  text-align: center;
  padding: var(--spacing-3);
  background-color: var(--neutral-50);
  border-radius: var(--border-radius-base);
}

.stat-label {
  display: block;
  font-size: var(--font-size-sm);
  color: var(--neutral-600);
  margin-bottom: var(--spacing-1);
}

.stat-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-900);
}

.warranty-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.warranty-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3);
  border: 1px solid var(--neutral-200);
  border-radius: var(--border-radius-base);
}

.warranty-info {
  display: flex;
  flex-direction: column;
}

.equipment-name {
  font-weight: var(--font-weight-medium);
  color: var(--neutral-900);
}

.equipment-location {
  font-size: var(--font-size-sm);
  color: var(--neutral-500);
}

.warranty-date {
  font-size: var(--font-size-sm);
  color: var(--error-600);
}

.report-tables {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: var(--spacing-3);
  text-align: left;
  border-bottom: 1px solid var(--neutral-200);
}

.table th {
  background-color: var(--neutral-50);
  font-weight: var(--font-weight-semibold);
  color: var(--neutral-700);
}

.table tbody tr:hover {
  background-color: var(--neutral-50);
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.status-badge.ativo {
  background-color: var(--success-100);
  color: var(--success-700);
}

.status-badge.manutencao {
  background-color: var(--warning-100);
  color: var(--warning-700);
}

@media (max-width: 1024px) {
  .report-cards {
    grid-template-columns: 1fr;
  }
  
  .filter-group {
    grid-template-columns: 1fr 1fr;
  }
  
  .summary-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .reports-view {
    padding: var(--spacing-4);
  }
  
  .reports-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
  
  .export-buttons {
    justify-content: center;
  }
}
</style>