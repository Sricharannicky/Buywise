'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Sparkles } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { toast } from 'sonner'

export function MiniCart() {
  const { miniCartOpen, setMiniCartOpen, navigate, user, setAuthOpen, setAiOpen } = useStore()
  const [items, setItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!user) return
    setLoading(true)
    try {
      const r = await api.cart.get()
      setItems(r.items)
      setSubtotal(r.subtotal)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { if (miniCartOpen) load() }, [miniCartOpen, user])

  async function updateQty(itemId: string, qty: number) {
    await api.cart.update(itemId, { quantity: qty })
    load(); refreshCartCount()
  }
  async function remove(itemId: string) {
    await api.cart.remove(itemId)
    toast.success('Removed from cart')
    load(); refreshCartCount()
  }

  const tax = Math.round(subtotal * 0.05)
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + tax + shipping

  return (
    <Sheet open={miniCartOpen} onOpenChange={(o) => setMiniCartOpen(o)}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md" hideClose>
        {/* Promo header */}
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3 text-center text-white">
          <p className="text-xs font-medium">🎉 Get Up To 30% OFF on your 1st order</p>
        </div>
        {/* Header */}
        <SheetHeader className="flex-row items-center justify-between border-b border-border/60 px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="h-4 w-4" /> My Cart ({items.length})
          </SheetTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMiniCartOpen(false)}><X className="h-4 w-4" /></Button>
        </SheetHeader>

        {/* Items */}
        <div className="flex-1 overflow-y-auto bg-muted/20 p-4 scrollbar-thin">
          {!user ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-sm text-muted-foreground">Sign in to view your cart</p>
              <Button className="mt-3" onClick={() => { setMiniCartOpen(false); setAuthOpen(true, 'login') }}>Sign in</Button>
            </div>
          ) : loading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="shimmer h-24 rounded-xl bg-muted" />)}</div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-medium">Your cart is empty</p>
              <p className="text-xs text-muted-foreground">Add something great!</p>
              <Button variant="outline" className="mt-3" onClick={() => { setMiniCartOpen(false); navigate({ name: 'catalog' }) }}>Browse products</Button>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 rounded-xl border border-border/40 bg-card p-2.5">
                  <button onClick={() => { setMiniCartOpen(false); navigate({ name: 'product', id: item.productId }) }} className="shrink-0">
                    <ProductImage name={item.product.name} images={item.product.images} className="h-16 w-16 rounded-lg" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <button onClick={() => { setMiniCartOpen(false); navigate({ name: 'product', id: item.productId }) }} className="line-clamp-2 text-left text-xs font-medium hover:text-primary">{item.product.name}</button>
                      <button onClick={() => remove(item.id)} className="shrink-0 text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                    <p className="text-sm font-bold">{formatPrice(item.product.price)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="flex items-center rounded-md border border-border">
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-l-md rounded-r-none" onClick={() => updateQty(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-r-md rounded-l-none" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <span className="text-xs text-muted-foreground">{formatPrice(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / summary */}
        {user && items.length > 0 && (
          <div className="border-t border-border/60 bg-card p-4">
            {/* AI optimize */}
            <button onClick={() => { setMiniCartOpen(false); setAiOpen(true) }} className="mb-3 flex w-full items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs text-violet-700 hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950/30 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" /> Optimise my cart with AI
            </button>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shipping)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <Button className="mt-3 w-full" onClick={() => { setMiniCartOpen(false); navigate({ name: 'checkout' }) }}>Continue to Checkout <ArrowRight className="ml-2 h-4 w-4" /></Button>
            <Button variant="ghost" className="mt-1 w-full text-sm" onClick={() => { setMiniCartOpen(false); navigate({ name: 'cart' }) }}>View Cart</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
