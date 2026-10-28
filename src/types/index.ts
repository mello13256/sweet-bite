/**
 * Modelo de dados da loja.
 * Todos os preços são guardados em CÊNTIMOS (inteiros) para evitar erros de
 * arredondamento — 4,99 € é guardado como 499.
 */

export interface Category {
  /** Identificador usado nos URLs, ex.: "chocolates" → /loja?categoria=chocolates */
  id: string
  name: string
  description: string
  image: string
  /** Ordem de apresentação (menor aparece primeiro) */
  order: number
}

export interface ProductVariant {
  id: string
  /** Texto apresentado ao cliente, ex.: "250 g" ou "Caixa 12 unidades" */
  label: string
  /** Preço em cêntimos, antes de promoções */
  price: number
  /** Se false, a variante aparece como esgotada */
  available?: boolean
}

export interface Product {
  id: string
  /** Usado no URL: /produto/<slug> */
  slug: string
  name: string
  categoryId: string
  /** Frase curta para os cartões do catálogo */
  shortDescription: string
  /** Descrição completa da página de detalhe */
  description: string
  image: string
  /** Imagens adicionais opcionais para a galeria */
  gallery?: string[]
  /** Preço base em cêntimos (usado quando o produto não tem variantes) */
  price: number
  /** Nome do seletor de variantes, ex.: "Tamanho", "Peso", "Sabor" */
  variantLabel?: string
  variants?: ProductVariant[]
  /** Desconto em percentagem (0–90). Aplica-se a todas as variantes. */
  discountPercent?: number
  /** Disponibilidade geral do produto */
  available: boolean
  isNew?: boolean
  bestSeller?: boolean
  /** Pontuação usada para ordenar por popularidade (maior = mais popular) */
  popularity: number
  /** Data de entrada no catálogo (AAAA-MM-DD), usada para "Novidades" */
  createdAt: string
  /** Lista de alergénios. Deixar undefined quando a informação não está confirmada. */
  allergens?: string[]
  /** Nota adicional sobre alergénios / rotulagem */
  allergenNote?: string
  /** Texto livre, ex.: "Peso líquido aproximado" */
  details?: string[]
  /** Se false, o produto não aparece no site */
  published?: boolean
}

export interface CartItem {
  productId: string
  variantId?: string
  quantity: number
}

export type DeliveryMethod = 'levantamento' | 'entrega'

export interface CustomerDetails {
  name: string
  phone: string
  email: string
  notes: string
}

export interface DeliveryDetails {
  method: DeliveryMethod
  address: string
  postalCode: string
  city: string
  preferredDate: string
  preferredTime: string
}

export interface OrderLine {
  productId: string
  variantId?: string
  name: string
  variantLabel?: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  reference: string
  createdAt: string
  lines: OrderLine[]
  subtotal: number
  /** null = custo de entrega a combinar com a loja */
  deliveryFee: number | null
  total: number
  customer: CustomerDetails
  delivery: DeliveryDetails
}
