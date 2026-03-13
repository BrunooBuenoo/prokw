import { Timestamp } from 'firebase/firestore'

export function toDate(input?: string | Timestamp): Date {
  if (!input) return new Date('Invalid Date')
  if (typeof input === 'string') return new Date(input)
  return input.toDate()
}


export function toDateStringSafe(input?: string | Timestamp): string {
  if (!input) return ''
  if (typeof input === 'string') return input
  return input.toDate().toISOString()
}

export function formatDate(date?: string | Date | Timestamp): string {
  if (!date) return ''
  if (typeof date === 'string') return new Date(date).toLocaleDateString('pt-BR')
  if (date instanceof Timestamp) return date.toDate().toLocaleDateString('pt-BR')
  return date.toLocaleDateString('pt-BR')
}