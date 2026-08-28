import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ cart: null, items: [], subtotal: 0, count: 0 })
  const cart = await db.cart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        where: { savedForLater: false },
        include: { product: { include: { brand: { select: { name: true } } } } },
        orderBy: { createdAt: 'desc' },
      },
    },
  })
  const items = cart?.items || []
  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
  const count = items.reduce((s, i) => s + i.quantity, 0)
  return NextResponse.json({ cart, items, subtotal, count })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in to add items to your cart' }, { status: 401 })
  const { productId, quantity = 1 } = await req.json()
  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product || !product.isActive) return NextResponse.json({ error: 'Product unavailable' }, { status: 404 })

  const cart = await db.cart.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
  const existing = await db.cartItem.findFirst({ where: { cartId: cart.id, productId, savedForLater: false } })
  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { quantity: Math.min(existing.quantity + quantity, 99) } })
  } else {
    await db.cartItem.create({ data: { cartId: cart.id, productId, quantity: Math.min(quantity, 99) } })
  }
  return NextResponse.json({ ok: true })
}

export async function PATCH(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { itemId, quantity, savedForLater } = await req.json()
  if (quantity !== undefined) {
    if (quantity <= 0) {
      await db.cartItem.deleteMany({ where: { id: itemId, cart: { userId: user.id } } })
    } else {
      await db.cartItem.updateMany({ where: { id: itemId, cart: { userId: user.id } }, data: { quantity: Math.min(quantity, 99) } })
    }
  }
  if (savedForLater !== undefined) {
    await db.cartItem.updateMany({ where: { id: itemId, cart: { userId: user.id } }, data: { savedForLater } })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')
  if (itemId) {
    await db.cartItem.deleteMany({ where: { id: itemId, cart: { userId: user.id } } })
  }
  return NextResponse.json({ ok: true })
}
