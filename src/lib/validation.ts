import type { CustomerDetails, DeliveryDetails } from '../types'

export type FieldErrors<T> = Partial<Record<keyof T, string>>

/** Aceita números portugueses (9 dígitos, começados por 2, 3 ou 9), com ou sem +351/00351. */
export function isValidPortuguesePhone(value: string): boolean {
  const digits = value.replace(/[\s.-]/g, '')
  const local = digits.replace(/^(\+351|00351)/, '')
  return /^[239]\d{8}$/.test(local)
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

export function isValidPostalCode(value: string): boolean {
  return /^\d{4}-\d{3}$/.test(value.trim())
}

export function validateCustomer(c: CustomerDetails): FieldErrors<CustomerDetails> {
  const errors: FieldErrors<CustomerDetails> = {}
  const name = c.name.trim()
  if (!name) errors.name = 'Indique o seu nome.'
  else if (name.length < 2) errors.name = 'O nome é demasiado curto.'
  else if (name.length > 80) errors.name = 'O nome é demasiado longo.'

  if (!c.phone.trim()) errors.phone = 'Indique um número de telemóvel.'
  else if (!isValidPortuguesePhone(c.phone)) errors.phone = 'Indique um número português válido (9 dígitos).'

  if (c.email.trim() && !isValidEmail(c.email)) errors.email = 'O email não parece válido.'
  if (c.notes.length > 500) errors.notes = 'As observações não podem ter mais de 500 caracteres.'
  return errors
}

export function validateDelivery(d: DeliveryDetails, today: string): FieldErrors<DeliveryDetails> {
  const errors: FieldErrors<DeliveryDetails> = {}
  if (d.method === 'entrega') {
    if (!d.address.trim()) errors.address = 'Indique a morada de entrega.'
    if (!d.postalCode.trim()) errors.postalCode = 'Indique o código postal.'
    else if (!isValidPostalCode(d.postalCode)) errors.postalCode = 'Use o formato 0000-000.'
    if (!d.city.trim()) errors.city = 'Indique a localidade.'
  }
  if (d.preferredDate && d.preferredDate < today) errors.preferredDate = 'Escolha uma data a partir de hoje.'
  return errors
}

/** Formata um número português para leitura: 912345678 → "912 345 678" */
export function formatPhone(value: string): string {
  const digits = value.replace(/[\s.-]/g, '').replace(/^(\+351|00351)/, '')
  if (/^\d{9}$/.test(digits)) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
  return value.trim()
}

/** Data local no formato AAAA-MM-DD (para inputs type="date"). */
export function todayISO(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
