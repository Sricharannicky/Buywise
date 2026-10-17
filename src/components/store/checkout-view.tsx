'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CheckCircle2,
  MapPin,
  CreditCard,
  ShoppingBag,
  Loader2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Shield,
  Lock,
  Truck,
  Wallet,
  Tag,
  Check,
  Package,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice, parseImages } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { toast } from 'sonner'

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SHIPPING_METHODS = [
  {
    id: 'standard',
    label: 'Standard Delivery',
    desc: '5-7 business days',
    cost: 0,
    icon: Truck,
  },
  {
    id: 'express',
    label: 'Express Delivery',
    desc: '2-3 business days',
    cost: 99,
    icon: Truck,
  },
  {
    id: 'sameday',
    label: 'Same Day Delivery',
    desc: 'Today · select pincodes only',
    cost: 199,
    icon: Truck,
  },
] as const

const PAYMENT_METHODS = [
  {
    value: 'COD',
    label: 'Cash on Delivery',
    desc: 'Pay when you receive',
    icon: Wallet,
  },
  {
    value: 'CARD',
    label: 'Credit / Debit Card',
    desc: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
  },
  {
    value: 'UPI',
    label: 'UPI',
    desc: 'GPay, PhonePe, Paytm',
    icon: Wallet,
  },
] as const

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Singapore',
  'United Arab Emirates',
  'Australia',
  'Canada',
] as const

