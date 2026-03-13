import { Timestamp } from 'firebase/firestore'

export interface User {
  uid: string
  email: string
  name: string
  role: 'admin' | 'tecnico' | 'diretor' | 'visualizador'
  photoURL?: string
  createdAt?: string | Timestamp
  lastLogin?: string | Timestamp
  status?: 'ativo' | 'inativo'
}

export interface Equipment {
  id: string
  name: string
  type: string
  brand: string
  model: string
  internalCode: string
  serialNumber?: string
  patrimonyNumber?: string
  location?: string
  store: string
  warrantyUntil?: string | Timestamp
  status: 'ativo' | 'manutencao' | 'inativo' | 'excluido'
  purchaseValue?: number
  purchaseDate?: string | Timestamp
  invoiceUrl?: string
  notes?: string
  createdAt: string | Timestamp
  updatedAt: string | Timestamp
  code?: string;
}

export interface Store {
  id: string
  name: string
  code: string
  address: string
  city: string
  state: string
  zipCode: string
  phone?: string
  manager?: string
  status: 'ativo' | 'inativo'
  createdAt?: string | Timestamp
  updatedAt?: string | Timestamp
}

export interface Company {
  id: string
  name: string
  cnpj: string
  address: string
  city: string
  state: string
  zipCode: string
  phone: string
  email: string
  contact: string
  services: string[]
  status: 'ativo' | 'inativo'
  createdAt?: string | Timestamp
  updatedAt?: string | Timestamp
}

export interface Maintenance {
  id: string
  equipmentId: string
  type: 'preventiva' | 'corretiva'
  isExternal: boolean
  technician?: string
  companyId?: string
  description: string
  cost: number
  startDate: string | Timestamp
  endDate?: string | Timestamp
  returnDate?: string | Timestamp
  warrantyDays?: number
  status: 'pendente' | 'em-andamento' | 'concluida'
  attachments?: string[]
  createdAt: string | Timestamp
  updatedAt: string | Timestamp
}

export interface DashboardStats {
  totalEquipments: number
  equipmentsByStore: { [key: string]: number }
  inMaintenanceCount: number
  warrantyExpiringSoon: number
  noMaintenanceCount: number
  monthlyMaintenanceCost: number
  totalUsers: number
  totalStores: number
  totalCompanies: number
}

export interface Notification {
  id: string
  message: string
  time: Date
  type: 'info' | 'warning' | 'error' | 'success'
  icon: string[]
  read: boolean
  route: string
  data?: any
}

export type SuggestionType = 'Equipamento' | 'Loja' | 'Usuário'

export interface SearchSuggestion {
  id: string
  title: string
  type: SuggestionType
  icon: [string, string]
  route: string
  data: any
}
