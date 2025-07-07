<template>
  <div class="companies-view">
    <!-- Header Section -->
    <div class="companies-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Empresas Terceiras</h1>
          <p>Gerencie empresas parceiras e prestadores de serviços</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="exportData">
            <font-awesome-icon :icon="['fas', 'download']" />
            <span class="btn-text">Exportar</span>
          </button>
          <button class="btn btn-primary" @click="showAddModal = true">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span class="btn-text">Nova Empresa</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="companies-filters">
      <div class="filter-group">
        <div class="search-input">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome, CNPJ, contato ou email..." 
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
          <option v-for="state in availableStates" :key="state" :value="state">
            {{ state }}
          </option>
        </select>
        <button class="btn btn-secondary" @click="clearFilters" v-if="hasActiveFilters">
          <font-awesome-icon :icon="['fas', 'times']" />
          <span class="btn-text">Limpar</span>
        </button>
      </div>
      <div class="filter-results" v-if="companies.length > 0">
        <span class="results-count">
          {{ filteredCompanies.length }} de {{ companies.length }} empresas
        </span>
        <div class="view-toggle">
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'cards' }"
            @click="viewMode = 'cards'"
          >
            <font-awesome-icon :icon="['fas', 'th-large']" />
          </button>
          <button 
            class="view-btn" 
            :class="{ active: viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            <font-awesome-icon :icon="['fas', 'list']" />
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-container">
        <div class="loading-spinner">
          <font-awesome-icon :icon="['fas', 'spinner']" class="fa-spin" />
        </div>
        <h3>Carregando empresas...</h3>
        <p>Aguarde enquanto buscamos os dados</p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredCompanies.length === 0" class="empty-state">
      <div class="empty-container">
        <div class="empty-icon">
          <font-awesome-icon :icon="['fas', 'building']" />
        </div>
        <h3>{{ searchQuery || selectedStatus || selectedState ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada' }}</h3>
        <p>{{ searchQuery || selectedStatus || selectedState ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando sua primeira empresa terceira' }}</p>
        <button class="btn btn-primary" @click="showAddModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" />
          {{ searchQuery || selectedStatus || selectedState ? 'Cadastrar Empresa' : 'Cadastrar Primeira Empresa' }}
        </button>
      </div>
    </div>

    <!-- Cards View -->
    <div v-else-if="viewMode === 'cards'" class="companies-grid">
      <div 
        v-for="company in filteredCompanies" 
        :key="company.id"
        class="company-card"
        @click="viewCompany(company)"
      >
        <div class="company-header">
          <div class="company-info">
            <h3>{{ company.name }}</h3>
            <p class="company-cnpj">{{ formatCNPJ(company.cnpj) }}</p>
          </div>
          <div class="company-status" :class="company.status">
            <font-awesome-icon 
              :icon="company.status === 'ativo' ? ['fas', 'check-circle'] : ['fas', 'pause-circle']" 
            />
            {{ company.status }}
          </div>
        </div>
        
        <div class="company-details">
          <div class="detail-row">
            <font-awesome-icon :icon="['fas', 'user']" class="detail-icon" />
            <span class="detail-label">Contato:</span>
            <span>{{ company.contact }}</span>
          </div>
          <div class="detail-row">
            <font-awesome-icon :icon="['fas', 'envelope']" class="detail-icon" />
            <span class="detail-label">Email:</span>
            <span>{{ company.email }}</span>
          </div>
          <div class="detail-row">
            <font-awesome-icon :icon="['fas', 'phone']" class="detail-icon" />
            <span class="detail-label">Telefone:</span>
            <span>{{ formatPhone(company.phone) }}</span>
          </div>
          <div class="detail-row">
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="detail-icon" />
            <span class="detail-label">Cidade:</span>
            <span>{{ company.city }} - {{ company.state }}</span>
          </div>
          <div class="detail-row" v-if="company.services && company.services.length > 0">
            <font-awesome-icon :icon="['fas', 'tools']" class="detail-icon" />
            <span class="detail-label">Serviços:</span>
            <div class="services-tags">
              <span 
                v-for="service in company.services.slice(0, 2)" 
                :key="service"
                class="service-tag"
              >
                {{ service }}
              </span>
              <span v-if="company.services.length > 2" class="service-tag more">
                +{{ company.services.length - 2 }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="company-actions" @click.stop>
          <button 
            class="btn btn-sm btn-secondary" 
            @click="viewCompany(company)"
          >
            <font-awesome-icon :icon="['fas', 'eye']" />
            <span class="btn-text">Ver</span>
          </button>
          <button 
            class="btn btn-sm btn-primary" 
            @click="editCompany(company)"
          >
            <font-awesome-icon :icon="['fas', 'edit']" />
            <span class="btn-text">Editar</span>
          </button>
          <button 
            class="btn btn-sm" 
            :class="company.status === 'ativo' ? 'btn-warning' : 'btn-success'"
            @click="toggleCompanyStatus(company)"
          >
            <font-awesome-icon 
              :icon="company.status === 'ativo' ? ['fas', 'pause'] : ['fas', 'play']" 
            />
            <span class="btn-text">{{ company.status === 'ativo' ? 'Desativar' : 'Ativar' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Table View -->
    <div v-else class="companies-table">
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Contato</th>
              <th>Localização</th>
              <th>Serviços</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="company in filteredCompanies" :key="company.id">
              <td>
                <div class="company-cell">
                  <strong>{{ company.name }}</strong>
                  <small>{{ formatCNPJ(company.cnpj) }}</small>
                </div>
              </td>
              <td>
                <div class="contact-cell">
                  <div>{{ company.contact }}</div>
                  <small>{{ company.email }}</small>
                </div>
              </td>
              <td>{{ company.city }} - {{ company.state }}</td>
              <td>
                <div class="services-cell">
                  <span 
                    v-for="service in company.services?.slice(0, 2)" 
                    :key="service"
                    class="service-tag small"
                  >
                    {{ service }}
                  </span>
                  <span v-if="company.services && company.services.length > 2" class="service-tag small more">
                    +{{ company.services.length - 2 }}
                  </span>
                </div>
              </td>
              <td>
                <span class="status-badge" :class="company.status">
                  <font-awesome-icon 
                    :icon="company.status === 'ativo' ? ['fas', 'check-circle'] : ['fas', 'pause-circle']" 
                  />
                  {{ company.status }}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <button 
                    class="btn btn-sm btn-secondary" 
                    @click="viewCompany(company)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                  </button>
                  <button 
                    class="btn btn-sm btn-primary" 
                    @click="editCompany(company)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                  </button>
                  <button 
                    class="btn btn-sm" 
                    :class="company.status === 'ativo' ? 'btn-warning' : 'btn-success'"
                    @click="toggleCompanyStatus(company)"
                  >
                    <font-awesome-icon 
                      :icon="company.status === 'ativo' ? ['fas', 'pause'] : ['fas', 'play']" 
                    />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Company Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedCompany?.name }}</h2>
          <button class="modal-close" @click="closeDetailsModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <div class="modal-body" v-if="selectedCompany">
          <div class="details-grid">
            <!-- Basic Info -->
            <div class="details-section">
              <h3>
                <font-awesome-icon :icon="['fas', 'building']" />
                Informações Básicas
              </h3>
              <div class="details-content">
                <div class="detail-item">
                  <label>Nome da Empresa:</label>
                  <span>{{ selectedCompany.name }}</span>
                </div>
                <div class="detail-item">
                  <label>CNPJ:</label>
                  <span>{{ formatCNPJ(selectedCompany.cnpj) }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" :class="selectedCompany.status">
                    <font-awesome-icon 
                      :icon="selectedCompany.status === 'ativo' ? ['fas', 'check-circle'] : ['fas', 'pause-circle']" 
                    />
                    {{ selectedCompany.status }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="details-section">
              <h3>
                <font-awesome-icon :icon="['fas', 'address-card']" />
                Contato
              </h3>
              <div class="details-content">
                <div class="detail-item">
                  <label>Pessoa de Contato:</label>
                  <span>{{ selectedCompany.contact }}</span>
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span>{{ selectedCompany.email }}</span>
                </div>
                <div class="detail-item">
                  <label>Telefone:</label>
                  <span>{{ formatPhone(selectedCompany.phone) }}</span>
                </div>
              </div>
            </div>

            <!-- Address Info -->
            <div class="details-section">
              <h3>
                <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
                Endereço
              </h3>
              <div class="details-content">
                <div class="detail-item">
                  <label>Endereço:</label>
                  <span>{{ selectedCompany.address }}</span>
                </div>
                <div class="detail-item">
                  <label>Cidade/Estado:</label>
                  <span>{{ selectedCompany.city }} - {{ selectedCompany.state }}</span>
                </div>
                <div class="detail-item">
                  <label>CEP:</label>
                  <span>{{ formatZipCode(selectedCompany.zipCode) }}</span>
                </div>
              </div>
            </div>

            <!-- Services -->
            <div class="details-section full-width" v-if="selectedCompany.services && selectedCompany.services.length > 0">
              <h3>
                <font-awesome-icon :icon="['fas', 'tools']" />
                Serviços Oferecidos
              </h3>
              <div class="details-content">
                <div class="services-grid">
                  <span 
                    v-for="service in selectedCompany.services" 
                    :key="service"
                    class="service-tag large"
                  >
                    {{ service }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn-secondary" @click="closeDetailsModal">
            Fechar
          </button>
          <button class="btn btn-primary" @click="editCompany(selectedCompany!)">
            <font-awesome-icon :icon="['fas', 'edit']" />
            Editar Empresa
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Company Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
      <div class="modal modal-large" @click.stop>
        <div class="modal-header">
          <h2>{{ editingCompany ? 'Editar Empresa' : 'Nova Empresa' }}</h2>
          <button class="modal-close" @click="closeModal">
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
        
        <form @submit.prevent="saveCompany" class="modal-body">
          <!-- Basic Information -->
          <div class="form-section">
            <h3>
              <font-awesome-icon :icon="['fas', 'building']" />
              Informações Básicas
            </h3>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Nome da Empresa *</label>
                <input 
                  type="text" 
                  class="form-input"
                  v-model="companyForm.name"
                  required
                  placeholder="Digite o nome da empresa"
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
                  placeholder="00.000.000/0000-00"
                />
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="form-section">
            <h3>
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              Endereço
            </h3>
            <div class="form-group">
              <label class="form-label">Endereço Completo *</label>
              <input 
                type="text" 
                class="form-input"
                v-model="companyForm.address"
                required
                placeholder="Rua, número, bairro"
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
                  placeholder="Nome da cidade"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Estado *</label>
                <select class="form-select" v-model="companyForm.state" required>
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
                  v-model="companyForm.zipCode"
                  @input="formatZipCodeInput"
                  maxlength="9"
                  required
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="form-section">
            <h3>
              <font-awesome-icon :icon="['fas', 'address-card']" />
              Contato
            </h3>
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
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div class="form-group">
                <label class="form-label">Email *</label>
                <input 
                  type="email" 
                  class="form-input"
                  v-model="companyForm.email"
                  required
                  placeholder="contato@empresa.com"
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
                placeholder="Nome do responsável"
              />
            </div>
          </div>

          <!-- Services -->
          <div class="form-section">
            <h3>
              <font-awesome-icon :icon="['fas', 'tools']" />
              Serviços Oferecidos
            </h3>
            <div class="form-group">
              <label class="form-label">Adicionar Serviços</label>
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
                  class="service-tag editable"
                >
                  {{ service }}
                  <button type="button" @click="removeService(index)">
                    <font-awesome-icon :icon="['fas', 'times']" />
                  </button>
                </span>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="form-section">
            <h3>
              <font-awesome-icon :icon="['fas', 'toggle-on']" />
              Status
            </h3>
            <div class="form-group">
              <label class="form-label">Status da Empresa</label>
              <select class="form-select" v-model="companyForm.status">
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
          </div>
        </form>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" @click="closeModal">
            Cancelar
          </button>
          <button type="submit" class="btn btn-primary" :disabled="isSaving" @click="saveCompany">
            <font-awesome-icon 
              v-if="isSaving"
              :icon="['fas', 'spinner']" 
              class="fa-spin"
            />
            {{ isSaving ? 'Salvando...' : (editingCompany ? 'Atualizar Empresa' : 'Cadastrar Empresa') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useCompanies } from '../composables/useCompanies'
import type { Company } from '../types'

const { companies, isLoading, loadCompanies, addCompany, updateCompany, unsubscribe } = useCompanies()

const showAddModal = ref(false)
const showDetailsModal = ref(false)
const editingCompany = ref<Company | null>(null)
const selectedCompany = ref<Company | null>(null)
const isSaving = ref(false)
const searchQuery = ref('')
const selectedStatus = ref('')
const selectedState = ref('')
const newService = ref('')
const viewMode = ref<'cards' | 'table'>('cards')

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
      company.email.toLowerCase().includes(query) ||
      company.city.toLowerCase().includes(query)
    )
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(company => company.status === selectedStatus.value)
  }

  if (selectedState.value) {
    filtered = filtered.filter(company => company.state === selectedState.value)
  }

  return filtered
})

const availableStates = computed(() => {
  const states = [...new Set(companies.value.map(company => company.state))]
  return states.sort()
})

const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedStatus.value || selectedState.value
})

const formatCNPJ = (cnpj: string) => {
  if (!cnpj) return ''
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
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

const formatZipCode = (zipCode: string) => {
  if (!zipCode) return ''
  return zipCode.replace(/(\d{5})(\d{3})/, '$1-$2')
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

const clearFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = ''
  selectedState.value = ''
}

const closeModal = () => {
  showAddModal.value = false
  editingCompany.value = null
  resetForm()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedCompany.value = null
}

const viewCompany = (company: Company) => {
  selectedCompany.value = company
  showDetailsModal.value = true
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
    services: [...(company.services || [])],
    status: company.status
  }
  showDetailsModal.value = false
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

const exportData = () => {
  const csvContent = [
    ['Nome', 'CNPJ', 'Contato', 'Email', 'Telefone', 'Cidade', 'Estado', 'Status'].join(','),
    ...filteredCompanies.value.map(company => [
      company.name,
      formatCNPJ(company.cnpj),
      company.contact,
      company.email,
      formatPhone(company.phone),
      company.city,
      company.state,
      company.status
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `empresas_${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(() => {
  loadCompanies()
})

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe()
  }
})
</script>

<style scoped>
.companies-view {
  padding: var(--space-8);
  background: var(--color-gray-50);
  min-height: 100vh;
}

.companies-header {
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

.companies-filters {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-sm);
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

.filter-results {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-200);
}

.results-count {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
}

.view-toggle {
  display: flex;
  gap: var(--space-1);
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
  padding: var(--space-1);
}

.view-btn {
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  border-radius: var(--radius-md);
  color: var(--color-gray-600);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.view-btn.active {
  background: var(--color-white);
  color: var(--color-primary-600);
  box-shadow: var(--shadow-sm);
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
  color: var(--color-primary-500);
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

.companies-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: var(--space-6);
}

.company-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.company-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.company-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.company-info h3 {
  margin: 0 0 var(--space-1) 0;
  color: var(--color-black);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.company-cnpj {
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--color-gray-500);
  font-family: var(--font-mono);
}

.company-status {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.company-status.ativo {
  background: var(--color-green-100);
  color: var(--color-green-700);
}

.company-status.inativo {
  background: var(--color-red-100);
  color: var(--color-red-700);
}

.company-details {
  padding: var(--space-6);
}

.detail-row {
  display: flex;
  align-items: center;
  margin-bottom: var(--space-3);
  gap: var(--space-3);
}

.detail-icon {
  color: var(--color-gray-400);
  width: 16px;
  flex-shrink: 0;
}

.detail-label {
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  min-width: 80px;
}

.services-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
  flex: 1;
}

.service-tag {
  background: var(--color-blue-100);
  color: var(--color-blue-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.service-tag.more {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

.service-tag.small {
  padding: var(--space-1);
  font-size: var(--font-size-2xs);
}

.service-tag.large {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}

.service-tag.editable button {
  background: none;
  border: none;
  color: var(--color-blue-700);
  cursor: pointer;
  padding: 0;
  font-size: var(--font-size-xs);
}

.company-actions {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-6);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

.company-actions .btn {
  flex: 1;
}

.companies-table {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
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
  padding: var(--space-4);
  text-align: left;
  border-bottom: 1px solid var(--color-gray-100);
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

.company-cell strong {
  display: block;
  color: var(--color-black);
  font-weight: var(--font-weight-semibold);
}

.company-cell small {
  color: var(--color-gray-500);
  font-family: var(--font-mono);
}

.contact-cell div {
  color: var(--color-black);
}

.contact-cell small {
  color: var(--color-gray-500);
}

.services-cell {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-1);
}

.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
}

.status-badge.ativo {
  background: var(--color-green-100);
  color: var(--color-green-700);
}

.status-badge.inativo {
  background: var(--color-red-100);
  color: var(--color-red-700);
}

.table-actions {
  display: flex;
  gap: var(--space-1);
}

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
}

.modal-header h2 {
  margin: 0;
  color: var(--color-black);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-gray-400);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.modal-close:hover {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

.modal-body {
  padding: var(--space-6);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.details-section {
  background: var(--color-gray-50);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
}

.details-section.full-width {
  grid-column: 1 / -1;
}

.details-section h3 {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-black);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.detail-item label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.detail-item span {
  color: var(--color-black);
}

.services-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.form-section {
  margin-bottom: var(--space-8);
  padding: var(--space-6);
  background: var(--color-gray-50);
  border-radius: var(--radius-xl);
}

.form-section h3 {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-black);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-4);
}

.services-input {
  display: flex;
  gap: var(--space-2);
}

.services-input .form-input {
  flex: 1;
}

.services-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding: var(--space-6);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

.btn-text {
  margin-left: var(--space-2);
}

@media (max-width: 1024px) {
  .companies-view {
    padding: var(--space-6);
  }
  
  .filter-group {
    grid-template-columns: 1fr 1fr;
  }
  
  .companies-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .companies-view {
    padding: var(--space-4);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--space-6);
    align-items: stretch;
  }
  
  .filter-group {
    grid-template-columns: 1fr;
  }
  
  .filter-results {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
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
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .btn-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .companies-view {
    padding: var(--space-3);
  }
  
  .header-content {
    padding: var(--space-4);
  }
  
  .companies-filters {
    padding: var(--space-4);
  }
  
  .modal {
    width: 95%;
    margin: var(--space-2);
  }
  
  .modal-header,
  .modal-body,
  .modal-actions {
    padding: var(--space-4);
  }
  
  .form-section {
    padding: var(--space-4);
  }
}
</style>
