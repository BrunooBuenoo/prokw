import { ref } from 'vue'
import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy,
  where
} from 'firebase/firestore'
import { db } from '../firebase/config'
import type { Company } from '../types'

export function useCompanies() {
  const companies = ref<Company[]>([])
  const isLoading = ref(false)

  const loadCompanies = async (filters?: { status?: string }) => {
    isLoading.value = true
    try {
      let q = query(collection(db, 'empresas'), orderBy('name'))
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      const querySnapshot = await getDocs(q)
      companies.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Company[]
    } catch (error) {
      console.error('Error loading companies:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addCompany = async (company: Omit<Company, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'empresas'), {
        ...company,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      await loadCompanies()
      return docRef.id
    } catch (error) {
      console.error('Error adding company:', error)
      throw error
    }
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      await updateDoc(doc(db, 'empresas', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      await loadCompanies()
    } catch (error) {
      console.error('Error updating company:', error)
      throw error
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'empresas', id))
      await loadCompanies()
    } catch (error) {
      console.error('Error deleting company:', error)
      throw error
    }
  }

  const getCompanyById = (id: string) => {
    return companies.value.find(company => company.id === id)
  }

  return {
    companies,
    isLoading,
    loadCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById
  }
}