import { ref } from "vue"
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase/config"
import type { Company } from "../types"

export function useCompanies() {
  const companies = ref<Company[]>([])
  const isLoading = ref(false)

  const loadCompanies = async (filters?: { status?: string }) => {
    isLoading.value = true
    try {
      let companyQuery = query(collection(db, "companies"), orderBy("createdAt", "desc"))

      if (filters?.status) {
        companyQuery = query(
          collection(db, "companies"),
          where("status", "==", filters.status),
          orderBy("createdAt", "desc"),
        )
      }

      const querySnapshot = await getDocs(companyQuery)

      companies.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Company[]
    } catch (error) {
      console.error("Error loading companies:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addCompany = async (company: Omit<Company, "id">) => {
    try {
      isLoading.value = true

      const docRef = await addDoc(collection(db, "companies"), {
        ...company,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const newCompany: Company = {
        ...company,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      companies.value.unshift(newCompany)
      return docRef.id
    } catch (error) {
      console.error("Error adding company:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateCompany = async (id: string, updates: Partial<Company>) => {
    try {
      isLoading.value = true

      await updateDoc(doc(db, "companies", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      const index = companies.value.findIndex((company) => company.id === id)
      if (index !== -1) {
        companies.value[index] = {
          ...companies.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error("Error updating company:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteCompany = async (id: string) => {
    try {
      isLoading.value = true

      await deleteDoc(doc(db, "companies", id))

      const index = companies.value.findIndex((company) => company.id === id)
      if (index !== -1) {
        companies.value.splice(index, 1)
      }
    } catch (error) {
      console.error("Error deleting company:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const getCompanyById = (id: string) => {
    return companies.value.find((company) => company.id === id)
  }

  return {
    companies,
    isLoading,
    loadCompanies,
    addCompany,
    updateCompany,
    deleteCompany,
    getCompanyById,
  }
}
