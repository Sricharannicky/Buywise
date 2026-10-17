'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, ChevronRight, MapPin, ShoppingBag } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { EmptyState } from './cart-view'

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-amber-100 text-amber-700',
  SHIPPED: 'bg-violet-100 text-violet-700',
  DELIVERED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-rose-100 text-rose-700',
  PENDING: 'bg-muted text-muted-foreground',
}

export function OrdersView() {
  const { navigate, user, setAuthOpen } = useStore()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { return }
    api.orders.list().then((r) => setOrders(r.orders)).finally(() => setLoading(false))
  }, [user])

  if (!user) {
    return <EmptyState icon={<Package />} title="Sign in to view orders" desc="Your order history will appear here." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />
  }

  if (loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  }

  if (orders.length === 0) {
    return <EmptyState icon={<Package />} title="No orders yet" desc="When you place your first order, it will show up here." action={<Button onClick={() => navigate({ name: 'catalog' })}>Start shopping</Button>} />
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">My Orders</h1>
      <div className="space-y-3">
        {orders.map((o) => (
          <Card key={o.id} className="overflow-hidden p-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={STATUS_COLORS[o.status] || 'bg-muted'} variant="secondary">{o.status}</Badge>
                <Badge variant="outline" className={o.paymentStatus === 'PAID' ? 'border-emerald-300 text-emerald-700' : ''}>{o.paymentStatus === 'PAID' ? 'Paid' : 'COD'}</Badge>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {o.items.map((it: any) => (
                <div key={it.id} className="flex items-center gap-3 text-sm">
                  <ProductImage name={it.productName} images={it.productImage} className="h-10 w-10 shrink-0 rounded-lg" />
                  <button onClick={() => navigate({ name: 'product', id: it.productId })} className="flex-1 truncate text-left hover:text-primary">{it.productName}</button>
                  <span className="text-muted-foreground">×{it.quantity}</span>
                  <span className="font-medium">{formatPrice(it.total)}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-4 py-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><MapPin className="h-3 w-3" /> {o.shipCity}, {o.shipState}</div>
              <div className="flex items-center gap-3">
                <span className="font-bold">{formatPrice(o.total)}</span>
                <Button size="sm" variant="outline" onClick={() => navigate({ name: 'catalog' })}>Buy again</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
