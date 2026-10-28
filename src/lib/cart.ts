import { storeConfig } from '../config/store'
import type { CartItem, OrderLine, Product } from '../types'
import { finalPrice, getVariant, isPurchasable } from './pricing'

export const MAX_QTY = storeConfig.cart.maxQuantityPerItem

export type CartAction =
  | { type: 'add'; productId: string; variantId?: string; quantity: number }
  | { type: 'setQuantity'; productId: string; variantId?: string; quantity: number }
  | { type: 'remove'; productId: string; variantId?: string }
  | { type: 'clear' }
  | { type: 'replace'; items: CartItem[] }

export function lineKey(productId: string, variantId?: string): string {
  return variantId ? `${productId}::${variantId}` : productId
}

/** Garante uma quantidade inteira entre 1 e o máximo configurado. */
export function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1
  return Math.min(MAX_QTY, Math.max(1, Math.floor(value)))
}

const same = (item: CartItem, productId: string, variantId?: string) =>
  item.productId === productId && (item.variantId ?? undefined) === (variantId ?? undefined)

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((i) => same(i, action.productId, action.variantId))
      if (existing) {
        return state.map((i) => (i === existing ? { ...i, quantity: clampQuantity(i.quantity + action.quantity) } : i))
      }
      return [...state, { productId: action.productId, variantId: action.variantId, quantity: clampQuantity(action.quantity) }]
    }
    case 'setQuantity':
      return state.map((i) =>
        same(i, action.productId, action.variantId) ? { ...i, quantity: clampQuantity(action.quantity) } : i,
      )
    case 'remove':
      return state.filter((i) => !same(i, action.productId, action.variantId))
    case 'clear':
      return []
    case 'replace':
      return sanitizeCart(action.items)
  }
}

/** Valida dados vindos do localStorage (podem estar corrompidos ou antigos). */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return []
  const items: CartItem[] = []
  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue
    const { productId, variantId, quantity } = entry as Record<string, unknown>
    if (typeof productId !== 'string' || !productId) continue
    if (variantId !== undefined && typeof variantId !== 'string') continue
    if (typeof quantity !== 'number') continue
    const key = lineKey(productId, variantId as string | undefined)
    if (items.some((i) => lineKey(i.productId, i.variantId) === key)) continue
    items.push({ productId, variantId: variantId as string | undefined, quantity: clampQuantity(quantity) })
  }
  return items
}

export type LineIssue = 'missing' | 'unavailable' | null

export interface CartLine {
  key: string
  item: CartItem
  product?: Product
  variantLabel?: string
  unitPrice: number
  lineTotal: number
  issue: LineIssue
}

/** Junta os itens do carrinho com os dados atuais do catálogo e calcula preços. */
export function resolveCart(items: CartItem[], products: Product[]) {
  const byId = new Map(products.map((p) => [p.id, p]))
  const lines: CartLine[] = items.map((item) => {
    const product = byId.get(item.productId)
    const key = lineKey(item.productId, item.variantId)
    if (!product) return { key, item, unitPrice: 0, lineTotal: 0, issue: 'missing' }
    const hasVariants = !!product.variants?.length
    const variant = getVariant(product, item.variantId)
    if (hasVariants && !variant) return { key, item, product, unitPrice: 0, lineTotal: 0, issue: 'missing' }
    const unitPrice = finalPrice(product, item.variantId)
    const purchasable = isPurchasable(product, item.variantId)
    return {
      key,
      item,
      product,
      variantLabel: variant?.label,
      unitPrice,
      lineTotal: purchasable ? unitPrice * item.quantity : 0,
      issue: purchasable ? null : 'unavailable',
    }
  })
  const valid = lines.filter((l) => !l.issue)
  return {
    lines,
    subtotal: valid.reduce((sum, l) => sum + l.lineTotal, 0),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
    hasIssues: lines.some((l) => l.issue),
    validLines: valid,
  }
}

export function toOrderLines(lines: CartLine[]): OrderLine[] {
  return lines
    .filter((l) => !l.issue && l.product)
    .map((l) => ({
      productId: l.item.productId,
      variantId: l.item.variantId,
      name: l.product!.name,
      variantLabel: l.variantLabel,
      quantity: l.item.quantity,
      unitPrice: l.unitPrice,
      lineTotal: l.lineTotal,
    }))
}
