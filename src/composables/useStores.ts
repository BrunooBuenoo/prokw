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
import type { Store } from '../types'

export function useStores() {
  const stores = ref<Store[]>([])
  const isLoading = ref(false)

  const loadStores = async (filters?: { status?: string }) => {
    isLoading.value = true
    try {
      let q = query(collection(db, 'lojas'), orderBy('name'))
      
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      
      const querySnapshot = await getDocs(q)
      stores.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[]
    } catch (error) {
      console.error('Error loading stores:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addStore = async (store: Omit<Store, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, 'lojas'), {
        ...store,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      await loadStores()
      return docRef.id
    } catch (error) {
      console.error('Error adding store:', error)
      throw error
    }
  }

  const updateStore = async (id: string, updates: Partial<Store>) => {
    try {
      await updateDoc(doc(db, 'lojas', id), {
        ...updates,
        updatedAt: new Date().toISOString()
      })
      await loadStores()
    } catch (error) {
      console.error('Error updating store:', error)
      throw error
    }
  }

  const deleteStore = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'lojas', id))
      await loadStores()
    } catch (error) {
      console.error('Error deleting store:', error)
      throw error
    }
  }

  const getStoreById = (id: string) => {
    return stores.value.find(store => store.id === id)
  }

  return {
    stores,
    isLoading,
    loadStores,
    addStore,
    updateStore,
    deleteStore,
    getStoreById
  }
}