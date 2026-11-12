import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'
import https from 'https'
import http from 'http'

const db = new PrismaClient({
  datasourceUrl: `file:${path.resolve(process.cwd(), 'db/custom.db')}`,
})

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'products')
fs.mkdirSync(PRODUCTS_DIR, { recursive: true })

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function downloadImage(url: string, destFilename: string): Promise<string> {
  const destPath = path.join(PRODUCTS_DIR, destFilename)
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 2000) {
    return Promise.resolve(`/products/${destFilename}`)
  }

  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(destPath)
    const req = mod.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(`/products/${destFilename}`)
        })
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        const redirectUrl = res.headers.location
        if (redirectUrl) {
          downloadImage(redirectUrl, destFilename).then(resolve)
        } else {
          resolve(`/products/${destFilename}`)
        }
      } else {
        resolve(`/products/${destFilename}`)
      }
    })
    req.on('error', () => resolve(`/products/${destFilename}`))
    req.setTimeout(12000, () => {
      req.destroy()
      resolve(`/products/${destFilename}`)
    })
  })
}

const PARTYWEAR_PRODUCTS = [
  {
    name: 'Zara Tropical Floral Printed Resort Party Shirt - Sunset Orange',
    brand: 'Zara',
    category: 'mens-clothing',
    price: 1990,
    compareAt: 2590,
    shortDesc: 'Relaxed fit camp collar resort shirt with vibrant tropical floral print.',
    desc: 'Perfect for Goa beach shacks and sunset pool parties. Crafted from ultra-breathable viscose fabric that feels breezy and lightweight under the warm sun.',
    tags: ['partywear', 'party wear', 'goa', 'beach wear', 'resort wear', 'floral shirt', 'party shirt', 'summer', 'mens clothing', 'fashion'],
    specs: { Fabric: '100% Viscose Rayon', Collar: 'Cuban Camp Collar', Fit: 'Relaxed Fit', Wash: 'Machine wash gentle' },
    photoUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    rating: 4.7,
    ratingCount: 1840,
    isTrending: true,
    isFeatured: true,
  },
  {
    name: 'H&M Bohemian Palm Print Beach Party Maxi Dress - Olive Palm',
    brand: 'H&M',
    category: 'womens-clothing',
    price: 2299,
    compareAt: 2999,
    shortDesc: 'Flowy sleeveless bohemian maxi dress with thigh-high slit and palm motif.',
    desc: 'Dance the night away on the beaches of Goa. Features an adjustable halter neckline, elasticated waistline, and an airy tiered skirt that catches the ocean breeze.',
    tags: ['partywear', 'party wear', 'goa', 'beach dress', 'maxi dress', 'party dress', 'summer dress', 'vacation', 'womens clothing', 'fashion'],
    specs: { Fabric: '100% Viscose Gauze', Length: 'Maxi Length', Silhouette: 'A-Line Flowy', Detail: 'Side Slit' },
    photoUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80',
    rating: 4.8,
    ratingCount: 2300,
    isTrending: true,
    isFeatured: true,
  },
  {
    name: 'Vero Moda Sequin Shimmer Bodycon Party Dress - Emerald Green',
    brand: 'Vero Moda',
    category: 'womens-clothing',
    price: 2999,
    compareAt: 3999,
    shortDesc: 'Glistening all-over mini sequin bodycon dress for clubbing and night parties.',
    desc: 'Turn heads at Goa top clubs and beach parties. Soft stretch lining ensures zero scratchiness while the iridescent emerald sequins catch every beam of light.',
    tags: ['partywear', 'party wear', 'party dress', 'sequin dress', 'shimmer', 'goa', 'clubwear', 'night party', 'womens clothing', 'fashion'],
    specs: { Fabric: 'Sequin Mesh with Poly Lining', Length: 'Above Knee', Stretch: 'High Stretch', Neck: 'Square Neckline' },
    photoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    rating: 4.6,
    ratingCount: 1420,
    isDeal: true,
  },
  {
    name: "Levi's Sunset Hawaiian Camp Collar Beach Party Shirt - Ocean Blue",
    brand: "Levi's",
    category: 'mens-clothing',
    price: 2499,
    compareAt: 3199,
    shortDesc: 'Authentic retro Hawaiian floral print with soft garment wash and vintage buttons.',
    desc: 'Made with soft TENCEL Lyocell fibers, this Levi sunset party shirt keeps you cool during day cruises and energetic beach parties in Goa.',
    tags: ['partywear', 'party wear', 'goa', 'hawaiian shirt', 'beach party', 'floral shirt', 'resort wear', 'mens clothing', 'fashion'],
    specs: { Material: 'TENCEL Lyocell Blend', Fit: 'Easy Relaxed Fit', Pattern: 'Retro Hibiscus Floral' },
    photoUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    rating: 4.7,
    ratingCount: 1980,
  },
  {
    name: 'ONLY Satin Slip Party Dress with Cowl Neck - Champagne Gold',
    brand: 'ONLY',
    category: 'womens-clothing',
    price: 2199,
    compareAt: 2999,
    shortDesc: 'Sensual liquid satin slip dress with draped cowl neckline and adjustable cross straps.',
    desc: 'Effortlessly chic partywear designed for sundowners, luxury beach resorts, and candlelight dinners in Goa. Liquid silk-touch satin cascades gracefully.',
    tags: ['partywear', 'party wear', 'satin dress', 'slip dress', 'party dress', 'goa', 'clubwear', 'evening', 'womens clothing', 'fashion'],
    specs: { Fabric: 'High-Lustre Poly Satin', Neckline: 'Cowl Neck', Back: 'Criss-cross Lace-up', Length: 'Midi' },
    photoUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80',
    rating: 4.8,
    ratingCount: 1750,
    isFeatured: true,
  },
  {
    name: 'Forever 21 Metallic Halter Neck Backless Party Crop Top & Skirt Set',
    brand: 'Forever 21',
    category: 'womens-clothing',
    price: 1899,
    compareAt: 2499,
    shortDesc: '2-piece shimmering co-ord party set with backless halter top and ruched mini skirt.',
    desc: 'The ultimate festival and Goa party look. Shimmer knit stretch fabric hugs your curves and sparkles under stage and party lights.',
    tags: ['partywear', 'party wear', 'party set', 'metallic', 'goa', 'crop top', 'skirt', 'clubwear', 'womens clothing', 'fashion'],
    specs: { Type: '2-Piece Co-ord Set', Material: 'Lurex Metallic Jersey', Fit: 'Bodycon', Closure: 'Tie-up' },
    photoUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&q=80',
    rating: 4.5,
    ratingCount: 980,
    isNewArrival: true,
  },
  {
    name: 'Roadster Breathable Linen Casual Beach Chino Shorts - Sand Khaki',
    brand: 'Roadster',
    category: 'mens-clothing',
    price: 1099,
    compareAt: 1599,
    shortDesc: 'Lightweight linen-cotton blend shorts with drawstring elasticated waistband.',
    desc: 'Essential beachwear for sunny Goa trips. Combines crisp chino style with the relaxed feel of an elastic drawstring waist.',
    tags: ['partywear', 'goa', 'beach wear', 'linen shorts', 'casual', 'party', 'mens clothing', 'fashion'],
    specs: { Fabric: '55% Linen 45% Cotton', Pockets: '4 Pockets', Waist: 'Elastic Drawstring', Inseam: '8 Inches' },
    photoUrl: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&q=80',
    rating: 4.4,
    ratingCount: 3100,
    isDeal: true,
  },
  {
    name: 'FabIndia Pure Linen Floral Printed Festive Party Shirt - Sunset Coral',
    brand: 'FabIndia',
    category: 'mens-clothing',
    price: 1890,
    compareAt: 2290,
    shortDesc: 'Handcrafted pure breathable linen shirt with subtle floral hand-block motifs.',
    desc: 'Stay stylish and cool in Goa humid coastal weather. Woven from 100% fine French linen that softens with every wash.',
    tags: ['partywear', 'party wear', 'linen shirt', 'goa', 'beach', 'party', 'resort wear', 'mens clothing', 'fashion'],
    specs: { Fabric: '100% Pure Linen', Fit: 'Comfort Regular Fit', Collar: 'Mandarin Band Collar' },
    photoUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    rating: 4.6,
    ratingCount: 1650,
  },
  {
    name: 'Mango One-Shoulder Cut-Out Party Midi Dress - Sunset Orange',
    brand: 'Mango',
    category: 'womens-clothing',
    price: 3490,
    compareAt: 4590,
    shortDesc: 'Asymmetrical one-shoulder midi dress with waist cut-out and side ruching.',
    desc: 'Exude resort glam at high-end beach clubs and pool parties. Rich terracotta sunset hue beautifully complements tropical coastal settings.',
    tags: ['partywear', 'party wear', 'party dress', 'midi dress', 'goa', 'vacation', 'evening', 'womens clothing', 'fashion'],
    specs: { Fabric: 'Ribbed Stretch Knit', Style: 'One-Shoulder Cutout', Fit: 'Bodycon to Flare' },
    photoUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
    rating: 4.7,
    ratingCount: 1120,
    isFeatured: true,
  },
  {
    name: 'UrbanWear Rayon Relaxed Fit Cuban Collar Party Shirt - Tropical Black',
    brand: 'UrbanWear',
    category: 'mens-clothing',
    price: 1199,
    compareAt: 1799,
    shortDesc: 'Silky smooth rayon party shirt with contrast botanical print and relaxed fit.',
    desc: 'Designed for Goa nightlife, pub crawls, and sunset beach bonfires. Breathable, sweat-absorbent, and ultra-durable.',
    tags: ['partywear', 'party wear', 'cuban collar', 'goa', 'party shirt', 'floral', 'summer', 'mens clothing', 'fashion'],
    specs: { Fabric: '100% Modal Rayon', Fit: 'Relaxed Fit', Style: 'Cuban Open Collar' },
    photoUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80',
    rating: 4.5,
    ratingCount: 2890,
    isDeal: true,
  },
]

