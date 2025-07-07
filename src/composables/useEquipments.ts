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
import type { Equipment } from "../types"

export function useEquipments() {
  const equipments = ref<Equipment[]>([])
  const isLoading = ref(false)

  const loadEquipments = async (filters?: any) => {
    isLoading.value = true

    try {
      let equipmentQuery = query(collection(db, "equipments"), orderBy("createdAt", "desc"))

      if (filters?.store) {
        equipmentQuery = query(
          collection(db, "equipments"),
          where("store", "==", filters.store),
          orderBy("createdAt", "desc"),
        )
      }

      const querySnapshot = await getDocs(equipmentQuery)

      equipments.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      })) as Equipment[]
    } catch (error) {
      console.error("Error loading equipments:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const addEquipment = async (equipment: Omit<Equipment, "id" | "createdAt" | "updatedAt">) => {
    try {
      isLoading.value = true

      const docRef = await addDoc(collection(db, "equipments"), {
        ...equipment,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      const newEquipment: Equipment = {
        ...equipment,
        id: docRef.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      equipments.value.unshift(newEquipment)
      return docRef.id
    } catch (error) {
      console.error("Error adding equipment:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const updateEquipment = async (id: string, updates: Partial<Equipment>) => {
    try {
      isLoading.value = true

      await updateDoc(doc(db, "equipments", id), {
        ...updates,
        updatedAt: serverTimestamp(),
      })

      const index = equipments.value.findIndex((eq) => eq.id === id)
      if (index !== -1) {
        equipments.value[index] = {
          ...equipments.value[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
      }
    } catch (error) {
      console.error("Error updating equipment:", error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  const deleteEquipment = async (id: string) => {
    try {
      isLoading.value = true

      await deleteDoc(doc(db, "equipments", id))

      const index = equipments.value.findIndex((eq) => eq.id === id)
      if (index !== -1) {
        equipments.value.splice(index, 1)
      }
    } catch (error) {
      console.error("Error deleting equipment:", error)
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
    deleteEquipment,
  }
}
