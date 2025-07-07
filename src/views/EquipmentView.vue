<template>
  <div class="equipment-view">
    <div class="equipment-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Gestão de Equipamentos</h1>
          <p>Controle completo do seu parque tecnológico</p>
        </div>
        <div class="header-actions" v-if="canManageEquipments">
          <button class="btn btn-secondary" @click="exportData">
            <font-awesome-icon :icon="['fas', 'download']" />
            Exportar
          </button>
          <button class="btn btn-primary" @click="showAddModal = true">
            <font-awesome-icon :icon="['fas', 'plus']" />
            Novo Equipamento
          </button>
        </div>
      </div>
    </div>
    
    <div class="equipment-filters">
      <div class="filters-card">
        <div class="filters-header">
          <h3>Filtros</h3>
          <button class="btn btn-ghost btn-sm" @click="clearFilters">
            <font-awesome-icon :icon="['fas', 'times']" />
            Limpar
          </button>
        </div>
        <div class="filters-grid">
          <div class="filter-group">
            <label class="filter-label">Buscar</label>
            <div class="search-input">
              <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
              <input 
                type="text" 
                placeholder="Nome, código ou série..." 
                class="form-input"
                v-model="searchQuery"
              />
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Loja</label>
            <select v-model="selectedStore" class="form-select">
              <option value="">Todas as lojas</option>
              <option v-for="store in stores" :key="store" :value="store">
                {{ store }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Tipo</label>
            <select v-model="selectedType" class="form-select">
              <option value="">Todos os tipos</option>
              <option v-for="type in equipmentTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <select v-model="selectedStatus" class="form-select">
              <option value="">Todos os status</option>
              <option value="ativo">Ativo</option>
              <option value="manutencao">Manutenção</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="loading-container">
        <div class="loading-spinner">
          <font-awesome-icon :icon="['fas', 'cogs']" class="loading-icon" />
        </div>
        <h3>Carregando equipamentos...</h3>
        <p>Aguarde enquanto buscamos os dados</p>
      </div>
    </div>
    
    <div v-else-if="filteredEquipments.length === 0" class="empty-state">
      <div class="empty-container">
        <div class="empty-icon">
          <font-awesome-icon :icon="['fas', 'desktop']" />
        </div>
        <h3>{{ searchQuery || selectedStore || selectedType || selectedStatus ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento cadastrado' }}</h3>
        <p>{{ searchQuery || selectedStore || selectedType || selectedStatus ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro equipamento' }}</p>
        <button v-if="canManageEquipments" class="btn btn-primary" @click="showAddModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" />
          {{ searchQuery || selectedStore || selectedType || selectedStatus ? 'Cadastrar Equipamento' : 'Cadastrar Primeiro Equipamento' }}
        </button>
      </div>
    </div>
    
    <div v-else class="equipment-content">
      <div class="content-header">
        <div class="results-info">
          <span class="results-count">{{ filteredEquipments.length }}</span>
          <span class="results-text">equipamentos encontrados</span>
        </div>
        <div class="view-controls">
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'grid' }"
            @click="viewMode = 'grid'"
          >
            <font-awesome-icon :icon="['fas', 'th-large']" />
          </button>
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'list' }"
            @click="viewMode = 'list'"
          >
            <font-awesome-icon :icon="['fas', 'list']" />
          </button>
        </div>
      </div>
      
      <div v-if="viewMode === 'grid'" class="equipment-grid">
        <div 
          v-for="equipment in filteredEquipments" 
          :key="equipment.id"
          class="equipment-card"
          @click="viewEquipment(equipment)"
        >
          <div class="card-header">
            <div class="equipment-info">
              <h3>{{ equipment.name }}</h3>
              <p class="equipment-code">{{ equipment.internalCode }}</p>
            </div>
            <div class="equipment-status" :class="equipment.status">
              <div class="status-dot"></div>
              {{ getStatusText(equipment.status) }}
            </div>
          </div>
          
          <div class="card-body">
            <div class="equipment-details">
              <div class="detail-item">
                <font-awesome-icon :icon="['fas', 'tag']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Tipo</span>
                  <span class="detail-value">{{ equipment.type }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <font-awesome-icon :icon="['fas', 'industry']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Marca/Modelo</span>
                  <span class="detail-value">{{ equipment.brand }} {{ equipment.model }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Localização</span>
                  <span class="detail-value">{{ equipment.store }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <font-awesome-icon :icon="['fas', 'shield-alt']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Garantia</span>
                  <span class="detail-value" :class="{ 'warranty-expiring': isWarrantyExpiring(equipment.warrantyUntil ?? '') }">
                    {{ formatDate(equipment.warrantyUntil ?? '') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="card-footer">
            <div class="equipment-actions">
              <button 
                class="action-btn secondary" 
                @click.stop="viewEquipment(equipment)"
                title="Ver detalhes"
              >
                <font-awesome-icon :icon="['fas', 'eye']" />
              </button>
              <button 
                v-if="canManageEquipments"
                class="action-btn primary" 
                @click.stop="editEquipment(equipment)"
                title="Editar"
              >
                <font-awesome-icon :icon="['fas', 'edit']" />
              </button>
              <button 
                class="action-btn warning" 
                @click.stop="newMaintenance(equipment)"
                title="Nova manutenção"
              >
                <font-awesome-icon :icon="['fas', 'wrench']" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="equipment-table">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Tipo</th>
                <th>Marca/Modelo</th>
                <th>Localização</th>
                <th>Status</th>
                <th>Garantia</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="equipment in filteredEquipments" :key="equipment.id" class="table-row">
                <td>
                  <div class="equipment-cell">
                    <div class="equipment-name">{{ equipment.name }}</div>
                    <div class="equipment-code">{{ equipment.internalCode }}</div>
                  </div>
                </td>
                <td>
                  <span class="type-badge">{{ equipment.type }}</span>
                </td>
                <td>{{ equipment.brand }} {{ equipment.model }}</td>
                <td>
                  <div class="location-cell">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                    {{ equipment.store }}
                  </div>
                </td>
                <td>
                  <div class="status-cell" :class="equipment.status">
                    <div class="status-dot"></div>
                    {{ getStatusText(equipment.status) }}
                  </div>
                </td>
                <td>
                  <span :class="{ 'warranty-expiring': isWarrantyExpiring(equipment.warrantyUntil ?? '') }">
                    {{ formatDate(equipment.warrantyUntil ?? '') }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="action-btn secondary" @click="viewEquipment(equipment)">
                      <font-awesome-icon :icon="['fas', 'eye']" />
                    </button>
                    <button v-if="canManageEquipments" class="action-btn primary" @click="editEquipment(equipment)">
                      <font-awesome-icon :icon="['fas', 'edit']" />
                    </button>
                    <button class="action-btn warning" @click="newMaintenance(equipment)">
                      <font-awesome-icon :icon="['fas', 'wrench']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Equipment Modal -->
    <transition name="modal-fade">
      <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <h2>{{ editingEquipment ? 'Editar Equipamento' : 'Novo Equipamento' }}</h2>
              <p>{{ editingEquipment ? 'Atualize as informações do equipamento' : 'Cadastre um novo equipamento no sistema' }}</p>
            </div>
            <button class="modal-close" @click="closeModal">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          
          <form @submit.prevent="saveEquipment" class="modal-body">
            <div class="form-section">
              <h3 class="section-title">Informações Básicas</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Nome do Equipamento *</label>
                  <input 
                    type="text" 
                    class="form-input"
                    v-model="equipmentForm.name"
                    placeholder="Ex: Computador Dell OptiPlex"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Código Interno *</label>
                  <input 
                    type="text" 
                    class="form-input"
                    v-model="equipmentForm.internalCode"
                    placeholder="Ex: EQ001"
                    required
                  />
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Tipo *</label>
                  <select class="form-select" v-model="equipmentForm.type" required>
                    <option value="">Selecione o tipo</option>
                    <option v-for="type in equipmentTypes" :key="type" :value="type">
                      {{ type }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Loja *</label>
                  <select class="form-select" v-model="equipmentForm.store" required>
                    <option value="">Selecione a loja</option>
                    <option v-for="store in stores" :key="store" :value="store">
                      {{ store }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h3 class="section-title">Especificações</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Marca *</label>
                  <input 
                    type="text" 
                    class="form-input"
                    v-model="equipmentForm.brand"
                    placeholder="Ex: Dell"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Modelo *</label>
                  <input 
                    type="text" 
                    class="form-input"
                    v-model="equipmentForm.model"
                    placeholder="Ex: OptiPlex 7090"
                    required
                  />
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Número de Série</label>
                  <input 
                    type="text" 
                    class="form-input"
                    v-model="equipmentForm.serialNumber"
                    placeholder="Ex: ABC123456789"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Patrimônio</label>
                  <input 
                    type="text" 
                    class="form-input"
                    v-model="equipmentForm.patrimonyNumber"
                    placeholder="Ex: PAT001"
                  />
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h3 class="section-title">Informações Comerciais</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Data de Compra</label>
                  <input 
                    type="date" 
                    class="form-input"
                    v-model="equipmentForm.purchaseDate"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Garantia até</label>
                  <input 
                    type="date" 
                    class="form-input"
                    v-model="equipmentForm.warrantyUntil"
                  />
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Valor de Compra</label>
                  <input 
                    type="number" 
                    step="0.01"
                    class="form-input"
                    v-model="equipmentForm.purchaseValue"
                    placeholder="0,00"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Status</label>
                  <select class="form-select" v-model="equipmentForm.status">
                    <option value="ativo">Ativo</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div class="form-section">
              <h3 class="section-title">Observações</h3>
              <div class="form-group">
                <label class="form-label">Notas Adicionais</label>
                <textarea 
                  class="form-textarea"
                  v-model="equipmentForm.notes"
                  rows="4"
                  placeholder="Informações adicionais sobre o equipamento..."
                ></textarea>
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSaving">
                <font-awesome-icon 
                  v-if="isSaving"
                  :icon="['fas', 'spinner']" 
                  class="loading-icon"
                />
                {{ isSaving ? 'Salvando...' : (editingEquipment ? 'Atualizar' : 'Cadastrar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe
} from 'firebase/firestore'
import { db } from '../firebase/config'

const { canManageEquipments } = useAuth()

const showAddModal = ref(false)
const editingEquipment = ref<Equipment | null>(null)
const isSaving = ref(false)
const isLoading = ref(true)
const viewMode = ref('grid')

// Filters
const searchQuery = ref('')
const selectedStore = ref('')
const selectedType = ref('')
const selectedStatus = ref('')

// Data
interface Equipment {
  id?: string
  name: string
  internalCode: string
  type: string
  store: string
  brand: string
  model: string
  serialNumber?: string
  patrimonyNumber?: string
  purchaseDate?: string
  warrantyUntil?: string
  purchaseValue?: number
  status: string
  notes?: string
  [key: string]: any
}

const equipments = ref<Equipment[]>([])
const stores = ref(['Centro', 'Shopping Norte', 'Matriz', 'Filial Sul'])
const equipmentTypes = ref(['Computador', 'Impressora', 'Roteador', 'Nobreak', 'Monitor', 'Servidor', 'Switch', 'Outro'])

const equipmentForm = ref({
  name: '',
  internalCode: '',
  type: '',
  store: '',
  brand: '',
  model: '',
  serialNumber: '',
  patrimonyNumber: '',
  purchaseDate: '',
  warrantyUntil: '',
  purchaseValue: 0,
  status: 'ativo',
  notes: ''
})

const filteredEquipments = computed(() => {
  let filtered = equipments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(equipment => 
      equipment.name.toLowerCase().includes(query) ||
      equipment.internalCode.toLowerCase().includes(query) ||
      equipment.serialNumber?.toLowerCase().includes(query) ||
      equipment.brand.toLowerCase().includes(query) ||
      equipment.model.toLowerCase().includes(query)
    )
  }

  if (selectedStore.value) {
    filtered = filtered.filter(equipment => equipment.store === selectedStore.value)
  }

  if (selectedType.value) {
    filtered = filtered.filter(equipment => equipment.type === selectedType.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(equipment => equipment.status === selectedStatus.value)
  }

  return filtered
})

const getStatusText = (status: string | number) => {
  const statusMap: Record<string, string> = {
    'ativo': 'Ativo',
    'manutencao': 'Manutenção',
    'inativo': 'Inativo'
  }
  return statusMap[String(status)] || status
}

const formatDate = (date: string | number | Date) => {
  if (!date) return 'Não informado'
  return new Date(date).toLocaleDateString('pt-BR')
}

const isWarrantyExpiring = (warrantyDate: string | number | Date) => {
  if (!warrantyDate) return false
  const today = new Date()
  const warranty = new Date(warrantyDate)
  const diffTime = warranty.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 30 && diffDays >= 0
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStore.value = ''
  selectedType.value = ''
  selectedStatus.value = ''
}

const resetForm = () => {
  equipmentForm.value = {
    name: '',
    internalCode: '',
    type: '',
    store: '',
    brand: '',
    model: '',
    serialNumber: '',
    patrimonyNumber: '',
    purchaseDate: '',
    warrantyUntil: '',
    purchaseValue: 0,
    status: 'ativo',
    notes: ''
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingEquipment.value = null
  resetForm()
}

const viewEquipment = (equipment: any) => {
  console.log('View equipment:', equipment)
  // Implement view modal
}

const editEquipment = (equipment: Equipment | null) => {
  editingEquipment.value = equipment
  if (equipment) {
    equipmentForm.value = {
      name: equipment.name,
      internalCode: equipment.internalCode,
      type: equipment.type,
      store: equipment.store,
      brand: equipment.brand,
      model: equipment.model,
      serialNumber: equipment.serialNumber || '',
      patrimonyNumber: equipment.patrimonyNumber || '',
      purchaseDate: equipment.purchaseDate || '',
      warrantyUntil: equipment.warrantyUntil || '',
      purchaseValue: equipment.purchaseValue || 0,
      status: equipment.status,
      notes: equipment.notes || ''
    }
  }
  showAddModal.value = true
}

const newMaintenance = (equipment: any) => {
  console.log('New maintenance for:', equipment)
  // Implement new maintenance modal
}

const exportData = () => {
  console.log('Export equipment data')
  // Implement export functionality
}

const saveEquipment = async () => {
  isSaving.value = true
  try {
    const equipmentData = {
      ...equipmentForm.value,
      purchaseValue: Number(equipmentForm.value.purchaseValue),
      createdAt: editingEquipment.value ? undefined : serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    if (editingEquipment.value && editingEquipment.value.id) {
      await updateDoc(doc(db, 'equipamentos', String(editingEquipment.value.id)), equipmentData)
    } else {
      await addDoc(collection(db, 'equipamentos'), equipmentData)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving equipment:', error)
  } finally {
    isSaving.value = false
  }
}

// Firebase real-time listener
let unsubscribe: Unsubscribe | null = null

const setupRealtimeListener = () => {
  const equipmentQuery = query(
    collection(db, 'equipamentos'),
    orderBy('createdAt', 'desc')
  )
  
  unsubscribe = onSnapshot(equipmentQuery, (snapshot) => {
    equipments.value = snapshot.docs.map(doc => {
      const data = doc.data() as Equipment
      return {
        id: doc.id,
        ...data
      }
    })
    isLoading.value = false
  }, (error) => {
    console.error('Error loading equipments:', error)
    isLoading.value = false
  })
}

onMounted(() => {
  setupRealtimeListener()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.equipment-view {
  padding: var(--space-8);
  background: var(--color-gray-50);
  min-height: 100vh;
}

.equipment-header {
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

.equipment-filters {
  margin-bottom: var(--space-8);
}

.filters-card {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
}

.filters-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.filters-header h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0;
}

.filters-grid {
  padding: var(--space-6);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--space-6);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.filter-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
  z-index: 1;
}

.search-input .form-input {
  padding-left: var(--space-12);
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
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-6) auto;
  box-shadow: var(--shadow-lg);
}

.loading-icon {
  font-size: var(--font-size-3xl);
  color: var(--color-black);
  animation: spin 2s linear infinite;
}

.empty-icon {
  font-size: var(--font-size-3xl);
  color: var(--color-gray-400);
}

.loading-container h3,
.empty-container h3 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0 0 var(--space-3) 0;
}

.loading-container p,
.empty-container p {
  color: var(--color-gray-600);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--space-6) 0;
}

.equipment-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
}

.results-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.results-count {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
}

.results-text {
  color: var(--color-gray-600);
  font-size: var(--font-size-base);
}

.view-controls {
  display: flex;
  gap: var(--space-2);
  background: var(--color-gray-100);
  padding: var(--space-1);
  border-radius: var(--radius-lg);
}

.view-btn {
  padding: var(--space-2) var(--space-4);
  border: none;
  background: transparent;
  color: var(--color-gray-600);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-lg);
}

.view-btn.active {
  background: var(--color-white);
  color: var(--color-black);
  box-shadow: var(--shadow-sm);
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-6);
}

.equipment-card {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.equipment-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--color-gray-200);
}

.card-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.equipment-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0 0 var(--space-1) 0;
}

.equipment-code {
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-family: 'Monaco', 'Menlo', monospace;
  background: var(--color-gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  margin: 0;
}

.equipment-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.equipment-status.ativo {
  background: var(--color-success-light);
  color: var(--color-success);
}

.equipment-status.ativo .status-dot {
  background: var(--color-success);
}

.equipment-status.manutencao {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.equipment-status.manutencao .status-dot {
  background: var(--color-warning);
}

.equipment-status.inativo {
  background: var(--color-error-light);
  color: var(--color-error);
}

.equipment-status.inativo .status-dot {
  background: var(--color-error);
}

.card-body {
  padding: var(--space-6);
}

.equipment-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.detail-icon {
  width: 32px;
  height: 32px;
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  flex-shrink: 0;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
}

.detail-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: var(--font-weight-medium);
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
  font-weight: var(--font-weight-medium);
}

.warranty-expiring {
  color: var(--color-warning) !important;
  font-weight: var(--font-weight-semibold);
}

.card-footer {
  padding: var(--space-6);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

.equipment-actions {
  display: flex;
  gap: var(--space-3);
}

.action-btn {
  flex: 1;
  padding: var(--space-3);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-base);
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-btn.secondary {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.action-btn.secondary:hover {
  background: var(--color-gray-200);
  color: var(--color-black);
  transform: translateY(-1px);
}

.action-btn.primary {
  background: var(--color-black);
  color: var(--color-white);
}

.action-btn.primary:hover {
  background: var(--color-gray-800);
  transform: translateY(-1px);
}

.action-btn.warning {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.action-btn.warning:hover {
  background: var(--color-warning);
  color: var(--color-white);
  transform: translateY(-1px);
}

/* Table View */
.equipment-table {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table th {
  padding: var(--space-4) var(--space-6);
  background: var(--color-gray-50);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-gray-200);
}

.table td {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
}

.table-row {
  transition: all var(--transition-fast);
}

.table-row:hover {
  background: var(--color-gray-50);
}

.equipment-cell {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.equipment-name {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
}

.equipment-cell .equipment-code {
  font-size: var(--font-size-xs);
  background: var(--color-gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  align-self: flex-start;
}

.type-badge {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.location-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-gray-600);
}

.status-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.table-actions {
  display: flex;
  gap: var(--space-2);
}

.table-actions .action-btn {
  width: 36px;
  height: 36px;
  padding: 0;
  font-size: var(--font-size-sm);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: var(--backdrop-blur-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: var(--space-4);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  width: 100%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  transform: scale(0.95);
  animation: modalEnter var(--transition-normal) ease-out forwards;
}

@keyframes modalEnter {
  to {
    transform: scale(1);
  }
}

.modal-header {
  padding: var(--space-8);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.modal-title h2 {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0 0 var(--space-2) 0;
}

.modal-title p {
  color: var(--color-gray-600);
  font-size: var(--font-size-base);
  margin: 0;
}

.modal-close {
  background: var(--color-gray-100);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--color-gray-600);
}

.modal-close:hover {
  background: var(--color-gray-200);
  color: var(--color-black);
  transform: scale(1.1);
}

.modal-body {
  padding: var(--space-8);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0;
  padding-bottom: var(--space-3);
  border-bottom: 2px solid var(--color-gray-100);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-6);
}

.modal-actions {
  display: flex;
  gap: var(--space-4);
  justify-content: flex-end;
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-gray-100);
}

/* Animations */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: all var(--transition-normal);
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* Responsividade */
@media (max-width: 1024px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .equipment-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .equipment-view {
    padding: var(--space-4);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--space-6);
    align-items: stretch;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .equipment-grid {
    grid-template-columns: 1fr;
  }
  
  .equipment-actions {
    flex-direction: column;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .content-header {
    flex-direction: column;
    gap: var(--space-4);
    align-items: stretch;
  }
  
  .table-container {
    font-size: var(--font-size-sm);
  }
}

@media (max-width: 480px) {
  .equipment-card {
    margin: 0 -var(--space-2);
  }
  
  .modal {
    margin: var(--space-2);
    max-width: none;
  }
  
  .modal-header,
  .modal-body {
    padding: var(--space-6);
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .detail-icon {
    align-self: flex-start;
  }
}
</style>