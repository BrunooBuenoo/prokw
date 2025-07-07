<template>
  <div class="stores-view">
    <div class="stores-header">
      <h1>Gestão de Lojas</h1>
      <button class="btn btn-primary" @click="showAddModal = true">
        <font-awesome-icon :icon="['fas', 'plus']" />
        Nova Loja
      </button>
    </div>
    
    <div class="stores-filters">
      <div class="filter-group">
        <input 
          type="text" 
          placeholder="Buscar loja..." 
          class="form-input"
          v-model="searchQuery"
        />
        <select v-model="selectedStatus" class="form-select">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <button class="btn btn-secondary" @click="loadStores">
          <font-awesome-icon :icon="['fas', 'sync-alt']" />
          Atualizar
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin" />
      <p>Carregando lojas...</p>
    </div>
    
    <div v-else-if="filteredStores.length === 0" class="empty-state">
      <font-awesome-icon :icon="['fas', 'store']" class="empty-icon" />
      <h3>Nenhuma loja encontrada</h3>
      <p>Comece cadastrando sua primeira loja</p>
      <button class="btn btn-primary" @click="showAddModal = true">
        Cadastrar Primeira Loja
      </button>
    </div>
    
    <div v-else class="stores-grid">
      <div 
        v-for="store in filteredStores" 
        :key="store.id"
        class="store-card"
      >
        <div class="store-header">
          <div class="store-info">
            <h3>{{ store.name }}</h3>
            <p class="store-code">{{ store.code }}</p>
          </div>
          <div class="store-status" :class="store.status">
            {{ store.status }}
          </div>
        </div>
        
        <div class="store-details">
          <div class="detail-row">
            <span class="detail-label">Endereço:</span>
            <span>{{ store.address }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Cidade:</span>
            <span>{{ store.city }} - {{ store.state }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">CEP:</span>
            <span>{{ formatZipCode(store.zipCode) }}</span>
          </div>
          <div class="detail-row" v-if="store.phone">
            <span class="detail-label">Telefone:</span>
            <span>{{ formatPhone(store.phone) }}</span>
          </div>
          <div class="detail-row" v-if="store.manager">
            <span class="detail-label">Gerente:</span>
            <span>{{ store.manager }}</span>
          </div>
        </div>
        
        <div class="store-actions">
          <button 
            class="btn btn-sm btn-secondary" 
            @click="viewStore(store)"
          >
            <font-awesome-icon :icon="['fas', 'eye']" />
            Ver
          </button>
          <button 
            class="btn btn-sm btn-primary" 
            @click="editStore(store)"
          >
            <font-awesome-icon :icon="['fas', 'edit']" />
            Editar
          </button>
          <button 
            class="btn btn-sm" 
            :class="store.status === 'ativo' ? 'btn-warning' : 'btn-success'"
            @click="toggleStoreStatus(store)"
          >
            <font-awesome-icon 
              :icon="store.status === 'ativo' ? ['fas', 'pause'] : ['fas', 'play']" 
            />
            {{ store.status === 'ativo' ? 'Desativar' : 'Ativar' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Store Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingStore ? 'Editar Loja' : 'Nova Loja' }}</h2>
          <button class="modal-close" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <form @submit.prevent="saveStore" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nome da Loja *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="storeForm.name"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Código *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="storeForm.code"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Endereço *</label>
            <input 
              type="text" 
              class="form-input"
              v-model="storeForm.address"
              required
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
              />
            </div>
            <div class="form-group">
              <label class="form-label">Estado *</label>
              <select class="form-select" v-model="storeForm.state" required>
                <option value="">Selecione</option>
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
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Telefone</label>
              <input 
                type="text" 
                class="form-input"
                v-model="storeForm.phone"
                @input="formatPhoneInput"
                maxlength="15"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Gerente</label>
              <input 
                type="text" 
                class="form-input"
                v-model="storeForm.manager"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="storeForm.status">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSaving">
              <font-awesome-icon 
                v-if="isSaving"
                :icon="['fas', 'spinner']" 
                class="fa-spin"
              />
              {{ isSaving ? 'Salvando...' : (editingStore ? 'Atualizar' : 'Cadastrar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useStores } from '../composables/useStores'
import type { Store } from '../types'

const { stores, isLoading, loadStores, addStore, updateStore } = useStores()

const showAddModal = ref(false)
const editingStore = ref<Store | null>(null)
const isSaving = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')

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
      store.city.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(store => store.status === selectedStatus.value)
  }

  return filtered
})

const formatZipCode = (zipCode: string) => {
  return zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')
}

const formatPhone = (phone: string) => {
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
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

const viewStore = (store: Store) => {
  console.log('View store:', store)
  // Implement view functionality
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
  padding: var(--spacing-6);
}

.stores-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.stores-header h1 {
  margin: 0;
  color: var(--neutral-900);
}

.stores-filters {
  margin-bottom: var(--spacing-6);
}

.filter-group {
  display: grid;
  grid-template-columns: 2fr 1fr auto;
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

.stores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--spacing-6);
}

.store-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
}

.store-card:hover {
  box-shadow: var(--shadow-md);
}

.store-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--neutral-200);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.store-info h3 {
  margin: 0 0 var(--spacing-1) 0;
  color: var(--neutral-900);
  font-size: var(--font-size-lg);
}

.store-code {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--neutral-500);
  font-family: monospace;
}

.store-status {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.store-status.ativo {
  background-color: var(--success-100);
  color: var(--success-700);
}

.store-status.inativo {
  background-color: var(--error-100);
  color: var(--error-700);
}

.store-details {
  padding: var(--spacing-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
}

.detail-label {
  font-weight: var(--font-weight-medium);
  color: var(--neutral-600);
}

.store-actions {
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border-top: 1px solid var(--neutral-200);
  background-color: var(--neutral-50);
}

.store-actions .btn {
  flex: 1;
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
}

.modal {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-xl);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-6);
  border-bottom: 1px solid var(--neutral-200);
}

.modal-header h2 {
  margin: 0;
  color: var(--neutral-900);
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-lg);
  color: var(--neutral-500);
  cursor: pointer;
  padding: var(--spacing-2);
}

.modal-body {
  padding: var(--spacing-6);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-4);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  margin-top: var(--spacing-6);
}

@media (max-width: 768px) {
  .stores-view {
    padding: var(--spacing-4);
  }
  
  .stores-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
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
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>