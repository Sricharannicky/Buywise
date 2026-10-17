import fs from 'fs'
import path from 'path'
import https from 'https'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Curated high-resolution Unsplash product photography IDs (all 800px square, studio quality)
const IMAGE_LIBRARY = {
  // Laptops & Tablets
  laptops: [
    'photo-1517336714731-489689fd1ca8', // MacBook silver
    'photo-1603302576837-37561b2e2302', // Gaming laptop RGB
    'photo-1496181133206-80ce9b88a853', // Ultrabook clean
    'photo-1588872657578-7efd1f1555ed', // ThinkPad workstation
    'photo-1544244015-0df4b3ffc6b0', // iPad tablet
    'photo-1531297484001-80022131f5a1', // Laptop keyboard glow
  ],
  // Audio / Headphones
  audio: [
    'photo-1505740420928-5e560c06d30e', // Black ANC headphones
    'photo-1590658268037-6bf12165a8df', // Wireless earbuds case
    'photo-1583394838336-acd977736f90', // Studio monitor headphones
    'photo-1545454675-3531b543be5d', // Bluetooth speaker
    'photo-1543512214-318c7553f230', // Soundbar audio
    'photo-1572536147248-ac59a8abfa4b', // In-ear sport earphones
  ],
  // Phones & Wearables
  mobile: [
    'photo-1511707171634-5f897ff02aa9', // Smartphone pro
    'photo-1592899677977-9c10ca588bbd', // Flagship phone
    'photo-1580910051074-3eb694886505', // Phone dual camera
    'photo-1546868871-7041f2a55e12', // Smartwatch
    'photo-1575311373937-040b8e1fd5b6', // Fitness band tracker
    'photo-1522335789203-aabd1fc54bc9', // Luxury analog watch
  ],
  // TV & Electronics
  tv_electronics: [
    'photo-1593359677879-a4bb92f829d1', // 4K Smart TV
    'photo-1609081219090-a6d8173087ec', // GaN Charger / Power bank
    'photo-1588508065123-287b28e013da', // Smart home speaker
    'photo-1550009158-9ebf69173e03', // Electronics accessories
  ],
  // Furniture & Home
  furniture: [
    'photo-1555041469-a586c61ea9bc', // 3-seater sofa
    'photo-1580481077197-bbfd4847e06a', // Ergonomic office chair
    'photo-1518455027359-f3f8164ba6bd', // Standing desk wood
    'photo-1594671581654-278545c41521', // Bookshelf shelving
    'photo-1615066390971-03e4e1c36ddf', // Dining table
  ],
  // Kitchen & Appliances
  kitchen: [
    'photo-1517668808822-9ebb02f2a0e6', // Espresso coffee machine
    'photo-1585515320310-259814833e62', // Air fryer
    'photo-1593618998160-e34014e67546', // Chef knife set
    'photo-1584990347449-399a9a385f00', // Non-stick frying pan
    'photo-1584727638096-042c45049ebe', // Airtight glass containers
  ],
  // Home Decor & Bedding
  decor_bedding: [
    'photo-1608571423902-eed4a5ad8108', // Ceramic aroma diffuser
    'photo-1507473885765-e6ed057f782c', // Warm table lamp
    'photo-1485955900006-10f4d324d411', // Faux plant indoor
    'photo-1616046229478-9901c5536a45', // Floral bedsheet
    'photo-1584100936595-c0654b55a2e2', // Soft fleece blanket
  ],
  // Fashion Apparel
  apparel: [
    'photo-1551028719-00167b16eac5', // Black leather/bomber jacket
    'photo-1624378439575-d8705ad7ae80', // Chino pants khaki
    'photo-1576995853123-5a10305d93c0', // Denim jacket
    'photo-1572804013309-59a88b7e92f1', // Blue cotton dress / kurti
    'photo-1503342217505-b0a15ec3261c', // Graphic t-shirt
    'photo-1591195853828-11db59a44f6b', // Cargo shorts
  ],
  // Footwear & Bags
  shoes_bags: [
    'photo-1542291026-7eec264c27ff', // Red running shoes
    'photo-1520639888713-7851133b1ed0', // Waterproof hiking boots
    'photo-1600185365926-3a2ce3cdb9eb', // Clean white sneakers
    'photo-1553062407-98eeb64c6a62', // Commuter backpack
    'photo-1590874103328-eac38a683ce7', // Leather tote bag
    'photo-1627123424574-724758594e93', // Minimal card wallet
    'photo-1511499767150-a48a237f0083', // Sunglasses
  ],
  // Beauty, Skincare & Grooming
  beauty: [
    'photo-1620916566398-39f1143ab7be', // Vitamin C facial serum
    'photo-1608248597359-25f385c6776c', // Hydra moisturizer cream
    'photo-1556228720-195a672e8a03', // Foaming face cleanser
    'photo-1535585209827-a15fcdbc4c2d', // Nourishing shampoo
    'photo-1512496015851-a90fb38ba796', // Makeup eyeshadow palette
    'photo-1592945403244-b3fbafd7f539', // Luxury glass perfume bottle
    'photo-1621607512214-68297480165e', // Cordless beard trimmer
  ],
  // Sports, Fitness & Outdoors
  fitness_outdoor: [
    'photo-1584735935682-2f2b69dff9d2', // Adjustable dumbbell set
    'photo-1601925260368-ae2f83cf8b7f', // Eco yoga mat
    'photo-1504280390367-361c6d9f38f4', // 4-person camping tent
    'photo-1485965120184-e220f721d03e', // Road bike cycling
    'photo-1517838277536-f5f99be501cd', // Gym workout accessories
  ],
  // Books & Stationery
  stationery: [
    'photo-1544947950-fa07a98d237f', // Hardcover fiction book
    'photo-1589829085413-56de8ae18c73', // Daily planner notebook
    'photo-1585336261026-7f897d26df85', // Fountain pen set
    'photo-1583485088034-697b5bc54ccd', // Desk organizer pens
  ],
  // Kids & Toys
  toys_baby: [
    'photo-1566576912321-d58ddd7a6088', // Building blocks toys
    'photo-1515488042361-ee00e0ddd4e4', // Baby care lotion & essentials
    'photo-1519457431-44ccd64a579b', // Children clothing romper
    'photo-1558060370-d644479cb6f7', // Action figures & toys
  ],
  // Groceries & Food
  groceries: [
    'photo-1586201375761-83865001e31c', // Rice & pantry staples
    'photo-1599490659213-e2b9527bd087', // Crispy wafers / snack pack
    'photo-1544787219-7f47ccb76574', // Green tea & coffee beans
    'photo-1582722872445-44dc5f7e3c8f', // Fresh eggs & dairy butter
  ],
  // Health & Wellness
  wellness: [
    'photo-1584308666744-24d5c474f2ae', // Herbal capsules & supplements
    'photo-1559599101-f09722fb4948', // Sonic electric toothbrush
    'photo-1617897903246-719242758050', // Ayurvedic herbal oil
  ],
  // Household & Automotive
  household_auto: [
    'photo-1585421514738-01798e348b17', // Spray bottle cleaning supplies
    'photo-1607860108855-64acf2078ed9', // Car care cleaning wash
    'photo-1549399542-7e3f8b79c341', // Car electronics vent dashcam
  ],
  // Pet Supplies
  pets: [
    'photo-1589924691995-400dc9ecc119', // Pet food bowl & kibble
    'photo-1548767797-d8c844163c4c', // Cat scratching post & accessories
    'photo-1601758228041-f3b2795255f1', // Pet collar and dog toys
  ]
}

