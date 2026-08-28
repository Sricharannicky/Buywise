'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Heart, ShoppingCart, Eye, Star } from 'lucide-react'
import { ProductImage } from './product-image'
import { formatPrice, discountPercent } from '@/lib/format'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { toast } from 'sonner'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductCard({ product, compact = false }: { product: any; compact?: boolean }) {
  const navigate = useStore((s) => s.navigate)
  const setAuthOpen = useStore((s) => s.setAuthOpen)
  const setMiniCartOpen = useStore((s) => s.setMiniCartOpen)
  const [adding, setAdding] = useState(false)
  const [wishlisted, setWishlisted] = useState(false)

  const discount = discountPercent(product.price, product.compareAtPrice)

  // Try the API directly — the httpOnly cookie is the real auth source.
  // If we get 401, THEN open the auth modal. This avoids stale store state.
  async function addToCart(e?: React.MouseEvent): Promise<boolean> {
    e?.stopPropagation()
    setAdding(true)
    try {
      await api.cart.add(product.id)
      await refreshCartCount()
      toast.success('Added to cart', { description: product.name })
      setMiniCartOpen(true) // open mini-cart drawer on success
      return true
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('please sign')) {
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

  async function toggleWishlist(e: React.MouseEvent) {
    e.stopPropagation()
    try {
      const res = await api.wishlist.toggle(product.id)
      setWishlisted(res.action === 'added')
      toast.success(res.action === 'added' ? 'Saved to wishlist' : 'Removed from wishlist')
    } catch (err: any) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('sign in') || msg.toLowerCase().includes('unauthorized') || msg.toLowerCase().includes('please sign')) {
        setAuthOpen(true, 'login')
        toast.info('Please sign in to manage your wishlist')
      } else {
        toast.error('Could not update wishlist')
      }
    }
  }

  return (
    <div
      onClick={() => navigate({ name: 'product', id: product.id })}
      className="group relative cursor-pointer"
    >
      <Card className="overflow-hidden border-border/50 p-0 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-muted/30">
          <ProductImage name={product.name} images={product.images} className="h-full w-full" />

          {/* Discount badge */}
          {discount > 0 && (
            <div className="absolute left-2.5 top-2.5">
              <span className="inline-flex items-center rounded-full bg-deal px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                -{discount}%
              </span>
            </div>
          )}

          {/* New badge */}
          {product.isNewArrival && (
            <div className={cn('absolute right-2.5', discount > 0 ? 'top-9' : 'top-2.5')}>
              <span className="inline-flex items-center rounded-full bg-white/95 px-2 py-0.5 text-[11px] font-semibold text-foreground shadow-sm backdrop-blur">
                New
              </span>
            </div>
          )}

          {/* Wishlist heart — always visible, subtle */}
          <button
            onClick={toggleWishlist}
            className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-foreground opacity-0 shadow-sm backdrop-blur transition-all duration-200 hover:bg-white group-hover:opacity-100"
            aria-label="Toggle wishlist"
          >
            <Heart className={cn('h-4 w-4 transition-all', wishlisted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-foreground')} />
          </button>

          {/* Quick actions overlay on hover */}
          <div className="absolute inset-x-2.5 bottom-2.5 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" style={{ marginRight: '2.5rem' }}>
            <Button
              size="sm"
              onClick={addToCart}
              disabled={adding}
              className="h-9 flex-1 rounded-full bg-foreground/95 text-background backdrop-blur hover:bg-foreground"
            >
              <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
              {adding ? 'Adding…' : 'Add to cart'}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={(e) => { e.stopPropagation(); navigate({ name: 'product', id: product.id }) }}
              className="h-9 w-9 rounded-full bg-white/95 p-0 text-foreground shadow-sm hover:bg-white"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1.5 p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{product.brand?.name}</p>
            {!compact && product.rating > 0 && (
              <div className="flex items-center gap-0.5 text-xs">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-medium leading-snug text-foreground">{product.name}</h3>
          <div className="flex items-baseline gap-2 pt-0.5">
            <span className="text-base font-bold tracking-tight text-foreground">{formatPrice(product.price)}</span>
            {product.compareAtPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
