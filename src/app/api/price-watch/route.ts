import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ watches: [] })
  const watches = await db.priceWatch.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ watches })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  const { productId, targetPrice } = await req.json()
  if (!productId || !targetPrice) return NextResponse.json({ error: 'Product and target price required' }, { status: 400 })
  const existing = await db.priceWatch.findFirst({ where: { userId: user.id, productId } })
  if (existing) {
    await db.priceWatch.update({ where: { id: existing.id }, data: { targetPrice: parseFloat(targetPrice) } })
    return NextResponse.json({ ok: true, action: 'updated' })
  }
  await db.priceWatch.create({ data: { userId: user.id, productId, targetPrice: parseFloat(targetPrice) } })
  return NextResponse.json({ ok: true, action: 'created' })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const watchId = searchParams.get('watchId')
  if (watchId) await db.priceWatch.deleteMany({ where: { id: watchId, userId: user.id } })
  return NextResponse.json({ ok: true })
}
