import { applyDiscount, formatPrice } from '../../lib/money'
import { cn } from '../../lib/cn'
import type { ProductVariant } from '../../types'

interface VariantSelectorProps {
  label: string
  variants: ProductVariant[]
  value?: string
  discount: number
  onChange: (id: string) => void
}

/** Grupo de opções (radio) para tamanho, peso ou sabor. */
export function VariantSelector({ label, variants, value, discount, onChange }: VariantSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-semibold text-cocoa-900">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const soldOut = v.available === false
          const selected = v.id === value
          return (
            <label
              key={v.id}
              className={cn(
                'relative flex cursor-pointer flex-col rounded-xl border px-4 py-2.5 text-sm transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500',
                selected
                  ? 'border-brand-600 bg-brand-50 ring-1 ring-brand-600'
                  : 'border-cocoa-900/15 bg-white hover:border-cocoa-900/35',
                soldOut && 'cursor-not-allowed opacity-50',
              )}
            >
              <input
                type="radio"
                name="variant"
                value={v.id}
                checked={selected}
                disabled={soldOut}
                onChange={() => onChange(v.id)}
                className="sr-only"
              />
              <span className="font-semibold text-cocoa-900">{v.label}</span>
              <span className="text-cocoa-700 tabular-nums">
                {soldOut ? 'Esgotado' : formatPrice(applyDiscount(v.price, discount))}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
