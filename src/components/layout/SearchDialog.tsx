import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Search, X } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { useUI } from '../../context/UIContext'
import { useDialog } from '../../hooks/useDialog'
import { filterProducts } from '../../lib/catalog'
import { formatPrice } from '../../lib/money'
import { lowestPrice } from '../../lib/pricing'
import { ProductImage } from '../ui/ProductImage'

const suggestions = ['Chocolate', 'Gomas', 'Macarons', 'Caixa de oferta', 'Marshmallows']

export function SearchDialog() {
  const { searchOpen, setSearchOpen } = useUI()
  const { products, categoryNames } = useCatalog()
  const [query, setQuery] = useState('')
  const deferred = useDeferredValue(query)
  const navigate = useNavigate()
  const location = useLocation()
  const panelRef = useRef<HTMLDivElement>(null)
  const close = () => setSearchOpen(false)

  useDialog(searchOpen, close, panelRef)
  useEffect(() => setSearchOpen(false), [location, setSearchOpen])
  useEffect(() => {
    if (!searchOpen) setQuery('')
  }, [searchOpen])

  const results = useMemo(() => {
    if (!deferred.trim()) return []
    return filterProducts(
      products,
      { query: deferred, categoryId: null, onSale: false, inStock: false, sort: 'relevancia' },
      categoryNames,
    )
  }, [deferred, products, categoryNames])

  if (!searchOpen) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/loja?q=${encodeURIComponent(q)}` : '/loja')
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 sm:pt-[10vh]">
      <div className="overlay-in absolute inset-0 bg-cocoa-900/40 backdrop-blur-[2px]" onClick={close} aria-hidden />
      <div
        ref={panelRef}
        onClick={(e) => (e.target as HTMLElement).closest('a[href]') && close()}
        role="dialog"
        aria-modal="true"
        aria-label="Pesquisar produtos"
        className="fade-up relative w-full max-w-2xl overflow-hidden rounded-3xl bg-cream-50 shadow-2xl"
      >
        <form onSubmit={submit} role="search" className="flex items-center gap-3 border-b border-cocoa-900/10 px-5">
          <Search className="size-5 shrink-0 text-cocoa-500" aria-hidden />
          <input
            data-autofocus
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar doces, chocolates, gomas…"
            aria-label="Pesquisar produtos"
            className="h-16 min-w-0 flex-1 bg-transparent text-lg text-cocoa-900 placeholder:text-cocoa-500/70 focus:outline-none"
            enterKeyHint="search"
          />
          <button
            type="button"
            onClick={close}
            className="rounded-full p-2 text-cocoa-700 hover:bg-cocoa-900/5"
            aria-label="Fechar pesquisa"
          >
            <X className="size-5" aria-hidden />
          </button>
        </form>

        <div className="max-h-[65vh] overflow-y-auto p-3">
          {!query.trim() ? (
            <div className="p-3">
              <p className="eyebrow mb-3">Sugestões</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setQuery(s)}
                    className="rounded-full border border-cocoa-900/10 bg-white px-4 py-2 text-sm font-medium text-cocoa-800 hover:border-brand-300 hover:text-brand-700"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-10 text-center text-cocoa-700" role="status">
              Não encontrámos produtos para “{query.trim()}”.
            </p>
          ) : (
            <>
              <p className="sr-only" role="status">
                {results.length} resultados
              </p>
              <ul>
                {results.slice(0, 6).map((p) => (
                  <li key={p.id}>
                    <Link
                      to={`/produto/${p.slug}`}
                      className="flex items-center gap-4 rounded-2xl p-2.5 transition hover:bg-white focus-visible:bg-white"
                    >
                      <ProductImage src={p.image} alt="" width={112} className="size-14 shrink-0 rounded-xl" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-cocoa-900">{p.name}</span>
                        <span className="block text-sm text-cocoa-500">{categoryNames[p.categoryId]}</span>
                      </span>
                      <span className="text-sm font-semibold text-cocoa-900 tabular-nums">{formatPrice(lowestPrice(p))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link
                to={`/loja?q=${encodeURIComponent(query.trim())}`}
                className="mt-2 flex items-center justify-center gap-2 rounded-2xl p-3 text-sm font-semibold text-brand-700 hover:bg-white"
              >
                Ver todos os {results.length} resultados <ArrowRight className="size-4" aria-hidden />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  )
}
