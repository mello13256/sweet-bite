import { storeConfig } from '../config/store'
import type { Product, ProductVariant } from '../types'
import { applyDiscount } from './money'

/** Desconto efetivo do produto (0 se as promoções estiverem desativadas). */
export function effectiveDiscount(product: Product): number {
  if (!storeConfig.promotions.enabled) return 0
  return product.discountPercent && product.discountPercent > 0 ? product.discountPercent : 0
}

export function isOnSale(product: Product): boolean {
  return effectiveDiscount(product) > 0
}

export function getVariant(product: Product, variantId?: string): ProductVariant | undefined {
  if (!product.variants?.length) return undefined
  return product.variants.find((v) => v.id === variantId)
}

/** Primeira variante disponível (ou a primeira, se nenhuma estiver disponível). */
export function defaultVariant(product: Product): ProductVariant | undefined {
  if (!product.variants?.length) return undefined
  return product.variants.find((v) => v.available !== false) ?? product.variants[0]
}

/** Preço original (antes de desconto) em cêntimos. */
export function basePrice(product: Product, variantId?: string): number {
  const variant = getVariant(product, variantId) ?? defaultVariant(product)
  return variant ? variant.price : product.price
}

/** Preço final (com desconto) em cêntimos. */
export function finalPrice(product: Product, variantId?: string): number {
  return applyDiscount(basePrice(product, variantId), effectiveDiscount(product))
}

/** Menor preço final entre as variantes — usado para "desde X €". */
export function lowestPrice(product: Product): number {
  if (!product.variants?.length) return finalPrice(product)
  return Math.min(...product.variants.map((v) => applyDiscount(v.price, effectiveDiscount(product))))
}

export function lowestBasePrice(product: Product): number {
  if (!product.variants?.length) return product.price
  return Math.min(...product.variants.map((v) => v.price))
}

export function hasMultiplePrices(product: Product): boolean {
  if (!product.variants || product.variants.length < 2) return false
  return new Set(product.variants.map((v) => v.price)).size > 1
}

/** O produto (e, se indicada, a variante) pode ser comprado? */
export function isPurchasable(product: Product, variantId?: string): boolean {
  if (!product.available) return false
  if (!product.variants?.length) return true
  const variant = getVariant(product, variantId)
  return variant ? variant.available !== false : false
}

/** Há pelo menos uma opção disponível para compra? */
export function hasAvailableOption(product: Product): boolean {
  if (!product.available) return false
  if (!product.variants?.length) return true
  return product.variants.some((v) => v.available !== false)
}

/** Custo de entrega em cêntimos, ou null se for "a combinar". */
export function deliveryFeeFor(subtotal: number, method: 'levantamento' | 'entrega'): number | null {
  if (method === 'levantamento') return 0
  const { deliveryFee, freeDeliveryFrom } = storeConfig.delivery
  if (freeDeliveryFrom !== null && subtotal >= freeDeliveryFrom) return 0
  return deliveryFee
}
