<template>
  <div class="maintenance-view">
    <div class="maintenance-header">
      <div class="header-content">
        <div class="header-text">
          <h1>Gestão de Manutenções</h1>
          <p>Acompanhe e controle as manutenções dos equipamentos</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary" @click="exportData" :disabled="isExporting">
            <font-awesome-icon :icon="['fas', 'download']" :class="{ 'fa-spin': isExporting }" />
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
                placeholder="Equipamento, técnico ou descrição..."
                class="form-input"
                v-model="searchQuery"
              />
            </div>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Tipo</label>
            <select v-model="selectedType" class="form-select">
              <option value="">Todos os tipos</option>
              <option value="preventiva">Preventiva</option>
              <option value="corretiva">Corretiva</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Status</label>
            <select v-model="selectedStatus" class="form-select">
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="em-andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <div class="loading-container">
        <div class="loading-spinner">
          <font-awesome-icon :icon="['fas', 'wrench']" class="loading-icon" />
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
        <h3>{{ hasFilters ? 'Nenhuma manutenção encontrada' : 'Nenhuma manutenção registrada' }}</h3>
        <p>{{ hasFilters ? 'Tente ajustar os filtros de busca' : 'Comece registrando sua primeira manutenção' }}</p>
        <button v-if="canManageEquipments" class="btn btn-primary" @click="showAddModal = true">
          <font-awesome-icon :icon="['fas', 'plus']" />
          {{ hasFilters ? 'Registrar Manutenção' : 'Registrar Primeira Manutenção' }}
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
            <font-awesome-icon :icon="['fas', 'th']" />
            <span class="btn-text">Cards</span>
          </button>
        </div>
        <div class="results-info">
          {{ filteredMaintenances.length }} manutenção{{ filteredMaintenances.length !== 1 ? 'ões' : '' }} encontrada{{ filteredMaintenances.length !== 1 ? 's' : '' }}
        </div>
      </div>

      <!-- Cards View -->
      <div v-if="viewMode === 'cards'" class="maintenance-grid">
        <div 
          v-for="maintenance in filteredMaintenances"
          :key="maintenance.id"
          class="maintenance-card"
          :class="{ 'urgent': isUrgent(maintenance) }"
          @click="viewMaintenance(maintenance)"
        >
          <div class="card-header">
            <div class="maintenance-info">
              <h3>{{ maintenance.equipmentName }}</h3>
              <p class="equipment-code">{{ maintenance.equipmentCode || 'N/A' }}</p>
              <div v-if="maintenance.units && maintenance.units.length > 0" class="units-info">
                <span class="units-count">{{ maintenance.units.length }} unidade{{ maintenance.units.length > 1 ? 's' : '' }}</span>
              </div>
            </div>
            <div class="maintenance-badges">
              <span class="type-badge" :class="maintenance.type">
                <font-awesome-icon :icon="getTypeIcon(maintenance.type)" />
                {{ getTypeText(maintenance.type) }}
              </span>
              <div class="status-badge" :class="maintenance.status">
                <div class="status-dot"></div>
                {{ getStatusText(maintenance.status) }}
              </div>
            </div>
          </div>

          <div class="card-body">
            <div class="maintenance-details">
              <div class="detail-item">
                <font-awesome-icon :icon="['fas', 'user']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Responsável</span>
                  <span class="detail-value">{{ maintenance.technician || maintenance.companyName || 'Não definido' }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <font-awesome-icon :icon="['fas', 'calendar']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Data de Início</span>
                  <span class="detail-value">{{ formatDate(maintenance.startDate) }}</span>
                </div>
              </div>
              
              <div class="detail-item">
                <font-awesome-icon :icon="['fas', 'dollar-sign']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Custo</span>
                  <span class="detail-value cost">{{ formatCurrency(maintenance.cost) }}</span>
                </div>
              </div>
              
              <div v-if="maintenance.description" class="detail-item description-item">
                <font-awesome-icon :icon="['fas', 'file-alt']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Descrição</span>
                  <span class="detail-value description">{{ maintenance.description.substring(0, 100) }}{{ maintenance.description.length > 100 ? '...' : '' }}</span>
                </div>
              </div>

              <!-- Attachments indicator -->
              <div v-if="maintenance.attachments && (maintenance.attachments.serviceOrder || maintenance.attachments.invoice)" class="detail-item">
                <font-awesome-icon :icon="['fas', 'paperclip']" class="detail-icon" />
                <div class="detail-content">
                  <span class="detail-label">Anexos</span>
                  <div class="attachments-list">
                    <span v-if="maintenance.attachments.serviceOrder" class="attachment-item">OS</span>
                    <span v-if="maintenance.attachments.invoice" class="attachment-item">NF</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="card-footer">
            <div class="maintenance-actions">
              <button 
                class="action-btn secondary"
                @click.stop="viewMaintenance(maintenance)"
                title="Ver detalhes"
              >
                <font-awesome-icon :icon="['fas', 'eye']" />
              </button>
              <button 
                v-if="canManageEquipments"
                class="action-btn primary"
                @click.stop="editMaintenance(maintenance)"
                title="Editar"
              >
                <font-awesome-icon :icon="['fas', 'edit']" />
              </button>
              <button 
                v-if="canManageEquipments && maintenance.status !== 'concluida'"
                class="action-btn success"
                @click.stop="completeMaintenance(maintenance)"
                title="Concluir"
              >
                <font-awesome-icon :icon="['fas', 'check']" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table View -->
      <div v-else class="maintenance-table">
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Unidades</th>
                <th>Tipo</th>
                <th>Responsável</th>
                <th>Data Início</th>
                <th>Status</th>
                <th>Custo</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="maintenance in filteredMaintenances" :key="maintenance.id" class="table-row">
                <td>
                  <div class="equipment-cell">
                    <div class="equipment-name">{{ maintenance.equipmentName }}</div>
                    <div class="equipment-code">{{ maintenance.equipmentCode || 'N/A' }}</div>
                  </div>
                </td>
                <td>
                  <div class="units-cell">
                    <span class="units-count">{{ maintenance.units?.length || 0 }}</span>
                  </div>
                </td>
                <td>
                  <span class="type-badge" :class="maintenance.type">
                    <font-awesome-icon :icon="getTypeIcon(maintenance.type)" />
                    {{ getTypeText(maintenance.type) }}
                  </span>
                </td>
                <td>{{ maintenance.technician || maintenance.companyName || 'Não definido' }}</td>
                <td>{{ formatDate(maintenance.startDate) }}</td>
                <td>
                  <div class="status-cell" :class="maintenance.status">
                    <div class="status-dot"></div>
                    {{ getStatusText(maintenance.status) }}
                  </div>
                </td>
                <td class="cost-cell">{{ formatCurrency(maintenance.cost) }}</td>
                <td>
                  <div class="table-actions">
                    <button class="action-btn secondary" @click="viewMaintenance(maintenance)" title="Ver detalhes">
                      <font-awesome-icon :icon="['fas', 'eye']" />
                    </button>
                    <button v-if="canManageEquipments" class="action-btn primary" @click="editMaintenance(maintenance)" title="Editar">
                      <font-awesome-icon :icon="['fas', 'edit']" />
                    </button>
                    <button v-if="canManageEquipments && maintenance.status !== 'concluida'" class="action-btn success" @click="completeMaintenance(maintenance)" title="Concluir">
                      <font-awesome-icon :icon="['fas', 'check']" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Maintenance Detail Modal -->
    <transition name="modal-fade">
      <div v-if="showDetailModal" class="modal-overlay" @click="showDetailModal = false">
        <div class="modal details-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <h2>Detalhes da Manutenção</h2>
              <p>Informações completas da manutenção</p>
            </div>
            <button class="modal-close" @click="showDetailModal = false">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          <div class="modal-body" v-if="selectedMaintenance">
            <div class="details-grid">
              <div class="details-section">
                <h3>Informações Básicas</h3>
                <div class="details-list">
                  <div class="detail-row">
                    <span class="detail-label">Equipamento:</span>
                    <span class="detail-value">{{ selectedMaintenance.equipmentName }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Tipo:</span>
                    <span class="detail-value">
                      <span class="type-badge" :class="selectedMaintenance.type">
                        {{ getTypeText(selectedMaintenance.type) }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Status:</span>
                    <span class="detail-value">
                      <span class="status-badge" :class="selectedMaintenance.status">
                        {{ getStatusText(selectedMaintenance.status) }}
                      </span>
                    </span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Responsável:</span>
                    <span class="detail-value">{{ selectedMaintenance.technician || selectedMaintenance.companyName || 'Não definido' }}</span>
                  </div>
                </div>
              </div>

              <div class="details-section">
                <h3>Datas e Custos</h3>
                <div class="details-list">
                  <div class="detail-row">
                    <span class="detail-label">Data de Início:</span>
                    <span class="detail-value">{{ formatDate(selectedMaintenance.startDate) }}</span>
                  </div>
                  <div class="detail-row" v-if="selectedMaintenance.endDate">
                    <span class="detail-label">Data de Conclusão:</span>
                    <span class="detail-value">{{ formatDate(selectedMaintenance.endDate) }}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Custo:</span>
                    <span class="detail-value cost">{{ formatCurrency(selectedMaintenance.cost) }}</span>
                  </div>
                </div>
              </div>

              <!-- Units Section -->
              <div class="details-section full-width" v-if="selectedMaintenance.units && selectedMaintenance.units.length > 0">
                <h3>Unidades em Manutenção ({{ selectedMaintenance.units.length }})</h3>
                <div class="units-grid">
                  <div v-for="(unit, index) in selectedMaintenance.units" :key="index" class="unit-card">
                    <div class="unit-header">
                      <span class="unit-number">#{{ index + 1 }}</span>
                      <span class="serial-number">{{ unit.serialNumber || 'S/N não informado' }}</span>
                    </div>
                    <div v-if="unit.notes" class="unit-notes">{{ unit.notes }}</div>
                  </div>
                </div>
              </div>

              <!-- Attachments Section -->
              <div class="details-section full-width" v-if="selectedMaintenance.attachments && (selectedMaintenance.attachments.serviceOrder || selectedMaintenance.attachments.invoice)">
                <h3>Anexos</h3>
                <div class="attachments-grid">
                  <div v-if="selectedMaintenance.attachments.serviceOrder" class="attachment-card">
                    <div class="attachment-icon">
                      <font-awesome-icon :icon="['fas', 'file-alt']" />
                    </div>
                    <div class="attachment-info">
                      <span class="attachment-label">Ordem de Serviço</span>
                      <a :href="selectedMaintenance.attachments.serviceOrder" target="_blank" class="attachment-link">
                        Ver documento
                      </a>
                    </div>
                  </div>
                  <div v-if="selectedMaintenance.attachments.invoice" class="attachment-card">
                    <div class="attachment-icon">
                      <font-awesome-icon :icon="['fas', 'receipt']" />
                    </div>
                    <div class="attachment-info">
                      <span class="attachment-label">Nota Fiscal</span>
                      <a :href="selectedMaintenance.attachments.invoice" target="_blank" class="attachment-link">
                        Ver documento
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div class="details-section full-width" v-if="selectedMaintenance.description">
                <h3>Descrição</h3>
                <div class="notes-content">
                  {{ selectedMaintenance.description }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Add/Edit Maintenance Modal -->
    <transition name="modal-fade">
      <div v-if="showAddModal" class="modal-overlay" @click="closeModal">
        <div class="modal large-modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <h2>{{ editingMaintenance ? 'Editar Manutenção' : 'Nova Manutenção' }}</h2>
              <p>{{ editingMaintenance ? 'Atualize as informações da manutenção' : 'Registre uma nova manutenção no sistema' }}</p>
            </div>
            <button class="modal-close" @click="closeModal">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          
          <form @submit.prevent="saveMaintenance" class="modal-body">
            <div class="form-section">
              <h3 class="section-title">Informações Básicas</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Equipamento *</label>
                  <select v-model="maintenanceForm.equipmentId" class="form-select" required>
                    <option value="">Selecione um equipamento</option>
                    <option v-for="equipment in availableEquipments" :key="equipment.id" :value="equipment.id">
                      {{ equipment.name }} - {{ equipment.internalCode || equipment.code || 'Sem código' }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Tipo *</label>
                  <select v-model="maintenanceForm.type" class="form-select" required>
                    <option value="">Selecione o tipo</option>
                    <option value="preventiva">Preventiva</option>
                    <option value="corretiva">Corretiva</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Status *</label>
                  <select v-model="maintenanceForm.status" class="form-select" required>
                    <option value="pendente">Pendente</option>
                    <option value="em-andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Units Section -->
            <div class="form-section">
              <h3 class="section-title">
                Unidades para Manutenção
                <span class="units-counter">({{ maintenanceForm.units.length }} unidade{{ maintenanceForm.units.length !== 1 ? 's' : '' }})</span>
              </h3>
              
              <div class="units-form">
                <div class="add-unit-form">
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label">Número de Série</label>
                      <input 
                        type="text"
                        v-model="newUnit.serialNumber"
                        class="form-input"
                        placeholder="Digite o número de série"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">Observações</label>
                      <input 
                        type="text"
                        v-model="newUnit.notes"
                        class="form-input"
                        placeholder="Observações sobre esta unidade"
                      />
                    </div>
                    <div class="form-group">
                      <label class="form-label">&nbsp;</label>
                      <button type="button" class="btn btn-secondary" @click="addUnit">
                        <font-awesome-icon :icon="['fas', 'plus']" />
                        Adicionar Unidade
                      </button>
                    </div>
                  </div>
                </div>

                <div v-if="maintenanceForm.units.length > 0" class="units-list">
                  <div v-for="(unit, index) in maintenanceForm.units" :key="index" class="unit-item">
                    <div class="unit-info">
                      <div class="unit-header">
                        <span class="unit-number">#{{ index + 1 }}</span>
                        <span class="serial-number">{{ unit.serialNumber || 'S/N não informado' }}</span>
                      </div>
                      <div v-if="unit.notes" class="unit-notes">{{ unit.notes }}</div>
                    </div>
                    <button type="button" class="remove-unit-btn" @click="removeUnit(index)">
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </div>
                </div>

                <div v-if="maintenanceForm.units.length === 0" class="empty-units">
                  <font-awesome-icon :icon="['fas', 'box']" class="empty-icon" />
                  <p>Nenhuma unidade adicionada</p>
                  <p class="empty-hint">Adicione pelo menos uma unidade para continuar</p>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Responsável</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="checkbox-label">
                    <input type="checkbox" v-model="maintenanceForm.isExternal" />
                    Manutenção externa
                  </label>
                </div>
                <div class="form-group" v-if="!maintenanceForm.isExternal">
                  <label class="form-label">Técnico Responsável</label>
                  <input 
                    type="text"
                    v-model="maintenanceForm.technician"
                    class="form-input"
                    placeholder="Nome do técnico"
                  />
                </div>
                <div class="form-group" v-if="maintenanceForm.isExternal">
                  <label class="form-label">Empresa</label>
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
              <h3 class="section-title">Datas e Custos</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Data de Início *</label>
                  <input 
                    type="date"
                    v-model="maintenanceForm.startDate"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group" v-if="maintenanceForm.status === 'concluida'">
                  <label class="form-label">Data de Conclusão</label>
                  <input 
                    type="date"
                    v-model="maintenanceForm.endDate"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Custo (R$)</label>
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
              <h3 class="section-title">Observações</h3>
              <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea 
                  v-model="maintenanceForm.description"
                  class="form-textarea"
                  rows="4"
                  placeholder="Descreva os detalhes da manutenção..."
                ></textarea>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" @click="closeModal">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="isSaving || maintenanceForm.units.length === 0">
                <font-awesome-icon v-if="isSaving" :icon="['fas', 'spinner']" class="loading-icon" />
                {{ isSaving ? 'Salvando...' : (editingMaintenance ? 'Atualizar' : 'Salvar') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Complete Maintenance Modal -->
    <transition name="modal-fade">
      <div v-if="showCompleteModal" class="modal-overlay" @click="closeCompleteModal">
        <div class="modal" @click.stop>
          <div class="modal-header">
            <div class="modal-title">
              <h2>Concluir Manutenção</h2>
              <p>Finalize a manutenção e adicione os documentos</p>
            </div>
            <button class="modal-close" @click="closeCompleteModal">
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
          
          <div class="modal-body">
            <div class="form-section">
              <h3 class="section-title">Informações de Conclusão</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">Data de Conclusão *</label>
                  <input 
                    type="date"
                    v-model="completeForm.endDate"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label class="form-label">Custo Final (R$)</label>
                  <input 
                    type="number"
                    v-model="completeForm.cost"
                    class="form-input"
                    min="0"
                    step="0.01"
                    placeholder="0,00"
                  />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Documentos (Opcional)</h3>
              <div class="attachments-form">
                <div class="attachment-group">
                  <label class="form-label">Ordem de Serviço</label>
                  <div class="file-input-group">
                    <input 
                      type="file"
                      ref="serviceOrderInput"
                      @change="handleServiceOrderUpload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      class="file-input"
                    />
                    <button type="button" class="btn btn-secondary" @click="invoiceInput?.click()">
                      <font-awesome-icon :icon="['fas', 'upload']" />
                      Selecionar Arquivo
                    </button>
                  </div>
                  <div v-if="completeForm.serviceOrderFile" class="file-preview">
                    <font-awesome-icon :icon="['fas', 'file']" />
                    <span>{{ completeForm.serviceOrderFile.name }}</span>
                    <button type="button" @click="completeForm.serviceOrderFile = null" class="remove-file">
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </div>
                </div>

                <div class="attachment-group">
                  <label class="form-label">Nota Fiscal</label>
                  <div class="file-input-group">
                    <input 
                      type="file"
                      ref="invoiceInput"
                      @change="handleInvoiceUpload"
                      accept=".pdf,.jpg,.jpeg,.png"
                      class="file-input"
                    />
                    <button type="button" class="btn btn-secondary" @click="invoiceInput?.click()">
                      <font-awesome-icon :icon="['fas', 'upload']" />
                      Selecionar Arquivo
                    </button>
                  </div>
                  <div v-if="completeForm.invoiceFile" class="file-preview">
                    <font-awesome-icon :icon="['fas', 'file']" />
                    <span>{{ completeForm.invoiceFile.name }}</span>
                    <button type="button" @click="completeForm.invoiceFile = null" class="remove-file">
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h3 class="section-title">Observações Finais</h3>
              <div class="form-group">
                <label class="form-label">Notas de Conclusão</label>
                <textarea 
                  v-model="completeForm.completionNotes"
                  class="form-textarea"
                  rows="3"
                  placeholder="Observações sobre a conclusão da manutenção..."
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeCompleteModal">
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" @click="saveCompleteMaintenance" :disabled="isCompleting">
              <font-awesome-icon v-if="isCompleting" :icon="['fas', 'spinner']" class="loading-icon" />
              {{ isCompleting ? 'Concluindo...' : 'Concluir Manutenção' }}
            </button>
          </div>
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
  getDocs,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  where,
  Unsubscribe
} from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { validateFile } from '../firebase/storage-config'
import { db } from '../firebase/config'
import { storage } from '../firebase/storage-config'
import type { Maintenance, Equipment, Company } from '../types'

interface MaintenanceUnit {
  serialNumber: string
  notes?: string
}

interface MaintenanceWithUnits extends Maintenance {
  units: MaintenanceUnit[]
  serviceData?: {
    serviceOrder?: string
    invoice?: string
  }
}


const { canManageEquipments } = useAuth()

// State
const showAddModal = ref(false)
const showDetailModal = ref(false)
const showCompleteModal = ref(false)
const searchQuery = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const viewMode = ref(localStorage.getItem('maintenance-view-mode') || 'cards')
const isLoading = ref(false)
const isSaving = ref(false)
const isCompleting = ref(false)
const isExporting = ref(false)
const editingMaintenance = ref(false)

// Data
const maintenances = ref<(MaintenanceWithUnits & { equipmentName: string; equipmentCode?: string; companyName?: string })[]>([])
const availableEquipments = ref<Equipment[]>([])
const availableCompanies = ref<Company[]>([])
const selectedMaintenance = ref<any>(null)
const invoiceInput = ref<HTMLInputElement | null>(null);

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
  description: '',
  units: [] as MaintenanceUnit[]
})

const newUnit = ref({
  serialNumber: '',
  notes: ''
})

const completeForm = ref({
  endDate: new Date().toISOString().split('T')[0],
  cost: 0,
  completionNotes: '',
  serviceOrderFile: null as File | null,
  invoiceFile: null as File | null
})

// Listeners
let maintenancesUnsubscribe: Unsubscribe | null = null

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

const hasFilters = computed(() => {
  return searchQuery.value || selectedType.value || selectedStatus.value
})

// Methods
const setViewMode = (mode: 'table' | 'cards') => {
  viewMode.value = mode
  localStorage.setItem('maintenance-view-mode', mode)
}

const addUnit = () => {
  if (newUnit.value.serialNumber.trim()) {
    maintenanceForm.value.units.push({
      serialNumber: newUnit.value.serialNumber.trim(),
      notes: newUnit.value.notes.trim() || undefined
    })
    
    newUnit.value = {
      serialNumber: '',
      notes: ''
    }
  }
}

const removeUnit = (index: number) => {
  maintenanceForm.value.units.splice(index, 1)
}

const handleServiceOrderUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const validation = validateFile(file)
    
    if (!validation.valid) {
      alert(validation.error)
      target.value = ''
      return
    }
    
    completeForm.value.serviceOrderFile = file
    console.log('📎 Arquivo válido selecionado para OS:', file.name)
  }
}

const handleInvoiceUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const validation = validateFile(file)
    
    if (!validation.valid) {
      alert(validation.error)
      target.value = ''
      return
    }
    
    completeForm.value.invoiceFile = file
    console.log('📎 Arquivo válido selecionado para NF:', file.name)
  }
}