const EMPTY_ADDR = {
  company: '',
  firstName: '',
  lastName: '',
  email: '',
  vatId: '',
  street: '',
  country: 'India',
  state: '',
  city: '',
  zip: '',
  phone: '',
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CheckoutView() {
  const { navigate, user, setAuthOpen } = useStore()

  // --- Cart ---
  const [items, setItems] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // --- Address ---
  const [addresses, setAddresses] = useState<any[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [newAddr, setNewAddr] = useState(EMPTY_ADDR)
  const [useSameForShipping, setUseSameForShipping] = useState(true)

  // --- Shipping ---
  const [shippingMethod, setShippingMethod] = useState<string>('')

  // --- Payment ---
  const [paymentMethod, setPaymentMethod] = useState('COD')
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [upiId, setUpiId] = useState('')

  // --- Coupon ---
  const [couponInput, setCouponInput] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)
  const [couponApplied, setCouponApplied] = useState<{
    code: string
    discount: number
    type: 'percent' | 'flat'
  } | null>(null)

  // --- Steps ---
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  // --- Order ---
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState<any>(null)

  // --- Mobile summary ---
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  // -------------------------------------------------------------------------

  async function load() {
    setLoading(true)
    try {
      const [cart, addr] = await Promise.all([api.cart.get(), api.addresses.list()])
      setItems(cart.items)
      setSubtotal(cart.subtotal)
      setAddresses(addr.addresses)
      const def = addr.addresses.find((a: any) => a.isDefault) || addr.addresses[0]
      if (def) setSelectedAddress(def.id)
    } catch {
      /* not logged in / network error */
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // --- Derived values ---

  const discount = couponApplied?.discount ?? 0
  const shippingCost = useMemo(() => {
    const m = SHIPPING_METHODS.find((m) => m.id === shippingMethod)
    return m?.cost ?? 0
  }, [shippingMethod])
  const taxableBase = Math.max(0, subtotal - discount)
  const tax = Math.round(taxableBase * 0.05)
  const total = taxableBase + tax + shippingCost

  const selectedAddrObj = addresses.find((a) => a.id === selectedAddress)
  const selectedShippingObj = SHIPPING_METHODS.find((m) => m.id === shippingMethod)
  const paymentLabel =
    paymentMethod === 'COD'
      ? 'Cash on Delivery'
      : paymentMethod === 'CARD'
        ? 'Credit / Debit Card'
        : 'UPI'

  // --- Step helpers ---

  function isStepComplete(step: number): boolean {
    if (step === 1) return !!selectedAddress
    if (step === 2) return !!shippingMethod
    if (step === 3) return !!paymentMethod
    return false
  }

  function canExpand(step: number): boolean {
    return completedSteps.has(step) || step === currentStep
  }

  function handleStepClick(step: number) {
    if (!canExpand(step)) return
    setCurrentStep(step)
    setTimeout(() => {
      document
        .getElementById(`checkout-step-${step}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  function proceedToNext(current: number) {
    setCompletedSteps((prev) => {
      const next = new Set(prev)
      next.add(current)
      return next
    })
    const next = Math.min(4, current + 1)
    setCurrentStep(next)
    setTimeout(() => {
      document
        .getElementById(`checkout-step-${next}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  function editStep(step: number) {
    setCurrentStep(step)
    setTimeout(() => {
      document
        .getElementById(`checkout-step-${step}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 60)
  }

  // --- Address actions ---

  async function addAddress() {
    if (
      !newAddr.firstName ||
      !newAddr.lastName ||
      !newAddr.email ||
      !newAddr.street ||
      !newAddr.country ||
      !newAddr.state ||
      !newAddr.city ||
      !newAddr.zip ||
      !newAddr.phone
    ) {
      toast.error('Please fill all required fields')
      return
    }
    try {
      const fullName = `${newAddr.firstName} ${newAddr.lastName}`.trim()
      const line2Parts = [
        newAddr.company && `Company: ${newAddr.company}`,
        newAddr.vatId && `VAT: ${newAddr.vatId}`,
        newAddr.email,
      ].filter(Boolean)
      const payload = {
        fullName,
        phone: newAddr.phone,
        line1: newAddr.street,
        line2: line2Parts.length ? line2Parts.join(' · ') : null,
        city: newAddr.city,
        state: newAddr.state,
        pincode: newAddr.zip,
        isDefault: addresses.length === 0,
      }
      const r = await api.addresses.create(payload)
      setAddresses((a) => [r.address, ...a])
      setSelectedAddress(r.address.id)
      setShowNewAddr(false)
      setNewAddr(EMPTY_ADDR)
      toast.success('Address added')
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  // --- Coupon ---

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase()
    if (!code) {
      toast.error('Enter a coupon code')
      return
    }
    if (code === 'SAVE10') {
      const d = Math.round(subtotal * 0.1)
      if (d <= 0) {
        toast.error('Cart total is too low for this coupon')
        return
      }
      setCouponApplied({ code, discount: d, type: 'percent' })
      toast.success(`Coupon applied! You saved ${formatPrice(d)}`)
    } else if (code === 'FLAT500') {
      const d = Math.min(500, subtotal)
      if (d <= 0) {
        toast.error('Cart total is too low for this coupon')
        return
      }
      setCouponApplied({ code, discount: d, type: 'flat' })
      toast.success(`Coupon applied! You saved ${formatPrice(d)}`)
    } else {
      toast.error('Invalid coupon code')
      return
    }
    setCouponInput('')
    setCouponOpen(false)
  }

  function removeCoupon() {
    setCouponApplied(null)
    toast.info('Coupon removed')
  }

  // --- Place order ---

  async function placeOrder() {
    if (!selectedAddress) {
      toast.error('Please select a delivery address')
      editStep(1)
      return
    }
    if (!shippingMethod) {
      toast.error('Please select a shipping method')
      editStep(2)
      return
    }
    if (!paymentMethod) {
      toast.error('Please select a payment method')
      editStep(3)
      return
    }
    if (paymentMethod === 'CARD') {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCvv.trim() || !cardName.trim()) {
        toast.error('Please fill in all card details')
        editStep(3)
        return
      }
    }
    if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast.error('Please enter a valid UPI ID')
        editStep(3)
        return
      }
    }
    setPlacing(true)
    try {
      const r = await api.orders.create({ addressId: selectedAddress, paymentMethod })
      await refreshCartCount()
      setPlaced(r.order)
      toast.success('Order placed successfully!')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setPlacing(false)
    }
  }

  // -------------------------------------------------------------------------
  // Early returns
  // -------------------------------------------------------------------------

  // Not signed in → guest banner screen
  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => navigate({ name: 'cart' })}
          className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" /> Back to cart
        </button>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-center sm:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h1 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Checkout</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Checking out as guest. Sign in for faster checkout.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setAuthOpen(true, 'login')}
                className="gap-2 bg-background border-border/80 shadow-xs hover:bg-muted/60"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </Button>
              <Button onClick={() => setAuthOpen(true, 'login')}>
                <Shield className="mr-2 h-4 w-4" /> Sign in with Email
              </Button>
              <Button variant="ghost" onClick={() => navigate({ name: 'catalog' })}>
                Continue browsing
              </Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Order placed → confirmation screen
  if (placed) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 animate-scale-in">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="mt-5 text-2xl font-bold tracking-tight">Order confirmed!</h2>
        <p className="mt-2 text-muted-foreground">
          Thank you for your purchase. Your order{' '}
          <span className="font-semibold text-foreground">{placed.orderNumber}</span> has been placed.
        </p>
        <Card className="mt-6 p-5 text-left">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-bold">{formatPrice(placed.total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span>{placed.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Paid'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span>{placed.items.length}</span>
          </div>
          <Separator className="my-3" />
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Truck className="h-3.5 w-3.5 text-primary" /> Expected delivery in 2-3 business days
          </p>
        </Card>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => navigate({ name: 'orders' })}>View my orders</Button>
          <Button variant="outline" onClick={() => navigate({ name: 'home' })}>
            Continue shopping
          </Button>
        </div>
      </div>
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8">
        <Skeleton className="mb-4 h-10 w-48" />
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-3 md:col-span-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-xl font-bold">Your cart is empty</h2>
        <Button className="mt-4" onClick={() => navigate({ name: 'catalog' })}>
          Browse products
        </Button>
      </div>
    )
  }

  // -------------------------------------------------------------------------
  // Main multi-step checkout
  // -------------------------------------------------------------------------

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 pb-28 md:pb-8">
      <button
        onClick={() => navigate({ name: 'cart' })}
        className="mb-4 flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" /> Back to cart
      </button>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Checkout</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete the steps below to place your order.
          </p>
        </div>
      </div>

      {/* Guest / signed-in banner */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
        <div className="flex items-center gap-2.5 text-sm">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Shield className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Signed in as {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              {user.firstName} {user.lastName} · secure checkout
            </p>
          </div>
        </div>
        <button
          onClick={() => setAuthOpen(true, 'login')}
          className="text-xs font-medium text-primary hover:underline"
        >
          Switch account
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* -------------------------------------------- Steps (left) -------- */}
        <div className="space-y-3 md:col-span-2">
          {/* ---------- Step 1: Address ---------- */}
          <StepCard
            stepNumber={1}
            title="Address"
            icon={MapPin}
            isCompleted={completedSteps.has(1)}
            isCurrent={currentStep === 1}
            isDisabled={!canExpand(1)}
            summary={
              selectedAddrObj
                ? `${selectedAddrObj.fullName}, ${selectedAddrObj.city}`
                : undefined
            }
            onToggle={() => handleStepClick(1)}
          >
            {addresses.length > 0 && (
              <RadioGroup
                value={selectedAddress}
                onValueChange={setSelectedAddress}
                className="space-y-2"
              >
                {addresses.map((a) => (
                  <label
                    key={a.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all ${
                      selectedAddress === a.id
                        ? 'border-primary bg-accent/50 ring-1 ring-primary/30'
                        : 'border-border hover:bg-accent/30'
                    }`}
                  >
                    <RadioGroupItem value={a.id} className="mt-1" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">
                        {a.fullName} <span className="text-muted-foreground">· {a.phone}</span>
                      </p>
                      <p className="text-muted-foreground">
                        {a.line1}
                        {a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} - {a.pincode}
                      </p>
                    </div>
                    {a.isDefault && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Default
                      </span>
                    )}
                  </label>
                ))}
              </RadioGroup>
            )}

            {showNewAddr ? (
              <div className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Company Name</Label>
                    <Input
                      value={newAddr.company}
                      onChange={(e) => setNewAddr({ ...newAddr, company: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">VAT ID</Label>
                    <Input
                      value={newAddr.vatId}
                      onChange={(e) => setNewAddr({ ...newAddr, vatId: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">First Name *</Label>
                    <Input
                      value={newAddr.firstName}
                      onChange={(e) => setNewAddr({ ...newAddr, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Last Name *</Label>
                    <Input
                      value={newAddr.lastName}
                      onChange={(e) => setNewAddr({ ...newAddr, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Email *</Label>
                  <Input
                    type="email"
                    value={newAddr.email}
                    onChange={(e) => setNewAddr({ ...newAddr, email: e.target.value })}
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <Label className="text-xs">Street Address *</Label>
                  <Input
                    value={newAddr.street}
                    onChange={(e) => setNewAddr({ ...newAddr, street: e.target.value })}
                    placeholder="House no, building, street name"
                  />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">Country *</Label>
                    <Select
                      value={newAddr.country}
                      onValueChange={(v) => setNewAddr({ ...newAddr, country: v })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs">State *</Label>
                    <Input
                      value={newAddr.state}
                      onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                      placeholder="e.g. Karnataka"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <Label className="text-xs">City *</Label>
                    <Input
                      value={newAddr.city}
                      onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Zip / Postcode *</Label>
                    <Input
                      value={newAddr.zip}
                      onChange={(e) => setNewAddr({ ...newAddr, zip: e.target.value })}
                      placeholder="6-digit pincode"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Telephone *</Label>
                  <Input
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-accent/40 px-3 py-2 text-sm">
                  <Checkbox
                    checked={useSameForShipping}
                    onCheckedChange={(v) => setUseSameForShipping(v === true)}
                  />
                  <span>Use this address for shipping as well</span>
                </label>

                <div className="flex gap-2">
                  <Button size="sm" onClick={addAddress}>
                    Save address
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setShowNewAddr(false)
                      setNewAddr(EMPTY_ADDR)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => setShowNewAddr(true)}
              >
                + Add new address
              </Button>
            )}

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                {selectedAddress
                  ? 'Address selected — click Proceed to continue.'
                  : 'Select or add an address to continue.'}
              </p>
              <Button
                size="sm"
                disabled={!selectedAddress}
                onClick={() => proceedToNext(1)}
              >
                Proceed <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </StepCard>

          {/* ---------- Step 2: Shipping ---------- */}
          <StepCard
            stepNumber={2}
            title="Shipping"
            icon={Truck}
            isCompleted={completedSteps.has(2)}
            isCurrent={currentStep === 2}
            isDisabled={!canExpand(2)}
            summary={
              selectedShippingObj
                ? `${selectedShippingObj.label} · ${
                    selectedShippingObj.cost === 0 ? 'FREE' : formatPrice(selectedShippingObj.cost)
                  }`
                : undefined
            }
            onToggle={() => handleStepClick(2)}
          >
            <RadioGroup
              value={shippingMethod}
              onValueChange={setShippingMethod}
              className="space-y-2"
            >
              {SHIPPING_METHODS.map((m) => (
                <label
                  key={m.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                    shippingMethod === m.id
                      ? 'border-primary bg-accent/50 ring-1 ring-primary/30'
                      : 'border-border hover:bg-accent/30'
                  }`}
                >
                  <RadioGroupItem value={m.id} />
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                    <m.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium">{m.label}</p>
                    <p className="text-xs text-muted-foreground">{m.desc}</p>
                  </div>
                  <div className="text-right text-sm font-semibold">
                    {m.cost === 0 ? (
                      <span className="text-emerald-600">FREE</span>
                    ) : (
                      formatPrice(m.cost)
                    )}
                  </div>
                </label>
              ))}
            </RadioGroup>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                {shippingMethod
                  ? 'Shipping method selected.'
                  : 'Select a shipping method to continue.'}
              </p>
              <Button size="sm" disabled={!shippingMethod} onClick={() => proceedToNext(2)}>
                Proceed <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </StepCard>

          {/* ---------- Step 3: Payment ---------- */}
          <StepCard
            stepNumber={3}
            title="Payment"
            icon={CreditCard}
            isCompleted={completedSteps.has(3)}
            isCurrent={currentStep === 3}
            isDisabled={!canExpand(3)}
            summary={paymentLabel}
            onToggle={() => handleStepClick(3)}
          >
            <RadioGroup
              value={paymentMethod}
              onValueChange={setPaymentMethod}
              className="space-y-2"
            >
              {PAYMENT_METHODS.map((p) => (
                <label
                  key={p.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-all ${
                    paymentMethod === p.value
                      ? 'border-primary bg-accent/50 ring-1 ring-primary/30'
                      : 'border-border hover:bg-accent/30'
                  }`}
                >
                  <RadioGroupItem value={p.value} />
                  <div className="flex flex-1 items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
                      <p.icon className="h-4 w-4" />
                    </div>
                    <div className="text-sm">
                      <p className="font-medium">{p.label}</p>
                      <p className="text-xs text-muted-foreground">{p.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </RadioGroup>

            {/* Card form */}
            {paymentMethod === 'CARD' && (
              <div className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-4 animate-fade-in">
                <div>
                  <Label className="text-xs">Card Number</Label>
                  <Input
                    inputMode="numeric"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4111 1111 1111 1111"
                  />
                </div>
                <div>
                  <Label className="text-xs">Name on Card</Label>
                  <Input
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Cardholder name"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Expiry (MM/YY)</Label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder="08/27"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CVV</Label>
                    <Input
                      type="password"
                      inputMode="numeric"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="•••"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI form */}
            {paymentMethod === 'UPI' && (
              <div className="mt-3 space-y-3 rounded-xl border border-dashed border-border p-4 animate-fade-in">
                <div>
                  <Label className="text-xs">UPI ID</Label>
                  <Input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@bank"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  You will be redirected to your UPI app to approve the payment.
                </p>
              </div>
            )}

            <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              <Lock className="h-3.5 w-3.5" /> This is a demo store. No real payment will be processed.
            </p>

            <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">Payment method selected.</p>
              <Button size="sm" onClick={() => proceedToNext(3)}>
                Proceed <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </StepCard>

          {/* ---------- Step 4: Review ---------- */}
          <StepCard
            stepNumber={4}
            title="Review"
            icon={Package}
            isCompleted={completedSteps.has(4)}
            isCurrent={currentStep === 4}
            isDisabled={!canExpand(4)}
            onToggle={() => handleStepClick(4)}
          >
            {/* Items */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Items in this order</h4>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-border p-2.5"
                  >
                    <ProductImage
                      name={item.product.name}
                      images={item.product.images}
                      className="h-14 w-14 shrink-0 rounded-lg"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.product.price)} · Qty {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Selected summaries */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> Address
                  </p>
                  <button
                    onClick={() => editStep(1)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {selectedAddrObj ? (
                  <div className="mt-1.5 text-sm">
                    <p className="font-medium">{selectedAddrObj.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedAddrObj.line1}
                      {selectedAddrObj.line2 ? `, ${selectedAddrObj.line2}` : ''}
                      <br />
                      {selectedAddrObj.city}, {selectedAddrObj.state} - {selectedAddrObj.pincode}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      📞 {selectedAddrObj.phone}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">No address selected</p>
                )}
              </div>

              <div className="rounded-xl border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Truck className="h-3.5 w-3.5" /> Shipping
                  </p>
                  <button
                    onClick={() => editStep(2)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
                {selectedShippingObj ? (
                  <div className="mt-1.5 text-sm">
                    <p className="font-medium">{selectedShippingObj.label}</p>
                    <p className="text-xs text-muted-foreground">{selectedShippingObj.desc}</p>
                    <p className="mt-0.5 text-xs font-semibold text-emerald-600">
                      {selectedShippingObj.cost === 0
                        ? 'FREE'
                        : formatPrice(selectedShippingObj.cost)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-1.5 text-xs text-muted-foreground">No shipping selected</p>
                )}
              </div>

              <div className="rounded-xl border border-border p-3 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <CreditCard className="h-3.5 w-3.5" /> Payment
                  </p>
                  <button
                    onClick={() => editStep(3)}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </button>
                </div>
                <p className="mt-1.5 text-sm font-medium">{paymentLabel}</p>
                {paymentMethod === 'CARD' && cardNumber && (
                  <p className="text-xs text-muted-foreground">
                    Card ending •••• {cardNumber.replace(/\s/g, '').slice(-4)}
                  </p>
                )}
                {paymentMethod === 'UPI' && upiId && (
                  <p className="text-xs text-muted-foreground">UPI: {upiId}</p>
                )}
              </div>
            </div>

            {/* Place order */}
            <div className="mt-5 flex flex-col items-center gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 text-primary" /> By placing the order you agree to our
                terms & conditions.
              </p>
              <Button
                className="w-full sm:w-auto"
                size="lg"
                onClick={placeOrder}
                disabled={placing}
              >
                {placing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Place Order · {formatPrice(total)}
                  </>
                )}
              </Button>
            </div>
          </StepCard>
        </div>

        {/* -------------------------------------------- Summary (right) ---- */}
        <div className="hidden md:block">
          <SummaryContent
            items={items}
            subtotal={subtotal}
            discount={discount}
            couponApplied={couponApplied}
            couponInput={couponInput}
            couponOpen={couponOpen}
            shippingCost={shippingCost}
            tax={tax}
            total={total}
            onCouponInputChange={setCouponInput}
            onToggleCoupon={() => setCouponOpen((v) => !v)}
            onApplyCoupon={applyCoupon}
            onRemoveCoupon={removeCoupon}
          />
        </div>
      </div>

      {/* -------------------------------------------- Mobile summary bar ---- */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur md:hidden">
        <button
          onClick={() => setMobileSummaryOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3"
        >
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Order total</p>
            <p className="text-base font-bold">{formatPrice(total)}</p>
          </div>
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            {mobileSummaryOpen ? 'Hide' : 'View'} summary
            <ChevronDown
              className={`h-4 w-4 transition-transform ${mobileSummaryOpen ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
        {mobileSummaryOpen && (
          <div className="max-h-[60vh] overflow-y-auto border-t border-border p-4 animate-fade-in">
            <SummaryContent
              items={items}
              subtotal={subtotal}
              discount={discount}
              couponApplied={couponApplied}
              couponInput={couponInput}
              couponOpen={couponOpen}
              shippingCost={shippingCost}
              tax={tax}
              total={total}
              onCouponInputChange={setCouponInput}
              onToggleCoupon={() => setCouponOpen((v) => !v)}
              onApplyCoupon={applyCoupon}
              onRemoveCoupon={removeCoupon}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// StepCard — accordion item
// ---------------------------------------------------------------------------

function StepCard({
  stepNumber,
  title,
  icon: Icon,
  isCompleted,
  isCurrent,
  isDisabled,
  summary,
  onToggle,
  children,
}: {
  stepNumber: number
  title: string
  icon: React.ComponentType<{ className?: string }>
  isCompleted: boolean
  isCurrent: boolean
  isDisabled: boolean
  summary?: string
  onToggle: () => void
  children: React.ReactNode
}) {
  const expanded = isCurrent
  return (
    <Card
      id={`checkout-step-${stepNumber}`}
      className={`overflow-hidden transition-all ${
        isDisabled ? 'opacity-60' : ''
      } ${expanded ? 'ring-1 ring-primary/30' : ''}`}
    >
      <button
        type="button"
        disabled={isDisabled}
        onClick={onToggle}
        className={`flex w-full items-center gap-3 p-4 text-left transition-colors ${
          isDisabled ? 'cursor-not-allowed' : 'hover:bg-accent/40'
        }`}
      >
        {/* Step number / checkmark */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-all ${
            isCompleted
              ? 'bg-emerald-500 text-white'
              : isCurrent
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground'
          }`}
        >
          {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
        </div>
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-semibold ${isDisabled ? 'text-muted-foreground' : ''}`}>
              {title}
            </p>
            {isCompleted && summary && (
              <p className="truncate text-xs text-muted-foreground">{summary}</p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        />
      </button>
      {expanded && (
        <div className="border-t border-border p-4 animate-fade-in">{children}</div>
      )}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// SummaryContent — shared between desktop sidebar and mobile collapsible
// ---------------------------------------------------------------------------

function SummaryContent({
  items,
  subtotal,
  discount,
  couponApplied,
  couponInput,
  couponOpen,
  shippingCost,
  tax,
  total,
  onCouponInputChange,
  onToggleCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: {
  items: any[]
  subtotal: number
  discount: number
  couponApplied: { code: string; discount: number; type: 'percent' | 'flat' } | null
  couponInput: string
  couponOpen: boolean
  shippingCost: number
  tax: number
  total: number
  onCouponInputChange: (v: string) => void
  onToggleCoupon: () => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
}) {
  return (
    <Card className="p-5 md:sticky md:top-32">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Order Summary</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
          {items.length} item{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Items */}
      <div className="max-h-56 space-y-2 overflow-y-auto scrollbar-thin pr-1">
        {items.map((item) => {
          const imgs = parseImages(item.product.images)
          return (
            <div key={item.id} className="flex items-center gap-2.5 text-sm">
              <div className="relative h-11 w-11 shrink-0">
                <ProductImage
                  name={item.product.name}
                  images={item.product.images}
                  className="h-11 w-11 rounded-lg"
                />
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold text-background">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-xs font-medium">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatPrice(item.product.price)} each
                </p>
              </div>
              <p className="text-xs font-semibold">
                {formatPrice(item.product.price * item.quantity)}
              </p>
            </div>
          )
        })}
      </div>

      <Separator className="my-3" />

      {/* Coupon */}
      {couponApplied ? (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-emerald-50 px-3 py-2 text-sm dark:bg-emerald-950/30">
          <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <Tag className="h-3.5 w-3.5" />
            <span className="font-semibold">{couponApplied.code}</span>
            <span className="text-xs">
              {couponApplied.type === 'percent' ? '(10% off)' : '(₹500 off)'}
            </span>
          </span>
          <button
            onClick={onRemoveCoupon}
            className="text-xs text-muted-foreground hover:text-destructive"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="mb-3">
          <button
            onClick={onToggleCoupon}
            className="flex w-full items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-medium text-primary hover:bg-accent/30"
          >
            <Tag className="h-3.5 w-3.5" />
            Apply Coupon
            <ChevronDown
              className={`ml-auto h-3.5 w-3.5 transition-transform ${couponOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {couponOpen && (
            <div className="mt-2 flex gap-2 animate-fade-in">
              <Input
                value={couponInput}
                onChange={(e) => onCouponInputChange(e.target.value)}
                placeholder="Enter code (e.g. SAVE10)"
                className="h-9 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') onApplyCoupon()
                }}
              />
              <Button size="sm" onClick={onApplyCoupon}>
                Apply
              </Button>
            </div>
          )}
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Try <span className="font-semibold">SAVE10</span> (10% off) or{' '}
            <span className="font-semibold">FLAT500</span> (₹500 off)
          </p>
        </div>
      )}

      <Separator className="my-3" />

      {/* Totals */}
      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" /> Discount
            </span>
            <span>−{formatPrice(discount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Delivery Charges</span>
          <span>
            {shippingCost === 0 ? (
              <span className="text-emerald-600">FREE</span>
            ) : (
              formatPrice(shippingCost)
            )}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax (5% GST)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex justify-between text-lg font-bold">
          <span>Grand Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <Shield className="h-3.5 w-3.5 text-primary" /> Secure & encrypted checkout
        </p>
        <p className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5 text-primary" /> Free standard delivery
        </p>
        <p className="flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-primary" /> 7-day easy returns
        </p>
      </div>
    </Card>
  )
}
