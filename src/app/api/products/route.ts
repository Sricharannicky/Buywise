import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const brand = searchParams.get('brand') || ''
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const minRating = searchParams.get('minRating')
  const sort = searchParams.get('sort') || 'relevance'
  const limit = parseInt(searchParams.get('limit') || '24')
  const offset = parseInt(searchParams.get('offset') || '0')
  const flag = searchParams.get('flag') // trending | newArrival | deal | featured

  const where: any = { isActive: true }
  const andClauses: any[] = []
  if (q) {
    andClauses.push({
      OR: [
        { name: { contains: q } },
        { shortDescription: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
        { brand: { name: { contains: q } } },
      ],
    })
  }
  if (category) {
    andClauses.push({
      OR: [
        { category: { slug: category } },
        { category: { parent: { slug: category } } },
      ],
    })
  }
  if (andClauses.length > 0) {
    where.AND = andClauses
  }
  if (brand) {
    const brands = brand.split(',').filter(Boolean)
    if (brands.length) where.brand = { slug: { in: brands } }
  }
  if (minPrice || maxPrice) {
    where.price = {}
    if (minPrice) where.price.gte = parseFloat(minPrice)
    if (maxPrice) where.price.lte = parseFloat(maxPrice)
  }
  if (minRating) where.rating = { gte: parseFloat(minRating) }
  if (flag === 'trending') where.isTrending = true
  if (flag === 'newArrival') where.isNewArrival = true
  if (flag === 'deal') where.isDeal = true
  if (flag === 'featured') where.isFeatured = true

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price-asc') orderBy = { price: 'asc' }
  else if (sort === 'price-desc') orderBy = { price: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }
  else if (sort === 'newest') orderBy = { createdAt: 'desc' }
  else if (sort === 'discount') orderBy = { compareAtPrice: 'desc' }

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: { brand: { select: { name: true, slug: true } }, category: { select: { name: true, slug: true } } },
    }),
    db.product.count({ where }),
  ])

  return NextResponse.json({ products, total, limit, offset })
}
