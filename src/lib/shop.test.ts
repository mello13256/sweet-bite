import { describe, expect, it } from 'vitest'
import { products } from '../data/products'
import { categories } from '../data/categories'
import type { CustomerDetails, DeliveryDetails, Product } from '../types'
import { cartReducer, clampQuantity, MAX_QTY, resolveCart, sanitizeCart, toOrderLines } from './cart'
import { filterProducts, getCollections, normalizeText } from './catalog'
import { applyDiscount, formatPrice } from './money'
import { buildOrder, createOrderReference } from './order'
import { finalPrice, isPurchasable, lowestPrice } from './pricing'
import { isValidPortuguesePhone, isValidPostalCode, validateCustomer, validateDelivery } from './validation'
import { buildOrderMessage, buildWhatsAppUrl, isWhatsAppConfigured, normalizeWhatsAppNumber } from './whatsapp'

const byId = (id: string) => products.find((p) => p.id === id) as Product
const nbsp = (s: string) => s.replace(/ /g, ' ')

describe('dinheiro', () => {
  it('formata euros em português', () => {
    expect(nbsp(formatPrice(1290))).toBe('12,90 €')
    expect(nbsp(formatPrice(5))).toBe('0,05 €')
  })
  it('aplica descontos arredondando ao cêntimo', () => {
    expect(applyDiscount(279, 20)).toBe(223) // 223,2 → 223
    expect(applyDiscount(450, 15)).toBe(383) // 382,5 → 383
    expect(applyDiscount(1000, 0)).toBe(1000)
    expect(applyDiscount(1000, undefined)).toBe(1000)
  })
})

describe('dados do catálogo', () => {
  it('tem ids e slugs únicos e categorias válidas', () => {
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length)
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length)
    const catIds = new Set(categories.map((c) => c.id))
    for (const p of products) {
      expect(catIds.has(p.categoryId), p.id).toBe(true)
      expect(Number.isInteger(p.price), p.id).toBe(true)
      for (const v of p.variants ?? []) expect(Number.isInteger(v.price), `${p.id}/${v.id}`).toBe(true)
    }
  })
})

describe('preços', () => {
  it('usa o preço da variante com desconto', () => {
    const gomas = byId('p-gomas-acidas') // 20% desconto
    expect(finalPrice(gomas, '150g')).toBe(223)
    expect(finalPrice(gomas, '300g')).toBe(399)
    expect(lowestPrice(gomas)).toBe(223)
  })
  it('respeita a disponibilidade das variantes', () => {
    const mix = byId('p-mix-gomas')
    expect(isPurchasable(mix, '200g')).toBe(true)
    expect(isPurchasable(mix, '1kg')).toBe(false)
    expect(isPurchasable(byId('p-bombons-brancos'))).toBe(false)
  })
})

describe('pesquisa e filtros', () => {
  const base = { query: '', categoryId: null, onSale: false, inStock: false, sort: 'relevancia' as const }
  it('ignora acentos e maiúsculas', () => {
    expect(normalizeText('Rebuçados')).toBe('rebucados')
    const result = filterProducts(products, { ...base, query: 'REBUCADOS' })
    expect(result.length).toBeGreaterThan(0)
    expect(result.every((p) => normalizeText(p.name).includes('rebucados'))).toBe(true)
  })
  it('filtra por categoria, promoção e disponibilidade', () => {
    expect(filterProducts(products, { ...base, categoryId: 'gomas' }).every((p) => p.categoryId === 'gomas')).toBe(true)
    expect(filterProducts(products, { ...base, onSale: true }).every((p) => (p.discountPercent ?? 0) > 0)).toBe(true)
    expect(filterProducts(products, { ...base, inStock: true }).some((p) => !p.available)).toBe(false)
  })
  it('ordena por preço e por novidade', () => {
    const asc = filterProducts(products, { ...base, inStock: true, sort: 'preco-asc' }).map(lowestPrice)
    expect(asc).toEqual([...asc].sort((a, b) => a - b))
    const recent = filterProducts(products, { ...base, inStock: true, sort: 'novidades' }).map((p) => p.createdAt)
    expect(recent).toEqual([...recent].sort().reverse())
  })
  it('coloca os esgotados no fim', () => {
    const list = filterProducts(products, { ...base, sort: 'preco-asc' })
    const firstOut = list.findIndex((p) => !p.available)
    expect(list.slice(firstOut).every((p) => !p.available)).toBe(true)
  })
  it('gera coleções da página inicial sem esgotados', () => {
    const c = getCollections(products)
    expect(c.bestSellers.length).toBeGreaterThan(0)
    expect(c.onSale.every((p) => p.available)).toBe(true)
  })
})

