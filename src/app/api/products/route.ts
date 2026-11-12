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
    const rawQ = q.trim()
    const lowerQ = rawQ.toLowerCase()
    const tokens = lowerQ.split(/[\s,+-]+/).filter((t) => t.length > 0)

    // Build synonym & phrase variations for natural e-commerce search (Amazon / Flipkart style)
    const synonyms: string[] = [rawQ, lowerQ]
    if (lowerQ.includes('eyeliner') || lowerQ.includes('eye liner') || lowerQ.includes('kajal')) {
      synonyms.push('eyeliner', 'eye liner', 'kajal', 'liner')
    }
    if (lowerQ.includes('lipstick') || lowerQ.includes('lip stick')) {
      synonyms.push('lipstick', 'lip stick', 'matte lipstick', 'liquid lipstick')
    }
    if (lowerQ.includes('sunscreen') || lowerQ.includes('sun screen')) {
      synonyms.push('sunscreen', 'sun screen', 'sunblock', 'spf')
    }
    if (lowerQ.includes('shoe') || lowerQ.includes('shoes')) {
      synonyms.push('shoes', 'shoe', 'sneakers', 'running shoes')
    }
    if (lowerQ.includes('smartwatch') || lowerQ.includes('smart watch')) {
      synonyms.push('smartwatch', 'smart watch', 'watch')
    }
    if (lowerQ.includes('air fryer') || lowerQ.includes('airfryer')) {
      synonyms.push('air fryer', 'airfryer')
    }
    if (lowerQ.includes('t shirt') || lowerQ.includes('t-shirt') || lowerQ.includes('tshirt')) {
      synonyms.push('t-shirt', 't shirt', 'tshirt')
    }

    // Token matching: require each keyword token to match somewhere across product fields
    const tokenClauses = tokens.map((token) => ({
      OR: [
        { name: { contains: token } },
        { shortDescription: { contains: token } },
        { description: { contains: token } },
        { tags: { contains: token } },
        { brand: { name: { contains: token } } },
        { category: { name: { contains: token } } },
        { category: { slug: { contains: token } } },
      ],
    }))

    // Synonym & phrase matching
    const synonymClauses = synonyms.map((syn) => ({
      OR: [
        { name: { contains: syn } },
        { shortDescription: { contains: syn } },
        { description: { contains: syn } },
        { tags: { contains: syn } },
        { brand: { name: { contains: syn } } },
      ],
    }))

    andClauses.push({
      OR: [
        { AND: tokenClauses },
        ...synonymClauses,
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

  let [products, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: { brand: { select: { name: true, slug: true } }, category: { select: { name: true, slug: true } } },
    }),
    db.product.count({ where }),
  ])

  // Enhanced relevance ranking (Amazon / Flipkart style):
  // Prioritize exact keyword in name, then rating & popularity
  if ((sort === 'relevance' || !sort) && q) {
    const qLower = q.toLowerCase().trim()
    products.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      const aHas = aName.includes(qLower) ? 1 : 0
      const bHas = bName.includes(qLower) ? 1 : 0
      if (aHas !== bHas) return bHas - aHas
      return (b.rating * Math.log10((b.ratingCount || 1) + 10)) - (a.rating * Math.log10((a.ratingCount || 1) + 10))
    })
  }

  return NextResponse.json({ products, total, limit, offset })
}
