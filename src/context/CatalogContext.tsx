import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { getLocalCatalog, loadCatalog, type CatalogData } from '../services/catalogService'
import { catalogSource } from '../services/firebase'
import type { Category, Product } from '../types'

type Status = 'loading' | 'ready'

interface CatalogContextValue {
  status: Status
  source: CatalogData['source']
  /** Mensagem quando o Firestore falhou e foram usados os dados locais */
  notice: string | null
  products: Product[]
  categories: Category[]
  categoryNames: Record<string, string>
  getProductBySlug: (slug: string) => Product | undefined
  getCategory: (id: string) => Category | undefined
}

const CatalogContext = createContext<CatalogContextValue | null>(null)

const empty: CatalogData = { products: [], categories: [], source: 'firestore' }

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<CatalogData>(() => (catalogSource === 'local' ? getLocalCatalog() : empty))
  const [status, setStatus] = useState<Status>(catalogSource === 'local' ? 'ready' : 'loading')
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (catalogSource === 'local') return
    let cancelled = false
    loadCatalog()
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        console.warn('[catálogo] Não foi possível ler o Firestore; a usar os dados locais.', err)
        setData(getLocalCatalog())
        setNotice('Não foi possível atualizar o catálogo. Alguns preços ou disponibilidades podem estar desatualizados.')
      })
      .finally(() => {
        if (!cancelled) setStatus('ready')
      })
    return () => {
      cancelled = true
    }
  }, [])

  const value = useMemo<CatalogContextValue>(() => {
    const bySlug = new Map(data.products.map((p) => [p.slug, p]))
    const byCategory = new Map(data.categories.map((c) => [c.id, c]))
    return {
      status,
      source: data.source,
      notice,
      products: data.products,
      categories: data.categories,
      categoryNames: Object.fromEntries(data.categories.map((c) => [c.id, c.name])),
      getProductBySlug: (slug) => bySlug.get(slug),
      getCategory: (id) => byCategory.get(id),
    }
  }, [data, status, notice])

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
}

export function useCatalog(): CatalogContextValue {
  const ctx = useContext(CatalogContext)
  if (!ctx) throw new Error('useCatalog deve ser usado dentro de <CatalogProvider>')
  return ctx
}
