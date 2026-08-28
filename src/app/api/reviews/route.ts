import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const productId = searchParams.get('productId')
  const reviews = await db.review.findMany({ where: productId ? { productId } : {}, orderBy: { createdAt: 'desc' }, take: 50 })
  return NextResponse.json({ reviews })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in to review' }, { status: 401 })
  const { productId, rating, title, body } = await req.json()
  if (!productId || !rating || !title || !body) return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 })
  // Check verified purchase
  const ordered = await db.orderItem.findFirst({ where: { productId, order: { userId: user.id } } })
  const review = await db.review.create({
    data: { productId, userId: user.id, authorName: `${user.firstName} ${user.lastName}`, rating: parseInt(rating), title, body, isVerifiedPurchase: !!ordered },
  })
  // Update product rating
  const agg = await db.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: { rating: true } })
  await db.product.update({ where: { id: productId }, data: { rating: agg._avg.rating || 0, ratingCount: agg._count.rating } })
  return NextResponse.json({ review })
}