const uploadFile = async (file: File, path: string): Promise<string> => {
  if (!storage) throw new Error("Firebase Storage não está disponível.")
  try {
    console.log('📎 Iniciando upload do arquivo:', file.name, 'Tamanho:', file.size)
    
    // Validar o arquivo
    if (!file) {
      throw new Error('Arquivo não encontrado')
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('Arquivo muito grande. Máximo 10MB.')
    }
    
    // Criar um nome de arquivo seguro
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const sanitizedPath = `maintenances/${selectedMaintenance.value.id}/${path}-${timestamp}.${fileExtension}`
    
    console.log('📁 Caminho do arquivo:', sanitizedPath)
    
    const fileRef = storageRef(storage, sanitizedPath)
    
    // Configurar metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    }
    
    console.log('⬆️ Fazendo upload...')
    const snapshot = await uploadBytes(fileRef, file, metadata)
    
    console.log('✅ Upload concluído, obtendo URL...')
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    console.log('🔗 URL obtida:', downloadURL)
    return downloadURL
  } catch (error) {
    console.error('❌ Erro detalhado no upload:', error)
    throw new Error(`Erro ao fazer upload: ${error.message}`)
  }
}

const loadMaintenances = () => {
  isLoading.value = true
  const maintenancesQuery = query(
    collection(db, 'maintenances'),
    orderBy('createdAt', 'desc')
  )

  maintenancesUnsubscribe = onSnapshot(maintenancesQuery, async (snapshot) => {
    try {
      console.log('🔧 Carregando manutenções...', snapshot.size)
      
      const maintenancesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MaintenanceWithUnits[]

      // Load equipment names and company names
      const enrichedMaintenances = await Promise.all(
        maintenancesList.map(async (maintenance) => {
          let equipmentName = 'Equipamento não encontrado'
          let equipmentCode = undefined
          let companyName = undefined

          // Load equipment name
          try {
            if (maintenance.equipmentId) {
              const equipmentQuery = query(collection(db, 'equipments'))
              const equipmentSnapshot = await getDocs(equipmentQuery)
              const equipment = equipmentSnapshot.docs.find(doc => doc.id === maintenance.equipmentId)
              
              if (equipment) {
                const equipmentData = equipment.data()
                equipmentName = equipmentData.name || 'Nome não encontrado'
                equipmentCode = equipmentData.internalCode || equipmentData.code
              }
            }
          } catch (error) {
            console.error('Erro ao carregar equipamento:', error)
          }

          // Load company name if external maintenance
          if (maintenance.isExternal && maintenance.companyId) {
            try {
              const companyQuery = query(collection(db, 'companies'))
              const companySnapshot = await getDocs(companyQuery)
              const company = companySnapshot.docs.find(doc => doc.id === maintenance.companyId)
              
              if (company) {
                companyName = company.data().name
              }
            } catch (error) {
              console.error('Erro ao carregar empresa:', error)
            }
          }

          return {
            ...maintenance,
            equipmentName,
            equipmentCode,
            companyName,
            units: maintenance.units || []
          }
        })
      )

      maintenances.value = enrichedMaintenances
      console.log('✅ Manutenções carregadas:', enrichedMaintenances.length)
    } catch (error) {
      console.error('❌ Erro ao carregar manutenções:', error)
    } finally {
      isLoading.value = false
    }
  })
}

