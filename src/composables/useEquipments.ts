import { ref } from 'vue'
import type { Equipment } from '../types'

// EQUIPAMENTOS MOCADOS PARA DESENVOLVIMENTO
const mockEquipments: Equipment[] = [
  {
    id: '1',
    name: 'Computador Dell OptiPlex',
    type: 'Computador',
    brand: 'Dell',
    model: 'OptiPlex 7090',
    internalCode: 'PC-001',
    serialNumber: 'DL7090001',
    location: 'Sala 1',
    store: 'Centro',
    warrantyUntil: '2025-12-31',
    status: 'ativo',
    purchaseValue: 2500.00,
    purchaseDate: '2024-01-15',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Impressora HP LaserJet',
    type: 'Impressora',
    brand: 'HP',
    model: 'LaserJet Pro M404n',
    internalCode: 'IMP-001',
    serialNumber: 'HP404001',
    location: 'Recepção',
    store: 'Shopping Norte',
    warrantyUntil: '2025-06-30',
    status: 'ativo',
    purchaseValue: 800.00,
    purchaseDate: '2024-02-10',
    createdAt: '2024-02-10T14:30:00Z',
    updatedAt: '2024-02-10T14:30:00Z'
  },
  {
    id: '3',
    name: 'Roteador TP-Link',
    type: 'Roteador',
    brand: 'TP-Link',
    model: 'Archer C6',
    internalCode: 'RTR-001',
    serialNumber: 'TPC6001',
    location: 'Sala de TI',
    store: 'Matriz',
    warrantyUntil: '2025-03-15',
    status: 'manutencao',
    purchaseValue: 150.00,
    purchaseDate: '2024-03-01',
    createdAt: '2024-03-01T09:15:00Z',
    updatedAt: '2024-03-01T09:15:00Z'
  },
  {
    id: '4',
    name: 'Nobreak APC',
    type: 'Nobreak',
    brand: 'APC',
    model: 'Back-UPS 600VA',
    internalCode: 'NBK-001',
    serialNumber: 'APC600001',
    location: 'Servidor',
    store: 'Filial Sul',
    warrantyUntil: '2024-12-31',
    status: 'ativo',
    purchaseValue: 300.00,
    purchaseDate: '2023-12-15',
    createdAt: '2023-12-15T16:45:00Z',
    updatedAt: '2023-12-15T16:45:00Z'
  }
]

export function useEquipments() {
  const equipments = ref<Equipment[]>([...mockEquipments])
  const isLoading = ref(false)

  const loadEquipments = async (filters?: any) => {
    isLoading.value = true
    
    try {
      // Simular delay de carregamento
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filtered = [...mockEquipments]
      
      if (filters?.store) {
        filtered = filtered.filter(equipment => equipment.store === filters.store)
      }
      
      equipments.value = filtered
    } catch (error) {
      console.error('Error loading equipments:', error)
    } finally {
      isLoading.value = false
    }
  }

  const addEquipment = async (equipment: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      isLoading.value = true
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const newEquipment: Equipment = {
        ...equipment,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      mockEquipments.push(newEquipment)
      equipments.value = [...mockEquipments]
      
    } catch (error) {
      console.error('Error adding equipment:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      isLoading.value = true
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const index = mockEquipments.findIndex(eq => eq.id === id)
      if (index !== -1) {
        mockEquipments[index] = {
          ...mockEquipments[index],
          ...updates,
          updatedAt: new Date().toISOString()
        }
        equipments.value = [...mockEquipments]
      }
      
    } catch (error) {
      console.error('Error updating equipment:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteEquipment = async (id: string) => {
    try {
      isLoading.value = true
      
      // Simular delay de exclusão
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const index = mockEquipments.findIndex(eq => eq.id === id)
      if (index !== -1) {
        mockEquipments.splice(index, 1)
        equipments.value = [...mockEquipments]
      }
      
    } catch (error) {
      console.error('Error deleting equipment:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    equipments,
    isLoading,
    loadEquipments,
    addEquipment,
    updateEquipment,
    deleteEquipment
  }
}