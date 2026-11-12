'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Shield, Truck, Sparkles, Save } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { toast } from 'sonner'

export function CartView() {
  const { navigate, user, setAuthOpen, setAiOpen } = useStore()
  const [items, setItems] = useState<any[]>([])
  const [savedItems, setSavedItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const r = await api.cart.get()
      setItems(r.items || [])
      setSavedItems(r.savedItems || [])
      setSubtotal(r.subtotal)
    } catch {
      /* not logged in */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

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

  async function moveToCart(itemId: string) {
    await api.cart.update(itemId, { savedForLater: false })
    toast.success('Moved back to cart')
    load()
    refreshCartCount()
  }

  if (!user) {
    return (
      <EmptyState
        icon={<ShoppingBag />}
        title="Your cart is waiting"
        desc="Sign in to add items and check out."
        action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>}
      />
    )
  }

  const tax = Math.round(subtotal * 0.05)
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + tax + shipping

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (items.length === 0 && savedItems.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag />}
        title="Your shopping cart is empty"
        desc="Explore our smart catalog and find products tailored for you."
        action={<Button onClick={() => navigate({ name: 'catalog' })}>Explore catalog</Button>}
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Shopping Cart</h1>
          <p className="text-xs text-muted-foreground">{items.length} items in your active bag</p>
        </div>
        <Button variant="ghost" onClick={() => navigate({ name: 'catalog' })}>
          Continue shopping
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Active items list */}
        <div className="space-y-3 md:col-span-2">
          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground text-sm">No items currently in active bag.</p>
            </Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="flex gap-4 p-4">
                <ProductImage
                  name={item.product.name}
                  images={item.product.images}
                  className="h-24 w-24 shrink-0 rounded-xl"
                />
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        {item.product.brand && (
                          <p className="text-xs text-muted-foreground">{item.product.brand.name}</p>
                        )}
                        <button
                          onClick={() => navigate({ name: 'product', id: item.product.id })}
                          className="font-medium hover:text-primary text-left text-sm"
                        >
                          {item.product.name}
                        </button>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-end justify-between pt-2">
                    <div className="flex items-center rounded-lg border border-border">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-l-lg rounded-r-none"
                        onClick={() => updateQty(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-r-lg rounded-l-none"
                        onClick={() => updateQty(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatPrice(item.product.price * item.quantity)}</p>
                      {item.product.compareAtPrice && (
                        <p className="text-xs text-muted-foreground line-through">
                          {formatPrice(item.product.compareAtPrice * item.quantity)}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => saveForLater(item.id)}
                    className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                  >
                    <Save className="h-3 w-3" /> Save for later
                  </button>
                </div>
              </Card>
            ))
          )}

          {/* Saved for later section */}
          {savedItems.length > 0 && (
            <div className="mt-8 border-t border-border/60 pt-6">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" /> Saved for Later ({savedItems.length})
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {savedItems.map((item) => (
                  <Card key={item.id} className="flex gap-3 p-3 items-center">
                    <ProductImage
                      name={item.product.name}
                      images={item.product.images}
                      className="h-16 w-16 rounded-lg shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate">{item.product.name}</p>
                      <p className="text-sm font-bold text-primary">{formatPrice(item.product.price)}</p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-2"
                          onClick={() => moveToCart(item.id)}
                        >
                          Move to Cart
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs px-2 text-destructive"
                          onClick={() => remove(item.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <Card className="p-5 md:sticky md:top-32">
            <h3 className="mb-3 font-semibold">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (5% GST)</span>
                <span className="font-medium">{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? <span className="text-emerald-600">FREE</span> : formatPrice(shipping)}
                </span>
              </div>
              <Separator className="my-3" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Button
              className="mt-4 w-full rounded-xl"
              disabled={items.length === 0}
              onClick={() => navigate({ name: 'checkout' })}
            >
              Proceed to checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-primary" /> Free delivery over ₹999
              </p>
              <p className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" /> Secure checkout
              </p>
            </div>
          </Card>

          <Card className="border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Smart Cart</p>
            </div>
            <p className="mt-2 text-xs text-emerald-800/90 dark:text-emerald-300/90">
              Let your AI partner check for duplicates, cheaper alternatives and savings.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3 w-full rounded-full border-emerald-300 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
              onClick={() => setAiOpen(true)}
            >
              <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Optimise my cart
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  desc,
  action,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        {icon}
      </div>
      <h2 className="mt-5 text-xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
