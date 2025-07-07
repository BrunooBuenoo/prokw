<template>
  <div class="companies-view">
    <div class="companies-header">
      <h1>Empresas Terceiras</h1>
      <button class="btn btn-primary" @click="showAddModal = true">
        <font-awesome-icon :icon="['fas', 'plus']" />
        Nova Empresa
      </button>
    </div>
    
    <div class="companies-filters">
      <div class="filter-group">
        <input 
          type="text" 
          placeholder="Buscar empresa..." 
          class="form-input"
          v-model="searchQuery"
        />
        <select v-model="selectedStatus" class="form-select">
          <option value="">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
        <button class="btn btn-secondary" @click="handleLoadCompanies">
          <font-awesome-icon :icon="['fas', 'sync-alt']" />
          Atualizar
        </button>
      </div>
    </div>
    
    <div v-if="isLoading" class="loading-state">
      <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin" />
      <p>Carregando empresas...</p>
    </div>
    
    <div v-else-if="filteredCompanies.length === 0" class="empty-state">
      <font-awesome-icon :icon="['fas', 'building']" class="empty-icon" />
      <h3>Nenhuma empresa encontrada</h3>
      <p>Comece cadastrando sua primeira empresa terceira</p>
      <button class="btn btn-primary" @click="showAddModal = true">
        Cadastrar Primeira Empresa
      </button>
    </div>
    
    <div v-else class="companies-grid">
      <div 
        v-for="company in filteredCompanies" 
        :key="company.id"
        class="company-card"
      >
        <div class="company-header">
          <div class="company-info">
            <h3>{{ company.name }}</h3>
            <p class="company-cnpj">{{ formatCNPJ(company.cnpj) }}</p>
          </div>
          <div class="company-status" :class="company.status">
            {{ company.status }}
          </div>
        </div>
        
        <div class="company-details">
          <div class="detail-row">
            <span class="detail-label">Contato:</span>
            <span>{{ company.contact }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Email:</span>
            <span>{{ company.email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Telefone:</span>
            <span>{{ formatPhone(company.phone) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Cidade:</span>
            <span>{{ company.city }} - {{ company.state }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Serviços:</span>
            <div class="services-tags">
              <span 
                v-for="service in company.services" 
                :key="service"
                class="service-tag"
              >
                {{ service }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="company-actions">
          <button 
            class="btn btn-sm btn-secondary" 
            @click="viewCompany(company)"
          >
            <font-awesome-icon :icon="['fas', 'eye']" />
            Ver
          </button>
          <button 
            class="btn btn-sm btn-primary" 
            @click="editCompany(company)"
          >
            <font-awesome-icon :icon="['fas', 'edit']" />
            Editar
          </button>
          <button 
            class="btn btn-sm" 
            :class="company.status === 'ativo' ? 'btn-warning' : 'btn-success'"
            @click="toggleCompanyStatus(company)"
          >
            <font-awesome-icon 
              :icon="company.status === 'ativo' ? ['fas', 'pause'] : ['fas', 'play']" 
            />
            {{ company.status === 'ativo' ? 'Desativar' : 'Ativar' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- Add Company Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCompany ? 'Editar Empresa' : 'Nova Empresa' }}</h2>
          <button class="modal-close" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <form @submit.prevent="saveCompany" class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nome da Empresa *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="companyForm.name"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">CNPJ *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="companyForm.cnpj"
                @input="formatCNPJInput"
                maxlength="18"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Endereço *</label>
            <input 
              type="text" 
              class="form-input"
              v-model="companyForm.address"
              required
            />
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Cidade *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="companyForm.city"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Estado *</label>
              <select class="form-select" v-model="companyForm.state" required>
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
                v-model="companyForm.zipCode"
                @input="formatZipCodeInput"
                maxlength="9"
                required
              />
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Telefone *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="companyForm.phone"
                @input="formatPhoneInput"
                maxlength="15"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Email *</label>
              <input 
                type="email" 
                class="form-input"
                v-model="companyForm.email"
                required
              />
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Pessoa de Contato *</label>
            <input 
              type="text" 
              class="form-input"
              v-model="companyForm.contact"
              required
            />
          </div>
          
          <div class="form-group">
            <label class="form-label">Serviços Oferecidos</label>
            <div class="services-input">
              <input 
                type="text" 
                class="form-input"
                v-model="newService"
                @keypress.enter.prevent="addService"
                placeholder="Digite um serviço e pressione Enter"
              />
              <button type="button" class="btn btn-sm btn-secondary" @click="addService">
                <font-awesome-icon :icon="['fas', 'plus']" />
              </button>
            </div>
            <div class="services-list" v-if="companyForm.services.length > 0">
              <span 
                v-for="(service, index) in companyForm.services" 
                :key="index"
                class="service-tag"
              >
                {{ service }}
                <button type="button" @click="removeService(index)">
                  <font-awesome-icon :icon="['fas', 'times']" />
                </button>
              </span>
            </div>
          </div>
          
          <div class="form-group">
            <label class="form-label">Status</label>
            <select class="form-select" v-model="companyForm.status">
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
              {{ isSaving ? 'Salvando...' : (editingCompany ? 'Atualizar' : 'Cadastrar') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CityAutocomplete from '/../components/CityAutocomplete.vue'
import { ref, computed, onMounted } from 'vue'
import { useCompanies } from '../composables/useCompanies'
import type { Company } from '../types'

const { companies, isLoading, loadCompanies, addCompany, updateCompany } = useCompanies()

const showAddModal = ref(false)
const editingCompany = ref<Company | null>(null)
const isSaving = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const newService = ref('')

const companyForm = ref({
  name: '',
  cnpj: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  phone: '',
  email: '',
  contact: '',
  services: [] as string[],
  status: 'ativo' as 'ativo' | 'inativo'
})

const filteredCompanies = computed(() => {
  let filtered = companies.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(company => 
      company.name.toLowerCase().includes(query) ||
      company.cnpj.includes(query) ||
      company.contact.toLowerCase().includes(query) ||
      company.email.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(company => company.status === selectedStatus.value)
  }

  return filtered
})

const formatCNPJ = (cnpj: string) => {
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

const formatPhone = (phone: string) => {
  if (phone.length === 11) {
    return phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  } else if (phone.length === 10) {
    return phone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return phone
}

const formatCNPJInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  if (value.length <= 14) {
    value = value.replace(/(\d{2})(\d{0,3})(\d{0,3})(\d{0,4})(\d{0,2})/, (match, p1, p2, p3, p4, p5) => {
      let result = p1
      if (p2) result += '.' + p2
      if (p3) result += '.' + p3
      if (p4) result += '/' + p4
      if (p5) result += '-' + p5
      return result
    })
  }
  companyForm.value.cnpj = value
}

const formatZipCodeInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value.replace(/\D/g, '')
  if (value.length > 5) {
    value = value.replace(/(\d{5})(\d{0,3})/, '$1-$2')
  }
  companyForm.value.zipCode = value
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
  companyForm.value.phone = value
}

const addService = () => {
  if (newService.value.trim() && !companyForm.value.services.includes(newService.value.trim())) {
    companyForm.value.services.push(newService.value.trim())
    newService.value = ''
  }
}

const removeService = (index: number) => {
  companyForm.value.services.splice(index, 1)
}

const resetForm = () => {
  companyForm.value = {
    name: '',
    cnpj: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    contact: '',
    services: [],
    status: 'ativo'
  }
  newService.value = ''
}

const closeModal = () => {
  showAddModal.value = false
  editingCompany.value = null
  resetForm()
}

const viewCompany = (company: Company) => {
  console.log('View company:', company)
  // Implement view functionality
}

const editCompany = (company: Company) => {
  editingCompany.value = company
  companyForm.value = {
    name: company.name,
    cnpj: company.cnpj,
    address: company.address,
    city: company.city,
    state: company.state,
    zipCode: company.zipCode,
    phone: company.phone,
    email: company.email,
    contact: company.contact,
    services: [...company.services],
    status: company.status
  }
  showAddModal.value = true
}

const toggleCompanyStatus = async (company: Company) => {
  try {
    const newStatus = company.status === 'ativo' ? 'inativo' : 'ativo'
    await updateCompany(company.id, { status: newStatus })
  } catch (error) {
    console.error('Error toggling company status:', error)
  }
}

const saveCompany = async () => {
  isSaving.value = true
  try {
    // Clean phone, cnpj and zipCode
    const cleanPhone = companyForm.value.phone.replace(/\D/g, '')
    const cleanCNPJ = companyForm.value.cnpj.replace(/\D/g, '')
    const cleanZipCode = companyForm.value.zipCode.replace(/\D/g, '')
    
    const companyData = {
      ...companyForm.value,
      phone: cleanPhone,
      cnpj: cleanCNPJ,
      zipCode: cleanZipCode
    }

    if (editingCompany.value) {
      await updateCompany(editingCompany.value.id, companyData)
    } else {
      await addCompany(companyData)
    }
    
    closeModal()
  } catch (error) {
    console.error('Error saving company:', error)
  } finally {
    isSaving.value = false
  }
}

const handleLoadCompanies = () => {
  const filters = selectedStatus.value ? { status: selectedStatus.value } : undefined
  loadCompanies(filters)
}

onMounted(() => {
  loadCompanies()
})
</script>

<style scoped>
.companies-view {
  padding: var(--spacing-6);
}

.companies-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);
}

.companies-header h1 {
  margin: 0;
  color: var(--neutral-900);
}

.companies-filters {
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

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: var(--spacing-6);
}

.company-card {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-base);
  overflow: hidden;
  transition: box-shadow var(--transition-fast);
}

.company-card:hover {
  box-shadow: var(--shadow-md);
}

.company-header {
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--neutral-200);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.company-info h3 {
  margin: 0 0 var(--spacing-1) 0;
  color: var(--neutral-900);
  font-size: var(--font-size-lg);
}

.company-cnpj {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--neutral-500);
  font-family: monospace;
}

.company-status {
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
}

.company-status.ativo {
  background-color: var(--success-100);
  color: var(--success-700);
}

.company-status.inativo {
  background-color: var(--error-100);
  color: var(--error-700);
}

.company-details {
  padding: var(--spacing-4);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
  align-items: flex-start;
}

.detail-label {
  font-weight: var(--font-weight-medium);
  color: var(--neutral-600);
  min-width: 80px;
}

.services-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-1);
  flex: 1;
  justify-content: flex-end;
}

.service-tag {
  background-color: var(--primary-100);
  color: var(--primary-700);
  padding: var(--spacing-1) var(--spacing-2);
  border-radius: var(--border-radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
}

.service-tag button {
  background: none;
  border: none;
  color: var(--primary-700);
  cursor: pointer;
  padding: 0;
  font-size: var(--font-size-xs);
}

.company-actions {
  display: flex;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  border-top: 1px solid var(--neutral-200);
  background-color: var(--neutral-50);
}

.company-actions .btn {
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
  max-width: 700px;
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

.services-input {
  display: flex;
  gap: var(--spacing-2);
}

.services-input .form-input {
  flex: 1;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  margin-top: var(--spacing-2);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  margin-top: var(--spacing-6);
}

@media (max-width: 768px) {
  .companies-view {
    padding: var(--spacing-4);
  }
  
  .companies-header {
    flex-direction: column;
    gap: var(--spacing-4);
    align-items: stretch;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
  
  .companies-grid {
    grid-template-columns: 1fr;
  }
  
  .company-actions {
    flex-direction: column;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .services-input {
    flex-direction: column;
  }
}
</style>