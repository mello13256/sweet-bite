const formatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formata um valor em cêntimos como euros: 1290 → "12,90 €" */
export function formatPrice(cents: number): string {
  return formatter.format(cents / 100)
}

/** Aplica uma percentagem de desconto a um valor em cêntimos, arredondando ao cêntimo. */
export function applyDiscount(cents: number, percent: number | undefined): number {
  if (!percent || percent <= 0) return cents
  const clamped = Math.min(percent, 90)
  return Math.round((cents * (100 - clamped)) / 100)
}