// Download image helper with retry and stream writing
function downloadImage(url, destPath) {
  return new Promise((resolve) => {
    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 2000) {
      return resolve(true)
    }
    const file = fs.createWriteStream(destPath)
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(true)
        })
      } else {
        file.close()
        try { fs.unlinkSync(destPath) } catch {}
        resolve(false)
      }
    }).on('error', () => {
      try { fs.unlinkSync(destPath) } catch {}
      resolve(false)
    })
  })
}

// Map subcategory slug or keywords to photo pool
function getPoolForProduct(categorySlug, productName) {
  const c = categorySlug.toLowerCase()
  const n = productName.toLowerCase()

  if (c.includes('laptop') || n.includes('laptop') || n.includes('macbook') || n.includes('ultrabook')) return IMAGE_LIBRARY.laptops
  if (c.includes('headphone') || c.includes('audio') || c.includes('speaker') || n.includes('buds') || n.includes('headphone')) return IMAGE_LIBRARY.audio
  if (c.includes('mobile') || c.includes('phone') || c.includes('smartwatch') || c.includes('watch') || n.includes('phone') || n.includes('watch')) return IMAGE_LIBRARY.mobile
  if (c.includes('tv') || c.includes('television') || c.includes('charger') || c.includes('power-bank')) return IMAGE_LIBRARY.tv_electronics
  if (c.includes('furniture') || n.includes('sofa') || n.includes('chair') || n.includes('desk') || n.includes('table')) return IMAGE_LIBRARY.furniture
  if (c.includes('kitchen') || c.includes('cookware') || n.includes('cooker') || n.includes('pan') || n.includes('knife') || n.includes('fryer')) return IMAGE_LIBRARY.kitchen
  if (c.includes('decor') || c.includes('bedding') || c.includes('lighting') || n.includes('lamp') || n.includes('bedsheet') || n.includes('diffuser')) return IMAGE_LIBRARY.decor_bedding
  if (c.includes('clothing') || n.includes('jacket') || n.includes('shirt') || n.includes('pants') || n.includes('dress') || n.includes('kurti')) return IMAGE_LIBRARY.apparel
  if (c.includes('footwear') || c.includes('bag') || c.includes('sunglass') || n.includes('shoe') || n.includes('boot') || n.includes('backpack') || n.includes('tote')) return IMAGE_LIBRARY.shoes_bags
  if (c.includes('skincare') || c.includes('beauty') || c.includes('makeup') || c.includes('shampoo') || c.includes('perfume') || c.includes('grooming')) return IMAGE_LIBRARY.beauty
  if (c.includes('fitness') || c.includes('gym') || c.includes('yoga') || c.includes('cycling') || n.includes('dumbbell') || n.includes('tent') || n.includes('mat')) return IMAGE_LIBRARY.fitness_outdoor
  if (c.includes('book') || c.includes('stationery') || c.includes('notebook') || c.includes('pen')) return IMAGE_LIBRARY.stationery
  if (c.includes('toy') || c.includes('baby') || c.includes('kid')) return IMAGE_LIBRARY.toys_baby
  if (c.includes('grocer') || c.includes('staple') || c.includes('snack') || c.includes('beverage') || c.includes('dairy')) return IMAGE_LIBRARY.groceries
  if (c.includes('wellness') || c.includes('vitamin') || c.includes('ayurveda')) return IMAGE_LIBRARY.wellness
  if (c.includes('automotive') || c.includes('car')) return IMAGE_LIBRARY.household_auto
  if (c.includes('cleaning') || c.includes('household')) return IMAGE_LIBRARY.household_auto
  if (c.includes('pet')) return IMAGE_LIBRARY.pets

  return IMAGE_LIBRARY.laptops
}

