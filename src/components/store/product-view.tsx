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
import { ShoppingCart, Heart, Sparkles, Star, Truck, Shield, RotateCcw, Check, Minus, Plus, ChevronRight, BadgeCheck } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice, discountPercent, parseImages, parseAttributes, parseTags } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { StarRating } from '@/components/shared/star-rating'
import { ProductCard } from '@/components/shared/product-card'
import { toast } from 'sonner'

export function ProductView({ id }: { id: string }) {
  const { navigate, user, setAuthOpen, setAiOpen } = useStore()
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

  async function addToCart() {
    if (!user) { setAuthOpen(true, 'login'); return }
    setAdding(true)
    try {
      await api.cart.add(data!.product.id, qty)
      await refreshCartCount()
      toast.success('Added to cart', { description: `${qty} × ${data!.product.name}` })
    } catch (e: any) { toast.error(e.message) } finally { setAdding(false) }
  }

  async function buyNow() {
    if (!user) { setAuthOpen(true, 'login'); return }
    await addToCart()
    navigate({ name: 'checkout' })
  }

  async function toggleWishlist() {
    if (!user) { setAuthOpen(true, 'login'); return }
    try {
      const r = await api.wishlist.toggle(data!.product.id)
      setWished(r.action === 'added')
      toast.success(r.action === 'added' ? 'Saved to wishlist' : 'Removed from wishlist')
    } catch { toast.error('Could not update wishlist') }
  }

  async function submitReview() {
    if (!user) { setAuthOpen(true, 'login'); return }
    if (!reviewForm.title || !reviewForm.body) { toast.error('Please fill all fields'); return }
    setSubmitting(true)
    try {
      const r = await api.reviews.create({ productId: data!.product.id, ...reviewForm })
      setReviews((rv) => [r.review, ...rv])
      setReviewForm({ rating: 5, title: '', body: '' })
      toast.success('Review submitted')
    } catch (e: any) { toast.error(e.message) } finally { setSubmitting(false) }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-2xl bg-muted" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
            <div className="h-24 animate-pulse rounded bg-muted" />
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
  const emojis = parseImages(product.images)
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
        <div className="space-y-3">
          <div className="overflow-hidden rounded-2xl border border-border/60">
            <ProductImage name={product.name} images={product.images} className="aspect-square w-full" />
          </div>
          <div className="flex gap-2">
            {emojis.map((e, i) => (
              <div key={i} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                <span className="text-2xl">{e}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">{product.brand?.name}</p>
            <h1 className="mt-1 text-2xl font-bold leading-tight md:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <StarRating rating={product.rating} size={16} showNumber count={product.ratingCount} />
              {product.isFeatured && <Badge variant="secondary"><BadgeCheck className="mr-1 h-3 w-3" /> Featured</Badge>}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
                <Badge className="bg-deal text-white hover:bg-deal">-{discount}% OFF</Badge>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground">Inclusive of all taxes</p>

          {/* AI Insight card */}
          <Card className="flex items-start gap-3 border-violet-200 bg-violet-50 p-3 dark:border-violet-900 dark:bg-violet-950/30">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Insight</p>
              <p className="mt-0.5 text-xs text-violet-800 dark:text-violet-300">{product.shortDescription || 'A solid choice that matches common shopper preferences. Ask your AI partner for a personalised take.'}</p>
              <Button size="sm" variant="link" className="h-auto p-0 text-violet-700 dark:text-violet-300" onClick={() => setAiOpen(true)}>Ask the AI about this →</Button>
            </div>
          </Card>

          {/* Stock + delivery */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {inStock ? (
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700"><Check className="mr-1 h-3 w-3" /> In stock ({product.stock} left)</Badge>
            ) : <Badge variant="destructive">Out of stock</Badge>}
            <span className="flex items-center gap-1.5 text-muted-foreground"><Truck className="h-4 w-4" /> Free delivery</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><RotateCcw className="h-4 w-4" /> 7-day returns</span>
            <span className="flex items-center gap-1.5 text-muted-foreground"><Shield className="h-4 w-4" /> Warranty</span>
          </div>

          {/* Quantity + actions */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-lg border border-border">
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1}><Minus className="h-4 w-4" /></Button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <Button variant="ghost" size="icon" className="h-10 w-10" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}><Plus className="h-4 w-4" /></Button>
            </div>
            <Button variant="outline" size="icon" className="h-10 w-10" onClick={toggleWishlist}><Heart className={wished ? 'fill-rose-500 text-rose-500' : 'h-4 w-4'} /></Button>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button size="lg" className="flex-1" onClick={addToCart} disabled={adding || !inStock}>
              <ShoppingCart className="mr-2 h-4 w-4" /> {adding ? 'Adding…' : 'Add to cart'}
            </Button>
            <Button size="lg" variant="secondary" className="flex-1" onClick={buyNow} disabled={!inStock}>Buy now</Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => <Badge key={t} variant="outline" className="text-xs">{t}</Badge>)}
            </div>
          )}
        </div>
      </div>

      {/* Tabs: description / specs / reviews */}
      <Tabs defaultValue="description" className="mt-10">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specs">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4">
          <Card className="p-6">
            <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          </Card>
        </TabsContent>
        <TabsContent value="specs" className="mt-4">
          <Card className="p-6">
            <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {Object.entries(specs).map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-border/40 py-2">
                  <dt className="text-sm text-muted-foreground">{k}</dt>
                  <dd className="text-sm font-medium">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        </TabsContent>
        <TabsContent value="reviews" className="mt-4 space-y-4">
          {/* Write review */}
          <Card className="p-4">
            <h4 className="mb-3 text-sm font-semibold">Write a review</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label className="text-xs">Rating:</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button key={r} onClick={() => setReviewForm({ ...reviewForm, rating: r })}>
                      <Star className={`h-5 w-5 ${r <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/40'}`} />
                    </button>
                  ))}
                </div>
              </div>
              <Input placeholder="Review title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
              <Textarea placeholder="Share your experience…" value={reviewForm.body} onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })} rows={3} />
              <Button onClick={submitReview} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit review'}</Button>
            </div>
          </Card>
          {/* Reviews list */}
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
                      {rv.isVerifiedPurchase && <Badge variant="secondary" className="text-[10px]"><BadgeCheck className="mr-1 h-3 w-3" /> Verified</Badge>}
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
          <h2 className="mb-4 text-xl font-bold">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {related.slice(0, 6).map((p) => <ProductCard key={p.id} product={p} compact />)}
          </div>
        </section>
      )}
    </div>
  )
}

