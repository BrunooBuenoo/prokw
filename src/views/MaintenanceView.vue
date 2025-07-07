<template>
  <div class="maintenance-view">
    <div class="maintenance-header">
      <h1>Manutenções</h1>
      <button 
        v-if="canManageEquipments"
        class="btn btn-primary" 
        @click="showAddModal = true"
      >
        <font-awesome-icon :icon="['fas', 'plus']" />
        Nova Manutenção
      </button>
    </div>
    
    <div class="maintenance-filters">
      <div class="filter-group">
        <input 
          type="text" 
          placeholder="Buscar manutenção..." 
          class="form-input"
          v-model="searchQuery"
        />
        <select v-model="selectedType" class="form-select">
          <option value="">Todos os tipos</option>
          <option value="preventiva">Preventiva</option>
          <option value="corretiva">Corretiva</option>
        </select>
        <select v-model="selectedStatus" class="form-select">
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em-andamento">Em Andamento</option>
          <option value="concluida">Concluída</option>
        </select>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin" />
      <p>Carregando manutenções...</p>
    </div>
    
    <div v-else-if="filteredMaintenances.length === 0" class="empty-state">
      <font-awesome-icon :icon="['fas', 'wrench']" class="empty-icon" />
      <h3>Nenhuma manutenção encontrada</h3>
      <p>Comece registrando sua primeira manutenção</p>
      <button class="btn btn-primary" @click="showAddModal = true">
        Registrar Primeira Manutenção
      </button>
    </div>
    
    <div v-else class="maintenance-table">
      <table class="table">
        <thead>
          <tr>
            <th>Equipamento</th>
            <th>Tipo</th>
            <th>Responsável</th>
            <th>Data Início</th>
            <th>Status</th>
            <th>Custo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="maintenance in filteredMaintenances" :key="maintenance.id">
            <td>{{ maintenance.equipmentName }}</td>
            <td>
              <span class="badge" :class="maintenance.type">
                {{ maintenance.type }}
              </span>
            </td>
            <td>{{ maintenance.technician || maintenance.companyName || 'Não definido' }}</td>
            <td>{{ formatDate(maintenance.startDate) }}</td>
            <td>
              <span class="status-badge" :class="maintenance.status">
                {{ getStatusText(maintenance.status) }}
              </span>
            </td>
            <td>{{ formatCurrency(maintenance.cost) }}</td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-sm btn-secondary" @click="viewMaintenance(maintenance)">
                  <font-awesome-icon :icon="['fas', 'eye']" />
                </button>
                <button 
                  v-if="canManageEquipments"
                  class="btn btn-sm btn-primary" 
                  @click="editMaintenance(maintenance)"
                >
                  <font-awesome-icon :icon="['fas', 'edit']" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { 
  collection, 
  getDocs, 
  query,
  orderBy
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Maintenance } from '../types'

const { canManageEquipments } = useAuth()

const showAddModal = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const isLoading = ref(false)
const maintenances = ref<(Maintenance & { equipmentName: string; companyName?: string })[]>([])

const filteredMaintenances = computed(() => {
  let filtered = maintenances.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(maintenance => 
      maintenance.equipmentName.toLowerCase().includes(query) ||
      maintenance.technician?.toLowerCase().includes(query) ||
      maintenance.companyName?.toLowerCase().includes(query)
    )
  }

  if (selectedType.value) {
    filtered = filtered.filter(maintenance => maintenance.type === selectedType.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(maintenance => maintenance.status === selectedStatus.value)
  }

  return filtered
})

const loadMaintenances = async () => {
  isLoading.value = true
  try {
    const maintenancesQuery = query(
      collection(db, 'manutencoes'),
      orderBy('createdAt', 'desc')
    )
    
    const maintenancesSnapshot = await getDocs(maintenancesQuery)
    const maintenancesList = maintenancesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Maintenance[]

    // Load equipment names and company names
    const enrichedMaintenances = await Promise.all(
      maintenancesList.map(async (maintenance) => {
        let equipmentName = 'Equipamento não encontrado'
        let companyName = undefined

        // Load equipment name
        try {
          const equipmentQuery = query(collection(db, 'equipamentos'))
          const equipmentSnapshot = await getDocs(equipmentQuery)
          const equipment = equipmentSnapshot.docs.find(doc => doc.id === maintenance.equipmentId)
          if (equipment) {
            equipmentName = equipment.data().name
          }
        } catch (error) {
          console.error('Error loading equipment:', error)
        }

        // Load company name if external maintenance
        if (maintenance.isExternal && maintenance.companyId) {
          try {
            const companyQuery = query(collection(db, 'empresas'))
            const companySnapshot = await getDocs(companyQuery)
            const company = companySnapshot.docs.find(doc => doc.id === maintenance.companyId)
            if (company) {
              companyName = company.data().name
            }
          } catch (error) {
            console.error('Error loading company:', error)
          }
        }

        return {
          ...maintenance,
          equipmentName,
          companyName
        }
      })
    )

    maintenances.value = enrichedMaintenances
  } catch (error) {
    console.error('Error loading maintenances:', error)
  } finally {
    isLoading.value = false
  }
}

const getStatusText = (status: string) => {
  const statusMap = {
    'pendente': 'Pendente',
    'em-andamento': 'Em Andamento',
    'concluida': 'Concluída'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const viewMaintenance = (maintenance: any) => {
  console.log('View maintenance:', maintenance)
}

const editMaintenance = (maintenance: any) => {
  console.log('Edit maintenance:', maintenance)
}

onMounted(() => {
  loadMaintenances()
})
</script>

<style scoped>
.maintenance-view {
  padding: var(--spacing-6);
}

.maintenance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.maintenance-header h1 {
  margin: 0;
  color: var(--neutral-900);
}

.maintenance-filters {
  margin-bottom: var(--spacing-6);
}

.filter-group {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--spacing-4);
}

.loading-state {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--neutral-500);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-12);
  color: var(--neutral-500);
}

.empty-icon {
  font-size: var(--font-size-4xl);
  margin-bottom: var(--spacing-4);
}

.maintenance-table {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  overflow: hidden;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: var(--spacing-4);
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

.badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.badge.preventiva {
  background-color: var(--primary-100);
  color: var(--primary-700);
}

.badge.corretiva {
  background-color: var(--warning-100);
  color: var(--warning-700);
}

.status-badge {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge.pendente {
  background-color: var(--neutral-100);
  color: var(--neutral-700);
}

.status-badge.em-andamento {
  background-color: var(--warning-100);
  color: var(--warning-700);
}

.status-badge.concluida {
  background-color: var(--success-100);
  color: var(--success-700);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-2);
}

@media (max-width: 1024px) {
  .filter-group {
    grid-template-columns: 1fr 1fr;
  }
  
  .maintenance-table {
    overflow-x: auto;
  }
}

@media (max-width: 768px) {
  .maintenance-view {
    padding: var(--spacing-4);
  }
  
  .maintenance-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
}
</style>