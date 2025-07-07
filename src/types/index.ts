export interface User {
  uid: string
  email: string
  name: string
  role: 'admin' | 'tecnico' | 'diretor' | 'visualizador'
  photoURL?: string
  createdAt?: string
  lastLogin?: string
}

export interface Equipment {
  id: string
  name: string
  type: string
  brand: string
  model: string
  internalCode: string
  serialNumber: string
  location: string
  store: string
  warrantyUntil: string
  status: 'ativo' | 'manutencao' | 'inativo'
  purchaseValue: number
  purchaseDate: string
  invoiceUrl?: string
  createdAt: string
  updatedAt: string
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
  createdAt?: string
  updatedAt?: string
}

export interface Maintenance {
  id: string
  equipmentId: string
  type: 'preventiva' | 'corretiva'
  isExternal: boolean
  technician?: string
  company?: string
  description: string
  cost: number
  startDate: string
  endDate?: string
  returnDate?: string
  warrantyDays: number
  status: 'pendente' | 'em-andamento' | 'concluida'
  attachments: string[]
  createdAt: string
  updatedAt: string
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