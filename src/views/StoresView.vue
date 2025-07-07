<template>
  <div class="stores-view">
    <div class="stores-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Gestão de Lojas</h1>
          <p>Gerencie e monitore todas as suas lojas</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="exportData">
            <font-awesome-icon :icon="['fas', 'download']" />
            <span class="btn-text">Exportar</span>
          </button>
          <button class="btn btn-primary" @click="showAddModal = true">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span class="btn-text">Nova Loja</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="stores-filters">
      <div class="filter-group">
        <div class="search-input">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome, código ou cidade..." 
            class="form-input"
            v-model="searchQuery"
          />
        </div>
        <select v-model="selectedStatus" class="form-select">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <select v-model="selectedState" class="form-select">
          <option value="">Todos os estados</option>
          <option v-for="state in uniqueStates" :key="state" :value="state">
            {{ state }}
          </option>
        </select>
        <button class="btn btn-secondary" @click="clearFilters">
          <font-awesome-icon :icon="['fas', 'times']" />
          <span class="btn-text">Limpar</span>
        </button>
      </div>
      <div class="results-info">
        <span>{{ filteredStores.length }} loja{{ filteredStores.length !== 1 ? 's' : '' }} encontrada{{ filteredStores.length !== 1 ? 's' : '' }}</span>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <div class="loading-container">
        <div class="loading-spinner">
          <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin" />
        </div>
        <h3>Carregando lojas...</h3>
        <p>Aguarde enquanto buscamos suas lojas</p>
      </div>
    </div>
    
    <div v-else-if="filteredStores.length === 0" class="empty-state">
      <div class="empty-container">
        <div class="empty-icon">
          <font-awesome-icon :icon="['fas', 'store']" />
        </div>
        <h3>{{ searchQuery || selectedStatus || selectedState ? 'Nenhuma loja encontrada' : 'Nenhuma loja cadastrada' }}</h3>
        <p>{{ searchQuery || selectedStatus || selectedState ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando sua primeira loja' }}</p>
        <button class="btn btn-primary" @click="showAddModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" />
          {{ searchQuery || selectedStatus || selectedState ? 'Cadastrar Loja' : 'Cadastrar Primeira Loja' }}
        </button>
      </div>
    </div>
    
    <div v-else class="stores-grid">
      <div 
        v-for="store in filteredStores" 
        :key="store.id"
        class="store-card"
        @click="viewStore(store)"
      >
        <div class="store-header">
          <div class="store-info">
            <h3>{{ store.name }}</h3>
            <p class="store-code">{{ store.code }}</p>
          </div>
          <div class="store-status" :class="store.status">
            <font-awesome-icon 
              :icon="store.status === 'ativo' ? ['fas', 'check-circle'] : ['fas', 'pause-circle']" 
            />
            {{ store.status }}
          </div>
        </div>
        
        <div class="store-details">
          <div class="detail-row">
            <span class="detail-label">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              Endereço:
            </span>
            <span>{{ store.address }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">
              <font-awesome-icon :icon="['fas', 'city']" />
              Cidade:
            </span>
            <span>{{ store.city }} - {{ store.state }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">
              <font-awesome-icon :icon="['fas', 'mail-bulk']" />
              CEP:
            </span>
            <span>{{ formatZipCode(store.zipCode) }}</span>
          </div>
          <div class="detail-row" v-if="store.phone">
            <span class="detail-label">
              <font-awesome-icon :icon="['fas', 'phone']" />
              Telefone:
            </span>
            <span>{{ formatPhone(store.phone) }}</span>
          </div>
          <div class="detail-row" v-if="store.manager">
            <span class="detail-label">
              <font-awesome-icon :icon="['fas', 'user-tie']" />
              Gerente:
            </span>
            <span>{{ store.manager }}</span>
          </div>
        </div>
        
        <div class="store-actions" @click.stop>
          <button 
            class="btn btn-sm btn-secondary" 
            @click="viewStoreDetails(store)"
            title="Ver detalhes"
          >
            <font-awesome-icon :icon="['fas', 'eye']" />
            <span class="btn-text">Ver</span>
          </button>
          <button 
            class="btn btn-sm btn-primary" 
            @click="editStore(store)"
            title="Editar loja"
          >
            <font-awesome-icon :icon="['fas', 'edit']" />
            <span class="btn-text">Editar</span>
          </button>
          <button 
            class="btn btn-sm" 
            :class="store.status === 'ativo' ? 'btn-warning' : 'btn-success'"
            @click="toggleStoreStatus(store)"
            :title="store.status === 'ativo' ? 'Desativar loja' : 'Ativar loja'"
          >
            <font-awesome-icon 
              :icon="store.status === 'ativo' ? ['fas', 'pause'] : ['fas', 'play']" 
            />
            <span class="btn-text">{{ store.status === 'ativo' ? 'Desativar' : 'Ativar' }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- Store Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <h2>
            <font-awesome-icon :icon="['fas', 'store']" />
            Detalhes da Loja
          </h2>
          <button class="modal-close" @click="closeDetailsModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedStore">
          <div class="details-grid">
            <div class="details-section">
              <h3>Informações Básicas</h3>
              <div class="detail-item">
                <label>Nome:</label>
                <span>{{ selectedStore.name }}</span>
              </div>
              <div class="detail-item">
                <label>Código:</label>
                <span class="code">{{ selectedStore.code }}</span>
              </div>
              <div class="detail-item">
                <label>Status:</label>
                <span class="status-badge" :class="selectedStore.status">
                  <font-awesome-icon 
                    :icon="selectedStore.status === 'ativo' ? ['fas', 'check-circle'] : ['fas', 'pause-circle']" 
                  />
                  {{ selectedStore.status }}
                </span>
              </div>
            </div>
            
            <div class="details-section">
              <h3>Localização</h3>
              <div class="detail-item">
                <label>Endereço:</label>
                <span>{{ selectedStore.address }}</span>
              </div>
              <div class="detail-item">
                <label>Cidade:</label>
                <span>{{ selectedStore.city }}</span>
              </div>
              <div class="detail-item">
                <label>Estado:</label>
                <span>{{ selectedStore.state }}</span>
              </div>
              <div class="detail-item">
                <label>CEP:</label>
                <span>{{ formatZipCode(selectedStore.zipCode) }}</span>
              </div>
            </div>
            
            <div class="details-section">
              <h3>Contato</h3>
              <div class="detail-item" v-if="selectedStore.phone">
                <label>Telefone:</label>
                <span>{{ formatPhone(selectedStore.phone) }}</span>
              </div>
              <div class="detail-item" v-if="selectedStore.manager">
                <label>Gerente:</label>
                <span>{{ selectedStore.manager }}</span>
              </div>
            </div>
            
            <div class="details-section">
              <h3>Informações do Sistema</h3>
              <div class="detail-item">
                <label>Criado em:</label>
                <span>{{ formatDate(selectedStore.createdAt) }}</span>
              </div>
              <div class="detail-item" v-if="selectedStore.updatedAt">
                <label>Atualizado em:</label>
                <span>{{ formatDate(selectedStore.updatedAt) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add/Edit Store Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>
            <font-awesome-icon :icon="editingStore ? ['fas', 'edit'] : ['fas', 'plus']" />
            {{ editingStore ? 'Editar Loja' : 'Nova Loja' }}
          </h2>
          <button class="modal-close" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <form @submit.prevent="saveStore" class="modal-body">
          <div class="form-section">
            <h3>Informações Básicas</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome da Loja *</label>
                <input 
                  type="text" 
                  class="form-input"
                  v-model="storeForm.name"
                  required
                  placeholder="Ex: Loja Centro"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Código *</label>
                <input 
                  type="text" 
                  class="form-input"
                  v-model="storeForm.code"
                  required
                  placeholder="Ex: LJ001"
                />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Endereço</h3>
            <div class="form-group">
              <label class="form-label">Endereço Completo *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="storeForm.address"
                required
                placeholder="Ex: Rua das Flores, 123 - Centro"
              />
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Cidade *</label>
                <input 
                  type="text" 
                  class="form-input"
                  v-model="storeForm.city"
                  required
                  placeholder="Ex: São Paulo"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Estado *</label>
                <select class="form-select" v-model="storeForm.state" required>
                  <option value="">Selecione o estado</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">CEP *</label>
                <input 
                  type="text" 
                  class="form-input"
                  v-model="storeForm.zipCode"
                  @input="formatZipCodeInput"
                  maxlength="9"
                  required
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Contato e Gerência</h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Telefone</label>
                <input 
                  type="text" 
                  class="form-input"
                  v-model="storeForm.phone"
                  @input="formatPhoneInput"
                  maxlength="15"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Gerente Responsável</label>
                <input 
                  type="text" 
                  class="form-input"
                  v-model="storeForm.manager"
                  placeholder="Nome do gerente"
                />
              </div>
            </div>
          </div>
          
          <div class="form-section">
            <h3>Status</h3>
            <div class="form-group">
              <label class="form-label">Status da Loja</label>
              <select class="form-select" v-model="storeForm.status">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <font-awesome-icon :icon="['fas', 'times']" />
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <font-awesome-icon 
                v-if="isSaving"
                :icon="['fas', 'spinner']" 
                class="fa-spin"
              />
              <font-awesome-icon 
                v-else
                :icon="editingStore ? ['fas', 'save'] : ['fas', 'plus']"
              />
              {{ isSaving ? 'Salvando...' : (editingStore ? 'Atualizar Loja' : 'Cadastrar Loja') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useStores } from '../composables/useStores'
import type { Store } from '../types'

const { stores, isLoading, loadStores, addStore, updateStore } = useStores()

const showAddModal = ref(false)
const showDetailsModal = ref(false)
const editingStore = ref<Store | null>(null)
const selectedStore = ref<Store | null>(null)
const isSaving = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedState = ref('')

const storeForm = ref({
  name: '',
  code: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  manager: '',
  status: 'ativo' as 'ativo' | 'inativo'
})

const filteredStores = computed(() => {
  let filtered = stores.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(store => 
      store.name.toLowerCase().includes(query) ||
      store.code.toLowerCase().includes(query) ||
      store.city.toLowerCase().includes(query) ||
      store.address.toLowerCase().includes(query) ||
      store.manager?.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(store => store.status === selectedStatus.value)
  }

  if (selectedState.value) {
    filtered = filtered.filter(store => store.state === selectedState.value)
  }

  return filtered
})

const uniqueStates = computed(() => {
  const states = stores.value.map(store => store.state)
  return [...new Set(states)].sort()
})

const formatZipCode = (zipCode: string) => {
  if (!zipCode) return ''
  return zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')
}

const formatPhone = (phone: string) => {
  if (!phone) return ''
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

const formatDate = (date: any) => {
  if (!date) return 'N/A'
  let dateObj: Date
  
  if (date.toDate) {
    dateObj = date.toDate()
  } else if (typeof date === 'string') {
    dateObj = new Date(date)
  } else {
    dateObj = date
  }
  
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatZipCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  if (value.length > 5) {
    value = value.replace(/(\d{5})(\d{0,3})/, '$1-$2')
  }
  storeForm.value.zipCode = value
}

const formatPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  if (value.length <= 11) {
    if (value.length === 11) {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    } else if (value.length === 10) {
      value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    }
  }
  storeForm.value.phone = value
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedState.value = ''
}

const exportData = () => {
  const csvContent = [
    ['Nome', 'Código', 'Endereço', 'Cidade', 'Estado', 'CEP', 'Telefone', 'Gerente', 'Status'],
    ...filteredStores.value.map(store => [
      store.name,
      store.code,
      store.address,
      store.city,
      store.state,
      formatZipCode(store.zipCode),
      formatPhone(store.phone || ''),
      store.manager || '',
      store.status
    ])
  ].map(row => row.join(',')).join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `lojas_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const resetForm = () => {
  storeForm.value = {
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    manager: '',
    status: 'ativo'
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingStore.value = null
  resetForm()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedStore.value = null
}

const viewStore = (store: Store) => {
  // Quick view - could show a tooltip or mini preview
}

const viewStoreDetails = (store: Store) => {
  selectedStore.value = store
  showDetailsModal.value = true
}

const editStore = (store: Store) => {
  editingStore.value = store
  storeForm.value = {
    name: store.name,
    code: store.code,
    address: store.address,
    city: store.city,
    state: store.state,
    zipCode: store.zipCode,
    phone: store.phone || '',
    manager: store.manager || '',
    status: store.status
  }
  showAddModal.value = true
}

const toggleStoreStatus = async (store: Store) => {
  try {
    const newStatus = store.status === 'ativo' ? 'inativo' : 'ativo'
    await updateStore(store.id, { status: newStatus })
  } catch (error) {
    console.error('Error toggling store status:', error)
  }
}

const saveStore = async () => {
  isSaving.value = true
  try {
    // Clean phone and zipCode
    const cleanPhone = storeForm.value.phone.replace(/\D/g, '')
    const cleanZipCode = storeForm.value.zipCode.replace(/\D/g, '')
    
    const storeData = {
      ...storeForm.value,
      phone: cleanPhone,
      zipCode: cleanZipCode
    }

    if (editingStore.value) {
      await updateStore(editingStore.value.id, storeData)
    } else {
      await addStore(storeData)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving store:', error)
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadStores()
})
</script>

<style scoped>
.stores-view {
  padding: var(--space-8);
  background: var(--color-gray-50);
  min-height: 100vh;
}

.stores-header {
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

.stores-filters {
  background: var(--color-white);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-8);
  border: 1px solid var(--color-gray-100);
}

.filter-group {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr auto;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.search-input {
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
  z-index: 1;
}

.search-input .form-input {
  padding-left: var(--space-10);
}

.results-info {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
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

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-6);
}

.store-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: all var(--transition-fast);
  border: 1px solid var(--color-gray-100);
  cursor: pointer;
}

.store-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.store-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.store-info h3 {
  margin: 0 0 var(--space-1) 0;
  color: var(--color-black);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.store-code {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-family: var(--font-mono);
  background: var(--color-gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  display: inline-block;
}

.store-status {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.store-status.ativo {
  background: var(--color-green-100);
  color: var(--color-green-700);
}

.store-status.inativo {
  background: var(--color-red-100);
  color: var(--color-red-700);
}

.store-details {
  padding: var(--space-6);
  min-height: 160px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
  gap: var(--space-4);
}

.detail-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  min-width: 100px;
  font-size: var(--font-size-sm);
}

.detail-row span:last-child {
  text-align: right;
  color: var(--color-gray-900);
  font-weight: var(--font-weight-medium);
}

.store-actions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

.store-actions .btn {
  flex: 1;
  font-size: var(--font-size-sm);
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

.modal-header h2 {
  margin: 0;
  color: var(--color-black);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-gray-500);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.modal-body {
  padding: var(--space-6);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-8);
}

.details-section {
  background: var(--color-gray-50);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-gray-100);
}

.details-section h3 {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-black);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-gray-200);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
  gap: var(--space-4);
}

.detail-item label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-600);
  min-width: 100px;
}

.detail-item span {
  color: var(--color-gray-900);
  font-weight: var(--font-weight-medium);
}

.detail-item .code {
  font-family: var(--font-mono);
  background: var(--color-gray-200);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
}

.detail-item .status-badge {
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.detail-item .status-badge.ativo {
  background: var(--color-green-100);
  color: var(--color-green-700);
}

.detail-item .status-badge.inativo {
  background: var(--color-red-100);
  color: var(--color-red-700);
}

.form-section {
  margin-bottom: var(--space-8);
}

.form-section h3 {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-black);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  padding-bottom: var(--space-2);
  border-bottom: 2px solid var(--color-gray-200);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-gray-200);
}

@media (max-width: 1024px) {
  .filter-group {
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
  }
  
  .stores-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .stores-view {
    padding: var(--space-4);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--space-6);
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: stretch;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
  
  .stores-grid {
    grid-template-columns: 1fr;
  }
  
  .store-actions {
    flex-direction: column;
  }
  
  .store-actions .btn .btn-text {
    display: inline;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .header-text h1 {
    font-size: var(--font-size-3xl);
  }
  
  .store-actions .btn .btn-text {
    display: none;
  }
  
  .header-actions .btn .btn-text {
    display: none;
  }
}
</style>
