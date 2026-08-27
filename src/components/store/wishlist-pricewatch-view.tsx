'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Heart, Trash2, ShoppingCart, Tag } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { EmptyState } from './cart-view'
import { toast } from 'sonner'

export function WishlistView() {
  const { navigate, user, setAuthOpen } = useStore()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() { setLoading(true); try { const r = await api.wishlist.get(); setItems(r.items) } catch {} finally { setLoading(false) } }
  useEffect(() => { if (user) load() }, [user])

  async function remove(id: string) { await api.wishlist.remove(id); load(); toast.success('Removed') }
  async function addToCart(productId: string, name: string) {
    try { await api.cart.add(productId); await refreshCartCount(); toast.success('Added to cart', { description: name }) } catch (e: any) { toast.error(e.message) }
  }

  if (!user) return <EmptyState icon={<Heart />} title="Sign in to view wishlist" desc="Save products here and we'll help you track them." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />
  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8"><p className="text-muted-foreground">Loading…</p></div>
  if (items.length === 0) return <EmptyState icon={<Heart />} title="Save products here" desc="Tap the heart on any product to save it for later." action={<Button onClick={() => navigate({ name: 'catalog' })}>Browse products</Button>} />

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">My Wishlist ({items.length})</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden p-0">
            <button onClick={() => navigate({ name: 'product', id: item.productId })}>
              <ProductImage name={item.product.name} images={item.product.images} className="aspect-square w-full" />
            </button>
            <div className="p-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{item.product.brand?.name}</p>
              <button onClick={() => navigate({ name: 'product', id: item.productId })} className="line-clamp-2 text-left text-sm font-semibold hover:text-primary">{item.product.name}</button>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="font-bold">{formatPrice(item.product.price)}</span>
                {item.product.compareAtPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(item.product.compareAtPrice)}</span>}
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1" onClick={() => addToCart(item.productId, item.product.name)}><ShoppingCart className="mr-1 h-3.5 w-3.5" /> Add</Button>
                <Button size="icon" variant="outline" onClick={() => remove(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export function PriceWatchView() {
  const { navigate, user, setAuthOpen } = useStore()
  const [watches, setWatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() { setLoading(true); try { const r = await api.priceWatch.list(); setWatches(r.watches) } catch {} finally { setLoading(false) } }
  useEffect(() => { if (user) load() }, [user])

  async function remove(id: string) { await api.priceWatch.remove(id); load(); toast.success('Alert removed') }

  if (!user) return <EmptyState icon={<Tag />} title="Sign in to track prices" desc="Get notified when your favourite products drop in price." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />
  if (loading) return <div className="mx-auto max-w-5xl px-4 py-8"><p className="text-muted-foreground">Loading…</p></div>
  if (watches.length === 0) return <EmptyState icon={<Tag />} title="No price alerts" desc="Ask your AI partner to set a price alert, or set one from a product page." action={<Button onClick={() => navigate({ name: 'catalog' })}>Browse products</Button>} />

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Price Watch</h1>
      <div className="space-y-3">
        {watches.map((w) => {
          const current = w.product.price
          const target = w.targetPrice
          const below = current <= target
          const pct = Math.round(((current - target) / current) * 100)
          return (
            <Card key={w.id} className="flex items-center gap-3 p-3">
              <ProductImage name={w.product.name} images={w.product.images} className="h-16 w-16 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <button onClick={() => navigate({ name: 'product', id: w.productId })} className="line-clamp-1 text-left text-sm font-semibold hover:text-primary">{w.product.name}</button>
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Now: <span className="font-semibold text-foreground">{formatPrice(current)}</span></span>
                  <span className="text-muted-foreground">Target: <span className={below ? 'font-semibold text-emerald-600' : 'font-semibold'}>{formatPrice(target)}</span></span>
                </div>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${below ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {below ? 'Target reached!' : `${pct}% above target`}
                </span>
              </div>
              <Button size="icon" variant="outline" onClick={() => remove(w.id)}><Trash2 className="h-4 w-4" /></Button>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
