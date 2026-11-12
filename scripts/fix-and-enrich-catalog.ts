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

// Curated high quality photos
const PHOTOS = {
  facewash: [
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', // Foaming face cleanser
    'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80', // Cleanser tube
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80', // Bottle cleanser
    'https://images.unsplash.com/photo-1608248597359-25f385c6776c?w=800&q=80', // Hydra cream
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80', // Skincare bottle
  ],
  backpacks: [
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', // Black commuter backpack
    'https://images.unsplash.com/photo-1546938576-6e6a64f317cc?w=800&q=80', // Travel rucksack
    'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&q=80', // Canvas backpack
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80', // Tote bag
    'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80', // Minimal wallet
  ],
  dumbbells: [
    'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80', // Adjustable dumbbell pair
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80', // Gym dumbbells
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80', // Iron dumbbells
    'https://images.unsplash.com/photo-1638805706539-a0880b0db86b?w=800&q=80', // Hex rubber dumbbells
  ],
  laptops: [
    'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', // Gaming laptop RGB keyboard
    'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80', // ThinkPad workstation
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80', // MacBook silver
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80', // Glowing gaming laptop
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80', // Ultrabook clean
  ],
}

async function fixMismatchedImages() {
  console.log('🔧 Fixing mismatched product images...')

  // 1. Fix face wash images (was getting laptops!)
  const facewashes = await db.product.findMany({
    where: { category: { slug: 'face-wash-cleansers' } },
  })
  for (let i = 0; i < facewashes.length; i++) {
    const fw = facewashes[i]
    const photoUrl = PHOTOS.facewash[i % PHOTOS.facewash.length]
    const filename = `facewash-${fw.slug}-fixed.jpg`
    const localPath = await downloadImage(photoUrl, filename)
    await db.product.update({
      where: { id: fw.id },
      data: { images: JSON.stringify([localPath]) },
    })
    console.log(`  Fixed facewash image for: ${fw.name}`)
  }

  // 2. Fix backpacks (was getting red shoes!)
  const backpacks = await db.product.findMany({
    where: {
      OR: [
        { name: { contains: 'Backpack' } },
        { name: { contains: 'Tote' } },
        { name: { contains: 'Bag' } },
      ],
      category: { slug: { in: ['bags-wallets', 'bags'] } },
    },
  })
  for (let i = 0; i < backpacks.length; i++) {
    const bp = backpacks[i]
    const photoUrl = PHOTOS.backpacks[i % PHOTOS.backpacks.length]
    const filename = `bag-${bp.slug}-fixed.jpg`
    const localPath = await downloadImage(photoUrl, filename)
    await db.product.update({
      where: { id: bp.id },
      data: { images: JSON.stringify([localPath]) },
    })
    console.log(`  Fixed backpack/bag image for: ${bp.name}`)
  }

  // 3. Fix dumbbells (was getting tables/tents!)
  const dumbbells = await db.product.findMany({
    where: {
      name: { contains: 'Dumbbell' },
    },
  })
  for (let i = 0; i < dumbbells.length; i++) {
    const dbell = dumbbells[i]
    const photoUrl = PHOTOS.dumbbells[i % PHOTOS.dumbbells.length]
    const filename = `dumbbell-${dbell.slug}-fixed.jpg`
    const localPath = await downloadImage(photoUrl, filename)
    await db.product.update({
      where: { id: dbell.id },
      data: { images: JSON.stringify([localPath]) },
    })
    console.log(`  Fixed dumbbell image for: ${dbell.name}`)
  }
}