describe('carrinho', () => {
  it('soma quantidades da mesma variante e separa variantes diferentes', () => {
    let s = cartReducer([], { type: 'add', productId: 'a', variantId: '1', quantity: 2 })
    s = cartReducer(s, { type: 'add', productId: 'a', variantId: '1', quantity: 3 })
    s = cartReducer(s, { type: 'add', productId: 'a', variantId: '2', quantity: 1 })
    expect(s).toEqual([
      { productId: 'a', variantId: '1', quantity: 5 },
      { productId: 'a', variantId: '2', quantity: 1 },
    ])
  })
  it('impede quantidades inválidas', () => {
    expect(clampQuantity(0)).toBe(1)
    expect(clampQuantity(-4)).toBe(1)
    expect(clampQuantity(2.7)).toBe(2)
    expect(clampQuantity(Number.NaN)).toBe(1)
    expect(clampQuantity(999)).toBe(MAX_QTY)
    const s = cartReducer([{ productId: 'a', quantity: MAX_QTY }], { type: 'add', productId: 'a', quantity: 5 })
    expect(s[0]!.quantity).toBe(MAX_QTY)
  })
  it('remove e limpa', () => {
    const s = [
      { productId: 'a', quantity: 1 },
      { productId: 'b', variantId: 'x', quantity: 1 },
    ]
    expect(cartReducer(s, { type: 'remove', productId: 'b', variantId: 'x' })).toEqual([{ productId: 'a', quantity: 1 }])
    expect(cartReducer(s, { type: 'clear' })).toEqual([])
  })
  it('valida dados corrompidos do localStorage', () => {
    expect(sanitizeCart('lixo')).toEqual([])
    expect(
      sanitizeCart([
        { productId: 'a', quantity: 3 },
        { productId: 5 },
        null,
        { productId: 'a', quantity: 1 },
        { productId: 'b', quantity: 500 },
      ]),
    ).toEqual([
      { productId: 'a', variantId: undefined, quantity: 3 },
      { productId: 'b', variantId: undefined, quantity: MAX_QTY },
    ])
  })
  it('calcula subtotais e total sem erros de arredondamento', () => {
    const items = [
      { productId: 'p-gomas-acidas', variantId: '150g', quantity: 3 }, // 3 × 2,23
      { productId: 'p-tablete-negro', quantity: 2 }, // 2 × 3,49
      { productId: 'p-bombons-brancos', quantity: 1 }, // esgotado
      { productId: 'p-inexistente', quantity: 1 },
    ]
    const r = resolveCart(items, products)
    expect(r.subtotal).toBe(3 * 223 + 2 * 349)
    expect(r.itemCount).toBe(7)
    expect(r.hasIssues).toBe(true)
    expect(r.lines.map((l) => l.issue)).toEqual([null, null, 'unavailable', 'missing'])
    expect(toOrderLines(r.lines)).toHaveLength(2)
  })
})