const loadEquipments = async () => {
  try {
    console.log('📦 Carregando equipamentos disponíveis...')
    
    const equipmentsQuery = query(
      collection(db, 'equipments'),
      where('status', 'in', ['ativo', 'maintenances'])
    )
    
    const snapshot = await getDocs(equipmentsQuery)
    
    availableEquipments.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Equipment[]

    console.log('✅ Equipamentos carregados:', availableEquipments.value.length)
  } catch (error) {
    console.error('❌ Erro ao carregar equipamentos:', error)
  }
}

const loadCompanies = async () => {
  try {
    console.log('🏢 Carregando empresas disponíveis...')
    
    const companiesQuery = query(
      collection(db, 'companies'),
      where('status', '==', 'ativo')
    )
    
    const snapshot = await getDocs(companiesQuery)
    
    availableCompanies.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Company[]

    console.log('✅ Empresas carregadas:', availableCompanies.value.length)
  } catch (error) {
    console.error('❌ Erro ao carregar empresas:', error)
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
  if (!date) return 'Data não informada'
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
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
    description: maintenance.description || '',
    units: maintenance.units || []
  }
  selectedMaintenance.value = maintenance
  showAddModal.value = true
}

const completeMaintenance = (maintenance: any) => {
  selectedMaintenance.value = maintenance
  completeForm.value = {
    endDate: new Date().toISOString().split('T')[0],
    cost: maintenance.cost || 0,
    completionNotes: '',
    serviceOrderFile: null,
    invoiceFile: null
  }
  showCompleteModal.value = true
}

