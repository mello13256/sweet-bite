import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, PackageSearch, Search, X } from 'lucide-react'
import { ProductGrid } from '../components/product/ProductGrid'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/misc'
import { storeConfig } from '../config/store'
import { useCatalog } from '../context/CatalogContext'
import { usePageMeta } from '../hooks/usePageMeta'
import { filterProducts, isSortOption, sortOptions, type SortOption } from '../lib/catalog'
import { cn } from '../lib/cn'

const PAGE_SIZE = storeConfig.catalog.pageSize

export default function ShopPage() {
  const { products, categories, categoryNames, status, getCategory } = useCatalog()
  const [params, setParams] = useSearchParams()

  const query = params.get('q') ?? ''
  const categoryParam = params.get('categoria')
  const category = categoryParam ? getCategory(categoryParam) : undefined
  const sortParam = params.get('ordem')
  const sort: SortOption = isSortOption(sortParam) ? sortParam : 'relevancia'
  const onSale = params.get('promocoes') === '1'
  const inStock = params.get('disponiveis') === '1'
  const page = Math.max(1, Number.parseInt(params.get('pagina') ?? '1', 10) || 1)

  const [draft, setDraft] = useState(query)
  useEffect(() => setDraft(query), [query])

  usePageMeta(
    category ? category.name : onSale ? 'Promoções' : 'Loja',
    category?.description ??
      'Explore todos os doces da loja: pesquise, filtre por categoria e ordene por preço, popularidade ou novidades.',
  )

  /** Atualiza parâmetros do URL; qualquer alteração de filtro volta à página 1. */
  const update = (changes: Record<string, string | null>, push = false) => {
    const next = new URLSearchParams(params)
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === '') next.delete(key)
      else next.set(key, value)
    }
    if (!('pagina' in changes)) next.delete('pagina')
    setParams(next, { replace: !push })
  }

  // Pesquisa com um pequeno atraso para não atualizar o URL a cada tecla.
  useEffect(() => {
    if (draft === query) return
    const t = window.setTimeout(() => update({ q: draft.trim() || null }), 250)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const filtered = useMemo(
    () => filterProducts(products, { query, categoryId: category?.id ?? null, onSale, inStock, sort }, categoryNames),
    [products, query, category, onSale, inStock, sort, categoryNames],
  )

  const counts = useMemo(() => {
    const base = filterProducts(products, { query, categoryId: null, onSale, inStock, sort }, categoryNames)
    return base.reduce<Record<string, number>>((acc, p) => {
      acc[p.categoryId] = (acc[p.categoryId] ?? 0) + 1
      return acc
    }, {})
  }, [products, query, onSale, inStock, sort, categoryNames])
  const totalForAll = Object.values(counts).reduce((a, b) => a + b, 0)

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const hasFilters = !!(query || category || onSale || inStock || sort !== 'relevancia')

  const goToPage = (p: number) => {
    update({ pagina: p > 1 ? String(p) : null }, true)
    document.getElementById('resultados')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const title = category ? category.name : onSale ? 'Promoções' : 'Todos os produtos'
  const subtitle = category
    ? category.description
    : onSale
      ? 'Produtos com desconto, enquanto durarem as existências.'
      : 'Descubra todos os nossos doces e encontre os seus favoritos.'

  const chip = (active: boolean) =>
    cn(
      'flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition',
      active ? 'bg-cocoa-900 text-white' : 'bg-white text-cocoa-800 shadow-card hover:text-brand-700',
    )

  return (
    <div>
      <section className="border-b border-cocoa-900/[0.07] bg-gradient-to-b from-brand-50 to-cream-50">
        <div className="container-page py-10 sm:py-14">
          <nav aria-label="Navegação estrutural" className="mb-3 text-sm text-cocoa-500">
            <Link to="/" className="hover:text-cocoa-900">
              Início
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            {category ? (
              <>
                <Link to="/loja" className="hover:text-cocoa-900">
                  Loja
                </Link>
                <span className="mx-2" aria-hidden>
                  /
                </span>
                <span className="text-cocoa-800">{category.name}</span>
              </>
            ) : (
              <span className="text-cocoa-800">Loja</span>
            )}
          </nav>
          <h1 className="text-4xl font-semibold sm:text-5xl">{title}</h1>
          <p className="mt-2 max-w-xl text-cocoa-700">{subtitle}</p>

          <div className="mt-7 flex max-w-xl items-center gap-3 rounded-full border border-cocoa-900/10 bg-white py-1.5 pr-1.5 pl-5 shadow-card focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15">
            <Search className="size-5 shrink-0 text-cocoa-500" aria-hidden />
            <input
              type="search"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Pesquisar produtos…"
              aria-label="Pesquisar produtos"
              className="h-10 min-w-0 flex-1 bg-transparent text-cocoa-900 placeholder:text-cocoa-500/70 focus:outline-none"
            />
            {draft && (
              <button
                type="button"
                onClick={() => setDraft('')}
                className="rounded-full p-2 text-cocoa-500 hover:bg-cocoa-900/5"
                aria-label="Limpar pesquisa"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-8 pt-8 lg:grid-cols-[230px_1fr] lg:gap-10">
        {/* Categorias — barra lateral no computador */}
        <aside className="hidden lg:block" aria-label="Categorias">
          <div className="sticky top-24">
            <p className="eyebrow mb-3">Categorias</p>
            <ul className="space-y-1">
              <li>
                <button
                  type="button"
                  onClick={() => update({ categoria: null })}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[15px] transition',
                    !category ? 'bg-brand-50 font-semibold text-brand-700' : 'text-cocoa-800 hover:bg-white',
                  )}
                  aria-current={!category ? 'true' : undefined}
                >
                  Todas as categorias <span className="text-xs text-cocoa-500 tabular-nums">{totalForAll}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => update({ categoria: c.id })}
                    className={cn(
                      'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-[15px] transition',
                      category?.id === c.id ? 'bg-brand-50 font-semibold text-brand-700' : 'text-cocoa-800 hover:bg-white',
                    )}
                    aria-current={category?.id === c.id ? 'true' : undefined}
                  >
                    {c.name} <span className="text-xs text-cocoa-500 tabular-nums">{counts[c.id] ?? 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div id="resultados" className="min-w-0 scroll-mt-24">
          {/* Categorias — chips no telemóvel/tablet */}
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:hidden" aria-label="Categorias">
            <button
              type="button"
              className={chip(!category)}
              onClick={() => update({ categoria: null })}
              aria-pressed={!category}
            >
              Todas
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={chip(category?.id === c.id)}
                onClick={() => update({ categoria: c.id })}
                aria-pressed={category?.id === c.id}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 lg:mt-0">
            <p className="mr-auto text-sm text-cocoa-700" role="status">
              {status === 'loading' ? (
                'A carregar produtos…'
              ) : (
                <>
                  <strong className="text-cocoa-900">{filtered.length}</strong> {filtered.length === 1 ? 'produto' : 'produtos'}
                  {query && <> para “{query}”</>}
                </>
              )}
            </p>

            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-cocoa-800">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => update({ promocoes: e.target.checked ? '1' : null })}
                className="size-4 accent-brand-600"
              />
              Em promoção
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-cocoa-800">
              <input
                type="checkbox"
                checked={inStock}
                onChange={(e) => update({ disponiveis: e.target.checked ? '1' : null })}
                className="size-4 accent-brand-600"
              />
              Só disponíveis
            </label>
            <label className="flex items-center gap-2 text-sm text-cocoa-700">
              <span className="sr-only sm:not-sr-only">Ordenar por</span>
              <select
                value={sort}
                onChange={(e) => update({ ordem: e.target.value === 'relevancia' ? null : e.target.value })}
                className="input h-10 w-auto py-0 pr-9 text-sm font-medium"
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {hasFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {category && <FilterTag label={category.name} onRemove={() => update({ categoria: null })} />}
              {query && <FilterTag label={`“${query}”`} onRemove={() => update({ q: null })} />}
              {onSale && <FilterTag label="Em promoção" onRemove={() => update({ promocoes: null })} />}
              {inStock && <FilterTag label="Só disponíveis" onRemove={() => update({ disponiveis: null })} />}
              <button
                type="button"
                onClick={() => setParams(new URLSearchParams(), { replace: true })}
                className="px-2 text-sm font-semibold text-brand-700 underline-offset-4 hover:underline"
              >
                Limpar filtros
              </button>
            </div>
          )}

          <div className="mt-6">
            {status !== 'loading' && filtered.length === 0 ? (
              <div className="card">
                <EmptyState
                  icon={<PackageSearch className="size-7" aria-hidden />}
                  title="Nenhum produto encontrado"
                  description="Experimente outra pesquisa ou remova alguns filtros."
                  action={
                    <Button variant="outline" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
                      Ver todos os produtos
                    </Button>
                  }
                />
              </div>
            ) : (
              <ProductGrid products={pageItems} loading={status === 'loading'} showCategory={!category} />
            )}
          </div>

          {pageCount > 1 && (
            <nav aria-label="Paginação" className="mt-10 flex items-center justify-center gap-1.5">
              <PageButton onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} label="Página anterior">
                <ChevronLeft className="size-4" aria-hidden />
              </PageButton>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
                <PageButton key={p} onClick={() => goToPage(p)} active={p === currentPage} label={`Página ${p}`}>
                  {p}
                </PageButton>
              ))}
              <PageButton onClick={() => goToPage(currentPage + 1)} disabled={currentPage === pageCount} label="Página seguinte">
                <ChevronRight className="size-4" aria-hidden />
              </PageButton>
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pr-1 pl-3 text-sm font-medium text-brand-800">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full p-1 hover:bg-brand-100"
        aria-label={`Remover filtro ${label}`}
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  )
}

function PageButton({
  children,
  onClick,
  disabled,
  active,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  active?: boolean
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex size-10 items-center justify-center rounded-full text-sm font-semibold transition disabled:opacity-35',
        active ? 'bg-brand-600 text-white' : 'bg-white text-cocoa-800 shadow-card hover:text-brand-700',
      )}
    >
      {children}
    </button>
  )
}
