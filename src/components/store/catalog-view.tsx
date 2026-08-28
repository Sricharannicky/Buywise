'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import { SlidersHorizontal, Search, Sparkles, X, PackageSearch, ChevronDown } from 'lucide-react'
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
  const activeFilters = (category ? 1 : 0) + selectedBrands.length + (minRating > 0 ? 1 : 0) + (priceRange[0] > 0 || priceRange[1] < 150000 ? 1 : 0)

  const FilterContent = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold">Category</h4>
        <div className="space-y-1">
          <button onClick={() => setCategory('')} className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${!category ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>All categories</button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.slug)} className={`block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors ${category === c.slug ? 'bg-accent font-medium text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
              <span className="mr-1.5">{c.imageUrl}</span>{c.name}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Price range</h4>
        <div className="px-1">
          <Slider value={priceRange} onValueChange={setPriceRange} min={0} max={150000} step={1000} className="my-3" />
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{formatPrice(priceRange[0])}</span>
            <span className="font-medium">{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold">Brands</h4>
        <div className="max-h-48 space-y-2 overflow-y-auto scrollbar-thin pr-1">
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
        <div className="flex flex-wrap gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <button key={r} onClick={() => setMinRating(r)} className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${minRating === r ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {r === 0 ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </div>
      {activeFilters > 0 && (
        <Button variant="outline" className="w-full" onClick={clearAll}><X className="mr-2 h-4 w-4" /> Clear all filters ({activeFilters})</Button>
      )}
    </div>
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary">Home</button>
          <span>/</span>
          <span className="text-foreground">{activeCategory ? activeCategory.name : 'All products'}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {query ? `Results for "${query}"` : activeCategory ? activeCategory.name : 'All products'}
          </h1>
          <p className="text-sm text-muted-foreground">{loading ? 'Searching…' : <span className="font-medium text-foreground">{total}</span>} product{total !== 1 ? 's' : ''} found</p>
        </div>
      </div>

      {/* Search + sort bar */}
      <div className="mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" className="h-11 rounded-xl border-border/50 bg-muted/40 pl-10" />
        </div>
        <Button variant="outline" onClick={() => setAiOpen(true)} className="h-11 shrink-0 rounded-xl">
          <Sparkles className="mr-2 h-4 w-4 text-violet-500" /> Ask AI
        </Button>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="hidden h-11 w-44 shrink-0 rounded-xl sm:flex"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="relative h-11 shrink-0 rounded-xl lg:hidden"><SlidersHorizontal className="h-4 w-4" />{activeFilters > 0 && <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{activeFilters}</span>}</Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto">
            <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
            <div className="mt-4">{FilterContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-36 rounded-2xl border border-border/50 bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2"><SlidersHorizontal className="h-4 w-4" /><h3 className="text-sm font-semibold">Filters</h3></div>
              {activeFilters > 0 && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">{activeFilters} active</span>}
            </div>
            {FilterContent}
          </div>
        </aside>

        {/* Products */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer aspect-[3/4] rounded-xl bg-muted" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try adjusting your filters or ask the Buywise AI to find what you need.</p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={clearAll}>Clear filters</Button>
                <Button onClick={() => setAiOpen(true)}><Sparkles className="mr-2 h-4 w-4" /> Ask AI</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {products.length >= 24 && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline" className="rounded-full">Load more products</Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