const saveCompleteMaintenance = async () => {
  isCompleting.value = true
  try {
    const updateData: any = {
      status: 'concluida',
      endDate: completeForm.value.endDate,
      cost: Number(completeForm.value.cost) || 0,
      updatedAt: serverTimestamp()
    }

    if (completeForm.value.completionNotes) {
      updateData.completionNotes = completeForm.value.completionNotes
    }

    // Upload attachments if provided
    const attachments: any = {}
    let uploadErrors: string[] = []
    
    try {
      if (completeForm.value.serviceOrderFile) {
        console.log('📎 Fazendo upload da ordem de serviço...')
        try {
          attachments.serviceOrder = await uploadFile(completeForm.value.serviceOrderFile, 'service-order')
          console.log('✅ Ordem de serviço enviada com sucesso')
        } catch (error) {
          console.error('❌ Erro no upload da ordem de serviço:', error)
          uploadErrors.push('Ordem de Serviço: ' + error.message)
        }
      }

      if (completeForm.value.invoiceFile) {
        console.log('📎 Fazendo upload da nota fiscal...')
        try {
          attachments.invoice = await uploadFile(completeForm.value.invoiceFile, 'invoice')
          console.log('✅ Nota fiscal enviada com sucesso')
        } catch (error) {
          console.error('❌ Erro no upload da nota fiscal:', error)
          uploadErrors.push('Nota Fiscal: ' + error.message)
        }
      }
    } catch (generalError) {
      console.error('❌ Erro geral nos uploads:', generalError)
      uploadErrors.push('Erro geral: ' + generalError.message)
    }

    // Mostrar erros de upload se houver
    if (uploadErrors.length > 0) {
      const errorMessage = 'Alguns arquivos não puderam ser enviados:\n' + uploadErrors.join('\n') + '\n\nDeseja continuar mesmo assim?'
      if (!confirm(errorMessage)) {
        return
      }
    }

    if (Object.keys(attachments).length > 0) {
      updateData.attachments = attachments
    }

    console.log('💾 Salvando manutenção no banco...')
    await updateDoc(doc(db, 'maintenances', selectedMaintenance.value.id), updateData)
    console.log('✅ Manutenção concluída:', selectedMaintenance.value.id)
    
    // Mostrar mensagem de sucesso
    if (uploadErrors.length > 0) {
      alert('Manutenção concluída, mas alguns anexos não foram salvos.')
    } else {
      console.log('🎉 Manutenção concluída com sucesso!')
    }
    
    closeCompleteModal()
  } catch (error) {
    console.error('❌ Erro ao concluir manutenção:', error)
    alert('Erro ao concluir manutenção: ' + error.message)
  } finally {
    isCompleting.value = false
  }
}

