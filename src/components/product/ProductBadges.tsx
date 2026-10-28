import { effectiveDiscount, hasAvailableOption } from '../../lib/pricing'
import { cn } from '../../lib/cn'
import type { Product } from '../../types'

const styles = {
  sale: 'bg-brand-600 text-white',
  new: 'bg-pistachio-100 text-pistachio-700',
  best: 'bg-white/95 text-cocoa-900',
  out: 'bg-cocoa-900 text-white',
}

export function Badge({ tone, children }: { tone: keyof typeof styles; children: string }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-[11px] leading-none font-bold tracking-wide shadow-sm', styles[tone])}>
      {children}
    </span>
  )
}

export function ProductBadges({ product, className }: { product: Product; className?: string }) {
  const discount = effectiveDiscount(product)
  const soldOut = !hasAvailableOption(product)
  if (!discount && !product.isNew && !product.bestSeller && !soldOut) return null
  return (
    <div className={cn('flex flex-wrap gap-1.5', className)}>
      {soldOut && <Badge tone="out">Esgotado</Badge>}
      {!soldOut && discount > 0 && <Badge tone="sale">{`−${discount}%`}</Badge>}
      {!soldOut && product.isNew && <Badge tone="new">Novidade</Badge>}
      {!soldOut && product.bestSeller && !product.isNew && <Badge tone="best">Mais vendido</Badge>}
    </div>
  )
}
