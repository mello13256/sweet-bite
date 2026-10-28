import { formatPrice } from '../../lib/money'
import { cn } from '../../lib/cn'

interface PriceProps {
  price: number
  /** Preço anterior (riscado) quando há promoção */
  compareAt?: number
  from?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Price({ price, compareAt, from, size = 'md', className }: PriceProps) {
  const onSale = compareAt !== undefined && compareAt > price
  return (
    <p className={cn('flex flex-wrap items-baseline gap-x-2', className)}>
      {from && <span className="text-xs font-medium text-cocoa-500">desde</span>}
      <span
        className={cn(
          'font-bold tabular-nums',
          onSale ? 'text-brand-700' : 'text-cocoa-900',
          size === 'sm' && 'text-[15px]',
          size === 'md' && 'text-lg',
          size === 'lg' && 'font-display text-3xl font-semibold',
        )}
      >
        {onSale && <span className="sr-only">Preço promocional: </span>}
        {formatPrice(price)}
      </span>
      {onSale && (
        <s className={cn('text-cocoa-500 tabular-nums', size === 'lg' ? 'text-lg' : 'text-sm')}>
          <span className="sr-only">Preço anterior: </span>
          {formatPrice(compareAt)}
        </s>
      )}
    </p>
  )
}