const saveMaintenance = async () => {
  if (maintenanceForm.value.units.length === 0) {
    alert('Adicione pelo menos uma unidade para continuar')
    return
  }

  isSaving.value = true
  try {
    const maintenanceData = {
      ...maintenanceForm.value,
      cost: Number(maintenanceForm.value.cost) || 0,
      updatedAt: serverTimestamp()
    }

    if (editingMaintenance.value && selectedMaintenance.value) {
      await updateDoc(doc(db, 'maintenances', selectedMaintenance.value.id), maintenanceData)
      console.log('✅ Manutenção atualizada:', selectedMaintenance.value.id)
    } else {
      const docRef = await addDoc(collection(db, 'maintenances'), {
        ...maintenanceData,
        createdAt: serverTimestamp()
      })
      console.log('✅ Nova manutenção criada:', docRef.id)
    }

    closeModal()
  } catch (error) {
    console.error('❌ Erro ao salvar manutenção:', error)
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
    description: '',
    units: []
  }
  newUnit.value = {
    serialNumber: '',
    notes: ''
  }
}

const closeCompleteModal = () => {
  showCompleteModal.value = false
  selectedMaintenance.value = null
  completeForm.value = {
    endDate: new Date().toISOString().split('T')[0],
    cost: 0,
    completionNotes: '',
    serviceOrderFile: null,
    invoiceFile: null
  }
}