describe('validação', () => {
  it('aceita números portugueses', () => {
    expect(isValidPortuguesePhone('912 345 678')).toBe(true)
    expect(isValidPortuguesePhone('+351 212345678')).toBe(true)
    expect(isValidPortuguesePhone('812345678')).toBe(false)
    expect(isValidPortuguesePhone('91234')).toBe(false)
  })
  it('valida código postal', () => {
    expect(isValidPostalCode('1000-001')).toBe(true)
    expect(isValidPostalCode('1000001')).toBe(false)
  })
  it('exige nome e telemóvel; email é opcional', () => {
    const e = validateCustomer({ name: '', phone: '123', email: 'x', notes: '' })
    expect(Object.keys(e).sort()).toEqual(['email', 'name', 'phone'])
    expect(validateCustomer({ name: 'Ana', phone: '912345678', email: '', notes: '' })).toEqual({})
  })
  it('exige morada só para entregas', () => {
    const d: DeliveryDetails = {
      method: 'levantamento',
      address: '',
      postalCode: '',
      city: '',
      preferredDate: '',
      preferredTime: '',
    }
    expect(validateDelivery(d, '2026-10-28')).toEqual({})
    expect(Object.keys(validateDelivery({ ...d, method: 'entrega' }, '2026-10-28')).sort()).toEqual([
      'address',
      'city',
      'postalCode',
    ])
    expect(validateDelivery({ ...d, preferredDate: '2026-10-01' }, '2026-10-28').preferredDate).toBeDefined()
  })
})

describe('WhatsApp', () => {
  const customer: CustomerDetails = { name: 'Maria Silva', phone: '912345678', email: '', notes: 'Sem frutos secos, por favor.' }
  const delivery: DeliveryDetails = {
    method: 'entrega',
    address: 'Rua das Flores, 10',
    postalCode: '1000-001',
    city: 'Lisboa',
    preferredDate: '2026-11-02',
    preferredTime: 'tarde',
  }

  it('deteta número em falta ou inválido', () => {
    expect(isWhatsAppConfigured('')).toBe(false)
    expect(isWhatsAppConfigured('123')).toBe(false)
    expect(isWhatsAppConfigured('+351 912 345 678')).toBe(true)
    expect(normalizeWhatsAppNumber('00351 912-345-678')).toBe('351912345678')
  })

  it('gera mensagem com produtos, quantidades, preços, cliente e entrega', () => {
    const r = resolveCart(
      [
        { productId: 'p-bombons-sortidos', variantId: '16', quantity: 2 },
        { productId: 'p-tablete-negro', quantity: 1 },
      ],
      products,
    )
    const order = buildOrder(toOrderLines(r.lines), customer, delivery, 'SB-261028-TEST')
    expect(order.subtotal).toBe(2 * 1290 + 349)
    expect(order.deliveryFee).toBeNull()
    expect(order.total).toBe(order.subtotal)

    const msg = nbsp(buildOrderMessage(order, 'SweetBite'))
    expect(msg).toContain('Referência: SB-261028-TEST')
    expect(msg).toContain('• 2 × Bombons Sortidos da Casa (Caixa 16 unidades)')
    expect(msg).toContain('12,90 € /un. = 25,80 €')
    expect(msg).toContain('Subtotal: 29,29 €')
    expect(msg).toContain('Entrega: a combinar')
    expect(msg).toContain('*Total: 29,29 €* (sem entrega)')
    expect(msg).toContain('Nome: Maria Silva')
    expect(msg).toContain('Telemóvel: 912 345 678')
    expect(msg).toContain('Morada: Rua das Flores, 10')
    expect(msg).toContain('Data pretendida: 02/11/2026 (Tarde)')
    expect(msg).toContain('Sem frutos secos, por favor.')

    const url = buildWhatsAppUrl(msg, '351 912 345 678')
    expect(url.startsWith('https://wa.me/351912345678?text=')).toBe(true)
    expect(decodeURIComponent(url.split('text=')[1]!)).toBe(msg)
  })

  it('levantamento não tem custo', () => {
    const order = buildOrder([], customer, { ...delivery, method: 'levantamento' })
    expect(order.deliveryFee).toBe(0)
    expect(nbsp(buildOrderMessage(order))).toContain('Levantamento: sem custo')
  })

  it('gera referências legíveis', () => {
    expect(createOrderReference(new Date(2026, 9, 28), () => 0)).toBe('SB-261028-AAAA')
  })
})
