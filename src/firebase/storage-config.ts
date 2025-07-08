import { getStorage } from "firebase/storage"
import { app } from "./config"

// Configurar o Storage
export const storage = getStorage(app)

// Configurações de CORS para desenvolvimento (sem acessar internals)
if (import.meta.env.DEV) {
  try {
    const host = (storage as any)?._delegate?._host
    if (host && !host.includes("localhost")) {
      console.log("🔧 Configurando Firebase Storage para desenvolvimento...")
    }
  } catch (error) {
    console.warn("⚠️ Não foi possível verificar o host do Firebase Storage:", error)
  }
}

// Configurações de upload
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
  },
  timeout: 30000, // 30 segundos
}

// Função utilitária para validar arquivos
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!file) {
    return { valid: false, error: "Nenhum arquivo selecionado" }
  }

  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    return { valid: false, error: "Arquivo muito grande. Máximo 10MB." }
  }

  const allowedTypes = Object.values(UPLOAD_CONFIG.allowedTypes)
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Tipo de arquivo não permitido. Use PDF, JPG ou PNG." }
  }

  return { valid: true }
}