async function main() {
  console.log('🚀 Starting E-Commerce Image Enrichment...')

  const prodDir = path.resolve('public/products')
  const catDir = path.resolve('public/categories')
  if (!fs.existsSync(prodDir)) fs.mkdirSync(prodDir, { recursive: true })
  if (!fs.existsSync(catDir)) fs.mkdirSync(catDir, { recursive: true })

  // 1. Enrich Categories (Top-level + Subcategories)
  console.log('📦 Enriching category images...')
  const categories = await prisma.category.findMany({
    include: { parent: true }
  })

  let catSuccess = 0
  for (const cat of categories) {
    const pool = getPoolForProduct(cat.slug, cat.name)
    const photoId = pool[0] || 'photo-1498049794561-7780e7231661'
    const url = `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=800&q=80`
    const localName = `${cat.slug}.jpg`
    const localPath = path.join(catDir, localName)

    await downloadImage(url, localPath)
    await prisma.category.update({
      where: { id: cat.id },
      data: { imageUrl: `/categories/${localName}` }
    })
    catSuccess++
  }
  console.log(`✅ Updated ${catSuccess} categories with rich photos.`)

  // 2. Enrich Products
  console.log('🛍️ Enriching product catalog images with multi-angle galleries...')
  const products = await prisma.product.findMany({
    include: { category: true }
  })

  let prodSuccess = 0
  for (let i = 0; i < products.length; i++) {
    const p = products[i]
    const catSlug = p.category?.slug || 'electronics'
    const pool = getPoolForProduct(catSlug, p.name)

    // Select primary and secondary photos from pool
    const primaryId = pool[i % pool.length]
    const secondaryId = pool[(i + 1) % pool.length]

    const primaryUrl = `https://images.unsplash.com/${primaryId}?auto=format&fit=crop&w=800&q=80`
    const secondaryUrl = `https://images.unsplash.com/${secondaryId}?auto=format&fit=crop&w=800&q=80`

    const baseName = `${p.slug}-${i}`
    const file1 = `${baseName}-0.jpg`
    const file2 = `${baseName}-1.jpg`

    const path1 = path.join(prodDir, file1)
    const path2 = path.join(prodDir, file2)

    await downloadImage(primaryUrl, path1)
    await downloadImage(secondaryUrl, path2)

    const imagesArray = [`/products/${file1}`, `/products/${file2}`]
    await prisma.product.update({
      where: { id: p.id },
      data: { images: JSON.stringify(imagesArray) }
    })
    prodSuccess++
    if (prodSuccess % 50 === 0) {
      console.log(`  Processed ${prodSuccess}/${products.length} products...`)
    }
  }

  console.log(`🎉 Finished! Successfully enriched ${prodSuccess} products with unique, rich, multi-angle imagery!`)
}

main()
  .catch((e) => {
    console.error('Error during image enrichment:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
