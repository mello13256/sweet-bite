import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useCart } from '../../context/CartContext'
import type { CartLine } from '../../lib/cart'
import { formatPrice } from '../../lib/money'
import { cn } from '../../lib/cn'
import { ProductImage } from '../ui/ProductImage'
import { QuantityInput } from '../ui/QuantityInput'

export function CartLineItem({ line, compact }: { line: CartLine; compact?: boolean }) {
  const { setQuantity, removeItem } = useCart()
  const { product, item, issue } = line
  const name = product?.name ?? 'Produto indisponível'

  return (
    <li className={cn('flex gap-3 sm:gap-4', compact ? 'py-4' : 'py-5')}>
      {product ? (
        <Link to={`/produto/${product.slug}`} className="shrink-0">
          <ProductImage
            src={product.image}
            alt={product.name}
            width={compact ? 144 : 192}
            className={cn('rounded-xl', compact ? 'size-[72px]' : 'size-20 sm:size-24', issue && 'opacity-60 grayscale')}
          />
        </Link>
      ) : (
        <div className={cn('shrink-0 rounded-xl bg-cream-200', compact ? 'size-[72px]' : 'size-20 sm:size-24')} />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product ? (
              <Link to={`/produto/${product.slug}`} className="font-semibold text-cocoa-900 hover:text-brand-700">
                {name}
              </Link>
            ) : (
              <p className="font-semibold text-cocoa-900">{name}</p>
            )}
            {line.variantLabel && <p className="text-sm text-cocoa-700">{line.variantLabel}</p>}
            {!issue && <p className="text-sm text-cocoa-500 tabular-nums">{formatPrice(line.unitPrice)} / un.</p>}
          </div>
          {!compact && !issue && (
            <p className="font-semibold text-cocoa-900 tabular-nums" aria-label={`Subtotal ${formatPrice(line.lineTotal)}`}>
              {formatPrice(line.lineTotal)}
            </p>
          )}
        </div>

        {issue && (
          <p className="mt-1 text-sm font-medium text-brand-700">
            {issue === 'unavailable' ? 'Esgotado — remova para continuar.' : 'Este produto já não está disponível.'}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          {issue ? (
            <span />
          ) : (
            <QuantityInput
              size="sm"
              value={item.quantity}
              onChange={(q) => setQuantity(item.productId, item.variantId, q)}
              label={`Quantidade de ${name}`}
            />
          )}
          <div className="flex items-center gap-2">
            {compact && !issue && <span className="text-sm font-semibold tabular-nums">{formatPrice(line.lineTotal)}</span>}
            <button
              type="button"
              onClick={() => removeItem(item.productId, item.variantId)}
              className="rounded-full p-2 text-cocoa-500 transition hover:bg-brand-50 hover:text-brand-700"
              aria-label={`Remover ${name} do carrinho`}
            >
              <Trash2 className="size-[18px]" aria-hidden />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}
