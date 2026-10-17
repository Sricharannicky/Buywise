'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  ShoppingCart, Heart, Sparkles, Star, Truck, Shield, RotateCcw,
  Check, Minus, Plus, ChevronRight, BadgeCheck, Clock, Zap, GitCompare,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import {
  formatPrice, discountPercent, parseAttributes, parseTags, parseImages,
} from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { SmartImage } from '@/components/shared/smart-image'
import { StarRating } from '@/components/shared/star-rating'
import { ProductCard } from '@/components/shared/product-card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Mock variant value pools — used because our products don't have real
// variants in the DB. The label is derived from the product's spec keys.
const VARIANT_POOLS: Record<string, string[]> = {
  ram: ['8 GB', '16 GB', '32 GB'],
  storage: ['256 GB', '512 GB', '1 TB'],
  color: ['Midnight', 'Silver', 'Rose Gold', 'Navy'],
  material: ['Mesh', 'Fabric', 'Leather'],
  size: ['Small', 'Medium', 'Large', 'XL'],
  capacity: ['6 L', '8 L', '10 L'],
  display: ['13"', '15"', '17"'],
  default: ['Standard', 'Premium'],
}

interface VariantGroup {
  label: string
  key: string
  options: string[]
}

// Build mock variant groups from the product's attributes/specs.
// If we find a RAM/Storage/Color/Material/etc. spec key, surface it as a
// selectable pill group. Otherwise fall back to a generic Standard/Premium.
function buildVariantGroups(specs: Record<string, string>): VariantGroup[] {
  if (Object.keys(specs).length === 0) {
    return [{ label: 'Edition', key: 'edition', options: VARIANT_POOLS.default }]
  }
  const result: VariantGroup[] = []
  const seen = new Set<string>()
  for (const k of Object.keys(specs)) {
    const lower = k.toLowerCase()
    let matched: keyof typeof VARIANT_POOLS | null = null
    if (lower.includes('ram') || lower.includes('memory')) matched = 'ram'
    else if (lower.includes('storage') || lower.includes('ssd') || lower.includes('drive')) matched = 'storage'
    else if (lower.includes('color') || lower.includes('colour')) matched = 'color'
    else if (lower.includes('material')) matched = 'material'
    else if (lower.includes('size') || lower.includes('dimension')) matched = 'size'
    else if (lower.includes('capacity') || lower.includes('volume') || lower.includes('tank')) matched = 'capacity'
    else if (lower.includes('display')) matched = 'display'
    if (matched && !seen.has(matched)) {
      seen.add(matched)
      result.push({
        label: k.charAt(0).toUpperCase() + k.slice(1),
        key: matched,
        options: VARIANT_POOLS[matched],
      })
    }
    if (result.length >= 2) break
  }
  if (result.length === 0) {
    result.push({ label: 'Edition', key: 'edition', options: VARIANT_POOLS.default })
  }
  return result
}

type GalleryView = {
  id: number
  src: string
  label: string
  zoomClass?: string
}

