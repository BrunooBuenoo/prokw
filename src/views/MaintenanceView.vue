<template>
  <div class="maintenance-view">
    <div class="maintenance-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Gestão de Manutenções</h1>
          <p>Acompanhe e controle as manutenções dos equipamentos</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="exportData">
            <font-awesome-icon :icon="['fas', 'download']" />
            <span class="btn-text">Exportar</span>
          </button>
          <button class="btn btn-primary" @click="showAddModal = true">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span class="btn-text">Nova Manutenção</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="maintenance-filters">
      <div class="filter-group">
        <div class="search-container">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar manutenção..." 
            class="form-input search-input"
            v-model="searchQuery"
          />
        </div>
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
        <button 
          v-if="searchQuery || selectedType || selectedStatus" 
          class="btn btn-ghost clear-filters"
          @click="clearFilters"
        >
          <font-awesome-icon :icon="['fas', 'times']" />
          <span class="btn-text">Limpar</span>
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="loading-container">
        <div class="loading-spinner">
          <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin" />
        </div>
        <h3>Carregando manutenções...</h3>
        <p>Aguarde enquanto buscamos os dados</p>
      </div>
    </div>
    
    <div v-else-if="filteredMaintenances.length === 0" class="empty-state">
      <div class="empty-container">
        <div class="empty-icon">
          <font-awesome-icon :icon="['fas', 'wrench']" />
        </div>
        <h3>{{ searchQuery || selectedType || selectedStatus ? 'Nenhuma manutenção encontrada' : 'Nenhuma manutenção registrada' }}</h3>
        <p>{{ searchQuery || selectedType || selectedStatus ? 'Tente ajustar os filtros de busca' : 'Comece registrando sua primeira manutenção' }}</p>
        <button v-if="canManageEquipments" class="btn btn-primary" @click="showAddModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" />
          {{ searchQuery || selectedType || selectedStatus ? 'Registrar Manutenção' : 'Registrar Primeira Manutenção' }}
        </button>
      </div>
    </div>

    <div v-else class="maintenance-content">
      <!-- View Toggle -->
      <div class="view-controls">
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <font-awesome-icon :icon="['fas', 'table']" />
            <span class="btn-text">Tabela</span>
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <font-awesome-icon :icon="['fas', 'th-large']" />
            <span class="btn-text">Cards</span>
          </button>
        </div>
        <div class="results-info">
          {{ filteredMaintenances.length }} manutenção{{ filteredMaintenances.length !== 1 ? 'ões' : '' }} encontrada{{ filteredMaintenances.length !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Table View -->
      <div v-if="viewMode === 'table'" class="maintenance-table">
        <div class="table-container">
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
                <td>
                  <div class="equipment-info">
                    <span class="equipment-name">{{ maintenance.equipmentName }}</span>
                    <span class="equipment-code">{{ maintenance.equipmentCode || 'N/A' }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="maintenance.type">
                    <font-awesome-icon :icon="getTypeIcon(maintenance.type)" />
                    {{ getTypeText(maintenance.type) }}
                  </span>
                </td>
                <td>{{ maintenance.technician || maintenance.companyName || 'Não definido' }}</td>
                <td>{{ formatDate(maintenance.startDate) }}</td>
                <td>
                  <span class="status-badge" :class="maintenance.status">
                    <font-awesome-icon :icon="getStatusIcon(maintenance.status)" />
                    {{ getStatusText(maintenance.status) }}
                  </span>
                </td>
                <td class="cost-cell">{{ formatCurrency(maintenance.cost) }}</td>
                <td>
                  <div class="action-buttons">
                    <button 
                      class="btn btn-sm btn-secondary" 
                      @click="viewMaintenance(maintenance)"
                      title="Ver detalhes"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" />
                    </button>
                    <button 
                      v-if="canManageEquipments"
                      class="btn btn-sm btn-primary" 
                      @click="editMaintenance(maintenance)"
                      title="Editar"
                    >
                      <font-awesome-icon :icon="['fas', 'edit']" />
                    </button>
                    <button 
                      v-if="canManageEquipments && maintenance.status !== 'concluida'"
                      class="btn btn-sm btn-success" 
                      @click="completeMaintenance(maintenance)"
                      title="Concluir"
                    >
                      <font-awesome-icon :icon="['fas', 'check']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Grid View -->
      <div v-else class="maintenance-grid">
        <div 
          v-for="maintenance in filteredMaintenances" 
          :key="maintenance.id"
          class="maintenance-card"
          :class="{ 'urgent': isUrgent(maintenance) }"
        >
          <div class="card-header">
            <div class="card-title">
              <h3>{{ maintenance.equipmentName }}</h3>
              <span class="equipment-code">{{ maintenance.equipmentCode || 'N/A' }}</span>
            </div>
            <div class="card-badges">
              <span class="badge" :class="maintenance.type">
                <font-awesome-icon :icon="getTypeIcon(maintenance.type)" />
                {{ getTypeText(maintenance.type) }}
              </span>
              <span class="status-badge" :class="maintenance.status">
                <font-awesome-icon :icon="getStatusIcon(maintenance.status)" />
                {{ getStatusText(maintenance.status) }}
              </span>
            </div>
          </div>
          
          <div class="card-content">
            <div class="info-row">
              <font-awesome-icon :icon="['fas', 'user']" />
              <span>{{ maintenance.technician || maintenance.companyName || 'Não definido' }}</span>
            </div>
            <div class="info-row">
              <font-awesome-icon :icon="['fas', 'calendar']" />
              <span>{{ formatDate(maintenance.startDate) }}</span>
            </div>
            <div class="info-row">
              <font-awesome-icon :icon="['fas', 'dollar-sign']" />
              <span class="cost">{{ formatCurrency(maintenance.cost) }}</span>
            </div>
            <div v-if="maintenance.description" class="description">
              <font-awesome-icon :icon="['fas', 'file-text']" />
              <span>{{ maintenance.description.substring(0, 100) }}{{ maintenance.description.length > 100 ? '...' : '' }}</span>
            </div>
          </div>
          
          <div class="card-actions">
            <button 
              class="btn btn-sm btn-secondary" 
              @click="viewMaintenance(maintenance)"
            >
              <font-awesome-icon :icon="['fas', 'eye']" />
              <span class="btn-text">Ver</span>
            </button>
            <button 
              v-if="canManageEquipments"
              class="btn btn-sm btn-primary" 
              @click="editMaintenance(maintenance)"
            >
              <font-awesome-icon :icon="['fas', 'edit']" />
              <span class="btn-text">Editar</span>
            </button>
            <button 
              v-if="canManageEquipments && maintenance.status !== 'concluida'"
              class="btn btn-sm btn-success" 
              @click="completeMaintenance(maintenance)"
            >
              <font-awesome-icon :icon="['fas', 'check']" />
              <span class="btn-text">Concluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Maintenance Detail Modal -->
    <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Detalhes da Manutenção</h2>
          <button class="modal-close" @click="showDetailModal = false">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        <div class="modal-body" v-if="selectedMaintenance">
          <div class="detail-sections">
            <div class="detail-section">
              <h3>Informações Básicas</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Equipamento:</label>
                  <span>{{ selectedMaintenance.equipmentName }}</span>
                </div>
                <div class="detail-item">
                  <label>Tipo:</label>
                  <span class="badge" :class="selectedMaintenance.type">
                    {{ getTypeText(selectedMaintenance.type) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" :class="selectedMaintenance.status">
                    {{ getStatusText(selectedMaintenance.status) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Responsável:</label>
                  <span>{{ selectedMaintenance.technician || selectedMaintenance.companyName || 'Não definido' }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Datas e Custos</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Data de Início:</label>
                  <span>{{ formatDate(selectedMaintenance.startDate) }}</span>
                </div>
                <div class="detail-item" v-if="selectedMaintenance.endDate">
                  <label>Data de Conclusão:</label>
                  <span>{{ formatDate(selectedMaintenance.endDate) }}</span>
                </div>
                <div class="detail-item">
                  <label>Custo:</label>
                  <span class="cost">{{ formatCurrency(selectedMaintenance.cost) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section" v-if="selectedMaintenance.description">
              <h3>Descrição</h3>
              <p class="description-text">{{ selectedMaintenance.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Maintenance Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>{{ editingMaintenance ? 'Editar Manutenção' : 'Nova Manutenção' }}</h2>
          <button class="modal-close" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveMaintenance" class="maintenance-form">
            <div class="form-sections">
              <div class="form-section">
                <h3>Informações Básicas</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Equipamento *</label>
                    <select v-model="maintenanceForm.equipmentId" class="form-select" required>
                      <option value="">Selecione um equipamento</option>
                      <option v-for="equipment in availableEquipments" :key="equipment.id" :value="equipment.id">
                        {{ equipment.name }} - {{ equipment.code }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Tipo *</label>
                    <select v-model="maintenanceForm.type" class="form-select" required>
                      <option value="">Selecione o tipo</option>
                      <option value="preventiva">Preventiva</option>
                      <option value="corretiva">Corretiva</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Status *</label>
                    <select v-model="maintenanceForm.status" class="form-select" required>
                      <option value="pendente">Pendente</option>
                      <option value="em-andamento">Em Andamento</option>
                      <option value="concluida">Concluída</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h3>Responsável</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label class="checkbox-label">
                      <input type="checkbox" v-model="maintenanceForm.isExternal" />
                      Manutenção externa
                    </label>
                  </div>
                  <div class="form-group" v-if="!maintenanceForm.isExternal">
                    <label>Técnico Responsável</label>
                    <input 
                      type="text" 
                      v-model="maintenanceForm.technician" 
                      class="form-input"
                      placeholder="Nome do técnico"
                    />
                  </div>
                  <div class="form-group" v-if="maintenanceForm.isExternal">
                    <label>Empresa</label>
                    <select v-model="maintenanceForm.companyId" class="form-select">
                      <option value="">Selecione uma empresa</option>
                      <option v-for="company in availableCompanies" :key="company.id" :value="company.id">
                        {{ company.name }}
                      </option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h3>Datas e Custos</h3>
                <div class="form-grid">
                  <div class="form-group">
                    <label>Data de Início *</label>
                    <input 
                      type="date" 
                      v-model="maintenanceForm.startDate" 
                      class="form-input"
                      required
                    />
                  </div>
                  <div class="form-group" v-if="maintenanceForm.status === 'concluida'">
                    <label>Data de Conclusão</label>
                    <input 
                      type="date" 
                      v-model="maintenanceForm.endDate" 
                      class="form-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Custo (R$)</label>
                    <input 
                      type="number" 
                      v-model="maintenanceForm.cost" 
                      class="form-input"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                    />
                  </div>
                </div>
              </div>
              
              <div class="form-section">
                <h3>Observações</h3>
                <div class="form-group">
                  <label>Descrição</label>
                  <textarea 
                    v-model="maintenanceForm.description" 
                    class="form-textarea"
                    rows="4"
                    placeholder="Descreva os detalhes da manutenção..."
                  ></textarea>
                </div>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSaving">
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="fa-spin" />
                {{ isSaving ? 'Salvando...' : (editingMaintenance ? 'Atualizar' : 'Salvar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { 
  collection, 
  getDocs, 
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Maintenance, Equipment, Company } from '../types'

const { canManageEquipments } = useAuth()

// State
const showAddModal = ref(false)
const showDetailModal = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const viewMode = ref<'table' | 'grid'>('table')
const isLoading = ref(false)
const isSaving = ref(false)
const editingMaintenance = ref(false)

// Data
const maintenances = ref<(Maintenance & { equipmentName: string; equipmentCode?: string; companyName?: string })[]>([])
const availableEquipments = ref<Equipment[]>([])
const availableCompanies = ref<Company[]>([])
const selectedMaintenance = ref<any>(null)

// Form
const maintenanceForm = ref({
  equipmentId: '',
  type: '',
  status: 'pendente',
  technician: '',
  isExternal: false,
  companyId: '',
  startDate: '',
  endDate: '',
  cost: 0,
  description: ''
})

// Listeners
let maintenancesUnsubscribe: (() => void) | null = null

// Computed
const filteredMaintenances = computed(() => {
  let filtered = maintenances.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(maintenance => 
      maintenance.equipmentName.toLowerCase().includes(query) ||
      maintenance.technician?.toLowerCase().includes(query) ||
      maintenance.companyName?.toLowerCase().includes(query) ||
      maintenance.description?.toLowerCase().includes(query)
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

// Methods
const loadMaintenances = () => {
  isLoading.value = true
  
  const maintenancesQuery = query(
    collection(db, 'manutencoes'),
    orderBy('createdAt', 'desc')
  )
  
  maintenancesUnsubscribe = onSnapshot(maintenancesQuery, async (snapshot) => {
    try {
      const maintenancesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Maintenance[]

      // Load equipment names and company names
      const enrichedMaintenances = await Promise.all(
        maintenancesList.map(async (maintenance) => {
          let equipmentName = 'Equipamento não encontrado'
          let equipmentCode = undefined
          let companyName = undefined

          // Load equipment name
          try {
            const equipmentQuery = query(collection(db, 'equipamentos'))
            const equipmentSnapshot = await getDocs(equipmentQuery)
            const equipment = equipmentSnapshot.docs.find(doc => doc.id === maintenance.equipmentId)
            if (equipment) {
              const equipmentData = equipment.data()
              equipmentName = equipmentData.name
              equipmentCode = equipmentData.code
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
            equipmentCode,
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
  })
}

const loadEquipments = async () => {
  try {
    const equipmentsQuery = query(
      collection(db, 'equipamentos'),
      where('status', '==', 'ativo')
    )
    const snapshot = await getDocs(equipmentsQuery)
    availableEquipments.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipment[]
  } catch (error) {
    console.error('Error loading equipments:', error)
  }
}

const loadCompanies = async () => {
  try {
    const companiesQuery = query(
      collection(db, 'empresas'),
      where('status', '==', 'ativa')
    )
    const snapshot = await getDocs(companiesQuery)
    availableCompanies.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Company[]
  } catch (error) {
    console.error('Error loading companies:', error)
  }
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
}

const getStatusText = (status: string) => {
  const statusMap = {
    'pendente': 'Pendente',
    'em-andamento': 'Em Andamento',
    'concluida': 'Concluída'
  }
  return statusMap[status as keyof typeof statusMap] || status
}

const getTypeText = (type: string) => {
  const typeMap = {
    'preventiva': 'Preventiva',
    'corretiva': 'Corretiva'
  }
  return typeMap[type as keyof typeof typeMap] || type
}

const getStatusIcon = (status: string) => {
  const iconMap = {
    'pendente': ['fas', 'clock'],
    'em-andamento': ['fas', 'cog'],
    'concluida': ['fas', 'check-circle']
  }
  return iconMap[status as keyof typeof iconMap] || ['fas', 'question']
}

const getTypeIcon = (type: string) => {
  const iconMap = {
    'preventiva': ['fas', 'calendar-check'],
    'corretiva': ['fas', 'tools']
  }
  return iconMap[type as keyof typeof iconMap] || ['fas', 'wrench']
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

const isUrgent = (maintenance: any) => {
  return maintenance.status === 'em-andamento' && maintenance.type === 'corretiva'
}

const viewMaintenance = (maintenance: any) => {
  selectedMaintenance.value = maintenance
  showDetailModal.value = true
}

const editMaintenance = (maintenance: any) => {
  editingMaintenance.value = true
  maintenanceForm.value = {
    equipmentId: maintenance.equipmentId,
    type: maintenance.type,
    status: maintenance.status,
    technician: maintenance.technician || '',
    isExternal: maintenance.isExternal || false,
    companyId: maintenance.companyId || '',
    startDate: maintenance.startDate,
    endDate: maintenance.endDate || '',
    cost: maintenance.cost || 0,
    description: maintenance.description || ''
  }
  selectedMaintenance.value = maintenance
  showAddModal.value = true
}

const completeMaintenance = async (maintenance: any) => {
  try {
    await updateDoc(doc(db, 'manutencoes', maintenance.id), {
      status: 'concluida',
      endDate: new Date().toISOString().split('T')[0],
      updatedAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error completing maintenance:', error)
  }
}

const saveMaintenance = async () => {
  isSaving.value = true
  try {
    const maintenanceData = {
      ...maintenanceForm.value,
      cost: Number(maintenanceForm.value.cost),
      updatedAt: serverTimestamp()
    }

    if (editingMaintenance.value && selectedMaintenance.value) {
      await updateDoc(doc(db, 'manutencoes', selectedMaintenance.value.id), maintenanceData)
    } else {
      await addDoc(collection(db, 'manutencoes'), {
        ...maintenanceData,
        createdAt: serverTimestamp()
      })
    }

    closeModal()
  } catch (error) {
    console.error('Error saving maintenance:', error)
  } finally {
    isSaving.value = false
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingMaintenance.value = false
  selectedMaintenance.value = null
  maintenanceForm.value = {
    equipmentId: '',
    type: '',
    status: 'pendente',
    technician: '',
    isExternal: false,
    companyId: '',
    startDate: '',
    endDate: '',
    cost: 0,
    description: ''
  }
}

const exportData = () => {
  const csvContent = [
    ['Equipamento', 'Tipo', 'Responsável', 'Data Início', 'Status', 'Custo', 'Descrição'],
    ...filteredMaintenances.value.map(m => [
      m.equipmentName,
      getTypeText(m.type),
      m.technician || m.companyName || 'Não definido',
      formatDate(m.startDate),
      getStatusText(m.status),
      m.cost.toString(),
      m.description || ''
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `manutencoes_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// Lifecycle
onMounted(() => {
  loadMaintenances()
  loadEquipments()
  loadCompanies()
})

onUnmounted(() => {
  if (maintenancesUnsubscribe) {
    maintenancesUnsubscribe()
  }
})
</script>

<style scoped>
.maintenance-view {
  padding: 2rem;
  background: #f8fafc;
  min-height: 100vh;
}

.maintenance-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 2rem;
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.header-text h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.5rem 0;
  background: linear-gradient(135deg, #1a202c, #4a5568);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-text p {
  color: #718096;
  font-size: 1.125rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.maintenance-filters {
  margin-bottom: 1.5rem;
}

.filter-group {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: 1rem;
  align-items: center;
}

.search-container {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #a0aec0;
  z-index: 1;
}

.search-input {
  padding-left: 2.5rem;
}

.clear-filters {
  white-space: nowrap;
}

.loading-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-container,
.empty-container {
  text-align: center;
  max-width: 400px;
}

.loading-spinner,
.empty-icon {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  font-size: 2rem;
  color: #4299e1;
}

.loading-container h3,
.empty-container h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a202c;
  margin: 0 0 0.75rem 0;
}

.loading-container p,
.empty-container p {
  color: #718096;
  font-size: 1.125rem;
  margin: 0 0 1.5rem 0;
}

.maintenance-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.view-toggle {
  display: flex;
  background: #f7fafc;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
}

.toggle-btn.active {
  background: white;
  color: #4299e1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.results-info {
  color: #718096;
  font-size: 0.875rem;
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
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table tbody tr:hover {
  background: #f7fafc;
}

.equipment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.equipment-name {
  font-weight: 600;
  color: #1a202c;
}

.equipment-code {
  font-size: 0.75rem;
  color: #718096;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge.preventiva {
  background: #e6fffa;
  color: #00a693;
}

.badge.corretiva {
  background: #fef5e7;
  color: #d69e2e;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.pendente {
  background: #f7fafc;
  color: #718096;
}

.status-badge.em-andamento {
  background: #fef5e7;
  color: #d69e2e;
}

.status-badge.concluida {
  background: #f0fff4;
  color: #38a169;
}

.cost-cell {
  font-weight: 600;
  color: #1a202c;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.maintenance-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 0.75rem;
  padding: 1.5rem;
  transition: all 0.2s;
}

.maintenance-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.maintenance-card.urgent {
  border-color: #f56565;
  background: linear-gradient(135deg, #fff5f5, #ffffff);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-title h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 0.25rem 0;
}

.card-badges {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.card-content {
  margin-bottom: 1.5rem;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.info-row svg {
  width: 1rem;
  height: 1rem;
  color: #718096;
}

.cost {
  font-weight: 600;
  color: #1a202c;
}

.description {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #718096;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #718096;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.375rem;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f7fafc;
  color: #4a5568;
}

.modal-body {
  padding: 1.5rem;
}

.detail-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.detail-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #718096;
}

.detail-item span {
  font-weight: 500;
  color: #1a202c;
}

.description-text {
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
}

.maintenance-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1a202c;
  margin: 0 0 1rem 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #4a5568;
}

.checkbox-label {
  flex-direction: row !important;
  align-items: center;
  gap: 0.5rem !important;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #3182ce;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-success {
  background: #48bb78;
  color: white;
}

.btn-success:hover {
  background: #38a169;
}

.btn-ghost {
  background: transparent;
  color: #718096;
  border: 1px solid #e2e8f0;
}

.btn-ghost:hover {
  background: #f7fafc;
  color: #4a5568;
}

.btn-sm {
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .filter-group {
    grid-template-columns: 1fr 1fr;
  }
  
  .clear-filters {
    grid-column: span 2;
  }
  
  .maintenance-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .maintenance-view {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    align-items: stretch;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
  
  .clear-filters {
    grid-column: span 1;
  }
  
  .view-controls {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .maintenance-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .table-container {
    font-size: 0.875rem;
  }
  
  .btn-text {
    display: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: 2rem;
  }
  
  .maintenance-card {
    padding: 1rem;
  }
  
  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .card-badges {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .action-buttons {
    justify-content: center;
  }
}
</style>
