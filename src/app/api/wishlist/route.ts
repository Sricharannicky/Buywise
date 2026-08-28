import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ items: [] })
  const wl = await db.wishlist.findUnique({
    where: { userId: user.id },
    include: { items: { include: { product: { include: { brand: { select: { name: true } } } } }, orderBy: { createdAt: 'desc' } } },
  })
  return NextResponse.json({ items: wl?.items || [] })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  const { productId } = await req.json()
  const wl = await db.wishlist.upsert({ where: { userId: user.id }, update: {}, create: { userId: user.id } })
  const existing = await db.wishlistItem.findFirst({ where: { wishlistId: wl.id, productId } })
  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true, action: 'removed' })
  }
  await db.wishlistItem.create({ data: { wishlistId: wl.id, productId } })
  return NextResponse.json({ ok: true, action: 'added' })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')
  if (itemId) await db.wishlistItem.deleteMany({ where: { id: itemId, wishlist: { userId: user.id } } })
  return NextResponse.json({ ok: true })
}
