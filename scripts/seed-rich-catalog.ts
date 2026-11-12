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

function slugify(text: string): string {
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
          resolve(url)
        }
      } else {
        resolve(url)
      }
    })
    req.on('error', () => resolve(url))
    req.setTimeout(12000, () => {
      req.destroy()
      resolve(url)
    })
  })
}

interface ProductSeedItem {
  name: string
  brandName: string
  categorySlug: string
  price: number
  compareAtPrice?: number
  shortDescription: string
  description: string
  tags: string[]
  specs: Record<string, string>
  imageUrl: string
  rating?: number
  ratingCount?: number
  isFeatured?: boolean
  isTrending?: boolean
  isNewArrival?: boolean
  isDeal?: boolean
}

const RICH_CATALOG: ProductSeedItem[] = [
  // ==========================================
  // EYELINERS (10+ BRANDS AS REQUESTED)
  // ==========================================
  {
    name: 'Maybelline New York Colossal Bold Liner - Matte Black',
    brandName: 'Maybelline',
    categorySlug: 'makeup',
    price: 249,
    compareAtPrice: 325,
    shortDescription: 'Intense black matte waterproof eyeliner with precision felt-tip applicator.',
    description: 'The Maybelline Colossal Bold Liner delivers intense, smudge-proof pigment in a single stroke. Designed with a flexible precision tip for effortless cat eyes and dramatic wings. Waterproof and ophthalmologist tested.',
    tags: ['eyeliner', 'eye liner', 'kajal', 'maybelline', 'colossal', 'waterproof eyeliner', 'liquid eyeliner', 'black eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Matte Black', Type: 'Liquid Eyeliner', Waterproof: 'Yes', Volume: '3ml', Finish: 'Bold Matte' },
    imageUrl: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80',
    rating: 4.6,
    ratingCount: 3820,
    isTrending: true,
    isFeatured: true,
  },
  {
    name: 'Lakmé Eyeconic Liquid Eyeliner - Deep Black (Waterproof)',
    brandName: 'Lakmé',
    categorySlug: 'makeup',
    price: 260,
    compareAtPrice: 310,
    shortDescription: 'Smudge-proof, waterproof liquid eyeliner with 24-hour long stay.',
    description: 'Make a statement with Lakmé Eyeconic Liquid Eyeliner. Its unique flexi-tip brush glides smoothly over your eyelids without tugging, leaving behind a rich, glossy deep-black line that stays put through sweat, rain, and humidity.',
    tags: ['eyeliner', 'eye liner', 'kajal', 'lakme', 'eyeconic', 'waterproof eyeliner', 'smudge-proof', 'black eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Deep Black', Type: 'Liquid Eyeliner', Waterproof: 'Yes', Volume: '4.5ml', Finish: 'Glossy Black' },
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80',
    rating: 4.5,
    ratingCount: 4210,
    isDeal: true,
  },
  {
    name: 'Colorbar All-Matte Waterproof Eyeliner - 001 Matte Black',
    brandName: 'Colorbar',
    categorySlug: 'makeup',
    price: 625,
    compareAtPrice: 750,
    shortDescription: 'Ultra-matte quick-dry liquid eyeliner with 16-hour staying power.',
    description: 'Colorbar All-Matte Waterproof Eyeliner defines your eyes with intense, jet-black velvet matte definition. Its quick-drying formula will not feather, flake or smudge throughout the day.',
    tags: ['eyeliner', 'eye liner', 'colorbar', 'matte eyeliner', 'waterproof', 'black eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Matte Black', Type: 'Precision Liquid', Waterproof: 'Yes', Volume: '2.5ml', Finish: 'Velvet Matte' },
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    rating: 4.4,
    ratingCount: 1890,
  },
  {
    name: 'Nykaa Glamoreyes Liquid Eyeliner - 01 Black Swan',
    brandName: 'Nykaa',
    categorySlug: 'makeup',
    price: 299,
    compareAtPrice: 399,
    shortDescription: 'High-shine, transfer-resistant liquid eyeliner for sleek definition.',
    description: 'Nykaa Glamoreyes Liquid Eyeliner in Black Swan offers an ultra-pigmented vinyl finish with zero smudging. Its ergonomic grip and fine bristle applicator make drawing sharp graphic lines seamless.',
    tags: ['eyeliner', 'eye liner', 'nykaa', 'glamoreyes', 'liquid eyeliner', 'black swan', 'waterproof eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Black Swan', Type: 'Liquid Eyeliner', Waterproof: 'Smudge-resistant', Volume: '5ml', Finish: 'High Shine' },
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    rating: 4.3,
    ratingCount: 1450,
    isNewArrival: true,
  },
  {
    name: 'Faces Canada Magneteyes Matte Eyeliner - Intense Black',
    brandName: 'Faces Canada',
    categorySlug: 'makeup',
    price: 219,
    compareAtPrice: 249,
    shortDescription: 'Super pigmented matte dip-in liquid eyeliner with 24HR stay.',
    description: 'Give your eyes captivating depth with Faces Canada Magneteyes Matte Eyeliner. Formulated to dry in seconds with a rich matte finish that resists sweat and smearing all day long.',
    tags: ['eyeliner', 'eye liner', 'faces canada', 'magneteyes', 'matte eyeliner', 'waterproof eyeliner', 'black eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Intense Black', Type: 'Dip-in Liquid', Waterproof: 'Yes', Volume: '3.5ml', Finish: 'Ultra Matte' },
    imageUrl: 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&q=80',
    rating: 4.5,
    ratingCount: 2100,
    isTrending: true,
  },
  {
    name: 'SUGAR Cosmetics Born To Wing Gel Eyeliner - 01 Blacktrack',
    brandName: 'SUGAR',
    categorySlug: 'makeup',
    price: 549,
    compareAtPrice: 599,
    shortDescription: 'Silky smooth gel eyeliner pot with built-in professional wing brush.',
    description: 'Born to Wing Gel Eyeliner from SUGAR delivers a dramatically rich, crease-resistant opaque black finish. Perfect for creating smokey cut-creases or crisp feline flicks that stay intact for over 12 hours.',
    tags: ['eyeliner', 'eye liner', 'sugar cosmetics', 'gel eyeliner', 'wing eyeliner', 'waterproof eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Blacktrack', Type: 'Gel Eyeliner Pot', Waterproof: 'Yes', Weight: '4g', Finish: 'Intense Pigment' },
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80',
    rating: 4.6,
    ratingCount: 1670,
    isFeatured: true,
  },
  {
    name: 'Plum Eye-Swear-By Matte Liquid Eyeliner - Deep Black',
    brandName: 'Plum',
    categorySlug: 'makeup',
    price: 385,
    compareAtPrice: 450,
    shortDescription: '100% vegan, quick-dry felt tip pen eyeliner with argan oil.',
    description: 'Experience effortless precision with Plum Eye-Swear-By Eyeliner. Infused with soothing organic ingredients and argan oil, this smudge-proof felt-tip pen lets you draw wings with zero skips or flaking.',
    tags: ['eyeliner', 'eye liner', 'plum', 'vegan', 'matte eyeliner', 'waterproof eyeliner', 'deep black', 'eye makeup', 'makeup'],
    specs: { Shade: 'Deep Black', Type: 'Felt-tip Pen', Waterproof: 'Water-resistant', Volume: '3ml', Finish: 'Clean Matte' },
    imageUrl: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=800&q=80',
    rating: 4.4,
    ratingCount: 1120,
  },
  {
    name: 'Mamaearth Soothing Waterproof Eyeliner with Almond & Castor Oil',
    brandName: 'Mamaearth',
    categorySlug: 'makeup',
    price: 319,
    compareAtPrice: 399,
    shortDescription: 'Natural toxin-free waterproof sketch eyeliner with 10-hour stay.',
    description: 'Enriched with the natural goodness of almond and castor oils, this Mamaearth eyeliner nourishes your lash line while delivering pitch-black definition that does not irritate sensitive eyes.',
    tags: ['eyeliner', 'eye liner', 'mamaearth', 'natural eyeliner', 'almond oil', 'waterproof eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Charcoal Black', Type: 'Sketch Pen', Waterproof: 'Yes', Volume: '3.5ml', Finish: 'Soft Matte' },
    imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80',
    rating: 4.3,
    ratingCount: 940,
    isDeal: true,
  },
  {
    name: 'Swiss Beauty Metallic Precision Liquid Eyeliner - Golden Emerald',
    brandName: 'Swiss Beauty',
    categorySlug: 'makeup',
    price: 199,
    compareAtPrice: 249,
    shortDescription: 'Shimmering metallic liquid eyeliner for glam festive and party looks.',
    description: 'Elevate your eye makeup with Swiss Beauty Metallic Liquid Eyeliner. Featuring micro-fine shimmer particles suspended in an ultra-smooth liquid base for glistening emerald wings.',
    tags: ['eyeliner', 'eye liner', 'swiss beauty', 'metallic eyeliner', 'shimmer eyeliner', 'party makeup', 'eye makeup', 'makeup'],
    specs: { Shade: 'Golden Emerald', Type: 'Metallic Liquid', Waterproof: 'Yes', Volume: '3.5ml', Finish: 'Metallic Shimmer' },
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&q=80',
    rating: 4.2,
    ratingCount: 1350,
  },
  {
    name: 'L\'Oréal Paris Flash Cat Eye Waterproof Liquid Eyeliner',
    brandName: 'L\'Oréal Paris',
    categorySlug: 'makeup',
    price: 699,
    compareAtPrice: 799,
    shortDescription: 'Felt tip eyeliner with removable wing stencil for foolproof wings.',
    description: 'Master the perfect winged eyeliner in seconds with L\'Oréal Paris Flash Cat Eye. Comes with an innovative detachable wing template and ultra-fine flexible brush tip for flawless symmetry.',
    tags: ['eyeliner', 'eye liner', 'loreal', 'cat eye', 'winged eyeliner', 'waterproof eyeliner', 'eye makeup', 'makeup'],
    specs: { Shade: 'Blackest Black', Type: 'Felt Pen with Stencil', Waterproof: 'Yes', Volume: '1.2g', Finish: 'Precision Black' },
    imageUrl: 'https://images.unsplash.com/photo-1503236823255-94609f598e71?w=800&q=80',
    rating: 4.7,
    ratingCount: 3100,
    isFeatured: true,
  },

  // ==========================================
  // LIPSTICKS (5+ BRANDS)
  // ==========================================
  {
    name: 'Maybelline Super Stay Matte Ink Liquid Lipstick - Pioneer Red',
    brandName: 'Maybelline',
    categorySlug: 'makeup',
    price: 549,
    compareAtPrice: 699,
    shortDescription: 'Up to 16HR saturated liquid matte lipstick with arrow applicator.',
    description: 'Ink your lips in up to 16 HR saturated liquid matte with Maybelline New York Super Stay Matte Ink Liquid Lipstick. Features a unique arrow applicator for precise application.',
    tags: ['lipstick', 'matte lipstick', 'liquid lipstick', 'maybelline', 'superstay', 'red lipstick', 'makeup'],
    specs: { Shade: 'Pioneer (Red)', Finish: 'Super Matte', Longevity: '16 Hours', Volume: '5ml' },
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    rating: 4.6,
    ratingCount: 5200,
    isTrending: true,
  },
  {
    name: 'MAC Retro Matte Lipstick - Ruby Woo',
    brandName: 'MAC',
    categorySlug: 'makeup',
    price: 1950,
    compareAtPrice: 2150,
    shortDescription: 'The iconic vivid blue-red shade with long-wearing matte finish.',
    description: 'MAC Ruby Woo is the world\'s most famous matte red lipstick. A completely matte finish with intense colour payoff that flatters every skin tone.',
    tags: ['lipstick', 'mac', 'ruby woo', 'retro matte', 'luxury lipstick', 'red lipstick', 'makeup'],
    specs: { Shade: 'Ruby Woo', Finish: 'Retro Matte', Weight: '3g' },
    imageUrl: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=800&q=80',
    rating: 4.8,
    ratingCount: 6800,
    isFeatured: true,
  },
  {
    name: 'SUGAR Smudge Me Not Liquid Lipstick - 01 Brazen Raisin',
    brandName: 'SUGAR',
    categorySlug: 'makeup',
    price: 499,
    compareAtPrice: 549,
    shortDescription: 'One-coat transferproof matte liquid lipstick enriched with Vitamin E.',
    description: 'Get rich, opaque, transferproof pigment with just a single swipe. Enriched with Vitamin E to keep lips nourished while looking ultra-glam.',
    tags: ['lipstick', 'sugar', 'liquid lipstick', 'smudge proof', 'makeup'],
    specs: { Shade: 'Brazen Raisin (Burgundy)', Finish: 'Extreme Matte', Volume: '4.5ml' },
    imageUrl: 'https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?w=800&q=80',
    rating: 4.4,
    ratingCount: 2300,
  },
  {
    name: 'Lakmé Forever Matte Liquid Lip Colour - Crimson Rose',
    brandName: 'Lakmé',
    categorySlug: 'makeup',
    price: 295,
    compareAtPrice: 349,
    shortDescription: 'Lightweight everyday matte liquid lip colour with 16H stay.',
    description: 'Lakmé Forever Matte Liquid Lip Colour gives a weightless, non-drying matte texture that feels comfortable all day long.',
    tags: ['lipstick', 'lakme', 'liquid lipstick', 'matte', 'makeup'],
    specs: { Shade: 'Crimson Rose', Finish: 'Comfort Matte', Volume: '5.6ml' },
    imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80',
    rating: 4.3,
    ratingCount: 3100,
    isDeal: true,
  },

  // ==========================================
  // SUNSCREENS & SKINCARE (5+ BRANDS)
  // ==========================================
  {
    name: 'Neutrogena Ultra Sheer Dry-Touch Sunscreen SPF 50+',
    brandName: 'Neutrogena',
    categorySlug: 'skincare',
    price: 599,
    compareAtPrice: 675,
    shortDescription: 'Broad spectrum UVA/UVB protection with ultra-light, non-greasy matte feel.',
    description: 'Dermatologist-tested Helioplex technology provides superior broad-spectrum protection from skin-aging UVA and skin-burning UVB rays with a dry-touch matte feel.',
    tags: ['sunscreen', 'spf 50', 'neutrogena', 'sunblock', 'skincare', 'dry touch', 'broad spectrum'],
    specs: { SPF: '50+ PA+++', 'Skin Type': 'All', Volume: '88ml', Finish: 'Matte' },
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    rating: 4.6,
    ratingCount: 4800,
    isTrending: true,
  },
  {
    name: 'The Derma Co 1% Hyaluronic Sunscreen Aqua Gel SPF 50',
    brandName: 'The Derma Co',
    categorySlug: 'skincare',
    price: 449,
    compareAtPrice: 499,
    shortDescription: 'Zero white cast aqua gel sunscreen with Hyaluronic Acid & Vitamin E.',
    description: 'Ultra-lightweight gel that absorbs quickly into the skin without white cast or greasy residue. Protects against sun damage and blue light from electronic screens.',
    tags: ['sunscreen', 'the derma co', 'hyaluronic', 'aqua gel', 'spf 50', 'skincare', 'zero white cast'],
    specs: { SPF: '50 PA++++', 'Skin Type': 'Oily / Combination', Volume: '50g' },
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-25f385c6776c?w=800&q=80',
    rating: 4.5,
    ratingCount: 3900,
    isFeatured: true,
  },
  {
    name: 'Minimalist SPF 50 Sunscreen with Niacinamide & Vitamin B5',
    brandName: 'Minimalist',
    categorySlug: 'skincare',
    price: 399,
    compareAtPrice: 449,
    shortDescription: 'Broad spectrum SPF 50 PA++++ formulated with 4 effective UV filters.',
    description: 'A light fluid sunscreen enriched with multi-vitamins to repair sun damage while offering complete photostable protection.',
    tags: ['sunscreen', 'minimalist', 'spf 50', 'niacinamide', 'skincare'],
    specs: { SPF: '50 PA++++', 'Skin Type': 'All', Volume: '50g' },
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80',
    rating: 4.7,
    ratingCount: 4200,
  },
  {
    name: 'Aqualogica Glow+ Dewy Sunscreen with Papaya & Vitamin C',
    brandName: 'Aqualogica',
    categorySlug: 'skincare',
    price: 359,
    compareAtPrice: 399,
    shortDescription: 'Hydrating dewy sunscreen with blue light protection and natural glow.',
    description: 'Blended with Papaya extract, Vitamin C and Hyaluronic Acid to hydrate and protect, leaving behind a luminous, glass-skin finish without stickiness.',
    tags: ['sunscreen', 'aqualogica', 'dewy sunscreen', 'spf 50', 'papaya', 'vitamin c', 'skincare'],
    specs: { SPF: '50+ PA++++', 'Skin Type': 'Dry / Normal', Volume: '50g' },
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80',
    rating: 4.4,
    ratingCount: 2600,
    isDeal: true,
  },

  // ==========================================
  // SMARTPHONES (TOP BRANDS)
  // ==========================================
  {
    name: 'Apple iPhone 16 Pro Max 256GB - Desert Titanium',
    brandName: 'Apple',
    categorySlug: 'mobile-phones',
    price: 144900,
    compareAtPrice: 149900,
    shortDescription: '6.9" Super Retina XDR, A18 Pro chip, 48MP Fusion camera, 4K 120fps Dolby Vision.',
    description: 'iPhone 16 Pro Max features a stunning grade 5 titanium design with thinner borders. Powered by the A18 Pro chip for breakthrough gaming and Apple Intelligence.',
    tags: ['iphone', 'apple', 'smartphone', 'mobile', 'iphone 16 pro max', '5g', 'electronics'],
    specs: { Display: '6.9" Super Retina XDR 120Hz', Chip: 'A18 Pro', Storage: '256GB', Camera: '48MP + 48MP + 12MP 5x Telephoto' },
    imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    rating: 4.9,
    ratingCount: 6200,
    isFeatured: true,
  },
  {
    name: 'Samsung Galaxy S24 Ultra 5G (12GB RAM, 256GB) - Titanium Gray',
    brandName: 'Samsung',
    categorySlug: 'mobile-phones',
    price: 129999,
    compareAtPrice: 139999,
    shortDescription: 'Galaxy AI, 200MP camera with Quad Telephoto, Snapdragon 8 Gen 3, S-Pen included.',
    description: 'Unleash new levels of creativity and productivity with Galaxy AI on the Galaxy S24 Ultra. Titanium exterior, Corning Gorilla Armor, and 200MP zoom clarity.',
    tags: ['samsung', 'galaxy s24 ultra', 'smartphone', 'mobile', 'android', 'galaxy ai', 'electronics'],
    specs: { Display: '6.8" QHD+ Dynamic AMOLED 2X', Chip: 'Snapdragon 8 Gen 3', RAM: '12GB', Storage: '256GB' },
    imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&q=80',
    rating: 4.8,
    ratingCount: 5100,
    isTrending: true,
  },
  {
    name: 'OnePlus 12 5G (16GB RAM, 512GB) - Flowy Emerald',
    brandName: 'OnePlus',
    categorySlug: 'mobile-phones',
    price: 64999,
    compareAtPrice: 69999,
    shortDescription: 'Snapdragon 8 Gen 3, 4th Gen Hasselblad Camera, 5400mAh, 100W SUPERVOOC charging.',
    description: 'The OnePlus 12 pairs flagship performance with exceptional thermal cooling and a class-leading 2K 120Hz ProXDR display. Recharges 1 to 100% in 26 minutes.',
    tags: ['oneplus', 'oneplus 12', 'smartphone', 'mobile', '5g', 'flagship', 'electronics'],
    specs: { Display: '6.82" 2K 120Hz ProXDR', Chip: 'Snapdragon 8 Gen 3', Battery: '5400mAh 100W', RAM: '16GB' },
    imageUrl: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&q=80',
    rating: 4.7,
    ratingCount: 3800,
    isDeal: true,
  },

  // ==========================================
  // HEADPHONES & EARBUDS (5+ BRANDS)
  // ==========================================
  {
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    brandName: 'Sony',
    categorySlug: 'headphones-earbuds',
    price: 28990,
    compareAtPrice: 34990,
    shortDescription: 'Industry-leading noise cancelation with two processors and 8 microphones.',
    description: 'With Auto NC Optimizer, Sony WH-1000XM5 noise cancelling automatically adjusts based on wearing conditions and environment. Up to 30-hour battery life with quick charging.',
    tags: ['headphones', 'sony', 'wh1000xm5', 'anc', 'wireless headphones', 'noise cancelling', 'bluetooth', 'electronics'],
    specs: { Driver: '30mm Carbon Fiber', Battery: '30 Hours', ANC: 'Auto NC Optimizer', Weight: '250g' },
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    rating: 4.8,
    ratingCount: 5600,
    isFeatured: true,
  },
  {
    name: 'Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)',
    brandName: 'Apple',
    categorySlug: 'headphones-earbuds',
    price: 22900,
    compareAtPrice: 24900,
    shortDescription: 'Up to 2x more Active Noise Cancellation, Adaptive Audio, USB-C case with speaker.',
    description: 'AirPods Pro feature the Apple-designed H2 chip that pushes advanced audio performance further, creating deeply immersive sound and intelligent noise cancelation.',
    tags: ['airpods', 'airpods pro', 'apple', 'earbuds', 'wireless earbuds', 'anc', 'headphones', 'electronics'],
    specs: { Chip: 'Apple H2', ANC: '2x Active Noise Cancellation', Battery: '6h + 30h case', Case: 'USB-C MagSafe' },
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&q=80',
    rating: 4.9,
    ratingCount: 7400,
    isTrending: true,
  },
  {
    name: 'boAt Airdopes 141 True Wireless Earbuds with 42H Playtime',
    brandName: 'boAt',
    categorySlug: 'headphones-earbuds',
    price: 1299,
    compareAtPrice: 4490,
    shortDescription: '42 hours total playback, ENx noise cancellation for calls, ASAP Charge.',
    description: 'Enjoy crisp audio and punchy boAt Signature Sound with 8mm drivers. BEAST mode reduces latency down to 80ms for responsive gaming.',
    tags: ['boat', 'airdopes', 'earbuds', 'wireless earbuds', 'bluetooth', 'headphones', 'budget earbuds'],
    specs: { Drivers: '8mm', Playtime: '42 Hours Total', IPX: 'IPX4 Water Resistant', Charging: 'ASAP Charge (5m = 75m)' },
    imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=800&q=80',
    rating: 4.2,
    ratingCount: 18400,
    isDeal: true,
  },

  // ==========================================
  // RUNNING SHOES & SNEAKERS (5+ BRANDS)
  // ==========================================
  {
    name: 'Nike Air Zoom Pegasus 40 Men\'s Road Running Shoes',
    brandName: 'Nike',
    categorySlug: 'footwear',
    price: 9495,
    compareAtPrice: 10495,
    shortDescription: 'Responsive React foam with dual Zoom Air units for bouncy everyday runs.',
    description: 'The Pegasus 40 brings back the trusted, personalized fit with tuned single-layer engineered mesh. Enhanced midfoot band delivers secure stability for high-mileage training.',
    tags: ['running shoes', 'shoes', 'nike', 'pegasus', 'sneakers', 'sports shoes', 'footwear', 'fitness'],
    specs: { Drop: '10mm', Midsole: 'Nike React + Zoom Air', Terrain: 'Road / Pavement', Weight: '288g' },
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    rating: 4.7,
    ratingCount: 3900,
    isFeatured: true,
  },
  {
    name: 'Adidas Ultraboost Light Men\'s Running Shoes - Core Black',
    brandName: 'Adidas',
    categorySlug: 'footwear',
    price: 14999,
    compareAtPrice: 17999,
    shortDescription: 'Lightest BOOST foam yet for epic energy return across any distance.',
    description: 'Experience ultimate comfort with the lightest Ultraboost ever made. Linear Energy Point push-off system provides snappy propulsion with Continental Rubber grip.',
    tags: ['running shoes', 'shoes', 'adidas', 'ultraboost', 'sneakers', 'boost', 'footwear'],
    specs: { Cushioning: 'Light BOOST', Outsole: 'Continental Rubber', Drop: '10mm', Upper: 'PRIMEKNIT+ textile' },
    imageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&q=80',
    rating: 4.8,
    ratingCount: 2800,
    isTrending: true,
  },
  {
    name: 'Puma Velocity Nitro 2 Running Shoes - Puma Black/Fizzy Lime',
    brandName: 'Puma',
    categorySlug: 'footwear',
    price: 6999,
    compareAtPrice: 9999,
    shortDescription: 'NITRO foam cushioning with PUMAGRIP durable all-weather rubber traction.',
    description: 'Velocity Nitro 2 is Puma’s flagship all-in-one neutral running shoe. Plush engineered mesh hugs your foot while nitrogen-infused foam provides superior responsiveness.',
    tags: ['running shoes', 'shoes', 'puma', 'velocity nitro', 'sneakers', 'footwear'],
    specs: { Foam: 'NITRO Foam', Grip: 'PUMAGRIP Rubber', Drop: '8mm', Weight: '257g' },
    imageUrl: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=80',
    rating: 4.5,
    ratingCount: 1650,
    isDeal: true,
  },

  // ==========================================
  // SMARTWATCHES (5+ BRANDS)
  // ==========================================
  {
    name: 'Apple Watch Series 10 GPS 46mm Jet Black Aluminium Case',
    brandName: 'Apple',
    categorySlug: 'smartwatches-wearables',
    price: 49900,
    compareAtPrice: 52900,
    shortDescription: 'Thinnest Apple Watch ever with largest display, sleep apnea notifications.',
    description: 'Features a wide-angle OLED display that is up to 40% brighter when viewed from an angle. Depth gauge and water temperature sensor for aquatic adventures.',
    tags: ['apple watch', 'smartwatch', 'apple', 'fitness tracker', 'wearables', 'electronics'],
    specs: { Case: '46mm Jet Black Aluminium', Display: 'Wide-angle OLED Always-on', Water: '50m Swimproof', Sensors: 'ECG, SpO2, Temp, Depth' },
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=80',
    rating: 4.9,
    ratingCount: 4100,
    isFeatured: true,
  },
  {
    name: 'Noise ColorFit Pro 5 Smartwatch with 1.85" AMOLED Display',
    brandName: 'Noise',
    categorySlug: 'smartwatches-wearables',
    price: 3499,
    compareAtPrice: 7999,
    shortDescription: '1.85" AMOLED, TruSync Bluetooth calling, emergency SOS, 7-day battery.',
    description: 'Noise ColorFit Pro 5 offers high-precision health monitoring with a vibrant 1000-nit AMOLED screen and stylish metallic finish with functional crown.',
    tags: ['noise', 'smartwatch', 'colorfit', 'bluetooth calling', 'wearables', 'budget smartwatch'],
    specs: { Display: '1.85" AMOLED 1000 nits', Battery: '7 Days', Calling: 'TruSync BT 5.3', Water: 'IP68' },
    imageUrl: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=800&q=80',
    rating: 4.4,
    ratingCount: 12400,
    isDeal: true,
  },

  // ==========================================
  // HOME APPLIANCES & KITCHEN (PHILIPS, PREETHI)
  // ==========================================
  {
    name: 'Philips Digital Air Fryer HD9252/90 Rapid Air Technology (4.1L)',
    brandName: 'Philips',
    categorySlug: 'kitchen-dining',
    price: 8999,
    compareAtPrice: 11995,
    shortDescription: 'Cook with up to 90% less fat. 7 pre-set touch programs with keep warm function.',
    description: 'Philips Air Fryer uses Rapid Air Technology to swirl hot air to create delicious foods that are crispy on the outside and tender on the inside, using little to no added oil.',
    tags: ['air fryer', 'airfryer', 'philips', 'kitchen', 'healthy cooking', 'appliances'],
    specs: { Capacity: '4.1 Litres', Power: '1400 Watts', Presets: '7 Touch Presets', Dishwasher: 'Safe Basket' },
    imageUrl: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&q=80',
    rating: 4.6,
    ratingCount: 6300,
    isFeatured: true,
    isTrending: true,
  },
  {
    name: 'Green Soul Monster Ultimate Series High Back Ergonomic Gaming Chair',
    brandName: 'Green Soul',
    categorySlug: 'furniture',
    price: 17990,
    compareAtPrice: 24990,
    shortDescription: 'Premium breathable spandex fabric, magnetic memory foam head pillow, 4D armrests.',
    description: 'Engineered for gamers and remote professionals who sit for 8+ hours. High-density molded foam cushions and heavy-duty steel frame provide lifelong spinal support.',
    tags: ['chair', 'gaming chair', 'office chair', 'ergonomic chair', 'green soul', 'furniture'],
    specs: { Material: 'Spandex Fabric', Armrests: '4D Adjustable', Recline: '90° to 180°', Mechanism: 'Multi-lock Frog' },
    imageUrl: 'https://images.unsplash.com/photo-1580481077197-bbfd4847e06a?w=800&q=80',
    rating: 4.7,
    ratingCount: 3400,
  },

  // ==========================================
  // FITNESS & GYM (DUMBBELLS, PROTEIN)
  // ==========================================
  {
    name: 'Bowflex SelectTech 552 Adjustable Dumbbells (Pair 2.5kg to 24kg)',
    brandName: 'Bowflex',
    categorySlug: 'gym-equipment',
    price: 24999,
    compareAtPrice: 32999,
    shortDescription: 'Replaces 15 sets of weights with an intuitive selection dial.',
    description: 'Say goodbye to 15 sets of dumbbells cluttering your workout space. Turn the dial to smoothly adjust your resistance from 2.5 kg all the way up to 24 kg per dumbbell.',
    tags: ['dumbbell', 'dumbbells', 'adjustable dumbbell', 'bowflex', 'gym equipment', 'weights', 'fitness'],
    specs: { Range: '2.5kg to 24kg per hand', Increments: '2.5kg dials', Quantity: 'Pair of 2', Tray: 'Storage trays included' },
    imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&q=80',
    rating: 4.8,
    ratingCount: 2900,
    isFeatured: true,
  },
  {
    name: 'Optimum Nutrition (ON) Gold Standard 100% Whey Protein (2kg)',
    brandName: 'Optimum Nutrition',
    categorySlug: 'vitamins-supplements',
    price: 6499,
    compareAtPrice: 7299,
    shortDescription: '24g protein per serving with whey protein isolate as primary source, 5.5g BCAAs.',
    description: 'The world\'s #1 selling whey protein powder. Fast-digesting whey protein isolate helps build and repair muscle after high-intensity training.',
    tags: ['protein', 'whey protein', 'on', 'optimum nutrition', 'bodybuilding', 'supplements', 'fitness'],
    specs: { Protein: '24g per scoop', Weight: '2 kg (4.4 lbs)', Servings: '67 Servings', Flavour: 'Double Rich Chocolate' },
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80',
    rating: 4.7,
    ratingCount: 9200,
    isTrending: true,
  },
]

