import type { CustomerDetails, DeliveryDetails, Order, OrderLine } from '../types'
import { deliveryFeeFor } from './pricing'

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

/** Referência curta e legível, ex.: SB-261028-7KQ2 */
export function createOrderReference(date = new Date(), random: () => number = Math.random): string {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  let code = ''
  for (let i = 0; i < 4; i++) code += ALPHABET[Math.floor(random() * ALPHABET.length)]
  return `SB-${yy}${mm}${dd}-${code}`
}

export function buildOrder(
  lines: OrderLine[],
  customer: CustomerDetails,
  delivery: DeliveryDetails,
  reference = createOrderReference(),
): Order {
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0)
  const deliveryFee = deliveryFeeFor(subtotal, delivery.method)
  return {
    reference,
    createdAt: new Date().toISOString(),
    lines,
    subtotal,
    deliveryFee,
    total: subtotal + (deliveryFee ?? 0),
    customer,
    delivery,
  }
}