const exportData = async () => {
  isExporting.value = true
  try {
    const data = filteredMaintenances.value.map(m => ({
      Equipamento: m.equipmentName,
      Unidades: m.units?.length || 0,
      Tipo: getTypeText(m.type),
      Responsável: m.technician || m.companyName || 'Não definido',
      'Data Início': formatDate(m.startDate),
      Status: getStatusText(m.status),
      Custo: m.cost.toString(),
      Descrição: m.description || ''
    }))

    // Create CSV content
    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header as keyof row] || ''}"`).join(','))
    ].join('\n')

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `manutencoes_${new Date().toISOString().split('T')[0]}.csv`)
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

// Lifecycle
onMounted(() => {
  console.log('🚀 Montando MaintenanceView...')
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
:root {
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;
  
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --color-white: #ffffff;
  --color-black: #1a202c;
  --color-gray-50: #f7fafc;
  --color-gray-100: #e2e8f0;
  --color-gray-200: #cbd5e0;
  --color-gray-400: #a0aec0;
  --color-gray-500: #718096;
  --color-gray-600: #4a5568;
  --color-gray-700: #2d3748;
  --color-gray-800: #1a202c;
  --color-gray-900: #171923;
  
  --color-success: #38a169;
  --color-success-light: #f0fff4;
  --color-warning: #d69e2e;
  --color-warning-light: #fef5e7;
  --color-error: #e53e3e;
  --color-error-light: #fed7d7;
  --color-error-dark: #c53030;
  --color-blue-100: #ebf8ff;
  --color-blue-700: #2b6cb0;
  
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
  
  --transition-fast: 0.15s ease;
  --transition-normal: 0.3s ease;
  
  --backdrop-blur-sm: blur(4px);
  --line-height-relaxed: 1.625;
}

.maintenance-view {
  padding: var(--space-4);
  background: #f8fafc;
  min-height: 100vh;
}

.maintenance-header {
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

.maintenance-filters {
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
  grid-template-columns: 2fr 1fr 1fr;
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

.maintenance-content {
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

.maintenance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: var(--space-4);
}

.maintenance-card {
  background: var(--color-white);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-100);
  overflow: hidden;
  transition: all var(--transition-fast);
  cursor: pointer;
}

.maintenance-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--color-gray-200);
}

.maintenance-card.urgent {
  border-color: var(--color-error);
  background: linear-gradient(135deg, var(--color-error-light), var(--color-white));
}

.card-header {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-gray-100);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(135deg, var(--color-gray-50), var(--color-white));
}

