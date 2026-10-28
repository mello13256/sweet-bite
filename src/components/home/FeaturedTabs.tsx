import { useId, useMemo, useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { getCollections } from '../../lib/catalog'
import { cn } from '../../lib/cn'
import { ProductGrid } from '../product/ProductGrid'
import { ButtonLink } from '../ui/Button'
import { SectionHeading } from '../ui/misc'

const tabs = [
  { id: 'bestSellers', label: 'Mais vendidos', href: '/loja?ordem=popularidade' },
  { id: 'newArrivals', label: 'Novidades', href: '/loja?ordem=novidades' },
  { id: 'onSale', label: 'Promoções', href: '/loja?promocoes=1' },
  { id: 'combos', label: 'Combos', href: '/loja?categoria=combos' },
  { id: 'giftBoxes', label: 'Caixas de oferta', href: '/loja?categoria=caixas-oferta' },
] as const

type TabId = (typeof tabs)[number]['id']

/** Destaques da página inicial — usa os mesmos dados do catálogo. */
export function FeaturedTabs() {
  const { products, status } = useCatalog()
  const collections = useMemo(() => getCollections(products), [products])
  const visibleTabs = tabs.filter((t) => status === 'loading' || collections[t.id].length > 0)
  const [active, setActive] = useState<TabId>('bestSellers')
  const current = visibleTabs.find((t) => t.id === active) ?? visibleTabs[0]
  const baseId = useId()
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

  if (!current) return null

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    const next = (index + (e.key === 'ArrowRight' ? 1 : -1) + visibleTabs.length) % visibleTabs.length
    setActive(visibleTabs[next]!.id)
    tabRefs.current[next]?.focus()
  }

  return (
    <section className="container-page mt-20 sm:mt-24" aria-labelledby={`${baseId}-title`}>
      <div id={`${baseId}-title`}>
        <SectionHeading
          eyebrow="Seleção da casa"
          title="Os favoritos de quem nos visita"
          action={
            <ButtonLink to={current.href} variant="outline" size="sm">
              Ver todos <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        />
      </div>

      <div
        role="tablist"
        aria-label="Destaques"
        className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0"
      >
        {visibleTabs.map((t, i) => {
          const selected = t.id === current.id
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(t.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition',
                selected ? 'bg-cocoa-900 text-white' : 'bg-white text-cocoa-800 shadow-card hover:text-brand-700',
              )}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel`}
        aria-labelledby={`${baseId}-tab-${current.id}`}
        className="mt-6"
        key={current.id}
      >
        <ProductGrid products={collections[current.id].slice(0, 8)} loading={status === 'loading'} showCategory columns="wide" />
      </div>
    </section>
  )
}
