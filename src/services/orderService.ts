import type { Order } from '../types'
import { getDb, saveOrdersEnabled } from './firebase'

const SAVE_TIMEOUT_MS = 6000

export type SaveOrderResult = { status: 'saved'; id: string } | { status: 'skipped' } | { status: 'failed'; error: string }

/**
 * Guarda o pedido no Firestore (coleção "orders"), se o Firebase estiver
 * configurado. Isto cria um registo do pedido para a loja consultar na
 * consola do Firebase — NÃO é um pagamento nem uma confirmação automática.
 *
 * As regras de segurança (firestore.rules) só permitem criar pedidos;
 * ninguém consegue lê-los ou alterá-los a partir do site.
 */
export async function saveOrder(order: Order): Promise<SaveOrderResult> {
  if (!saveOrdersEnabled) return { status: 'skipped' }
  try {
    const db = await getDb()
    const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
    const write = addDoc(collection(db, 'orders'), {
      reference: order.reference,
      status: 'pendente',
      channel: 'whatsapp',
      createdAt: serverTimestamp(),
      items: order.lines.map((l) => ({
        productId: l.productId,
        variantId: l.variantId ?? null,
        name: l.name,
        variantLabel: l.variantLabel ?? null,
        quantity: l.quantity,
        unitPrice: l.unitPrice,
        lineTotal: l.lineTotal,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      total: order.total,
      customer: {
        name: order.customer.name.trim(),
        phone: order.customer.phone.trim(),
        email: order.customer.email.trim(),
        notes: order.customer.notes.trim(),
      },
      delivery: {
        method: order.delivery.method,
        address: order.delivery.address.trim(),
        postalCode: order.delivery.postalCode.trim(),
        city: order.delivery.city.trim(),
        preferredDate: order.delivery.preferredDate,
        preferredTime: order.delivery.preferredTime,
      },
    })
    // Sem ligação, o Firestore só confirma a escrita quando voltar a estar
    // online. Não bloqueamos o cliente: ao fim de alguns segundos seguimos.
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Tempo de resposta excedido.')), SAVE_TIMEOUT_MS),
    )
    const ref = await Promise.race([write, timeout])
    return { status: 'saved', id: ref.id }
  } catch (err) {
    return { status: 'failed', error: err instanceof Error ? err.message : String(err) }
  }
}
