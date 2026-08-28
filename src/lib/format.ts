// Currency / formatting helpers
export function formatPrice(amount: number, currency = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function discountPercent(price: number, compareAt?: number | null): number {
  if (!compareAt || compareAt <= price) return 0
  return Math.round(((compareAt - price) / compareAt) * 100)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function parseImages(images: string): string[] {
  try {
    const arr = JSON.parse(images)
    if (Array.isArray(arr)) return arr as string[]
  } catch {
    // ignore
  }
  return []
}

export function parseAttributes(attrs?: string | null): Record<string, string> {
  if (!attrs) return {}
  try {
    const obj = JSON.parse(attrs)
    if (obj && typeof obj === 'object') return obj as Record<string, string>
  } catch {
    // ignore
  }
  return {}
}

export function parseTags(tags?: string | null): string[] {
  if (!tags) return []
  return tags.split(',').map((t) => t.trim()).filter(Boolean)
}

export function parseJsonArray<T>(value?: string | null): T[] {
  if (!value) return []
  try {
    const arr = JSON.parse(value)
    if (Array.isArray(arr)) return arr as T[]
  } catch {
    // ignore
  }
  return []
}
