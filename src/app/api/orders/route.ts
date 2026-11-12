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
  const { addressId, paymentMethod = 'COD', couponCode, shippingMethodId } = body

  const address = await db.address.findFirst({ where: { id: addressId, userId: user.id } })
  if (!address) return NextResponse.json({ error: 'Please select a shipping address' }, { status: 400 })

  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: { items: { where: { savedForLater: false }, include: { product: true } } },
  })
  if (!cart || cart.items.length === 0) return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 })

  // Validate stock and compute prices server-side
  let subtotal = 0
  const lineItems: any[] = []
  for (const item of cart.items) {
    if (!item.product || !item.product.isActive || item.product.stock < item.quantity) {
      return NextResponse.json(
        { error: `${item.product?.name || 'An item'} is no longer available in the requested quantity` },
        { status: 400 }
      )
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

  // Coupon Discount
  let discount = 0
  if (couponCode === 'SAVE10') {
    discount = Math.round(subtotal * 0.1)
  } else if (couponCode === 'FLAT500') {
    discount = Math.min(500, subtotal)
  }

  // Shipping cost
  let shipping = 0
  if (shippingMethodId === 'sameday') {
    shipping = 199
  } else if (shippingMethodId === 'express') {
    shipping = 99
  } else {
    shipping = subtotal > 999 ? 0 : 99
  }

  const tax = Math.round(Math.max(0, subtotal - discount) * 0.05)
  const total = Math.max(0, subtotal - discount) + tax + shipping

  // Buywise order number
  const orderNumber = 'BW' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(2, 5).toUpperCase()

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
        discount,
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
    data: {
      userId: user.id,
      type: 'ORDER',
      title: 'Order confirmed',
      body: `Your Buywise order ${order.orderNumber} for ₹${total} has been placed.`,
    },
  })

  return NextResponse.json({ order })
}
