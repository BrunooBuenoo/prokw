import { ref } from "vue"
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "../firebase/config"
import type { Maintenance } from "../types"

export function useMaintenances() {
  const maintenances = ref<(Maintenance & { equipmentName: string; companyName?: string })[]>([])
  const isLoading = ref(false)

  const loadMaintenances = async (filters?: { type?: string; status?: string }) => {
    isLoading.value = true
    try {
      let maintenanceQuery = query(collection(db, "maintenances"), orderBy("createdAt", "desc"))

      if (filters?.type) {
        maintenanceQuery = query(
          collection(db, "maintenances"),
          where("type", "==", filters.type),
          orderBy("createdAt", "desc"),
        )
      }

      if (filters?.status) {
        maintenanceQuery = query(
          collection(db, "maintenances"),
          where("status", "==", filters.status),
          orderBy("createdAt", "desc"),
        )
      }

      const querySnapshot = await getDocs(maintenanceQuery)

      // Load maintenance data with equipment and company names
      const maintenancesList = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const maintenanceData = docSnapshot.data() as Maintenance
          let equipmentName = "Equipamento não encontrado"
          let companyName = undefined

          // Load equipment name
          if (maintenanceData.equipmentId) {
            try {
              const equipmentDoc = await getDoc(doc(db, "equipments", maintenanceData.equipmentId))
              if (equipmentDoc.exists()) {
                equipmentName = equipmentDoc.data().name
              }
            } catch (error) {
              console.error("Error loading equipment:", error)
            }
          }

          // Load company name if external maintenance
          if (maintenanceData.isExternal && maintenanceData.companyId) {
            try {
              const companyDoc = await getDoc(doc(db, "companies", maintenanceData.companyId))
              if (companyDoc.exists()) {
                companyName = companyDoc.data().name
              }
            } catch (error) {
              console.error("Error loading company:", error)
            }
          }

          return {
            id: docSnapshot.id,
            ...maintenanceData,
            equipmentName,
            companyName,
            createdAt: maintenanceData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            updatedAt: maintenanceData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          }
        }),
      )

      maintenances.value = maintenancesList
    } catch (error) {
      console.error("Error loading maintenances:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addMaintenance = async (maintenance: Omit<Maintenance, "id" | "createdAt" | "updatedAt">) => {
    try {
      isLoading.value = true

      const docRef = await addDoc(collection(db, "maintenances"), {
        ...maintenance,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      // Load equipment name for the new maintenance
      let equipmentName = "Equipamento não encontrado"
      if (maintenance.equipmentId) {
        try {
          const equipmentDoc = await getDoc(doc(db, "equipments", maintenance.equipmentId))
          if (equipmentDoc.exists()) {
            equipmentName = equipmentDoc.data().name
          }
        } catch (error) {
          console.error("Error loading equipment:", error)
        }
      }

      const newMaintenance = {
        ...maintenance,
        id: docRef.id,
        equipmentName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      maintenances.value.unshift(newMaintenance)
      return docRef.id
    } catch (error) {
      console.error("Error adding maintenance:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateMaintenance = async (id: string, updates: Partial<Maintenance>) => {
    try {
      isLoading.value = true

      await updateDoc(doc(db, "maintenances", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      const index = maintenances.value.findIndex((maintenance) => maintenance.id === id)
      if (index !== -1) {
        maintenances.value[index] = {
          ...maintenances.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error("Error updating maintenance:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    maintenances,
    isLoading,
    loadMaintenances,
    addMaintenance,
    updateMaintenance,
  }
}
