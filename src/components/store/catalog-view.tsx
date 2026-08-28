'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Checkbox } from '@/components/ui/checkbox'
import {
  SlidersHorizontal,
  Search,
  Sparkles,
  X,
  PackageSearch,
  ChevronDown,
  LayoutGrid,
  List,
  Star,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { ProductCard } from '@/components/shared/product-card'
import { ProductImage } from '@/components/shared/product-image'
import { formatPrice, discountPercent } from '@/lib/format'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const SORTS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
]

const PER_PAGE_OPTIONS = [12, 24, 36]
const PRICE_MAX = 150000

/* ---------- Collapsible filter group ---------- */
function FilterGroup({
  title,
  open,
  onToggle,
  count,
  children,
}: {
  title: string
  open: boolean
  onToggle: () => void
  count?: number
  children: React.ReactNode
}) {
  return (
    <div className="border-b border-border/40 last:border-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between py-3 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          {title}
          {!!count && (
            <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
              {count}
            </span>
          )}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  )
}

/* ---------- Horizontal product row for list view ---------- */
function ProductListItem({ product }: { product: any }) {
  const navigate = useStore((s) => s.navigate)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const setMiniCartOpen = useStore((s) => s.setMiniCartOpen)
  const [adding, setAdding] = useState(false)
  const discount = discountPercent(product.price, product.compareAtPrice)

  async function addToCart(e: React.MouseEvent) {
    e.stopPropagation()
    setAdding(true)
    try {
      await api.cart.add(product.id)
      await refreshCartCount()
      toast.success('Added to cart', { description: product.name })
      setMiniCartOpen(true)
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase()
      if (
        msg.includes('sign in') ||
        msg.includes('unauthorized') ||
        msg.includes('please sign')
      ) {
        setAuthOpen(true, 'login')
        toast.info('Please sign in to add items to your cart')
      } else {
        toast.error(err.message || 'Could not add to cart')
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <div
      onClick={() => navigate({ name: 'product', id: product.id })}
      className="group relative flex cursor-pointer gap-4 rounded-2xl border border-border/50 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 sm:gap-5 sm:p-4"
    >
      <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted/30 sm:h-32 sm:w-32">
        <ProductImage name={product.name} images={product.images} className="h-full w-full" />
        {discount > 0 && (
          <span className="absolute left-1.5 top-1.5 inline-flex items-center rounded-full bg-deal px-1.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.brand?.name}
          </p>
          {product.rating > 0 && (
            <div className="flex items-center gap-0.5 text-xs">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground sm:text-base">
          {product.name}
        </h3>
        {product.description ? (
          <p className="mt-1 hidden line-clamp-2 text-xs text-muted-foreground sm:block">
            {product.description}
          </p>
        ) : null}
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            ) : null}
          </div>
          <Button
            size="sm"
            onClick={addToCart}
            disabled={adding}
            className="ml-auto h-8 rounded-full"
          >
            <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
            {adding ? 'Adding…' : 'Add to cart'}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Main CatalogView ---------- */
export function CatalogView({
  categories,
  brands,
  initialCategory,
  initialQuery,
}: {
  categories: any[]
  brands: any[]
  initialCategory?: string
  initialQuery?: string
}) {
  const { navigate, setAiOpen } = useStore()

  const [products, setProducts] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const [query, setQuery] = useState(initialQuery || '')
  const [category, setCategory] = useState(initialCategory || '')
  const [selectedBrands, setSelectedBrands] = useState<string[]>([])
  const [priceRange, setPriceRange] = useState<number[]>([0, PRICE_MAX])
  const [minRating, setMinRating] = useState(0)
  const [sort, setSort] = useState('relevance')

  // New toolbar state
  const [perPage, setPerPage] = useState(24)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [page, setPage] = useState(1)

  // UI state
  const [brandSearch, setBrandSearch] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    category: false,
    price: false,
    brand: false,
    rating: false,
  })

  function toggleGroup(key: string) {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  /* ----- Filter setters that also reset to page 1 (avoids setState-in-effect) ----- */
  function onQueryChange(v: string) {
    setQuery(v)
    setPage(1)
  }
  function onCategoryChange(slug: string) {
    setCategory(slug)
    setPage(1)
  }
  function onPriceChange(v: number[]) {
    setPriceRange(v)
    setPage(1)
  }
  function onRatingChange(r: number) {
    setMinRating(r)
    setPage(1)
  }
  function onSortChange(s: string) {
    setSort(s)
    setPage(1)
  }
  function onPerPageChange(n: number) {
    setPerPage(n)
    setPage(1)
  }
  function toggleBrand(slug: string) {
    setSelectedBrands((b) => (b.includes(slug) ? b.filter((x) => x !== slug) : [...b, slug]))
    setPage(1)
  }
  function goToPage(p: number) {
    setPage(p)
  }
  function clearAll() {
    setQuery('')
    setCategory('')
    setSelectedBrands([])
    setPriceRange([0, PRICE_MAX])
    setMinRating(0)
    setSort('relevance')
    setBrandSearch('')
    setPage(1)
  }

  // Load products (debounced) whenever filters or page change.
  // setLoading is called inside the timeout callback (not synchronously in the
  // effect body) to comply with react-hooks/set-state-in-effect.
  useEffect(() => {
    const skip = (page - 1) * perPage
    const params: Record<string, string> = {
      limit: String(perPage),
      sort,
      skip: String(skip),
    }
    if (query) params.q = query
    if (category) params.category = category
    if (selectedBrands.length) params.brand = selectedBrands.join(',')
    if (priceRange[0] > 0) params.minPrice = String(priceRange[0])
    if (priceRange[1] < PRICE_MAX) params.maxPrice = String(priceRange[1])
    if (minRating > 0) params.minRating = String(minRating)

    const t = setTimeout(() => {
      setLoading(true)
      api.products
        .list(params)
        .then((r) => {
          setProducts(r.products)
          setTotal(r.total)
        })
        .finally(() => setLoading(false))
    }, 200)
    return () => clearTimeout(t)
  }, [query, category, selectedBrands, priceRange, minRating, sort, perPage, page])

  const activeCategory = categories.find((c) => c.slug === category)
  const activeFilters =
    (category ? 1 : 0) +
    selectedBrands.length +
    (minRating > 0 ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < PRICE_MAX ? 1 : 0)

  const filteredBrands = brandSearch
    ? brands.filter((b) => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
    : brands

  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const showingFrom = total === 0 ? 0 : (page - 1) * perPage + 1
  const showingTo = Math.min(page * perPage, total)

  /* ---------- Shared filter panel (desktop sidebar + mobile sheet) ---------- */
  const FilterContent = (
    <div className="space-y-0">
      <FilterGroup
        title="Category"
        open={!collapsed.category}
        onToggle={() => toggleGroup('category')}
        count={category ? 1 : undefined}
      >
        <div className="space-y-1">
          <button
            onClick={() => onCategoryChange('')}
            className={cn(
              'block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
              !category
                ? 'bg-accent font-medium text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            All categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => onCategoryChange(c.slug)}
              className={cn(
                'block w-full rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors',
                category === c.slug
                  ? 'bg-accent font-medium text-accent-foreground'
                  : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup
        title="Price range"
        open={!collapsed.price}
        onToggle={() => toggleGroup('price')}
        count={priceRange[0] > 0 || priceRange[1] < PRICE_MAX ? 1 : undefined}
      >
        <div className="px-1">
          <div className="mb-3 text-xs font-medium text-muted-foreground">
            Range:{' '}
            <span className="text-foreground">{formatPrice(priceRange[0])}</span>
            {' – '}
            <span className="text-foreground">{formatPrice(priceRange[1])}</span>
          </div>
          <Slider
            value={priceRange}
            onValueChange={onPriceChange}
            min={0}
            max={PRICE_MAX}
            step={1000}
            className="my-2"
          />
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{formatPrice(priceRange[0])}</span>
            <span className="font-medium">{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </FilterGroup>

      <FilterGroup
        title="Brands"
        open={!collapsed.brand}
        onToggle={() => toggleGroup('brand')}
        count={selectedBrands.length || undefined}
      >
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="Search brands…"
            aria-label="Search brands"
            className="h-8 rounded-lg bg-muted/40 pl-8 text-xs"
          />
        </div>
        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {filteredBrands.length === 0 ? (
            <p className="px-1 py-2 text-xs text-muted-foreground">
              No brands match &quot;{brandSearch}&quot;
            </p>
          ) : (
            filteredBrands.map((b) => (
              <label
                key={b.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selectedBrands.includes(b.slug)}
                  onCheckedChange={() => toggleBrand(b.slug)}
                />
                <span className="flex-1 truncate">{b.name}</span>
              </label>
            ))
          )}
        </div>
      </FilterGroup>

      <FilterGroup
        title="Rating"
        open={!collapsed.rating}
        onToggle={() => toggleGroup('rating')}
        count={minRating > 0 ? 1 : undefined}
      >
        <div className="flex flex-wrap gap-1.5">
          {[0, 3, 4, 4.5].map((r) => (
            <button
              key={r}
              onClick={() => onRatingChange(r)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                minRating === r
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              {r === 0 ? 'Any' : `${r}★+`}
            </button>
          ))}
        </div>
      </FilterGroup>

      {activeFilters > 0 && (
        <Button variant="outline" className="mt-4 w-full" onClick={clearAll}>
          <X className="mr-2 h-4 w-4" /> Clear all filters ({activeFilters})
        </Button>
      )}
    </div>
  )

  const skeletonCount = view === 'grid' ? 10 : 6

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary">
            Home
          </button>
          <span>/</span>
          <span className="text-foreground">
            {activeCategory ? activeCategory.name : 'All products'}
          </span>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {query ? `Results for "${query}"` : activeCategory ? activeCategory.name : 'All products'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {loading ? (
              'Searching…'
            ) : (
              <>
                Showing <span className="font-medium text-foreground">{showingFrom}</span>–
                <span className="font-medium text-foreground">{showingTo}</span> of{' '}
                <span className="font-medium text-foreground">{total}</span> products
              </>
            )}
          </p>
        </div>
      </div>

      {/* Toolbar: search + Ask AI + sort + per-page + view toggle + mobile filters */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative min-w-[180px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search products…"
            className="h-11 rounded-xl border-border/50 bg-muted/40 pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setAiOpen(true)}
          className="h-11 shrink-0 rounded-xl"
        >
          <Sparkles className="mr-2 h-4 w-4 text-violet-500" />
          <span className="hidden sm:inline">Ask AI</span>
        </Button>
        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="h-11 w-32 shrink-0 rounded-xl sm:w-40" aria-label="Sort by">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(perPage)} onValueChange={(v) => onPerPageChange(Number(v))}>
          <SelectTrigger className="h-11 w-28 shrink-0 rounded-xl" aria-label="Items per page">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PER_PAGE_OPTIONS.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex h-11 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-card">
          <Button
            variant={view === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setView('grid')}
            className="h-11 w-11 rounded-none"
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setView('list')}
            className="h-11 w-11 rounded-none"
            aria-label="List view"
            aria-pressed={view === 'list'}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="relative h-11 shrink-0 rounded-xl lg:hidden"
              aria-label="Open filters"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFilters > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                  {activeFilters}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">{FilterContent}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex gap-6">
        {/* Desktop filters sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-36 rounded-2xl border border-border/50 bg-card p-5">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Filters</h3>
              </div>
              {activeFilters > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                  {activeFilters} active
                </span>
              )}
            </div>
            {FilterContent}
          </div>
        </aside>

        {/* Products area */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div
              className={cn(
                'grid gap-4',
                view === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4' : 'grid-cols-1'
              )}
            >
              {Array.from({ length: skeletonCount }).map((_, i) =>
                view === 'grid' ? (
                  <div
                    key={i}
                    className="overflow-hidden rounded-xl border border-border/40 bg-card"
                  >
                    <div className="shimmer aspect-square bg-muted" />
                    <div className="space-y-2 p-3.5">
                      <div className="shimmer h-2.5 w-1/3 rounded-full bg-muted" />
                      <div className="shimmer h-3.5 w-full rounded-full bg-muted" />
                      <div className="shimmer h-3.5 w-2/3 rounded-full bg-muted" />
                      <div className="shimmer h-4 w-1/2 rounded-full bg-muted" />
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex gap-4 rounded-xl border border-border/40 bg-card p-3"
                  >
                    <div className="shimmer h-28 w-28 shrink-0 rounded-xl bg-muted sm:h-32 sm:w-32" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="shimmer h-2.5 w-1/4 rounded-full bg-muted" />
                      <div className="shimmer h-3.5 w-3/4 rounded-full bg-muted" />
                      <div className="shimmer h-3.5 w-1/2 rounded-full bg-muted" />
                      <div className="shimmer mt-3 h-7 w-32 rounded-full bg-muted" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-20 text-center">
              <PackageSearch className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or ask the Buywise AI to find what you need.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" onClick={clearAll}>
                  Clear filters
                </Button>
                <Button onClick={() => setAiOpen(true)}>
                  <Sparkles className="mr-2 h-4 w-4" /> Ask AI
                </Button>
              </div>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {products.map((p) => (
                <ProductListItem key={p.id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && total > perPage && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of{' '}
                <span className="font-medium text-foreground">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
