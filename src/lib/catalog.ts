import type { Product } from '../types'
import { hasAvailableOption, isOnSale, lowestPrice } from './pricing'

export type SortOption = 'relevancia' | 'popularidade' | 'novidades' | 'preco-asc' | 'preco-desc' | 'nome'

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'relevancia', label: 'Destaques' },
  { value: 'popularidade', label: 'Mais populares' },
  { value: 'novidades', label: 'Novidades' },
  { value: 'preco-asc', label: 'Preço: mais baixo' },
  { value: 'preco-desc', label: 'Preço: mais alto' },
  { value: 'nome', label: 'Nome (A–Z)' },
]

export function isSortOption(value: string | null): value is SortOption {
  return sortOptions.some((o) => o.value === value)
}

export interface CatalogFilters {
  query: string
  categoryId: string | null
  onSale: boolean
  inStock: boolean
  sort: SortOption
}

/** Remove acentos e passa a minúsculas, para pesquisar "rebucados" e encontrar "Rebuçados". */
export function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function matchesQuery(product: Product, query: string, categoryName = ''): boolean {
  const q = normalizeText(query)
  if (!q) return true
  const haystack = normalizeText(`${product.name} ${product.shortDescription} ${categoryName}`)
  return q.split(/\s+/).every((term) => haystack.includes(term))
}

export function filterProducts(
  products: Product[],
  filters: CatalogFilters,
  categoryNames: Record<string, string> = {},
): Product[] {
  const result = products.filter((p) => {
    if (filters.categoryId && p.categoryId !== filters.categoryId) return false
    if (filters.onSale && !isOnSale(p)) return false
    if (filters.inStock && !hasAvailableOption(p)) return false
    return matchesQuery(p, filters.query, categoryNames[p.categoryId])
  })
  return sortProducts(result, filters.sort)
}

export function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products]
  // Produtos esgotados vão sempre para o fim, exceto na ordenação por nome.
  const stock = (p: Product) => (hasAvailableOption(p) ? 0 : 1)
  switch (sort) {
    case 'popularidade':
      return list.sort((a, b) => stock(a) - stock(b) || b.popularity - a.popularity)
    case 'novidades':
      return list.sort((a, b) => stock(a) - stock(b) || b.createdAt.localeCompare(a.createdAt))
    case 'preco-asc':
      return list.sort((a, b) => stock(a) - stock(b) || lowestPrice(a) - lowestPrice(b))
    case 'preco-desc':
      return list.sort((a, b) => stock(a) - stock(b) || lowestPrice(b) - lowestPrice(a))
    case 'nome':
      return list.sort((a, b) => a.name.localeCompare(b.name, 'pt'))
    case 'relevancia':
    default:
      return list.sort(
        (a, b) =>
          stock(a) - stock(b) ||
          Number(!!b.bestSeller) - Number(!!a.bestSeller) ||
          Number(isOnSale(b)) - Number(isOnSale(a)) ||
          b.popularity - a.popularity,
      )
  }
}

/** Coleções da página inicial, derivadas dos mesmos dados do catálogo. */
export function getCollections(products: Product[]) {
  const available = products.filter(hasAvailableOption)
  return {
    bestSellers: sortProducts(
      available.filter((p) => p.bestSeller),
      'popularidade',
    ),
    newArrivals: sortProducts(
      available.filter((p) => p.isNew),
      'novidades',
    ),
    onSale: sortProducts(available.filter(isOnSale), 'popularidade'),
    combos: sortProducts(
      available.filter((p) => p.categoryId === 'combos'),
      'popularidade',
    ),
    giftBoxes: sortProducts(
      available.filter((p) => p.categoryId === 'caixas-oferta'),
      'popularidade',
    ),
  }
}
