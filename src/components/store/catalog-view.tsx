'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { SlidersHorizontal, Search, Sparkles, X, PackageSearch } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/shared/product-card'
import { formatPrice } from '@/lib/format'

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
]

export function CatalogView({ categories, brands, initialCategory, initialQuery }: { categories: any[]; brands: any[]; initialCategory?: string; initialQuery?: string }) {
  const { navigate, setAiOpen } = useStore()

  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState(initialQuery || '')
  const [category, setCategory] = useState(initialCategory || '')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, 150000])
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('relevance')

  function applyFilters() {
    setLoading(true)
    const params: Record<string, string> = { limit: '24', sort }
    if (query) params.q = query
    if (category) params.category = category
    if (selectedBrands.length) params.brand = selectedBrands.join(',')
    if (priceRange[0] > 0) params.minPrice = String(priceRange[0])
    if (priceRange[1] < 150000) params.maxPrice = String(priceRange[1])
    if (minRating > 0) params.minRating = String(minRating)
    api.products.list(params).then((r) => { setProducts(r.products); setTotal(r.total) }).finally(() => setLoading(false))
  }

  useEffect(() => {
    const t = setTimeout(applyFilters, 200)
    return () => clearTimeout(t)
  }, [query, category, selectedBrands, priceRange, minRating, sort])

  function toggleBrand(slug: string) {
    setSelectedBrands((b) => (b.includes(slug) ? b.filter((x) => x !== slug) : [...b, slug]))
  }

  function clearAll() {
    setQuery(''); setCategory(''); setSelectedBrands([]); setPriceRange([0, 150000]); setMinRating(0); setSort('relevance')
  }

  const activeCategory = categories.find((c) => c.slug === category)

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold">Category</h4>
        <div className="space-y-1.5">
          <button onClick={() => setCategory('')} className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${!category ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}>All categories</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={`block w-full rounded-lg px-2 py-1.5 text-left text-sm ${category === c.slug ? 'bg-accent font-medium' : 'hover:bg-accent/50'}`}>
              <span className="mr-1.5">{c.imageUrl}</span>{c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Price range</h4>
        <div className="px-1">
          <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={150000} step={1000} className="my-3" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Brands</h4>
        <div className="max-h-48 space-y-2 overflow-y-auto scrollbar-thin">
          {brands.map((b) => (
            <label key={b.id} className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox checked={selectedBrands.includes(b.slug)} onCheckedChange={() => toggleBrand(b.slug)} />
              {b.name}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Minimum rating</h4>
        <div className="flex gap-2">
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`rounded-full px-3 py-1 text-xs ${minRating === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {r === 0 ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={clearAll}><X className="mr-2 h-4 w-4" /> Clear all filters</Button>
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary">Home</button>
          <span>/</span>
          <span>{activeCategory ? activeCategory.name : 'All products'}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold md:text-3xl">
            {query ? `Results for "${query}"` : activeCategory ? activeCategory.name : 'All products'}
          </h1>
          <p className="text-sm text-muted-foreground">{loading ? 'Searching…' : `${total} product${total !== 1 ? 's' : ''} found`}</p>
        </div>
      </div>

      {/* Search + sort bar */}
      <div className="mb-4 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="pl-9" />
        </div>
        <Button variant="outline" onClick={() => setAiOpen(true)} className="shrink-0">
          <Sparkles className="mr-2 h-4 w-4 text-violet-500" /> Ask AI
        </Button>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="hidden w-44 shrink-0 sm:flex"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="shrink-0 lg:hidden"><SlidersHorizontal className="h-4 w-4" /></Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-4">{FilterContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-32 rounded-xl border border-border/60 bg-card p-4">
            <div className="mb-4 flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /><h3 className="text-sm font-semibold">Filters</h3></div>
            {FilterContent}
          </div>
        </aside>

        {/* Products */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try adjusting your filters or ask the AI Shopping Partner to find what you need.</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={clearAll}>Clear filters</Button>
                <Button onClick={() => setAiOpen(true)}><Sparkles className="mr-2 h-4 w-4" /> Ask AI</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
