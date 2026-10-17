import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ orders: [] })
  const orders = await db.order.findMany({
    where: { userId: user.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ orders })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in to checkout' }, { status: 401 })
  const body = await req.json()
  const { addressId, paymentMethod = 'COD' } = body

  const address = await db.address.findFirst({ where: { id: addressId, userId: user.id } })
  if (!address) return NextResponse.json({ error: 'Please select a shipping address' }, { status: 400 })

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { where: { savedForLater: false }, include: { product: true } } },
  })
  if (!cart || cart.items.length === 0) return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })

  // Validate stock and recompute prices server-side (never trust frontend)
  let subtotal = 0
  const lineItems: any[] = []
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive || item.product.stock < item.quantity) {
      return NextResponse.json({ error: `${item.product?.name || 'An item'} is no longer available in the requested quantity` }, { status: 400 })
    }
    subtotal += item.product.price * item.quantity
    lineItems.push({
      productId: item.product.id,
      productName: item.product.name,
      productImage: item.product.images,
      productSku: item.product.sku,
      unitPrice: item.product.price,
      quantity: item.quantity,
      total: item.product.price * item.quantity,
    })
  }
  const tax = Math.round(subtotal * 0.05) // 5% GST estimate
  const shipping = subtotal > 999 ? 0 : 99
  const total = subtotal + tax + shipping

  const orderNumber = 'AIS' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase()

  const order = await db.$transaction(async (tx) => {
    // Decrement stock
    for (const item of cart.items) {
      await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } })
    }
    const o = await tx.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: 'CONFIRMED',
        paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        paymentMethod,
        subtotal,
        tax,
        shipping,
        discount: 0,
        total,
        shipFullName: address.fullName,
        shipPhone: address.phone,
        shipLine1: address.line1,
        shipLine2: address.line2 || null,
        shipCity: address.city,
        shipState: address.state,
        shipPincode: address.pincode,
        items: { create: lineItems },
      },
      include: { items: true },
    })
    // Clear active cart items
    await tx.cartItem.deleteMany({ where: { cartId: cart.id, savedForLater: false } })
    return o
  })

  // Notification
  await db.notification.create({
    data: { userId: user.id, type: 'ORDER', title: 'Order confirmed', body: `Your order ${order.orderNumber} has been confirmed.` },
  })

  return NextResponse.json({ order })
}