export function ProductView({ id }: { id: string }) {
  const { navigate, setAuthOpen, setAiOpen, setMiniCartOpen } = useStore()
  const [data, setData] = useState<{ product: any; related: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [wished, setWished] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)
  const [activeView, setActiveView] = useState(0)
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({})

  useEffect(() => {
    setLoading(true)
    setActiveView(0)
    setSelectedVariants({})
    api.products.get(id).then((d) => {
      setData(d)
      // Pre-select the first option of each variant group for a smoother UX
      const specs = parseAttributes(d.product.attributes)
      const groups = buildVariantGroups(specs)
      const init: Record<string, string> = {}
      for (const g of groups) init[g.key] = g.options[0]
      setSelectedVariants(init)
      api.reviews.list(id).then((r) => setReviews(r.reviews)).catch(() => {})
    }).finally(() => setLoading(false))
  }, [id])

  // Try the API directly — the httpOnly cookie is the real auth source.
  // Only open the auth modal if the API returns 401.
  function isAuthError(msg: string): boolean {
    const l = msg.toLowerCase()
    return l.includes('sign in') || l.includes('unauthorized') || l.includes('please sign')
  }

  async function addToCart(): Promise<boolean> {
    setAdding(true)
    try {
      await api.cart.add(data!.product.id, qty)
      await refreshCartCount()
      toast.success('Added to cart', { description: `${qty} × ${data!.product.name}` })
      // Open the mini-cart drawer so the user sees their cart update
      setMiniCartOpen(true)
      return true
    } catch (e: any) {
      const msg = e.message || ''
      if (isAuthError(msg)) {
        setAuthOpen(true, 'login')
        toast.info('Please sign in to add items to your cart')
      } else {
        toast.error(msg || 'Could not add to cart')
      }
      return false
    } finally {
      setAdding(false)
    }
  }

  async function buyNow() {
    const ok = await addToCart()
    if (ok) {
      // Close the mini-cart drawer (addToCart opens it) before navigating
      setMiniCartOpen(false)
      navigate({ name: 'checkout' })
    }
  }

  async function toggleWishlist() {
    try {
      const r = await api.wishlist.toggle(data!.product.id)
      setWished(r.action === 'added')
      toast.success(r.action === 'added' ? 'Saved to wishlist' : 'Removed from wishlist')
    } catch (e: any) {
      const msg = e.message || ''
      if (isAuthError(msg)) {
        setAuthOpen(true, 'login')
        toast.info('Please sign in to manage your wishlist')
      } else {
        toast.error('Could not update wishlist')
      }
    }
  }

  function addToCompare() {
    toast.success('Added to comparison', { description: data!.product.name })
  }

  async function submitReview() {
    if (!reviewForm.title || !reviewForm.body) { toast.error('Please fill all fields'); return }
    setSubmitting(true)
    try {
      const r = await api.reviews.create({ productId: data!.product.id, ...reviewForm })
      setReviews((rv) => [r.review, ...rv])
      setReviewForm({ rating: 5, title: '', body: '' })
      toast.success('Review submitted')
    } catch (e: any) {
      const msg = e.message || ''
      if (isAuthError(msg)) {
        setAuthOpen(true, 'login')
        toast.info('Please sign in to write a review')
      } else {
        toast.error(msg)
      }
    } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="shimmer aspect-square rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="shimmer h-8 w-3/4 rounded bg-muted" />
            <div className="shimmer h-6 w-1/3 rounded bg-muted" />
            <div className="shimmer h-24 rounded bg-muted" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) return <div className="mx-auto max-w-7xl px-4 py-20 text-center">Product not found.</div>

  const { product, related } = data
  const discount = discountPercent(product.price, product.compareAtPrice)
  const specs = parseAttributes(product.attributes)
  const tags = parseTags(product.tags)
  const inStock = product.stock > 0

  // Build gallery views — all REAL photographs (never emojis!)
  const parsedImages = parseImages(product.images)
  const validImages = parsedImages.filter((p) => typeof p === 'string' && (p.startsWith('/') || p.startsWith('http')))
  const primarySrc = validImages[0] || (typeof product.images === 'string' && (product.images.startsWith('/') || product.images.startsWith('http')) ? product.images : null)

  const views: GalleryView[] = []
  if (validImages.length > 1) {
    validImages.forEach((src, idx) => {
      views.push({
        id: idx,
        src,
        label: idx === 0 ? 'Front view' : idx === 1 ? 'Angle view' : idx === 2 ? 'Detail view' : `View ${idx + 1}`,
      })
    })
  } else if (primarySrc) {
    views.push(
      { id: 0, src: primarySrc, label: 'Front view' },
      { id: 1, src: primarySrc, label: 'Close-up detail', zoomClass: 'scale-125' },
      { id: 2, src: primarySrc, label: 'Perspective angle', zoomClass: 'scale-110 object-top' },
      { id: 3, src: primarySrc, label: 'Product in-use', zoomClass: 'scale-105' }
    )
  }

  const safeView = views[activeView] ?? views[0]

  // Build mock variant groups from specs
  const variantGroups = buildVariantGroups(specs)

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary">Home</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate({ name: 'catalog', category: product.category?.slug })} className="hover:text-primary">{product.category?.name}</button>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Gallery — sticky on desktop */}
        <div className="space-y-3 md:sticky md:top-32 md:self-start">
          <div className="flex flex-col gap-3 sm:flex-row">
            {/* Main image */}
            <div className="relative flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm group">
              <div className="relative aspect-square w-full overflow-hidden bg-muted/10">
                <SmartImage
                  src={safeView?.src || primarySrc}
                  alt={product.name}
                  className={cn("h-full w-full object-cover transition-transform duration-500 group-hover:scale-105", safeView?.zoomClass)}
                  priority
                />
                <Badge variant="secondary" className="absolute left-3 top-3 bg-background/85 text-foreground backdrop-blur border border-border/40 text-[10px] font-medium shadow-xs">
                  {safeView?.label || 'Front view'}
                </Badge>
              </div>
            </div>
            {/* Thumbnails — vertical strip on desktop, horizontal row on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar sm:w-20 sm:flex-col sm:overflow-visible sm:pb-0">
              {views.map((v, i) => {
                const active = i === activeView
                return (
                  <button
                    key={i}
                    onClick={() => setActiveView(i)}
                    aria-label={v.label}
                    aria-pressed={active}
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-card transition-all sm:h-20 sm:w-20 ${
                      active
                        ? 'border-primary ring-2 ring-primary/30 shadow-xs'
                        : 'border-border/50 hover:border-primary/40 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="h-full w-full overflow-hidden bg-muted/20">
                      <SmartImage
                        src={v.src}
                        alt={`${product.name} - ${v.label}`}
                        className={cn("h-full w-full object-cover", v.zoomClass)}
                      />
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          {/* Trust badges under image */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-border/50 bg-card p-2.5">
              <Truck className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-[10px] font-medium">Free delivery</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-2.5">
              <RotateCcw className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-[10px] font-medium">7-day returns</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-card p-2.5">
              <Shield className="mx-auto h-4 w-4 text-primary" />
              <p className="mt-1 text-[10px] font-medium">Warranty</p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">{product.brand?.name}</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <StarRating rating={product.rating} size={16} showNumber count={product.ratingCount} />
              {product.isFeatured && <Badge variant="secondary" className="gap-1"><BadgeCheck className="h-3 w-3" /> Featured</Badge>}
              {product.isTrending && <Badge variant="secondary" className="gap-1 bg-amber-100 text-amber-700"><Zap className="h-3 w-3" /> Trending</Badge>}
            </div>
          </div>

          {/* Price block */}
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-bold tracking-tight">{formatPrice(product.price)}</span>
              {product.compareAtPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
                  <Badge className="bg-deal text-white hover:bg-deal">Save {discount}%</Badge>
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Inclusive of all taxes</p>
          </div>

          {/* Variant selectors — derived from the product's specs */}
          {variantGroups.length > 0 && (
            <div className="space-y-4">
              {variantGroups.map((g) => {
                const selected = selectedVariants[g.key]
                return (
                  <div key={g.key}>
                    <div className="mb-2 flex items-center justify-between">
                      <Label className="text-sm font-semibold">
                        Select {g.label}
                      </Label>
                      <span className="text-sm font-medium text-muted-foreground">
                        {selected ?? 'Choose…'}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {g.options.map((opt) => {
                        const isSel = selected === opt
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => setSelectedVariants((s) => ({ ...s, [g.key]: opt }))}
                            aria-pressed={isSel}
                            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                              isSel
                                ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                                : 'border-border bg-card text-foreground hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
              <Separator className="bg-border/40" />
            </div>
          )}

          {/* AI Insight card */}
          <Card className="overflow-hidden border-violet-200/60 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-fuchsia-950/30">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-md">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Insight</p>
                <p className="mt-0.5 text-sm text-violet-800/90 dark:text-violet-300/90">{product.shortDescription || 'A solid choice that matches common shopper preferences. Ask your AI partner for a personalised take.'}</p>
                <button onClick={() => setAiOpen(true)} className="mt-1.5 inline-flex items-center gap-1 text-sm font-semibold text-violet-700 hover:underline dark:text-violet-300">
                  Ask the AI about this <ChevronRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          </Card>

          {/* Stock + delivery */}
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {inStock ? (
              <Badge variant="secondary" className="gap-1 bg-emerald-100 text-emerald-700"><Check className="h-3 w-3" /> In stock ({product.stock} left)</Badge>
            ) : <Badge variant="destructive">Out of stock</Badge>}
            <span className="flex items-center gap-1.5 text-muted-foreground"><Clock className="h-4 w-4" /> Delivers in 2-3 days</span>
          </div>

          {/* Quantity + wishlist */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-border bg-card">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-l-xl rounded-r-none" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><Minus className="h-4 w-4" /></Button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-r-xl rounded-l-none" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}><Plus className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={toggleWishlist}><Heart className={wished ? 'fill-rose-500 text-rose-500' : 'h-4 w-4'} /></Button>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button size="lg" className="h-12 flex-1 rounded-xl" onClick={addToCart} disabled={adding || !inStock}>
              <ShoppingCart className="mr-2 h-4 w-4" /> {adding ? 'Adding…' : 'Add to cart'}
            </Button>
            <Button size="lg" variant="secondary" className="h-12 flex-1 rounded-xl" onClick={buyNow} disabled={!inStock}>Buy now</Button>
          </div>

          {/* Compare + wishlist shortcut row */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
            <button
              onClick={addToCompare}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <GitCompare className="h-4 w-4" /> Add to compare
            </button>
            <button
              onClick={() => navigate({ name: 'wishlist' })}
              className="inline-flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Heart className="h-4 w-4" /> View wishlist
            </button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mt-12">
        <TabsList className="h-auto w-full justify-start gap-1 rounded-xl bg-muted/50 p-1">
          <TabsTrigger value="description" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Description</TabsTrigger>
          <TabsTrigger value="specs" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Specifications</TabsTrigger>
          <TabsTrigger value="reviews" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4">
          <Card className="p-6">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </Card>
        </TabsContent>
        <TabsContent value="specs" className="mt-4">
          <Card className="p-6">
            <dl className="grid gap-x-8 gap-y-1 sm:grid-cols-2">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/40 py-2.5">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4 space-y-4">
          <Card className="p-4">
            <h4 className="mb-3 text-sm font-semibold">Write a review</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Rating:</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setReviewForm({ ...reviewForm, rating: r })}>
                      <Star className={`h-5 w-5 transition-transform hover:scale-110 ${r <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/40'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <Input placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
              <Textarea placeholder="Share your experience…" value={reviewForm.body} onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })} rows={3} />
              <Button onClick={submitReview} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</Button>
            </div>
          </Card>
          {reviews.length === 0 ? (
            <Card className="p-8 text-center text-sm text-muted-foreground">No reviews yet. Be the first to review!</Card>
          ) : (
            reviews.map((rv) => (
              <Card key={rv.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{rv.authorName[0]}</div>
                    <div>
                      <p className="text-sm font-semibold">{rv.authorName}</p>
                      {rv.isVerifiedPurchase && <Badge variant="secondary" className="text-[10px] gap-1"><BadgeCheck className="h-3 w-3" /> Verified</Badge>}
                    </div>
                  </div>
                  <StarRating rating={rv.rating} size={12} />
                </div>
                <p className="mt-2 text-sm font-medium">{rv.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{rv.body}</p>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-5 text-xl font-bold tracking-tight md:text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {related.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </section>
      )}
    </div>
  )
}
