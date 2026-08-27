'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { ProductImage } from './product-image'
import { StarRating } from './star-rating'
import { formatPrice, discountPercent } from '@/lib/format'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductCard({ product, compact = false }: { product: any; compact?: boolean }) {
  const navigate = useStore((s) => s.navigate)
  const user = useStore((s) => s.user)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const [adding, setAdding] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const discount = discountPercent(product.price, product.compareAtPrice)

  async function addToCart(e: React.MouseEvent) {
    e.stopPropagation()
    if (!user) {
      setAuthOpen(true, 'login')
      toast.info('Please sign in to add items to your cart')
      return
    }
    setAdding(true)
    try {
      await api.cart.add(product.id)
      await refreshCartCount()
      toast.success('Added to cart', { description: product.name })
    } catch (e: any) {
      toast.error(e.message || 'Could not add to cart')
    } finally {
      setAdding(false)
    }
  }

  async function toggleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    if (!user) {
      setAuthOpen(true, 'login')
      return
    }
    try {
      const res = await api.wishlist.toggle(product.id)
      setWishlisted(res.action === 'added')
      toast.success(res.action === 'added' ? 'Saved to wishlist' : 'Removed from wishlist')
    } catch {
      toast.error('Could not update wishlist')
    }
  }

  return (
    <Card
      onClick={() => navigate({ name: 'product', id: product.id })}
      className="group relative cursor-pointer overflow-hidden border-border/60 p-0 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="relative">
        <ProductImage name={product.name} images={product.images} className="aspect-square w-full" />
        {discount > 0 && (
          <Badge className="absolute left-2 top-2 bg-deal text-white shadow-sm hover:bg-deal">-{discount}%</Badge>
        )}
        {product.isNewArrival && (
          <Badge variant="secondary" className="absolute right-2 top-2 bg-white/90 text-foreground shadow-sm">New</Badge>
        )}
        <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-2 bg-gradient-to-t from-black/60 to-transparent p-2 transition-transform group-hover:translate-y-0">
          <Button size="sm" variant="secondary" className="h-8 flex-1 bg-white/95 text-foreground hover:bg-white" onClick={addToCart} disabled={adding}>
            <ShoppingCart className="mr-1 h-3.5 w-3.5" /> {adding ? 'Adding' : 'Add'}
          </Button>
          <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/95 text-foreground hover:bg-white" onClick={() => navigate({ name: 'product', id: product.id })}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
        </div>
        <button
          onClick={toggleWishlist}
          className={cn(
            'absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white/80 backdrop-blur transition-colors hover:bg-white',
            product.isNewArrival && 'top-9'
          )}
          aria-label="Toggle wishlist"
        >
          <Heart className={cn('h-3.5 w-3.5', wishlisted ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
        </button>
      </div>
      <div className="space-y-1.5 p-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{product.brand?.name}</p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-foreground">{product.name}</h3>
        {!compact && (
          <StarRating rating={product.rating} showNumber count={product.ratingCount} />
        )}
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="text-base font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.compareAtPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
          )}
        </div>
      </div>
    </Card>
  )
}
