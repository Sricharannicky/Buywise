import { db } from '../src/lib/db'
import { hashPassword } from '../src/lib/auth'
import { slugify } from '../src/lib/format'

// Product image helper — stores an emoji token that the frontend ProductImage
// component renders as a clean gradient placeholder. Self-contained & reliable.
function img(emoji: string): string {
  return JSON.stringify([emoji])
}

interface SeedProduct {
  name: string
  brand: string
  category: string
  price: number
  compareAt?: number
  stock: number
  shortDescription: string
  description: string
  tags: string[]
  specs: Record<string, string>
  emoji: string
  flags?: { featured?: boolean; trending?: boolean; newArrival?: boolean; deal?: boolean }
}

const BRANDS = ['Aurora', 'Nimbus', 'Vertex', 'Lumen', 'Forge', 'Halcyon', 'Quartz', 'Drift', 'Atlas', 'Mira']

const CATEGORIES = [
  { name: 'Electronics', slug: 'electronics', emoji: '💻', children: [
    { name: 'Laptops', slug: 'laptops' },
    { name: 'Headphones', slug: 'headphones' },
    { name: 'Smartphones', slug: 'smartphones' },
    { name: 'Wearables', slug: 'wearables' },
  ]},
  { name: 'Home & Living', slug: 'home-living', emoji: '🛋️', children: [
    { name: 'Furniture', slug: 'furniture' },
    { name: 'Kitchen', slug: 'kitchen' },
    { name: 'Decor', slug: 'decor' },
  ]},
  { name: 'Fashion', slug: 'fashion', emoji: '👕', children: [
    { name: 'Footwear', slug: 'footwear' },
    { name: 'Bags', slug: 'bags' },
    { name: 'Watches', slug: 'watches' },
  ]},
  { name: 'Sports & Fitness', slug: 'sports-fitness', emoji: '🏃', children: [
    { name: 'Fitness Equipment', slug: 'fitness-equipment' },
    { name: 'Outdoor', slug: 'outdoor' },
  ]},
  { name: 'Beauty & Care', slug: 'beauty-care', emoji: '💆', children: [
    { name: 'Skincare', slug: 'skincare' },
    { name: 'Grooming', slug: 'grooming' },
  ]},
]

