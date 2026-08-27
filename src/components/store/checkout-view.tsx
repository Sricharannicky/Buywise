'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, MapPin, CreditCard, ShoppingBag, Loader2, ChevronLeft } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'

export function CheckoutView() {
  const { navigate, user, setAuthOpen } = useStore()
  const [items, setItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState<any>(null)
  const [newAddr, setNewAddr] = useState({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
  const [showNewAddr, setShowNewAddr] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const [cart, addr] = await Promise.all([api.cart.get(), api.addresses.list()])
      setItems(cart.items)
      setSubtotal(cart.subtotal)
      setAddresses(addr.addresses)
      const def = addr.addresses.find((a: any) => a.isDefault) || addr.addresses[0]
      if (def) setSelectedAddress(def.id)
    } catch { /* */ } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  async function addAddress() {
    if (!newAddr.fullName || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.state || !newAddr.pincode) {
      toast.error('Please fill all required fields'); return
    }
    try {
      const r = await api.addresses.create({ ...newAddr, isDefault: addresses.length === 0 })
      setAddresses((a) => [r.address, ...a])
      setSelectedAddress(r.address.id)
      setShowNewAddr(false)
      setNewAddr({ fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' })
      toast.success('Address added')
    } catch (e: any) { toast.error(e.message) }
  }

  async function placeOrder() {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return }
    setPlacing(true)
    try {
      const r = await api.orders.create({ addressId: selectedAddress, paymentMethod })
      await refreshCartCount()
      setPlaced(r.order)
      toast.success('Order placed successfully!')
    } catch (e: any) { toast.error(e.message) } finally { setPlacing(false) }
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h2 className="text-xl font-bold">Please sign in to checkout</h2>
        <Button className="mt-4" onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>
      </div>
    )
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-5 text-2xl font-bold">Order confirmed!</h2>
        <p className="mt-2 text-muted-foreground">Thank you for your purchase. Your order <span className="font-semibold text-foreground">{placed.orderNumber}</span> has been placed.</p>
        <Card className="mt-6 p-4 text-left">
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total</span><span className="font-bold">{formatPrice(placed.total)}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Payment</span><span>{placed.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Items</span><span>{placed.items.length}</span></div>
        </Card>
        <div className="mt-6 flex gap-2 justify-center">
          <Button onClick={() => navigate({ name: 'orders' })}>View my orders</Button>
          <Button variant="outline" onClick={() => navigate({ name: 'home' })}>Continue shopping</Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-4 py-8"><Skeleton className="h-96 rounded-xl" /></div>
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold">Your cart is empty</h2>
        <Button className="mt-4" onClick={() => navigate({ name: 'catalog' })}>Browse products</Button>
      </div>
    )
  }

  const tax = Math.round(subtotal * 0.05)
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + tax + shipping

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <button onClick={() => navigate({ name: 'cart' })} className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ChevronLeft className="h-4 w-4" /> Back to cart</button>
      <h1 className="mb-6 text-2xl font-bold md:text-3xl">Checkout</h1>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          {/* Address */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2"><MapPin className="h-5 w-5 text-primary" /><h3 className="font-semibold">Delivery address</h3></div>
            {addresses.length > 0 && (
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress} className="space-y-2">
                {addresses.map((a) => (
                  <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${selectedAddress === a.id ? 'border-primary bg-accent/50' : 'border-border hover:bg-accent/30'}`}>
                    <RadioGroupItem value={a.id} className="mt-1" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{a.fullName} <span className="text-muted-foreground">· {a.phone}</span></p>
                      <p className="text-muted-foreground">{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}</p>
                    </div>
                    {a.isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Default</span>}
                  </label>
                ))}
              </RadioGroup>
            )}
            {showNewAddr ? (
              <div className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-xs">Full name *</Label><Input value={newAddr.fullName} onChange={(e) => setNewAddr({ ...newAddr, fullName: e.target.value })} /></div>
                  <div><Label className="text-xs">Phone *</Label><Input value={newAddr.phone} onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })} /></div>
                </div>
                <div><Label className="text-xs">Address line 1 *</Label><Input value={newAddr.line1} onChange={(e) => setNewAddr({ ...newAddr, line1: e.target.value })} /></div>
                <div><Label className="text-xs">Address line 2</Label><Input value={newAddr.line2} onChange={(e) => setNewAddr({ ...newAddr, line2: e.target.value })} /></div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-xs">City *</Label><Input value={newAddr.city} onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })} /></div>
                  <div><Label className="text-xs">State *</Label><Input value={newAddr.state} onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })} /></div>
                  <div><Label className="text-xs">Pincode *</Label><Input value={newAddr.pincode} onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })} /></div>
                </div>
                <div className="flex gap-2"><Button size="sm" onClick={addAddress}>Save address</Button><Button size="sm" variant="ghost" onClick={() => setShowNewAddr(false)}>Cancel</Button></div>
              </div>
            ) : (
              <Button variant="outline" size="sm" className="mt-3" onClick={() => setShowNewAddr(true)}>+ Add new address</Button>
            )}
          </Card>

          {/* Payment */}
          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2"><CreditCard className="h-5 w-5 text-primary" /><h3 className="font-semibold">Payment method</h3></div>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-2">
              {[
                { value: 'COD', label: 'Cash on Delivery', desc: 'Pay when you receive' },
                { value: 'CARD', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                { value: 'UPI', label: 'UPI', desc: 'GPay, PhonePe, Paytm' },
              ].map((p) => (
                <label key={p.value} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${paymentMethod === p.value ? 'border-primary bg-accent/50' : 'border-border hover:bg-accent/30'}`}>
                  <RadioGroupItem value={p.value} />
                  <div className="text-sm"><p className="font-medium">{p.label}</p><p className="text-xs text-muted-foreground">{p.desc}</p></div>
                </label>
              ))}
            </RadioGroup>
            <p className="mt-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">🔒 This is a demo store. No real payment will be processed.</p>
          </Card>
        </div>

        {/* Summary */}
        <div>
          <Card className="sticky top-32 p-5">
            <h3 className="mb-3 font-semibold">Order summary</h3>
            <div className="max-h-48 space-y-2 overflow-y-auto scrollbar-thin">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <span className="text-lg">{JSON.parse(item.product.images || '["📦"]')[0]}</span>
                  <span className="flex-1 truncate">{item.product.name}</span>
                  <span className="text-muted-foreground">×{item.quantity}</span>
                  <span className="font-medium">{formatPrice(item.product.price * item.quantity)}</span>
                </div>
              ))}
            </div>
            <Separator className="my-3" />
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tax (5%)</span><span>{formatPrice(tax)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <Separator className="my-2" />
              <div className="flex justify-between text-base font-bold"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <Button className="mt-4 w-full" onClick={placeOrder} disabled={placing || !selectedAddress}>
              {placing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing order…</> : 'Place order'}
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">By placing your order you agree to our terms.</p>
          </Card>
        </div>
      </div>
    </div>
  )
}
