import { useEffect, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { MAX_QTY, clampQuantity } from '../../lib/cart'
import { cn } from '../../lib/cn'

interface QuantityInputProps {
  value: number
  onChange: (value: number) => void
  label: string
  size?: 'sm' | 'md'
  disabled?: boolean
  max?: number
}

/** Seletor de quantidade com botões −/+ e campo editável (1 a MAX_QTY). */
export function QuantityInput({ value, onChange, label, size = 'md', disabled, max = MAX_QTY }: QuantityInputProps) {
  const [draft, setDraft] = useState(String(value))
  useEffect(() => setDraft(String(value)), [value])

  const commit = (raw: string) => {
    const parsed = Number.parseInt(raw, 10)
    const next = Number.isNaN(parsed) ? value : Math.min(max, clampQuantity(parsed))
    setDraft(String(next))
    if (next !== value) onChange(next)
  }

  const btn = cn(
    'flex items-center justify-center rounded-full text-cocoa-800 transition hover:bg-cream-100 disabled:opacity-35 disabled:hover:bg-transparent',
    size === 'sm' ? 'size-8' : 'size-10',
  )

  return (
    <div
      className={cn('inline-flex items-center rounded-full border border-cocoa-900/15 bg-white', size === 'sm' ? 'p-0.5' : 'p-1')}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={disabled || value <= 1}
        aria-label="Diminuir quantidade"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={1}
        max={max}
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
        }}
        aria-label="Quantidade"
        className={cn(
          'bg-transparent text-center font-semibold text-cocoa-900 tabular-nums focus:outline-none',
          size === 'sm' ? 'w-8 text-sm' : 'w-10',
        )}
      />
      <button
        type="button"
        className={btn}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={disabled || value >= max}
        aria-label="Aumentar quantidade"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  )
}
