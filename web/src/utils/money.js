/** Amounts from fees/checkout are often paise. Heuristic: large ints → paise. */
export function toRupees(amount, { assumePaise = false } = {}) {
  if (amount == null || Number.isNaN(Number(amount))) return 0
  const n = Number(amount)
  if (assumePaise || Number.isInteger(n) && Math.abs(n) >= 1000) {
    return n / 100
  }
  return n
}

export function formatINR(amount, opts = {}) {
  const rupees = toRupees(amount, opts)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: rupees % 1 === 0 ? 0 : 2,
  }).format(rupees)
}

export function formatINRFromPaise(paise) {
  return formatINR(paise, { assumePaise: true })
}
