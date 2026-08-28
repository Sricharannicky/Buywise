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
import { ShoppingCart, Heart, Sparkles, Star, Truck, Shield, RotateCcw, Check, Minus, Plus, ChevronRight, BadgeCheck, Clock, Zap } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice, discountPercent, parseAttributes, parseTags } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { StarRating } from '@/components/shared/star-rating'
import { ProductCard } from '@/components/shared/product-card'
import { toast } from 'sonner'

export function ProductView({ id }: { id: string }) {
  const { navigate, setAuthOpen, setAiOpen } = useStore()
  const [data, setData] = useState<{ product: any; related: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [adding, setAdding] = useState(false)
  const [wished, setWished] = useState(false)
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.products.get(id).then((d) => {
      setData(d)
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
        {/* Gallery */}
        <div className="space-y-3 md:sticky md:top-32 md:self-start">
          <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
            <ProductImage name={product.name} images={product.images} className="aspect-square w-full" priority />
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

          {/* Quantity + actions */}
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
