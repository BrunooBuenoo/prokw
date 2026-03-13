<template>
  <div class="equipment-view">
    <div class="equipment-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Gestão de Equipamentos</h1>
          <p>Controle completo do seu parque tecnológico</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="exportData" :disabled="isExporting">
            <font-awesome-icon :icon="['fas', 'download']" :class="{ 'fa-spin': isExporting }" />
            <span class="btn-text">Exportar</span>
          </button>
          <button class="btn btn-primary" @click="showAddModal = true">
            <font-awesome-icon :icon="['fas', 'plus']" />
            <span class="btn-text">Novo Equipamento</span>
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
            <span class="btn-text">Limpar</span>
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
              <option v-for="store in availableStores" :key="store" :value="store">
                {{ store }}
              </option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Tipo</label>
            <select v-model="selectedType" class="form-select">
              <option value="">Todos os tipos</option>
              <option v-for="type in availableTypes" :key="type" :value="type">
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
        <h3>{{ hasFilters ? 'Nenhum equipamento encontrado' : 'Nenhum equipamento cadastrado' }}</h3>
        <p>{{ hasFilters ? 'Tente ajustar os filtros de busca' : 'Comece cadastrando seu primeiro equipamento' }}</p>
        <button v-if="canManageEquipments" class="btn btn-primary" @click="showAddModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" />
          {{ hasFilters ? 'Cadastrar Equipamento' : 'Cadastrar Primeiro Equipamento' }}
        </button>
      </div>
    </div>

    <div v-else class="equipment-content">
      <!-- View Toggle -->
      <div class="view-controls">
        <div class="view-toggle">
          <button 
            class="toggle-btn"
            :class="{ active: viewMode === 'table' }"
            @click="setViewMode('table')"
          >
            <font-awesome-icon :icon="['fas', 'table']" />
            <span class="btn-text">Tabela</span>
          </button>
          <button 
            class="toggle-btn"
            :class="{ active: viewMode === 'cards' }"
            @click="setViewMode('cards')"
          >
            <font-awesome-icon :icon="['fas', 'th-large']" />
            <span class="btn-text">Cards</span>
          </button>
        </div>
        <div class="results-info">
          {{ filteredEquipments.length }} equipamento{{ filteredEquipments.length !== 1 ? 's' : '' }} encontrado{{ filteredEquipments.length !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Cards View -->
      <div v-if="viewMode === 'cards'" class="equipment-grid">
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
                  <span :class="{ 'warranty-expiring': isWarrantyExpiring(toDate(equipment.warrantyUntil)) }">
                    {{ formatDate(toDate(equipment.warrantyUntil)) }}
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
              <button 
                v-if="canManageEquipments"
                class="action-btn danger"
                @click.stop="confirmDeleteEquipment(equipment)"
                title="Excluir equipamento"
              >
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
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
                  <span :class="{ 'warranty-expiring': isWarrantyExpiring(toDate(equipment.warrantyUntil)) }">
                    {{ formatDate(toDate(equipment.warrantyUntil)) }}
                  </span>
                </td>
                <td>
                  <div class="table-actions">
                    <button class="action-btn secondary" @click="viewEquipment(equipment)" title="Ver detalhes">
                      <font-awesome-icon :icon="['fas', 'eye']" />
                    </button>
                    <button v-if="canManageEquipments" class="action-btn primary" @click="editEquipment(equipment)" title="Editar">
                      <font-awesome-icon :icon="['fas', 'edit']" />
                    </button>
                    <button class="action-btn warning" @click="newMaintenance(equipment)" title="Nova manutenção">
                      <font-awesome-icon :icon="['fas', 'wrench']" />
                    </button>
                    <button v-if="canManageEquipments" class="action-btn danger" @click="confirmDeleteEquipment(equipment)" title="Excluir equipamento">
                      <font-awesome-icon :icon="['fas', 'trash']" />
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
                    <option v-for="store in storeOptions" :key="store.id" :value="store.name">
                      {{ store.name }}
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

    <!-- Equipment Details Modal -->
    <transition name="modal-fade">
      <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
        <div class="modal details-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <h2>{{ selectedEquipment?.name }}</h2>
              <p>Detalhes completos do equipamento</p>
            </div>
            <button class="modal-close" @click="closeDetailsModal">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          
          <div class="modal-body" v-if="selectedEquipment">
            <div class="details-grid">
              <div class="details-section">
                <h3>Informações Básicas</h3>
                <div class="details-list">
                  <div class="detail-row">
                    <span class="detail-label">Nome:</span>
                    <span class="detail-value">{{ selectedEquipment.name }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Código Interno:</span>
                    <span class="detail-value">{{ selectedEquipment.internalCode }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">{{ selectedEquipment.type }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                      <span class="status-badge" :class="selectedEquipment.status">
                        {{ getStatusText(selectedEquipment.status) }}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <h3>Especificações</h3>
                <div class="details-list">
                  <div class="detail-row">
                    <span class="detail-label">Marca:</span>
                    <span class="detail-value">{{ selectedEquipment.brand }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Modelo:</span>
                    <span class="detail-value">{{ selectedEquipment.model }}</span>
                  </div>
                  <div class="detail-row" v-if="selectedEquipment.serialNumber">
                    <span class="detail-label">Número de Série:</span>
                    <span class="detail-value">{{ selectedEquipment.serialNumber }}</span>
                  </div>
                  <div class="detail-row" v-if="selectedEquipment.patrimonyNumber">
                    <span class="detail-label">Patrimônio:</span>
                    <span class="detail-value">{{ selectedEquipment.patrimonyNumber }}</span>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <h3>Localização</h3>
                <div class="details-list">
                  <div class="detail-row">
                    <span class="detail-label">Loja:</span>
                    <span class="detail-value">{{ selectedEquipment.store }}</span>
                  </div>
                  <div class="detail-row" v-if="selectedEquipment.location">
                    <span class="detail-label">Local Específico:</span>
                    <span class="detail-value">{{ selectedEquipment.location }}</span>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <h3>Informações Comerciais</h3>
                <div class="details-list">
                  <div class="detail-row" v-if="selectedEquipment.purchaseDate">
                    <span class="detail-label">Data de Compra:</span>
                    <span class="detail-value">{{ formatDate(toDate(selectedEquipment.purchaseDate)) }}</span>
                  </div>
                  <div class="detail-row" v-if="selectedEquipment.warrantyUntil">
                    <span class="detail-label">Garantia até:</span>
                    <span class="detail-value" :class="{ 'warranty-expiring': isWarrantyExpiring(toDate(selectedEquipment.warrantyUntil)) }">
                      {{ formatDate(toDate(selectedEquipment.warrantyUntil)) }}
                    </span>
                  </div>
                  <div class="detail-row" v-if="selectedEquipment.purchaseValue">
                    <span class="detail-label">Valor de Compra:</span>
                    <span class="detail-value">{{ formatCurrency(selectedEquipment.purchaseValue) }}</span>
                  </div>
                </div>
              </div>

              <div class="details-section full-width" v-if="selectedEquipment.notes">
                <h3>Observações</h3>
                <div class="notes-content">
                  {{ selectedEquipment.notes }}
                </div>
              </div>
            </div>

            <div class="details-actions">
              <button class="btn btn-secondary" @click="closeDetailsModal">
                Fechar
              </button>
              <button v-if="canManageEquipments" class="btn btn-primary" @click="editFromDetails">
                <font-awesome-icon :icon="['fas', 'edit']" />
                Editar
              </button>
              <button v-if="canManageEquipments" class="btn btn-danger" @click="confirmDeleteFromDetails">
                <font-awesome-icon :icon="['fas', 'trash']" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Delete Confirmation Modal -->
    <transition name="modal-fade">
      <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
        <div class="modal delete-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <h2>Confirmar Exclusão</h2>
              <p>Esta ação não pode ser desfeita</p>
            </div>
            <button class="modal-close" @click="closeDeleteModal">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          
          <div class="modal-body" v-if="equipmentToDelete">
            <div class="delete-warning">
              <div class="warning-icon">
                <font-awesome-icon :icon="['fas', 'exclamation-triangle']" />
              </div>
              <div class="warning-content">
                <h3>Tem certeza que deseja excluir este equipamento?</h3>
                <p class="equipment-info">
                  <strong>{{ equipmentToDelete.name }}</strong><br>
                  Código: {{ equipmentToDelete.internalCode }}
                </p>
                <p class="warning-text">
                  Esta ação irá remover permanentemente o equipamento e todos os dados relacionados.
                </p>
              </div>
            </div>

            <div class="form-section">
              <h4>Motivo da exclusão *</h4>
              <div class="form-group">
                <select v-model="deleteReason" class="form-select" required>
                  <option value="">Selecione o motivo</option>
                  <option value="vendido">Equipamento vendido</option>
                  <option value="descartado">Equipamento descartado</option>
                  <option value="roubado">Equipamento roubado/perdido</option>
                  <option value="transferido">Transferido para outra unidade</option>
                  <option value="defeito">Defeito irreparável</option>
                  <option value="obsoleto">Equipamento obsoleto</option>
                  <option value="outro">Outro motivo</option>
                </select>
              </div>
              
              <div class="form-group" v-if="deleteReason">
                <label class="form-label">Observações adicionais</label>
                <textarea 
                  v-model="deleteNotes"
                  class="form-textarea"
                  rows="3"
                  placeholder="Descreva detalhes sobre a exclusão..."
                ></textarea>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeDeleteModal">
                Cancelar
              </button>
              <button 
                type="button" 
                class="btn btn-danger" 
                @click="deleteEquipment"
                :disabled="!deleteReason || isDeleting"
              >
                <font-awesome-icon 
                  v-if="isDeleting"
                  :icon="['fas', 'spinner']" 
                  class="loading-icon"
                />
                {{ isDeleting ? 'Excluindo...' : 'Confirmar Exclusão' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useEquipments } from '../composables/useEquipments'
import { useStores } from '../composables/useStores'
import { toDate, toDateStringSafe, formatDate } from '../util/date'
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  Unsubscribe,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Equipment } from '../types'

const { canManageEquipments } = useAuth()
const { equipments, isLoading, addEquipment, updateEquipment } = useEquipments()
const { stores, loadStores } = useStores()

const showAddModal = ref(false)
const showDetailsModal = ref(false)
const showDeleteModal = ref(false)
const editingEquipment = ref<Equipment | null>(null)
const selectedEquipment = ref<Equipment | null>(null)
const equipmentToDelete = ref<Equipment | null>(null)
const isSaving = ref(false)
const isExporting = ref(false)
const isDeleting = ref(false)

// View mode with localStorage persistence
const viewMode = ref(localStorage.getItem('equipment-view-mode') || 'cards')

// Delete form
const deleteReason = ref('')
const deleteNotes = ref('')

// Filters
const searchQuery = ref('')
const selectedStore = ref('')
const selectedType = ref('')
const selectedStatus = ref('')

// Real-time listener
let equipmentUnsubscribe: Unsubscribe | null = null

// Equipment types
const equipmentTypes = ref([
  'Computador', 'Notebook', 'Impressora', 'Scanner', 'Roteador', 
  'Switch', 'Nobreak', 'Monitor', 'Servidor', 'Tablet', 'Smartphone', 'Outro'
])

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

const hasFilters = computed(() => {
  return searchQuery.value || selectedStore.value || selectedType.value || selectedStatus.value
})

const availableStores = computed(() => {
  const storeNames = [...new Set(equipments.value.map(eq => eq.store))]
  return storeNames.sort()
})

const availableTypes = computed(() => {
  const types = [...new Set(equipments.value.map(eq => eq.type))]
  return types.sort()
})

const storeOptions = computed(() => {
  return stores.value.filter(store => store.status === 'ativo')
})

const setViewMode = (mode: 'table' | 'cards') => {
  viewMode.value = mode
  localStorage.setItem('equipment-view-mode', mode)
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'ativo': 'Ativo',
    'manutencao': 'Manutenção',
    'inativo': 'Inativo'
  }
  return statusMap[status] || status
}

const formatDateLocal = (date: string | Date) => {
  if (!date) return 'Não informado'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

const isWarrantyExpiring = (warrantyDate: string | Date) => {
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

const resetDeleteForm = () => {
  deleteReason.value = ''
  deleteNotes.value = ''
}

const closeModal = () => {
  showAddModal.value = false
  editingEquipment.value = null
  resetForm()
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedEquipment.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  equipmentToDelete.value = null
  resetDeleteForm()
}

const viewEquipment = (equipment: Equipment) => {
  selectedEquipment.value = equipment
  showDetailsModal.value = true
}

const editEquipment = (equipment: Equipment) => {
  editingEquipment.value = equipment
  equipmentForm.value = {
    name: equipment.name,
    internalCode: equipment.internalCode,
    type: equipment.type,
    store: equipment.store,
    brand: equipment.brand,
    model: equipment.model,
    serialNumber: equipment.serialNumber || '',
    patrimonyNumber: equipment.patrimonyNumber || '',
    purchaseDate: toDateStringSafe(equipment.purchaseDate),
    warrantyUntil: toDateStringSafe(equipment.warrantyUntil),
    purchaseValue: equipment.purchaseValue || 0,
    status: equipment.status,
    notes: equipment.notes || ''
  }
  showAddModal.value = true
}

const editFromDetails = () => {
  if (selectedEquipment.value) {
    closeDetailsModal()
    editEquipment(selectedEquipment.value)
  }
}

const confirmDeleteEquipment = (equipment: Equipment) => {
  equipmentToDelete.value = equipment
  showDeleteModal.value = true
}

const confirmDeleteFromDetails = () => {
  if (selectedEquipment.value) {
    equipmentToDelete.value = selectedEquipment.value
    closeDetailsModal()
    showDeleteModal.value = true
  }
}

const deleteEquipment = async () => {
  if (!equipmentToDelete.value || !deleteReason.value) return

  isDeleting.value = true
  try {
    // Instead of actually deleting, we'll mark as deleted with reason
    await updateDoc(doc(db, 'equipments', equipmentToDelete.value.id), {
      status: 'excluido',
      deletedAt: serverTimestamp(),
      deleteReason: deleteReason.value,
      deleteNotes: deleteNotes.value,
      updatedAt: serverTimestamp()
    })

    console.log('✅ Equipamento marcado como excluído:', equipmentToDelete.value.id)
    closeDeleteModal()
  } catch (error) {
    console.error('❌ Erro ao excluir equipamento:', error)
  } finally {
    isDeleting.value = false
  }
}

const newMaintenance = (equipment: Equipment) => {
  // TODO: Implement new maintenance modal
  console.log('New maintenance for:', equipment)
}

const exportData = async () => {
  isExporting.value = true
  try {
    const data = filteredEquipments.value.map(eq => ({
      Nome: eq.name,
      'Código Interno': eq.internalCode,
      Tipo: eq.type,
      Marca: eq.brand,
      Modelo: eq.model,
      'Número de Série': eq.serialNumber || '',
      Patrimônio: eq.patrimonyNumber || '',
      Loja: eq.store,
      Status: getStatusText(eq.status),
      'Data de Compra': eq.purchaseDate ? formatDate(eq.purchaseDate) : '',
      'Garantia até': eq.warrantyUntil ? formatDate(eq.warrantyUntil) : '',
      'Valor de Compra': eq.purchaseValue ? formatCurrency(eq.purchaseValue) : '',
      Observações: eq.notes || ''
    }))

    // Create CSV content
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `equipamentos_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    await new Promise(resolve => setTimeout(resolve, 1000))
  } catch (error) {
    console.error('Error exporting data:', error)
  } finally {
    isExporting.value = false
  }
}

const saveEquipment = async () => {
  isSaving.value = true
  try {
    const equipmentData = {
      ...equipmentForm.value,
      purchaseValue: Number(equipmentForm.value.purchaseValue),
      status: (['ativo', 'manutencao', 'inativo'].includes(equipmentForm.value.status)
        ? equipmentForm.value.status
        : 'ativo') as 'ativo' | 'manutencao' | 'inativo',
    }


    if (editingEquipment.value && editingEquipment.value.id) {
      await updateEquipment(editingEquipment.value.id, equipmentData)
    } else {
      await addEquipment(equipmentData)
    }

    closeModal()
  } catch (error) {
    console.error('Error saving equipment:', error)
  } finally {
    isSaving.value = false
  }
}

// Setup real-time listener
const setupRealtimeListener = () => {
  equipmentUnsubscribe = onSnapshot(
    query(collection(db, 'equipments'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      // Filter out deleted equipment
      equipments.value = snapshot.docs
        .map(doc => {
          const data = doc.data() as Equipment
          return {
            ...data,
            id: doc.id, // Sobrescreve o id do data se existir
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
          }
        })
        .filter(equipment => equipment.status !== 'excluido') as Equipment[]

    },
    (error) => {
      console.error('Error listening to equipment changes:', error)
    }
  )
}

onMounted(() => {
  loadStores()
  setupRealtimeListener()
})

onUnmounted(() => {
  if (equipmentUnsubscribe) {
    equipmentUnsubscribe()
  }
})
</script>

<style scoped>
.equipment-view {
  padding: var(--space-4);
  background: #f8fafc;
  min-height: 100vh;
}

.equipment-header {
  margin-bottom: var(--space-8);
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

.header-actions {
  display: flex;
  gap: var(--space-3);
}

.btn-text {
  display: inline;
}

.equipment-filters {
  margin-bottom: var(--space-6);
}

.filters-card {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
}

.filters-header {
  padding: var(--space-4);
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
  padding: var(--space-4);
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: var(--space-4);
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
  left: var(--space-3);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gray-400);
  z-index: 1;
}

.search-input .form-input {
  padding-left: var(--space-10);
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
  font-size: var(--font-size-base);
  margin: 0 0 var(--space-6) 0;
}

.equipment-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.view-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  margin-bottom: var(--space-4);
}

.view-toggle {
  display: flex;
  gap: var(--space-1);
  background: var(--color-gray-100);
  padding: var(--space-1);
  border-radius: var(--radius-lg);
}

.toggle-btn {
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  color: var(--color-gray-600);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toggle-btn.active {
  background: var(--color-white);
  color: var(--color-black);
  box-shadow: var(--shadow-sm);
}

.results-info {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-4);
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
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.equipment-info h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-black);
  margin: 0 0 var(--space-1) 0;
}

.equipment-code {
  font-size: var(--font-size-xs);
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
  padding: var(--space-4);
}

.equipment-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.detail-icon {
  width: 28px;
  height: 28px;
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
  padding: var(--space-4);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

.equipment-actions {
  display: flex;
  gap: var(--space-2);
}

.action-btn {
  flex: 1;
  padding: var(--space-2);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
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

.action-btn.danger {
  background: var(--color-error-light);
  color: var(--color-error);
  font-weight: 600;
}

.action-btn.danger:hover {
  background: var(--color-error);
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
  padding: var(--space-4) var(--space-4);
  background: var(--color-gray-50);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-gray-200);
}

.table td {
  padding: var(--space-3) var(--space-4);
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
  font-size: var(--font-size-sm);
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
  font-size: var(--font-size-sm);
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
  gap: var(--space-1);
}

.table-actions .action-btn {
  width: 32px;
  height: 32px;
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

.details-modal {
  max-width: 900px;
}

.delete-modal {
  max-width: 600px;
}

@keyframes modalEnter {
  to {
    transform: scale(1);
  }
}

.modal-header {
  padding: var(--space-6);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.modal-title h2 {
  font-size: var(--font-size-xl);
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
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
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
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-input,
.form-select,
.form-textarea {
  padding: var(--space-3);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--color-black);
  box-shadow: 0 0 0 3px rgba(0, 0, 0, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-100);
}

/* Delete Modal */
.delete-warning {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-error-light);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-error);
  margin-bottom: var(--space-4);
}

.warning-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: var(--color-error);
  color: var(--color-white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-xl);
}

.warning-content h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-error);
  margin: 0 0 var(--space-2) 0;
}

.equipment-info {
  background: var(--color-white);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  margin: var(--space-3) 0;
  border: 1px solid var(--color-gray-200);
}

.warning-text {
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  margin: var(--space-2) 0 0 0;
}

.form-section h4 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0 0 var(--space-3) 0;
}

/* Details Modal */
.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);
}

.details-section {
  background: var(--color-gray-50);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
}

.details-section.full-width {
  grid-column: 1 / -1;
}

.details-section h3 {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
  margin: 0 0 var(--space-4) 0;
}

.details-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-2) 0;
  border-bottom: 1px solid var(--color-gray-200);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
  font-weight: var(--font-weight-medium);
}

.status-badge {
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
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
  background: var(--color-error-light);
  color: var(--color-error);
}

.notes-content {
  background: var(--color-white);
  padding: var(--space-4);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

.details-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-100);
}

/* Button Styles */
.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--color-black);
  color: var(--color-white);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-gray-800);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}

.btn-secondary:hover {
  background: var(--color-gray-200);
  color: var(--color-black);
}

.btn-danger {
  background: var(--color-error);
  color: var(--color-white);
}

.btn-danger:hover:not(:disabled) {
  background: var(--color-error-dark);
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--color-gray-600);
  border: 1px solid var(--color-gray-200);
}

.btn-ghost:hover {
  background: var(--color-gray-50);
  color: var(--color-black);
}

.btn-sm {
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-xs);
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

/* Responsive Design */
@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .equipment-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .equipment-view {
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
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .equipment-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
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
  
  .view-controls {
    flex-direction: column;
    gap: var(--space-3);
    align-items: stretch;
  }
  
  .table-container {
    font-size: var(--font-size-sm);
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .details-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .equipment-view {
    padding: var(--space-2);
  }
  
  .equipment-card {
    margin: 0 -var(--space-1);
  }
  
  .modal {
    margin: var(--space-2);
    max-width: none;
  }
  
  .modal-header,
  .modal-body {
    padding: var(--space-4);
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .detail-icon {
    align-self: flex-start;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }
}
</style>
