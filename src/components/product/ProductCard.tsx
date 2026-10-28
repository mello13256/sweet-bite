import { Link, useNavigate } from 'react-router-dom'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import {
  basePrice,
  defaultVariant,
  finalPrice,
  hasAvailableOption,
  hasMultiplePrices,
  isOnSale,
  lowestBasePrice,
  lowestPrice,
} from '../../lib/pricing'
import { cn } from '../../lib/cn'
import type { Product } from '../../types'
import { ProductImage } from '../ui/ProductImage'
import { Price } from './Price'
import { ProductBadges } from './ProductBadges'

interface ProductCardProps {
  product: Product
  categoryName?: string
  priority?: boolean
}

export function ProductCard({ product, categoryName, priority }: ProductCardProps) {
  const { addItem } = useCart()
  const navigate = useNavigate()
  const available = hasAvailableOption(product)
  const multiple = hasMultiplePrices(product)
  const href = `/produto/${product.slug}`

  const price = multiple ? lowestPrice(product) : finalPrice(product)
  const compareAt = isOnSale(product) ? (multiple ? lowestBasePrice(product) : basePrice(product)) : undefined

  const handleAdd = () => {
    // Produtos com várias opções: escolher a variante na página de detalhe.
    if (product.variants && product.variants.length > 1) {
      navigate(href)
      return
    }
    addItem(product, defaultVariant(product)?.id, 1)
  }

  return (
    <article className="group card relative flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-square overflow-hidden">
        <ProductImage
          src={product.image}
          alt={product.name}
          width={480}
          sizes="(min-width: 1280px) 290px, (min-width: 1024px) 23vw, (min-width: 640px) 31vw, 47vw"
          priority={priority}
          className={cn('size-full transition duration-500 group-hover:scale-[1.04]', !available && 'grayscale-[60%]')}
        />
        <ProductBadges product={product} className="absolute top-2.5 left-2.5" />
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {categoryName && <p className="mb-1 text-[11px] font-semibold tracking-wider text-cocoa-500 uppercase">{categoryName}</p>}
        <h3 className="font-sans text-[15px] leading-snug font-semibold text-cocoa-900 sm:text-base">
          <Link to={href} className="after:absolute after:inset-0 focus-visible:outline-none">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 hidden text-sm text-cocoa-700 sm:block">{product.shortDescription}</p>
        <div className="mt-auto pt-3">
          <Price price={price} compareAt={compareAt} from={multiple} size="sm" />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!available}
            className={cn(
              'relative z-10 mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-semibold transition',
              available
                ? 'bg-brand-600 text-white hover:bg-brand-700 active:scale-[0.98]'
                : 'cursor-not-allowed bg-cream-200 text-cocoa-500',
            )}
            aria-label={
              !available
                ? `${product.name} esgotado`
                : multiple || (product.variants?.length ?? 0) > 1
                  ? `Escolher opções de ${product.name}`
                  : `Adicionar ${product.name} ao carrinho`
            }
          >
            {available ? (
              <>
                <ShoppingBag className="size-4" aria-hidden />
                {(product.variants?.length ?? 0) > 1 ? 'Escolher opções' : 'Adicionar'}
              </>
            ) : (
              'Esgotado'
            )}
          </button>
        </div>
      </div>
    </article>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden>
      <div className="skeleton aspect-square" />
      <div className="space-y-2 p-4">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton mt-4 h-10 rounded-full" />
      </div>
    </div>
  )
}
