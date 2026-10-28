import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useCatalog } from '../../context/CatalogContext'
import { ProductImage } from '../ui/ProductImage'
import { Skeleton } from '../ui/misc'

export function CategoryGrid() {
  const { categories, products, status } = useCatalog()
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.categoryId] = (acc[p.categoryId] ?? 0) + 1
    return acc
  }, {})

  if (status === 'loading') {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton key={i} className="aspect-[4/3.6] rounded-2xl" />
        ))}
      </div>
    )
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
      {categories.map((c) => (
        <li key={c.id}>
          <Link
            to={`/loja?categoria=${c.id}`}
            className="group card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="overflow-hidden">
              <ProductImage
                src={c.image}
                alt=""
                width={440}
                ratio={0.72}
                sizes="(min-width: 1024px) 23vw, 47vw"
                className="aspect-[1/0.72] w-full transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 items-center justify-between gap-2 p-3 sm:p-4">
              <div className="min-w-0">
                <p className="font-semibold text-cocoa-900">{c.name}</p>
                <p className="text-xs text-cocoa-500 sm:text-sm">
                  {counts[c.id] ?? 0} {(counts[c.id] ?? 0) === 1 ? 'produto' : 'produtos'}
                </p>
              </div>
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                <ArrowRight className="size-4" aria-hidden />
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}