async function main() {
  console.log('🌴 Seeding Goa & Partywear collection under ₹5,000...')

  const categories = await db.category.findMany()
  const catMap = new Map()
  categories.forEach((c) => catMap.set(c.slug, c.id))

  for (const item of PARTYWEAR_PRODUCTS) {
    const brandSlug = slugify(item.brand)
    let brand = await db.brand.findUnique({ where: { slug: brandSlug } })
    if (!brand) {
      brand = await db.brand.create({ data: { name: item.brand, slug: brandSlug } })
      console.log(`Created brand: ${brand.name}`)
    }

    const catId = catMap.get(item.category)
    if (!catId) {
      console.error(`Category not found: ${item.category}`)
      continue
    }

    const baseSlug = slugify(item.name)
    const filename = `${baseSlug}.jpg`
    const localImagePath = await downloadImage(item.photoUrl, filename)

    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    const sku = `BW-${brandSlug.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`

    await db.product.create({
      data: {
        slug,
        name: item.name,
        shortDescription: item.shortDesc,
        description: item.desc,
        brandId: brand.id,
        categoryId: catId,
        price: item.price,
        compareAtPrice: item.compareAt,
        sku,
        stock: Math.floor(30 + Math.random() * 100),
        lowStockThreshold: 5,
        rating: item.rating,
        ratingCount: item.ratingCount,
        tags: item.tags.join(','),
        attributes: JSON.stringify(item.specs),
        images: JSON.stringify([localImagePath]),
        isActive: true,
        isFeatured: item.isFeatured ?? false,
        isTrending: item.isTrending ?? false,
        isDeal: item.isDeal ?? false,
      },
    })
    console.log(`  Added partywear item: ${item.name} (₹${item.price})`)
  }

  console.log('✅ Finished seeding Goa & Partywear products!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