// Add real-world programming & gaming laptops under ₹70,000
const NEW_LAPTOPS = [
  {
    name: 'ASUS TUF Gaming F15 Laptop (Intel Core i5-11400H 11th Gen, 16GB RAM, 512GB SSD, 4GB RTX 2050)',
    brand: 'ASUS',
    price: 51990,
    compareAt: 74990,
    shortDesc: '15.6" FHD 144Hz IPS display, RTX 2050 4GB GPU, dual fans with anti-dust tunnels.',
    desc: 'Geared for serious gaming and coding. The ASUS TUF Gaming F15 features an 11th Gen Intel Core i5 processor and NVIDIA GeForce RTX 2050 graphics to power through heavy compile tasks and smooth 1080p gaming.',
    tags: ['laptop', 'gaming laptop', 'asus', 'tuf gaming', 'rtx 2050', 'programming', 'gaming', '144hz', '16gb ram'],
    specs: { Processor: 'Intel Core i5-11400H', RAM: '16GB DDR4 3200MHz', Storage: '512GB PCIe NVMe SSD', GPU: 'NVIDIA GeForce RTX 2050 4GB GDDR6', Display: '15.6" FHD 144Hz IPS', OS: 'Windows 11 Home' },
    photoUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80',
    rating: 4.6,
    ratingCount: 3400,
    isTrending: true,
  },
  {
    name: 'Lenovo IdeaPad Gaming 3 Laptop (AMD Ryzen 5 5500H, 16GB RAM, 512GB SSD, 4GB RTX 2050)',
    brand: 'Lenovo',
    price: 49990,
    compareAt: 76890,
    shortDesc: '15.6" FHD 120Hz IPS display, signature blue backlit keyboard, rapid charge.',
    desc: 'Lenovo IdeaPad Gaming 3 gives you tournament-ready performance on a budget. Featuring an AMD Ryzen 5 processor, 16GB DDR4 memory, and NVIDIA RTX graphics, it runs Docker, IDEs, and modern games seamlessly.',
    tags: ['laptop', 'gaming laptop', 'lenovo', 'ideapad gaming', 'programming', 'ryzen 5', 'gaming', '16gb ram'],
    specs: { Processor: 'AMD Ryzen 5 5500H', RAM: '16GB DDR4', Storage: '512GB SSD', GPU: 'NVIDIA GeForce RTX 2050 4GB', Display: '15.6" FHD 120Hz', Keyboard: 'Blue Backlit' },
    photoUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&q=80',
    rating: 4.5,
    ratingCount: 2900,
    isDeal: true,
  },
  {
    name: 'HP Victus Gaming Laptop 15.6" (AMD Ryzen 5 5600H, 16GB DDR4, 512GB SSD, 4GB Radeon RX 6500M)',
    brand: 'HP',
    price: 54990,
    compareAt: 69990,
    shortDesc: '15.6" FHD 144Hz micro-edge display, OMEN Gaming Hub, updated thermal cooling.',
    desc: 'Powered by an AMD Ryzen 5 5600H processor and dedicated Radeon graphics, the HP Victus 15 has all the features you need for everyday programming, machine learning scripts, and immersive gaming.',
    tags: ['laptop', 'gaming laptop', 'hp', 'victus', 'programming', 'gaming', 'ryzen 5', '16gb'],
    specs: { Processor: 'AMD Ryzen 5 5600H 6-core', RAM: '16GB DDR4', Storage: '512GB Gen4 SSD', GPU: 'AMD Radeon RX 6500M 4GB', Display: '15.6" FHD 144Hz 250 nits' },
    photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    rating: 4.4,
    ratingCount: 2150,
    isFeatured: true,
  },
  {
    name: 'Acer Aspire 7 Gaming Laptop (Intel Core i5 12th Gen, 16GB RAM, 512GB SSD, 4GB RTX 3050)',
    brand: 'Acer',
    price: 57990,
    compareAt: 84990,
    shortDesc: '15.6" FHD 144Hz display, RTX 3050 4GB GPU, dual fans with elevated hinge cooling.',
    desc: 'The Acer Aspire 7 combines understated professional looks with full-tilt gaming performance. 12th Gen Intel Core i5 12-core architecture effortlessly handles video editing, software development, and AAA games.',
    tags: ['laptop', 'gaming laptop', 'acer', 'aspire 7', 'rtx 3050', 'programming', 'gaming', 'intel i5'],
    specs: { Processor: 'Intel Core i5-12450H 8-core', RAM: '16GB DDR4', Storage: '512GB PCIe SSD', GPU: 'NVIDIA GeForce RTX 3050 4GB', Display: '15.6" FHD 144Hz' },
    photoUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80',
    rating: 4.6,
    ratingCount: 3800,
  },
  {
    name: 'Dell 15 Laptop (Intel Core i5-1235U 12th Gen, 16GB RAM, 512GB SSD, 15.6" FHD 120Hz)',
    brand: 'Dell',
    price: 47990,
    compareAt: 61890,
    shortDesc: '12th Gen Intel Core i5, lift hinge ergonomics, Spill-resistant keyboard, 16GB RAM.',
    desc: 'Engineered for smooth multi-tasking and programming workflows. 16GB high-speed memory and a 512GB SSD ensure instant bootups and fluid VS Code compilation.',
    tags: ['laptop', 'dell', 'inspiron', 'programming', 'coding', 'student', 'office laptop', '16gb'],
    specs: { Processor: 'Intel Core i5-1235U 10-core', RAM: '16GB DDR4', Storage: '512GB SSD', Display: '15.6" FHD 120Hz Anti-Glare', Weight: '1.65 kg' },
    photoUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
    rating: 4.5,
    ratingCount: 4200,
    isDeal: true,
  },
  {
    name: 'Apple MacBook Air M1 Chip (8GB RAM, 256GB SSD, 13.3" Retina Display) - Space Grey',
    brand: 'Apple',
    price: 64990,
    compareAt: 92900,
    shortDesc: 'Apple M1 chip, 13.3" Retina display, 18-hour battery life, fanless silent design.',
    desc: 'The gold standard for developer laptops. Incredible single-core performance, up to 18 hours of real battery life, and instant-on readiness in a razor-thin unibody enclosure.',
    tags: ['laptop', 'apple', 'macbook air', 'macbook', 'm1', 'programming', 'coding', 'developer laptop'],
    specs: { Chip: 'Apple M1 8-Core CPU + 7-Core GPU', RAM: '8GB Unified', Storage: '256GB SSD', Display: '13.3" Retina with True Tone', Battery: 'Up to 18 Hours' },
    photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    rating: 4.9,
    ratingCount: 18900,
    isFeatured: true,
    isTrending: true,
  },
]

async function seedLaptops() {
  console.log('💻 Adding real-world programming & gaming laptops under ₹70,000...')

  const category = await db.category.findFirst({
    where: { slug: { in: ['laptops-tablets', 'laptops'] } },
  })
  if (!category) {
    console.error('Could not find laptop category')
    return
  }

  for (const item of NEW_LAPTOPS) {
    const brandSlug = slugify(item.brand)
    let brand = await db.brand.findUnique({ where: { slug: brandSlug } })
    if (!brand) {
      brand = await db.brand.create({ data: { name: item.brand, slug: brandSlug } })
    }

    const baseSlug = slugify(item.name)
    const filename = `${baseSlug}-real.jpg`
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
        categoryId: category.id,
        price: item.price,
        compareAtPrice: item.compareAt,
        sku,
        stock: Math.floor(25 + Math.random() * 80),
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
    console.log(`  Added laptop: ${item.name} (₹${item.price.toLocaleString('en-IN')})`)
  }
}

async function main() {
  await fixMismatchedImages()
  await seedLaptops()
  console.log('\n✅ All mismatched images fixed and new laptops added!')
}

main()
  .catch((e) => {
    console.error('Error in script:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
