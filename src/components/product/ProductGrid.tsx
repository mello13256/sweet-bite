import { useCatalog } from '../../context/CatalogContext'
import type { Product } from '../../types'
import { ProductCard, ProductCardSkeleton } from './ProductCard'

interface ProductGridProps {
  products: Product[]
  showCategory?: boolean
  loading?: boolean
  skeletonCount?: number
  columns?: 'default' | 'wide'
}

export function ProductGrid({ products, showCategory, loading, skeletonCount = 8, columns = 'default' }: ProductGridProps) {
  const { categoryNames } = useCatalog()
  const cols = columns === 'wide' ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'

  return (
    <ul className={`grid gap-3 sm:gap-5 ${cols}`}>
      {loading
        ? Array.from({ length: skeletonCount }, (_, i) => (
            <li key={i}>
              <ProductCardSkeleton />
            </li>
          ))
        : products.map((p, i) => (
            <li key={p.id} className="fade-up" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
              <ProductCard product={p} categoryName={showCategory ? categoryNames[p.categoryId] : undefined} />
            </li>
          ))}
    </ul>
  )
}
