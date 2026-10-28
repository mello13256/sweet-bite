import { categories as localCategories } from '../data/categories'
import { products as localProducts } from '../data/products'
import type { Category, Product, ProductVariant } from '../types'
import { catalogSource, getDb } from './firebase'

export interface CatalogData {
  products: Product[]
  categories: Category[]
  source: 'firestore' | 'local'
}

const isStr = (v: unknown): v is string => typeof v === 'string'
const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0

function parseVariant(raw: unknown): ProductVariant | null {
  if (!raw || typeof raw !== 'object') return null
  const v = raw as Record<string, unknown>
  if (!isStr(v.id) || !isStr(v.label) || !isInt(v.price)) return null
  return { id: v.id, label: v.label, price: v.price, available: v.available !== false }
}

/** Valida um documento do Firestore. Documentos inválidos são ignorados. */
export function parseProduct(id: string, raw: Record<string, unknown>): Product | null {
  const r = raw
  if (!isStr(r.name) || !isStr(r.slug) || !isStr(r.categoryId) || !isStr(r.image) || !isInt(r.price)) return null
  const variants = Array.isArray(r.variants)
    ? r.variants.map(parseVariant).filter((v): v is ProductVariant => v !== null)
    : undefined
  return {
    id,
    slug: r.slug,
    name: r.name,
    categoryId: r.categoryId,
    shortDescription: isStr(r.shortDescription) ? r.shortDescription : '',
    description: isStr(r.description) ? r.description : '',
    image: r.image,
    gallery: Array.isArray(r.gallery) ? r.gallery.filter(isStr) : undefined,
    price: r.price,
    variantLabel: isStr(r.variantLabel) ? r.variantLabel : undefined,
    variants: variants?.length ? variants : undefined,
    discountPercent: typeof r.discountPercent === 'number' ? r.discountPercent : undefined,
    available: r.available !== false,
    isNew: r.isNew === true,
    bestSeller: r.bestSeller === true,
    popularity: typeof r.popularity === 'number' ? r.popularity : 0,
    createdAt: isStr(r.createdAt) ? r.createdAt : '1970-01-01',
    allergens: Array.isArray(r.allergens) ? r.allergens.filter(isStr) : undefined,
    allergenNote: isStr(r.allergenNote) ? r.allergenNote : undefined,
    details: Array.isArray(r.details) ? r.details.filter(isStr) : undefined,
    published: r.published !== false,
  }
}

export function parseCategory(id: string, raw: Record<string, unknown>): Category | null {
  if (!isStr(raw.name) || !isStr(raw.image)) return null
  return {
    id,
    name: raw.name,
    image: raw.image,
    description: isStr(raw.description) ? raw.description : '',
    order: typeof raw.order === 'number' ? raw.order : 99,
  }
}

function finalize(products: Product[], categories: Category[], source: CatalogData['source']): CatalogData {
  return {
    products: products.filter((p) => p.published !== false),
    categories: [...categories].sort((a, b) => a.order - b.order),
    source,
  }
}

export function getLocalCatalog(): CatalogData {
  return finalize(localProducts, localCategories, 'local')
}

export async function loadCatalog(): Promise<CatalogData> {
  if (catalogSource === 'local') return getLocalCatalog()

  const db = await getDb()
  const { collection, getDocs } = await import('firebase/firestore')
  const [productSnap, categorySnap] = await Promise.all([
    getDocs(collection(db, 'products')),
    getDocs(collection(db, 'categories')),
  ])
  const products = productSnap.docs.map((d) => parseProduct(d.id, d.data())).filter((p): p is Product => p !== null)
  const categories = categorySnap.docs.map((d) => parseCategory(d.id, d.data())).filter((c): c is Category => c !== null)

  if (!products.length) {
    throw new Error('A coleção "products" do Firestore está vazia. Execute npm run seed:firestore.')
  }
  return finalize(products, categories.length ? categories : localCategories, 'firestore')
}