const PRODUCTS: SeedProduct[] = [
  // ===== Laptops =====
  { name: 'Aurora Pro 14 Laptop', brand: 'Aurora', category: 'laptops', price: 74999, compareAt: 89999, stock: 24, emoji: '💻', flags: { trending: true, featured: true },
    shortDescription: '14" OLED, M3-class chip, 16GB RAM, 512GB SSD',
    description: 'The Aurora Pro 14 is a premium ultraportable laptop engineered for programmers, creators and professionals. A stunning 14-inch OLED display delivers deep blacks and crisp text, while the efficient Aurora M3 chip provides all-day battery life with silent fanless operation. 16GB unified memory and a 512GB NVMe SSD keep builds, compiles and multi-tab workflows snappy.',
    tags: ['laptop','programming','gaming','oled','ultrabook','premium'], specs: { Display: '14" OLED 2.8K', Processor: 'Aurora M3 8-core', RAM: '16GB Unified', Storage: '512GB NVMe SSD', Battery: 'Up to 18 hrs', Weight: '1.55 kg' } },
  { name: 'Vertex Strike 16 Gaming Laptop', brand: 'Vertex', category: 'laptops', price: 119999, compareAt: 134999, stock: 12, emoji: '🖥️', flags: { trending: true },
    shortDescription: 'RTX 4070, Ryzen 9, 16" 240Hz, 32GB RAM',
    description: 'Built for high-frame-rate gaming and serious content work. The Vertex Strike 16 pairs a 240Hz QHD+ panel with a next-gen GPU and 32GB of DDR5 memory. An advanced vapour-chamber cooling system keeps thermals in check during long sessions.',
    tags: ['laptop','gaming','rtx','high-performance'], specs: { Display: '16" QHD+ 240Hz', GPU: 'RTX 4070 8GB', CPU: 'Ryzen 9 8-core', RAM: '32GB DDR5', Storage: '1TB NVMe SSD', Cooling: 'Vapour Chamber' } },
  { name: 'Nimbus Air 13 Ultrabook', brand: 'Nimbus', category: 'laptops', price: 62999, compareAt: 69999, stock: 40, emoji: '💻', flags: { newArrival: true },
    shortDescription: '13" FHD, i5, 8GB, 256GB, 1.2kg',
    description: 'The Nimbus Air 13 is the ideal everyday ultrabook — light, fast and reliable. A 13-inch Full HD anti-glare display, all-aluminium chassis and 14-hour battery make it perfect for students and mobile professionals.',
    tags: ['laptop','ultrabook','student','portable'], specs: { Display: '13.3" FHD IPS', CPU: 'Intel i5-1335U', RAM: '8GB LPDDR5', Storage: '256GB SSD', Battery: '14 hrs', Weight: '1.2 kg' } },
  { name: 'Forge Workstation 15', brand: 'Forge', category: 'laptops', price: 94999, compareAt: 104999, stock: 8, emoji: '💻',
    shortDescription: '15.6" 4K, i9, 32GB, 1TB, RTX 4060',
    description: 'A mobile workstation tuned for 3D rendering, video editing and data science. Colour-accurate 4K panel, ECC-grade memory and ISV-certified drivers.',
    tags: ['laptop','workstation','4k','creator'], specs: { Display: '15.6" 4K OLED', CPU: 'Intel i9-13900H', RAM: '32GB DDR5', Storage: '1TB SSD', GPU: 'RTX 4060' } },

  // ===== Headphones =====
  { name: 'Lumen Quiet ANC Headphones', brand: 'Lumen', category: 'headphones', price: 18999, compareAt: 24999, stock: 60, emoji: '🎧', flags: { trending: true, deal: true, featured: true },
    shortDescription: 'Adaptive ANC, 40h battery, Hi-Res audio',
    description: 'Industry-leading adaptive noise cancellation that reads your environment 50,000 times a second. 40-hour battery life, plush memory-foam earcups and Hi-Res certified sound make the Lumen Quiet your perfect travel and focus companion.',
    tags: ['headphones','anc','wireless','travel','music'], specs: { 'Noise Cancelling': 'Adaptive ANC', Battery: '40 hrs', Connectivity: 'Bluetooth 5.3 + USB-C', 'Audio': 'Hi-Res LDAC', Weight: '254 g' } },
  { name: 'Drift Buds Pro', brand: 'Drift', category: 'headphones', price: 6999, compareAt: 8999, stock: 120, emoji: '🎵', flags: { newArrival: true },
    shortDescription: 'True wireless, ANC, 30h with case',
    description: 'Compact true-wireless earbuds with active noise cancellation, transparency mode and a wireless charging case. IPX5 sweat resistance for workouts.',
    tags: ['earbuds','wireless','anc','workout'], specs: { Type: 'True Wireless', ANC: 'Yes', Battery: '6h + 24h case', 'Water Resistance': 'IPX5', Connectivity: 'Bluetooth 5.3' } },
  { name: 'Quartz Studio Monitor Headphones', brand: 'Quartz', category: 'headphones', price: 12999, compareAt: 15999, stock: 35, emoji: '🎧',
    shortDescription: 'Studio reference, wired, flat response',
    description: 'Closed-back studio monitor headphones with a deliberately flat frequency response for mixing and critical listening. Detachable cable and foldable design.',
    tags: ['headphones','studio','audio','wired'], specs: { Type: 'Closed-back wired', Impedance: '38 ohm', 'Frequency Response': '5Hz-40kHz', Cable: '3m detachable' } },

  // ===== Smartphones =====
  { name: 'Atlas X Pro Smartphone', brand: 'Atlas', category: 'smartphones', price: 54999, compareAt: 59999, stock: 80, emoji: '📱', flags: { trending: true, featured: true },
    shortDescription: '6.7" 120Hz, triple 50MP, 5000mAh',
    description: 'Flagship smartphone with a 6.7-inch LTPO AMOLED 120Hz display, triple 50MP camera system with OIS, and a 5000mAh battery with 80W fast charging. Titanium frame and IP68 rating.',
    tags: ['phone','smartphone','flagship','camera'], specs: { Display: '6.7" LTPO AMOLED 120Hz', Camera: '50MP+50MP+50MP', Battery: '5000mAh, 80W', Chip: 'Atlas A2 Pro', Build: 'Titanium, IP68' } },
  { name: 'Mira Lite 5G', brand: 'Mira', category: 'smartphones', price: 19999, compareAt: 22999, stock: 150, emoji: '📲', flags: { deal: true, newArrival: true },
    shortDescription: '6.5" 90Hz, 64MP, 5000mAh, 5G',
    description: 'Affordable 5G smartphone with a smooth 90Hz display, 64MP main camera and a big 5000mAh battery. Clean software experience with 3 years of updates.',
    tags: ['phone','5g','budget'], specs: { Display: '6.5" 90Hz', Camera: '64MP+8MP+2MP', Battery: '5000mAh', Chip: 'Mira M3 5G' } },

  // ===== Wearables =====
  { name: 'Aurora Watch Series 7', brand: 'Aurora', category: 'wearables', price: 24999, compareAt: 29999, stock: 70, emoji: '⌚', flags: { trending: true },
    shortDescription: 'AMOLED, ECG, SpO2, GPS, 7-day battery',
    description: 'Premium smartwatch with always-on AMOLED display, ECG and blood-oxygen sensors, built-in GPS and 7-day battery life. Aluminium case with swim-proof design.',
    tags: ['watch','smartwatch','fitness','health'], specs: { Display: '1.4" AMOLED Always-on', Sensors: 'ECG, SpO2, HR, GPS', Battery: '7 days', 'Water Resistance': '5 ATM', Build: 'Aluminium' } },
  { name: 'Drift Band Fit 3', brand: 'Drift', category: 'wearables', price: 3999, compareAt: 4999, stock: 200, emoji: '⌚', flags: { deal: true },
    shortDescription: 'Fitness tracker, 14-day battery, HR+SpO2',
    description: 'Lightweight fitness band with continuous heart-rate, SpO2 and sleep tracking. 14-day battery and 5 ATM water resistance.',
    tags: ['fitness','tracker','band'], specs: { Display: '1.1" AMOLED', Battery: '14 days', Sensors: 'HR, SpO2, Sleep', 'Water Resistance': '5 ATM' } },

  // ===== Furniture =====
  { name: 'Forge Ergonomic Office Chair', brand: 'Forge', category: 'furniture', price: 15999, compareAt: 21999, stock: 30, emoji: '🪑', flags: { trending: true, featured: true },
    shortDescription: 'Mesh back, lumbar support, 4D armrests',
    description: 'A professional ergonomic chair with breathable mesh back, dynamic lumbar support, adjustable 4D armrests and a synchronised tilt mechanism. Built for 8+ hour workdays.',
    tags: ['chair','office','ergonomic','furniture'], specs: { Material: 'Breathable mesh', 'Lumbar Support': 'Dynamic adjustable', Armrests: '4D adjustable', 'Weight Capacity': '150 kg', Warranty: '5 years' } },
  { name: 'Halcyon 3-Seater Fabric Sofa', brand: 'Halcyon', category: 'furniture', price: 38999, compareAt: 49999, stock: 15, emoji: '🛋️',
    shortDescription: '3-seater, premium fabric, solid wood frame',
    description: 'A timeless 3-seater sofa with high-resilience foam cushions, stain-resistant premium fabric and a kiln-dried solid wood frame. Tool-free assembly in 10 minutes.',
    tags: ['sofa','furniture','living-room'], specs: { Dimensions: '210x90x85 cm', Material: 'Premium fabric', Frame: 'Solid wood', 'Seat Cushion': 'High-resilience foam' } },
  { name: 'Atlas Standing Desk Pro', brand: 'Atlas', category: 'furniture', price: 27999, compareAt: 32999, stock: 22, emoji: '🗄️', flags: { newArrival: true },
    shortDescription: 'Electric sit-stand, 4-memory, bamboo top',
    description: 'Electric height-adjustable standing desk with a bamboo top, quiet dual motor and 4 memory presets. Cable management tray included.',
    tags: ['desk','standing','office','furniture'], specs: { 'Height Range': '68-118 cm', Top: 'Bamboo 140x70cm', Motor: 'Dual quiet motor', Presets: '4 memory', 'Load Capacity': '100 kg' } },

  // ===== Kitchen =====
  { name: 'Vertex Brew Pro Espresso Machine', brand: 'Vertex', category: 'kitchen', price: 21999, compareAt: 26999, stock: 25, emoji: '☕', flags: { trending: true },
    shortDescription: '15-bar, milk frother, PID temperature',
    description: 'Café-grade espresso at home. 15-bar Italian pump, PID temperature control for consistent shots and a powerful steam wand for micro-foam milk.',
    tags: ['coffee','espresso','kitchen'], specs: { Pressure: '15 bar', 'Temperature': 'PID controlled', 'Steam Wand': '360° professional', 'Water Tank': '2L' } },
  { name: 'Nimbus Air Fryer 6L', brand: 'Nimbus', category: 'kitchen', price: 8999, compareAt: 11999, stock: 90, emoji: '🍳', flags: { deal: true },
    shortDescription: '6L, 1700W, 8 presets, digital',
    description: 'Large 6-litre air fryer with rapid hot-air circulation, 8 one-touch presets and a dishwasher-safe basket. Cook with up to 90% less oil.',
    tags: ['air-fryer','kitchen','healthy'], specs: { Capacity: '6L', Power: '1700W', Presets: '8 one-touch', Display: 'Digital touch' } },
  { name: 'Lumen Chef Knife Set', brand: 'Lumen', category: 'kitchen', price: 5999, compareAt: 7999, stock: 60, emoji: '🔪',
    shortDescription: '5-piece German steel, wooden block',
    description: 'A 5-piece knife set forged from high-carbon German stainless steel with ergonomic pakkawood handles and an acacia wood storage block.',
    tags: ['knives','kitchen','cooking'], specs: { Pieces: '5', Steel: 'German X50CrMoV15', Handles: 'Pakkawood', Block: 'Acacia wood' } },

  // ===== Decor =====
  { name: 'Halcyon Aroma Diffuser', brand: 'Halcyon', category: 'decor', price: 2499, compareAt: 3499, stock: 140, emoji: '🪔', flags: { newArrival: true },
    shortDescription: 'Ultrasonic, 300ml, 7-colour LED',
    description: 'Ultrasonic aroma diffuser with a 300ml tank, 7-colour ambient LED and auto shut-off. Whisper-quiet operation for bedrooms and offices.',
    tags: ['decor','aroma','wellness'], specs: { Capacity: '300ml', Runtime: '10 hrs', Light: '7-colour LED', 'Auto Shut-off': 'Yes' } },
  { name: 'Quartz Table Lamp Warm', brand: 'Quartz', category: 'decor', price: 4499, compareAt: 5999, stock: 45, emoji: '💡',
    shortDescription: 'Matte ceramic, warm LED, dimmable',
    description: 'A sculptural table lamp in matte ceramic with a built-in warm dimmable LED. Perfect ambient lighting for living rooms and bedrooms.',
    tags: ['lamp','decor','lighting'], specs: { Material: 'Ceramic matte', Light: 'Warm 2700K LED', Dimming: 'Stepless', Height: '38 cm' } },

  // ===== Footwear =====
  { name: 'Drift Run Pro Running Shoes', brand: 'Drift', category: 'footwear', price: 8999, compareAt: 11999, stock: 100, emoji: '👟', flags: { trending: true, featured: true },
    shortDescription: 'Carbon plate, superfoam, race-ready',
    description: 'A race-day running shoe with a full-length carbon-fibre plate and supercritical foam midsole. Engineered for personal bests from 5K to marathon.',
    tags: ['shoes','running','fitness','sports'], specs: { Drop: '8mm', Weight: '215g', 'Midsole': 'Supercritical foam', Plate: 'Full-length carbon' } },
  { name: 'Atlas Trek Hiking Boots', brand: 'Atlas', category: 'footwear', price: 11999, compareAt: 14999, stock: 50, emoji: '🥾',
    shortDescription: 'Waterproof, Vibram sole, ankle support',
    description: 'Rugged waterproof hiking boots with a Vibram outsole, full-grain leather upper and gusseted tongue. Built for multi-day treks.',
    tags: ['boots','hiking','outdoor'], specs: { Upper: 'Full-grain leather', Sole: 'Vibram', Waterproof: 'Yes', Weight: '620g' } },

  // ===== Bags =====
  { name: 'Mira Commuter Backpack 25L', brand: 'Mira', category: 'bags', price: 6999, compareAt: 8999, stock: 80, emoji: '🎒', flags: { newArrival: true },
    shortDescription: '25L, laptop sleeve, weatherproof',
    description: 'A weatherproof commuter backpack with a padded 16-inch laptop sleeve, hidden anti-theft pocket and luggage pass-through. YKK Aquaguard zippers throughout.',
    tags: ['backpack','commuter','travel'], specs: { Capacity: '25L', 'Laptop Sleeve': 'Up to 16"', Material: 'Recycled weatherproof', Zippers: 'YKK Aquaguard' } },
  { name: 'Halcyon Leather Tote', brand: 'Halcyon', category: 'bags', price: 14999, compareAt: 18999, stock: 30, emoji: '👜',
    shortDescription: 'Full-grain leather, 14" laptop fit',
    description: 'A timeless full-grain leather tote with brass hardware and a suede-lined interior. Fits a 14-inch laptop with room to spare.',
    tags: ['bag','tote','leather','fashion'], specs: { Material: 'Full-grain leather', Hardware: 'Brass', 'Laptop Fit': '14"', Dimensions: '40x30x12 cm' } },

  // ===== Watches (fashion) =====
  { name: 'Quartz Heritage Auto Watch', brand: 'Quartz', category: 'watches', price: 16999, compareAt: 21999, stock: 40, emoji: '⌚', flags: { featured: true },
    shortDescription: 'Automatic, sapphire crystal, 100m',
    description: 'A mechanical automatic watch with an exhibition caseback, sapphire crystal and 100m water resistance. Classic dress-sport styling on a stainless bracelet.',
    tags: ['watch','automatic','luxury','fashion'], specs: { Movement: 'Automatic (40h reserve)', Crystal: 'Sapphire', 'Water Resistance': '100m', Case: '40mm stainless steel' } },

  // ===== Fitness Equipment =====
  { name: 'Forge Adjustable Dumbbell Set', brand: 'Forge', category: 'fitness-equipment', price: 19999, compareAt: 25999, stock: 35, emoji: '🏋️', flags: { trending: true },
    shortDescription: '2.5-24kg per hand, quick-select',
    description: 'A pair of quick-select adjustable dumbbells covering 2.5 to 24kg per hand. Replaces 15 sets of fixed dumbbells with a compact footprint.',
    tags: ['dumbbell','fitness','home-gym'], specs: { 'Weight Range': '2.5-24kg per hand', Increments: '2.5kg', Pair: 'Yes', Tray: 'Included' } },
  { name: 'Drift Yoga Mat Pro', brand: 'Drift', category: 'fitness-equipment', price: 2999, compareAt: 3999, stock: 110, emoji: '🧘', flags: { deal: true },
    shortDescription: '6mm, natural rubber, non-slip',
    description: 'A premium 6mm yoga mat made from natural tree rubber with a polyurethane top layer for unmatched grip — wet or dry. Alignment lines included.',
    tags: ['yoga','mat','fitness'], specs: { Thickness: '6mm', Material: 'Natural rubber + PU', Dimensions: '183x68cm', Grip: 'Wet & dry' } },

  // ===== Outdoor =====
  { name: 'Atlas Camping Tent 4P', brand: 'Atlas', category: 'outdoor', price: 12999, compareAt: 15999, stock: 28, emoji: '⛺',
    shortDescription: '4-person, 3-season, quick-pitch',
    description: 'A spacious 3-season tent for 4 people with a quick-pitch hub design, taped seams and a full-coverage rain fly. Packs down to 58cm.',
    tags: ['tent','camping','outdoor'], specs: { Capacity: '4 person', Season: '3', 'Pitch Time': '5 min', Packed: '58cm, 3.2kg' } },

  // ===== Skincare =====
  { name: 'Mira Glow Vitamin C Serum', brand: 'Mira', category: 'skincare', price: 1299, compareAt: 1799, stock: 200, emoji: '🧴', flags: { trending: true, deal: true },
    shortDescription: '15% Vit-C, hyaluronic, 30ml',
    description: 'A brightening vitamin C serum with 15% L-ascorbic acid, hyaluronic acid and vitamin E. Evens tone and boosts radiance without irritation.',
    tags: ['skincare','serum','beauty'], specs: { Volume: '30ml', 'Vitamin C': '15% L-ascorbic', 'Key Actives': 'Hyaluronic, Vit-E', 'Skin Type': 'All' } },
  { name: 'Lumen Hydra Moisturiser', brand: 'Lumen', category: 'skincare', price: 999, compareAt: 1299, stock: 180, emoji: '🧴',
    shortDescription: 'Ceramides, niacinamide, 50ml',
    description: 'A lightweight daily moisturiser with ceramides, niacinamide and squalane. Strengthens the skin barrier and provides 48-hour hydration.',
    tags: ['skincare','moisturiser','beauty'], specs: { Volume: '50ml', Actives: 'Ceramides, Niacinamide, Squalane', 'Skin Type': 'All', Fragrance: 'Free' } },

  // ===== Grooming =====
  { name: 'Forge Pro Beard Trimmer', brand: 'Forge', category: 'grooming', price: 3499, compareAt: 4499, stock: 130, emoji: '✂️', flags: { newArrival: true },
    shortDescription: 'Cordless, 20 lengths, 90min battery',
    description: 'A precision cordless beard trimmer with self-sharpening stainless blades, 20 length settings and a 90-minute runtime on a 1-hour charge.',
    tags: ['trimmer','grooming','beauty'], specs: { Battery: '90 min runtime', Settings: '20 lengths', Blades: 'Self-sharpening stainless', Charging: 'USB-C' } },
]

