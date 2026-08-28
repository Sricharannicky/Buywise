import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await db.product.findUnique({
    where: { id },
    include: {
      brand: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
      reviews: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })

  // Track recently viewed if logged in
  try {
    const user = await getSession(req)
    if (user) {
      await db.recentlyViewed.create({ data: { userId: user.id, productId: product.id } })
      // keep only last 20
      const rv = await db.recentlyViewed.findMany({ where: { userId: user.id }, orderBy: { viewedAt: 'desc' }, take: 30 })
      if (rv.length > 20) {
        const toDelete = rv.slice(20).map((r) => r.id)
        await db.recentlyViewed.deleteMany({ where: { id: { in: toDelete } } })
      }
    }
  } catch {
    // ignore
  }

  // Related products (same category, exclude self)
  const related = await db.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 6,
    include: { brand: { select: { name: true } } },
  })

  return NextResponse.json({ product, related })
}