async function main() {
  console.log('🚀 Seeding rich Amazon/Flipkart-style catalog items...')

  // Build category cache
  const categories = await db.category.findMany()
  const catMap = new Map<string, string>()
  for (const c of categories) {
    catMap.set(c.slug, c.id)
  }

  let addedCount = 0

  for (const item of RICH_CATALOG) {
    // 1. Resolve or create Brand
    const brandSlug = slugify(item.brandName)
    let brand = await db.brand.findUnique({ where: { slug: brandSlug } })
    if (!brand) {
      brand = await db.brand.create({
        data: {
          name: item.brandName,
          slug: brandSlug,
        },
      })
      console.log(`Created new brand: ${brand.name}`)
    }

    // 2. Resolve Category
    const categoryId = catMap.get(item.categorySlug)
    if (!categoryId) {
      console.warn(`Category slug not found: ${item.categorySlug}, skipping ${item.name}`)
      continue
    }

    // 3. Download image locally
    const baseSlug = slugify(item.name)
    const imageFilename = `${baseSlug}.jpg`
    const localImagePath = await downloadImage(item.imageUrl, imageFilename)

    // 4. Create product
    const productSlug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
    const sku = `BW-${brandSlug.slice(0, 3).toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`

    await db.product.create({
      data: {
        slug: productSlug,
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        brandId: brand.id,
        categoryId: categoryId,
        price: item.price,
        compareAtPrice: item.compareAtPrice ?? null,
        sku: sku,
        stock: Math.floor(25 + Math.random() * 150),
        lowStockThreshold: 5,
        rating: item.rating ?? 4.5,
        ratingCount: item.ratingCount ?? 120,
        tags: item.tags.join(','),
        attributes: JSON.stringify(item.specs),
        images: JSON.stringify([localImagePath]),
        isActive: true,
        isFeatured: item.isFeatured ?? false,
        isTrending: item.isTrending ?? false,
        isNewArrival: item.isNewArrival ?? false,
        isDeal: item.isDeal ?? false,
      },
    })

    addedCount++
    console.log(`[${addedCount}/${RICH_CATALOG.length}] Added: ${item.name} (${brand.name})`)
  }

  console.log(`\n🎉 Successfully added ${addedCount} branded products!`)
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
