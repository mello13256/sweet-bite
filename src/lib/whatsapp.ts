import { storeConfig } from '../config/store'
import type { Order } from '../types'
import { formatPrice } from './money'
import { formatPhone } from './validation'

/** Normaliza o número configurado: só dígitos, sem "+" nem "00" inicial. */
export function normalizeWhatsAppNumber(value: string): string {
  return value.replace(/\D/g, '').replace(/^00/, '')
}

/** Um número internacional válido tem entre 8 e 15 dígitos (E.164). */
export function isWhatsAppConfigured(number = storeConfig.whatsappNumber): boolean {
  const n = normalizeWhatsAppNumber(number)
  return n.length >= 8 && n.length <= 15
}

export function buildWhatsAppUrl(message: string, number = storeConfig.whatsappNumber): string {
  return `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}/${m}/${y}` : iso
}

const timeLabels: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  indiferente: 'Indiferente',
}

/** Gera a mensagem de encomenda, formatada para o WhatsApp (*negrito*, _itálico_). */
export function buildOrderMessage(order: Order, storeName = storeConfig.name): string {
  const lines: string[] = []
  lines.push(`*Novo pedido de encomenda — ${storeName}*`)
  lines.push(`Referência: ${order.reference}`)
  lines.push('')
  lines.push('*Produtos*')
  for (const l of order.lines) {
    const name = l.variantLabel ? `${l.name} (${l.variantLabel})` : l.name
    lines.push(`• ${l.quantity} × ${name}`)
    lines.push(`   ${formatPrice(l.unitPrice)} /un. = ${formatPrice(l.lineTotal)}`)
  }
  lines.push('')
  lines.push(`Subtotal: ${formatPrice(order.subtotal)}`)
  if (order.delivery.method === 'levantamento') {
    lines.push('Levantamento: sem custo')
  } else {
    lines.push(`Entrega: ${order.deliveryFee === null ? 'a combinar' : formatPrice(order.deliveryFee)}`)
  }
  lines.push(`*Total: ${formatPrice(order.total)}*${order.deliveryFee === null ? ' (sem entrega)' : ''}`)
  lines.push('')
  lines.push('*Cliente*')
  lines.push(`Nome: ${order.customer.name.trim()}`)
  lines.push(`Telemóvel: ${formatPhone(order.customer.phone)}`)
  if (order.customer.email.trim()) lines.push(`Email: ${order.customer.email.trim()}`)
  lines.push('')
  lines.push(`*${order.delivery.method === 'levantamento' ? 'Levantamento na loja' : 'Entrega ao domicílio'}*`)
  if (order.delivery.method === 'entrega') {
    lines.push(`Morada: ${order.delivery.address.trim()}`)
    lines.push(`${order.delivery.postalCode.trim()} ${order.delivery.city.trim()}`)
  }
  if (order.delivery.preferredDate) {
    const time = timeLabels[order.delivery.preferredTime]
    lines.push(`Data pretendida: ${formatDate(order.delivery.preferredDate)}${time ? ` (${time})` : ''}`)
  }
  if (order.customer.notes.trim()) {
    lines.push('')
    lines.push('*Observações*')
    lines.push(order.customer.notes.trim())
  }
  lines.push('')
  lines.push('_Pedido enviado através do site. Aguarda confirmação da loja (disponibilidade, data e pagamento)._')
  return lines.join('\n')
}