async function main() {
  console.log('🌱 Seeding database...')

  // Categories
  const categoryMap = new Map<string, string>()
  for (const cat of CATEGORIES) {
    const parent = await db.category.create({
      data: { name: cat.name, slug: cat.slug, imageUrl: cat.emoji, description: `${cat.name} category` },
    })
    categoryMap.set(cat.slug, parent.id)
    for (const child of cat.children) {
      const c = await db.category.create({
        data: { name: child.name, slug: child.slug, parentId: parent.id, description: `${child.name} — ${cat.name}` },
      })
      categoryMap.set(child.slug, c.id)
    }
  }

  // Brands
  const brandMap = new Map<string, string>()
  for (const b of BRANDS) {
    const brand = await db.brand.create({ data: { name: b, slug: slugify(b) } })
    brandMap.set(b, brand.id)
  }

  // Products
  let i = 0
  for (const p of PRODUCTS) {
    const categoryId = categoryMap.get(p.category)
    const brandId = brandMap.get(p.brand)
    if (!categoryId || !brandId) {
      console.warn(`Missing category or brand for ${p.name}`)
      continue
    }
    await db.product.create({
      data: {
        slug: slugify(p.name) + '-' + (i++),
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        brandId,
        categoryId,
        price: p.price,
        compareAtPrice: p.compareAt ?? null,
        sku: 'SKU-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
        stock: p.stock,
        rating: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
        ratingCount: Math.floor(Math.random() * 800) + 20,
        tags: p.tags.join(','),
        attributes: JSON.stringify(p.specs),
        images: img(p.emoji),
        isFeatured: p.flags?.featured ?? false,
        isTrending: p.flags?.trending ?? false,
        isNewArrival: p.flags?.newArrival ?? false,
        isDeal: p.flags?.deal ?? false,
      },
    })
  }

  // Demo customer
  const existing = await db.user.findUnique({ where: { email: 'demo@ai-shop.in' } })
  if (!existing) {
    const user = await db.user.create({
      data: {
        email: 'demo@ai-shop.in',
        passwordHash: hashPassword('demo1234'),
        firstName: 'Demo',
        lastName: 'Shopper',
        phone: '9876543210',
        role: 'CUSTOMER',
        preferences: { create: { aiPersonalization: 'INTELLIGENT' } },
        financial: { create: { monthlyIncome: 80000, monthlyShoppingBudget: 12000, fixedExpenses: 35000, savingsTarget: 15000 } },
        addresses: { create: [{ fullName: 'Demo Shopper', phone: '9876543210', line1: '12 MG Road', city: 'Bengaluru', state: 'Karnataka', pincode: '560001', isDefault: true }] },
        cart: { create: {} },
        wishlist: { create: {} },
      },
    })
    await db.goal.create({
      data: {
        userId: user.id,
        title: 'New Workstation Setup',
        targetAmount: 150000,
        currentAmount: 45000,
        status: 'ACTIVE',
        targetDate: new Date('2026-06-01'),
      },
    })
    console.log('✅ Created demo user: demo@ai-shop.in / demo1234')
  }

  // Admin
  const adminExisting = await db.user.findUnique({ where: { email: 'admin@ai-shop.in' } })
  if (!adminExisting) {
    await db.user.create({
      data: { email: 'admin@ai-shop.in', passwordHash: hashPassword('admin1234'), firstName: 'Store', lastName: 'Admin', role: 'ADMIN' },
    })
    console.log('✅ Created admin: admin@ai-shop.in / admin1234')
  }

  console.log(`✅ Seeded ${PRODUCTS.length} products, ${CATEGORIES.length} parent categories, ${BRANDS.length} brands`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