.maintenance-info h3 {
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

.units-info {
  margin-top: var(--space-2);
}

.units-count {
  font-size: var(--font-size-xs);
  color: var(--color-blue-700);
  background: var(--color-blue-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.maintenance-badges {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-badge.preventiva {
  background: var(--color-success-light);
  color: var(--color-success);
}

.type-badge.corretiva {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.status-badge {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
}

.status-badge.pendente {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

.status-badge.pendente .status-dot {
  background: var(--color-gray-600);
}

.status-badge.em-andamento {
  background: var(--color-warning-light);
  color: var(--color-warning);
}

.status-badge.em-andamento .status-dot {
  background: var(--color-warning);
}

.status-badge.concluida {
  background: var(--color-success-light);
  color: var(--color-success);
}

.status-badge.concluida .status-dot {
  background: var(--color-success);
}

.card-body {
  padding: var(--space-4);
}

.maintenance-details {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.detail-item.description-item {
  align-items: flex-start;
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

.detail-value.cost {
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.detail-value.description {
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-600);
}

.attachments-list {
  display: flex;
  gap: var(--space-2);
}

.attachment-item {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.card-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

.maintenance-actions {
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

.action-btn.success {
  background: var(--color-success-light);
  color: var(--color-success);
  font-weight: 600;
}

.action-btn.success:hover {
  background: var(--color-success);
  color: var(--color-white);
  transform: translateY(-1px);
}

/* Table View */
.maintenance-table {
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

.units-cell {
  text-align: center;
}

.units-cell .units-count {
  background: var(--color-blue-100);
  color: var(--color-blue-700);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
}

.status-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.cost-cell {
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
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

.large-modal {
  max-width: 1000px;
}

.details-modal {
  max-width: 900px;
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
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.units-counter {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  font-weight: var(--font-weight-medium);
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

.checkbox-label {
  flex-direction: row !important;
  align-items: center;
  gap: var(--space-2) !important;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
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

/* Units Form */
.units-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.add-unit-form {
  background: var(--color-gray-50);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-gray-200);
}

.units-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.unit-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-xl);
  transition: all var(--transition-fast);
}

.unit-item:hover {
  border-color: var(--color-gray-300);
  box-shadow: var(--shadow-sm);
}

.unit-info {
  flex: 1;
}

.unit-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-1);
}

.unit-number {
  background: var(--color-black);
  color: var(--color-white);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
}

.serial-number {
  font-family: 'Monaco', 'Menlo', monospace;
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
}

.unit-notes {
  color: var(--color-gray-600);
  font-size: var(--font-size-sm);
  font-style: italic;
}

.remove-unit-btn {
  background: var(--color-error-light);
  color: var(--color-error);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-unit-btn:hover {
  background: var(--color-error);
  color: var(--color-white);
  transform: scale(1.1);
}

.empty-units {
  text-align: center;
  padding: var(--space-8);
  color: var(--color-gray-500);
}

.empty-units .empty-icon {
  font-size: var(--font-size-3xl);
  color: var(--color-gray-300);
  margin-bottom: var(--space-4);
}

.empty-units p {
  margin: 0 0 var(--space-2) 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-gray-400);
}

/* Attachments Form */
.attachments-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.attachment-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.file-input-group {
  display: flex;
  gap: var(--space-2);
  align-items: center;
}

.file-input {
  display: none;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
  font-size: var(--font-size-sm);
}

.remove-file {
  background: none;
  border: none;
  color: var(--color-error);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.remove-file:hover {
  background: var(--color-error-light);
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-gray-100);
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

.detail-row .detail-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
}

.detail-row .detail-value {
  font-size: var(--font-size-sm);
  color: var(--color-gray-900);
  font-weight: var(--font-weight-medium);
}

.detail-row .detail-value.cost {
  font-weight: var(--font-weight-bold);
  color: var(--color-success);
}

.units-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: var(--space-3);
}

.unit-card {
  background: var(--color-white);
  padding: var(--space-3);
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-gray-200);
}

.unit-card .unit-header {
  margin-bottom: var(--space-2);
}

.unit-card .unit-notes {
  margin-bottom: 0;
}

.attachments-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
}

.attachment-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--color-white);
  border: 1px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
}

.attachment-card:hover {
  border-color: var(--color-gray-300);
  box-shadow: var(--shadow-sm);
}

.attachment-icon {
  width: 40px;
  height: 40px;
  background: var(--color-gray-100);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-gray-600);
  font-size: var(--font-size-lg);
}

.attachment-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.attachment-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-900);
}

.attachment-link {
  font-size: var(--font-size-sm);
  color: var(--color-black);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
}

.attachment-link:hover {
  text-decoration: underline;
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

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .maintenance-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

@media (max-width: 768px) {
  .maintenance-view {
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
  
  .maintenance-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }
  
  .maintenance-actions {
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
  
  .units-grid {
    grid-template-columns: 1fr;
  }
  
  .attachments-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .maintenance-view {
    padding: var(--space-2);
  }
  
  .maintenance-card {
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
  
  .maintenance-badges {
    flex-direction: row;
    align-items: flex-start;
  }
  
  .unit-item {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }
  
  .remove-unit-btn {
    align-self: flex-end;
  }
}
</style>
