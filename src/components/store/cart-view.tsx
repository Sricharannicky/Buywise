'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Minus, Plus, Trash2, ShoppingBag, Sparkles, ArrowRight, Save, Tag, Truck, Shield } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { toast } from 'sonner'

export function CartView() {
  const { navigate, user, setAuthOpen, setAiOpen } = useStore()
  const [items, setItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const r = await api.cart.get()
      setItems(r.items)
      setSubtotal(r.subtotal)
    } catch { /* not logged in */ } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function updateQty(itemId: string, qty: number) {
    await api.cart.update(itemId, { quantity: qty })
    load()
    refreshCartCount()
  }
  async function remove(itemId: string) {
    await api.cart.remove(itemId)
    toast.success('Removed from cart')
    load()
    refreshCartCount()
  }
  async function saveForLater(itemId: string) {
    await api.cart.update(itemId, { savedForLater: true })
    toast.success('Saved for later')
    load()
    refreshCartCount()
  }

  if (!user) {
    return <EmptyState icon={<ShoppingBag />} title="Your cart is waiting" desc="Sign in to add items and check out." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />
  }

  const tax = Math.round(subtotal * 0.05)
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag />}
        title="Your cart is waiting for something great"
        desc="Browse our catalog or ask the Buywise AI to find the perfect product."
        action={<div className="flex gap-2"><Button onClick={() => navigate({ name: 'catalog' })}>Browse products</Button><Button variant="outline" onClick={() => setAiOpen(true)}><Sparkles className="mr-2 h-4 w-4" /> Ask AI</Button></div>}
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Your Cart</h1>
          <p className="text-sm text-muted-foreground">{items.length} item{items.length !== 1 ? 's' : ''} in your cart</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-3 md:col-span-2">
          {items.map((item) => (
            <Card key={item.id} className="flex gap-3 p-3 transition-shadow hover:shadow-md">
              <button onClick={() => navigate({ name: 'product', id: item.productId })} className="shrink-0">
                <ProductImage name={item.product.name} images={item.product.images} className="h-24 w-24 rounded-xl" />
              </button>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.product.brand?.name}</p>
                    <button onClick={() => navigate({ name: 'product', id: item.productId })} className="line-clamp-2 text-left text-sm font-medium hover:text-primary">{item.product.name}</button>
                  </div>
                  <button onClick={() => remove(item.id)} className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2">
                  <div className="flex items-center rounded-lg border border-border bg-card">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-l-lg rounded-r-none" onClick={() => updateQty(item.id, item.quantity - 1)}><Minus className="h-3 w-3" /></Button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-r-lg rounded-l-none" onClick={() => updateQty(item.id, item.quantity + 1)}><Plus className="h-3 w-3" /></Button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                    {item.product.compareAtPrice && <p className="text-xs text-muted-foreground line-through">{formatPrice(item.product.compareAtPrice * item.quantity)}</p>}
                  </div>
                </div>
                <button onClick={() => saveForLater(item.id)} className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"><Save className="h-3 w-3" /> Save for later</button>
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="p-5 md:sticky md:top-32">
            <h3 className="mb-3 font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-medium">{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5% GST)</span><span className="font-medium">{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">{shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shipping)}</span></div>
              <Separator className="my-3" />
              <div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <Button className="mt-4 w-full rounded-xl" onClick={() => navigate({ name: 'checkout' })}>Proceed to checkout <ArrowRight className="ml-2 h-4 w-4" /></Button>

            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Free delivery over ₹999</p>
              <p className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-primary" /> Secure checkout</p>
            </div>
          </Card>

          <Card className="border-violet-200/60 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-fuchsia-950/30">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">Smart Cart</p>
            </div>
            <p className="mt-2 text-xs text-violet-800/90 dark:text-violet-300/90">Let your AI partner check for duplicates, cheaper alternatives and savings.</p>
            <Button size="sm" variant="outline" className="mt-3 w-full rounded-full border-violet-300 text-violet-700 hover:bg-violet-100 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-950/50" onClick={() => setAiOpen(true)}>
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Optimise my cart
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action?: React.ReactNode }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">{icon}</div>
      <h2 className="mt-5 text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
