import { PrismaClient } from '@prisma/client'
import path from 'path'

const db = new PrismaClient({
  datasourceUrl: `file:${path.resolve(process.cwd(), 'db/custom.db')}`,
})

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const EXTRA_PRODUCTS = [
  // AIR FRYERS
  {
    name: 'Instant Vortex Plus 6-in-1 Air Fryer with ClearCook (5.7L)',
    brand: 'Instant Pot',
    category: 'kitchen-dining',
    price: 10999,
    compareAt: 14999,
    shortDesc: 'ClearCook window, odor erase filters, 6 customizable cooking programs.',
    desc: 'Instant Vortex Plus 6-in-1 Air Fryer features a ClearCook see-through window and internal light to monitor cooking progress without opening the basket. EvenCrisp airflow delivers tender, golden results.',
    tags: ['air fryer', 'airfryer', 'instant pot', 'kitchen', 'healthy cooking'],
    specs: { Capacity: '5.7L', Programs: '6-in-1', Power: '1700W' },
    image: '/products/air-fryer-6l-digital-rqsl.jpg',
  },
  {
    name: 'Havells Grande Digital Air Fryer with 10 Auto Cooking Presets (6.5L)',
    brand: 'Havells',
    category: 'kitchen-dining',
    price: 7999,
    compareAt: 12990,
    shortDesc: 'Aero Crisp technology, 360-degree hot air circulation, digital touch display.',
    desc: 'Havells Grande Air Fryer features Aero Crisp Technology that allows 360-degree air circulation for faster and even cooking with up to 85% less oil.',
    tags: ['air fryer', 'airfryer', 'havells', 'kitchen', 'fryer'],
    specs: { Capacity: '6.5L', Power: '1700W', Display: 'LED Touch' },
    image: '/products/air-fryer-6l-digital-rqsl-213-0.jpg',
  },
  {
    name: 'Morphy Richards CrispPro Digital Air Fryer (5L)',
    brand: 'Morphy Richards',
    category: 'kitchen-dining',
    price: 6499,
    compareAt: 9995,
    shortDesc: 'Dual convection fan technology, non-stick coated basket, 8 one-touch presets.',
    desc: 'Experience guilt-free fried foods with Morphy Richards CrispPro Air Fryer. Advanced convection heating ensures crispy outer layer and juicy interior.',
    tags: ['air fryer', 'airfryer', 'morphy richards', 'kitchen'],
    specs: { Capacity: '5L', Power: '1500W' },
    image: '/products/air-fryer-6l-digital-rqsl-213-1.jpg',
  },
  {
    name: 'Pigeon Healthifry Digital Air Fryer (4.2L)',
    brand: 'Pigeon',
    category: 'kitchen-dining',
    price: 2999,
    compareAt: 5995,
    shortDesc: 'Compact 1200W digital air fryer with 360 degree high speed air circulation.',
    desc: 'Pigeon Healthifry is a budget-friendly digital air fryer designed for Indian kitchens, enabling crispy samosas, french fries, and roasted veggies with 90% less oil.',
    tags: ['air fryer', 'airfryer', 'pigeon', 'kitchen', 'budget'],
    specs: { Capacity: '4.2L', Power: '1200W' },
    image: '/products/air-fryer-6l-digital-rqsl.jpg',
  },

  // DUMBBELLS
  {
    name: 'Cockatoo Rubber Coated Hex Dumbbells Set (10kg Pair)',
    brand: 'Cockatoo',
    category: 'gym-equipment',
    price: 3499,
    compareAt: 4999,
    shortDesc: 'Professional hex rubber encased dumbbells with knurled chrome steel handle.',
    desc: 'Cockatoo Hex Rubber Dumbbells prevent rolling and protect your flooring. Ergonomic knurled grip provides secure hold during heavy dumbbell bench and shoulder presses.',
    tags: ['dumbbell', 'dumbbells', 'cockatoo', 'weights', 'gym equipment', 'fitness'],
    specs: { Weight: '10kg x 2 (20kg Total)', Shape: 'Hexagonal', Handle: 'Chrome Knurled' },
    image: '/products/adjustable-dumbbell-set-24kg-h7bi-323-0.jpg',
  },
  {
    name: 'Kobo Hex Rubber Dumbbells (5kg Pair)',
    brand: 'Kobo',
    category: 'gym-equipment',
    price: 1899,
    compareAt: 2799,
    shortDesc: 'Premium virgin rubber coated cast iron hexagonal dumbbells for home workouts.',
    desc: 'Kobo Hex Dumbbells are manufactured from high-quality solid cast iron encased in heavy-duty virgin rubber for shock absorption and quiet gym performance.',
    tags: ['dumbbell', 'dumbbells', 'kobo', 'weights', 'fitness'],
    specs: { Weight: '5kg x 2 (10kg Total)', Shape: 'Hexagonal' },
    image: '/products/adjustable-dumbbell-set-24kg-h7bi-323-1.jpg',
  },
  {
    name: 'Cultsport Chrome Grip Hex Dumbbells (7.5kg Pair)',
    brand: 'Cultsport',
    category: 'gym-equipment',
    price: 2699,
    compareAt: 3999,
    shortDesc: 'Engineered for HIIT and strength conditioning with anti-roll hex head.',
    desc: 'Cultsport hex dumbbells combine heavy-duty iron cores with durable protective rubber coating. Knurled steel handles ensure non-slip grip during sweaty sessions.',
    tags: ['dumbbell', 'dumbbells', 'cultsport', 'weights', 'fitness'],
    specs: { Weight: '7.5kg x 2', Shape: 'Hex' },
    image: '/products/adjustable-dumbbell-set-24kg-h7bi.jpg',
  },

  // WHEY PROTEIN
  {
    name: 'MuscleBlaze Biozyme Performance Whey Protein (2kg) - Rich Chocolate',
    brand: 'MuscleBlaze',
    category: 'vitamins-supplements',
    price: 4499,
    compareAt: 5299,
    shortDesc: 'Enhanced Absorption Formula (EAF) with 25g protein and 5.51g BCAA per scoop.',
    desc: 'Clinically tested Biozyme formula ensures 50% higher protein absorption and 60% higher BCAA absorption, minimizing stomach bloating.',
    tags: ['whey protein', 'protein', 'muscleblaze', 'biozyme', 'supplements', 'fitness'],
    specs: { Protein: '25g', Servings: '66', Flavour: 'Rich Chocolate' },
    image: '/products/amla-juice-1l-lqr4-319-0.jpg',
  },
  {
    name: 'MuscleTech Nitro-Tech 100% Whey Gold (2.2kg) - Double Rich Chocolate',
    brand: 'MuscleTech',
    category: 'vitamins-supplements',
    price: 5899,
    compareAt: 6999,
    shortDesc: 'Micro-filtered whey peptides and isolate for superior muscle building.',
    desc: 'Nitro-Tech 100% Whey Gold features whey protein peptides and isolate for rapid absorption and digestion. Delivers 24g of ultra-pure protein per scoop.',
    tags: ['whey protein', 'protein', 'muscletech', 'nitro-tech', 'supplements', 'fitness'],
    specs: { Protein: '24g', Servings: '76', Flavour: 'Double Rich Chocolate' },
    image: '/products/amla-juice-1l-lqr4-319-1.jpg',
  },
  {
    name: 'Dymatize ISO 100 Hydrolyzed 100% Whey Isolate (2.3kg) - Gourmet Chocolate',
    brand: 'Dymatize',
    category: 'vitamins-supplements',
    price: 8499,
    compareAt: 9999,
    shortDesc: 'Ultra-fast absorbing hydrolyzed whey isolate with zero sugar and fat.',
    desc: 'Recognized worldwide for quality and purity, Dymatize ISO 100 uses cross-flow microfiltration to preserve muscle-building fractions while removing excess fat and lactose.',
    tags: ['whey protein', 'protein', 'dymatize', 'iso 100', 'whey isolate', 'supplements'],
    specs: { Protein: '25g', BCAA: '5.5g', Servings: '71', Flavour: 'Gourmet Chocolate' },
    image: '/products/amla-juice-1l-lqr4.jpg',
  },
  {
    name: 'Myprotein Impact Whey Protein (2.5kg) - Chocolate Smooth',
    brand: 'Myprotein',
    category: 'vitamins-supplements',
    price: 5299,
    compareAt: 6499,
    shortDesc: 'Premium Grade-A whey protein powder with 21g protein per serving.',
    desc: 'Ranked Grade A by independent lab Labdoor for quality and value, Myprotein Impact Whey delivers premium grass-fed whey to support all your workout goals.',
    tags: ['whey protein', 'protein', 'myprotein', 'impact whey', 'supplements'],
    specs: { Protein: '21g', Servings: '100', Flavour: 'Chocolate Smooth' },
    image: '/products/amla-juice-1l-lqr4-319-0.jpg',
  },

  // FOUNDATIONS
  {
    name: 'Maybelline Fit Me Matte + Poreless Liquid Foundation (SPF 22)',
    brand: 'Maybelline',
    category: 'makeup',
    price: 549,
    compareAt: 649,
    shortDesc: 'Oil-free matte foundation that refines pores and leaves a natural, seamless finish.',
    desc: 'Maybelline Fit Me Matte + Poreless Foundation matches your natural tone and texture. Micro-powders absorb shine while blur micro-particles minimize appearance of pores.',
    tags: ['foundation', 'maybelline', 'fit me', 'matte foundation', 'makeup'],
    specs: { Finish: 'Matte', SPF: '22', Volume: '30ml' },
    image: '/products/under-eye-cream-20ml-i1fl.jpg',
  },
  {
    name: "L'Oréal Paris Infallible 24H Fresh Wear Foundation (SPF 25)",
    brand: "L'Oréal Paris",
    category: 'makeup',
    price: 999,
    compareAt: 1299,
    shortDesc: 'Breathable full coverage liquid foundation that resists sweat, heat, and transfer.',
    desc: 'Formulated with oxygen technology to feel weightless on your skin while delivering full, waterproof, transfer-resistant 24-hour coverage.',
    tags: ['foundation', 'loreal', 'infallible', 'liquid foundation', 'makeup'],
    specs: { Finish: 'Fresh Matte', SPF: '25', Volume: '30ml' },
    image: '/products/under-eye-cream-20ml-i1fl-57-0.jpg',
  },
  {
    name: 'Lakmé 9 to 5 Primer + Matte Perfect Cover Foundation',
    brand: 'Lakmé',
    category: 'makeup',
    price: 475,
    compareAt: 550,
    shortDesc: 'Built-in primer foundation with SPF 20 for smooth, long-lasting matte finish.',
    desc: 'Glides on effortlessly to blur imperfections and even skin tone without caking. Built-in primer keeps your makeup fresh through a full workday.',
    tags: ['foundation', 'lakme', '9 to 5', 'primer foundation', 'makeup'],
    specs: { Finish: 'Primer Matte', SPF: '20', Volume: '25ml' },
    image: '/products/under-eye-cream-20ml-i1fl-57-1.jpg',
  },
  {
    name: 'MAC Studio Fix Fluid SPF 15 Foundation',
    brand: 'MAC',
    category: 'makeup',
    price: 3600,
    compareAt: 3900,
    shortDesc: '24-hour medium-to-full buildable coverage with natural matte finish.',
    desc: 'The gold standard of studio foundations. Controls oil and shine while creating a smooth, picture-perfect base for photography and everyday wear.',
    tags: ['foundation', 'mac', 'studio fix', 'luxury foundation', 'makeup'],
    specs: { Finish: 'Natural Matte', SPF: '15', Volume: '30ml' },
    image: '/products/under-eye-cream-20ml-i1fl.jpg',
  },

  // MASCARA
  {
    name: 'Maybelline New York Colossal Waterproof Mascara - Glam Black',
    brand: 'Maybelline',
    category: 'makeup',
    price: 399,
    compareAt: 449,
    shortDesc: 'Collagen-infused formula for 9x colossal lash volume without clumping.',
    desc: 'Mega brush instantly builds 9x volume in one coat. Waterproof formula stands up to heat, sweat, and humidity without flaking.',
    tags: ['mascara', 'maybelline', 'colossal mascara', 'waterproof mascara', 'eye makeup', 'makeup'],
    specs: { Volume: '10ml', Type: 'Waterproof Mega Brush' },
    image: '/products/eyeshadow-palette-12-shades-ffn3.jpg',
  },
  {
    name: "L'Oréal Paris Lash Paradise Volumizing Mascara - Blackest Black",
    brand: "L'Oréal Paris",
    category: 'makeup',
    price: 699,
    compareAt: 899,
    shortDesc: 'Feathery soft full lash fringe with 20x volume and 2x length.',
    desc: 'Lash Paradise delivers dramatic lash volume with feather-light feel. Silky smooth formula with floral oil conditions lashes with every swipe.',
    tags: ['mascara', 'loreal', 'lash paradise', 'volumizing mascara', 'eye makeup', 'makeup'],
    specs: { Volume: '8.5ml', Brush: 'Hourglass Soft Bristle' },
    image: '/products/eyeshadow-palette-12-shades-ffn3-63-0.jpg',
  },

  // SOFAS
  {
    name: 'Wakefit Orthopedic 3-Seater Fabric Sofa - Royal Blue',
    brand: 'Wakefit',
    category: 'furniture',
    price: 18999,
    compareAt: 26999,
    shortDesc: 'High-density foam with Neem wood internal frame and breathable linen fabric.',
    desc: 'Wakefit 3-seater sofa is designed for modern living rooms, offering ergonomic back support, removable cushion covers, and termite-resistant Neem wood frame.',
    tags: ['sofa', 'wakefit', '3 seater sofa', 'living room', 'furniture'],
    specs: { Seating: '3 Seater', Material: 'Linen Fabric', Frame: 'Neem Wood', Warranty: '3 Years' },
    image: '/products/3-seater-fabric-sofa-sggu-207-0.jpg',
  },
  {
    name: 'Urban Ladder Apollo Modern 3-Seater Sofa - Charcoal Gray',
    brand: 'Urban Ladder',
    category: 'furniture',
    price: 28999,
    compareAt: 38999,
    shortDesc: 'Scandinavian clean-lined silhouette with solid Sheesham wood tapered legs.',
    desc: 'Apollo 3-seater brings understated elegance to your home. Features pocket spring seat construction for bounce that does not sag over time.',
    tags: ['sofa', 'urban ladder', 'couch', 'furniture', 'living room'],
    specs: { Seating: '3 Seater', Frame: 'Solid Sheesham Wood', Fabric: 'Polyester Blend' },
    image: '/products/3-seater-fabric-sofa-sggu.jpg',
  },
  {
    name: 'Home Centre Emily Fabric 2-Seater Loveseat Sofa - Beige',
    brand: 'Home Centre',
    category: 'furniture',
    price: 14999,
    compareAt: 21999,
    shortDesc: 'Compact 2-seater upholstered sofa perfect for apartments and cozy balconies.',
    desc: 'Crafted with durable pinewood frame and soft chenille fabric, the Emily sofa adds warm, inviting charm to compact apartment living spaces.',
    tags: ['sofa', 'home centre', '2 seater sofa', 'loveseat', 'furniture'],
    specs: { Seating: '2 Seater', Material: 'Chenille Fabric', Dimensions: '145x82x80 cm' },
    image: '/products/3-seater-fabric-sofa-sggu-207-1.jpg',
  },

  // COFFEE
  {
    name: 'Blue Tokai Coffee Roasters Vienna Roast Dark Roast Ground Coffee (250g)',
    brand: 'Blue Tokai',
    category: 'beverages',
    price: 470,
    compareAt: 550,
    shortDesc: '100% Arabica artisanal dark roast with notes of dark chocolate and oak.',
    desc: 'Vienna Roast is Blue Tokai’s most popular dark roast coffee, freshly ground for South Indian filter, French press, or moka pot brewing.',
    tags: ['coffee', 'blue tokai', 'filter coffee', 'ground coffee', 'arabica', 'beverages'],
    specs: { Roast: 'Dark Roast', Weight: '250g', Origin: 'Chikmagalur, Karnataka' },
    image: '/products/wok-30cm-non-stick-6v6b.jpg',
  },
  {
    name: 'Starbucks Pike Place Roast Medium Roast Ground Coffee (200g)',
    brand: 'Starbucks',
    category: 'beverages',
    price: 650,
    compareAt: 750,
    shortDesc: 'Well-rounded with subtle notes of cocoa and toasted nuts balancing the smooth mouthfeel.',
    desc: 'Named after Starbucks first store in Seattle Pike Place Market, this rich Latin American blend is brewed fresh every day in Starbucks cafes.',
    tags: ['coffee', 'starbucks', 'ground coffee', 'medium roast', 'beverages'],
    specs: { Roast: 'Medium Roast', Weight: '200g' },
    image: '/products/wok-30cm-non-stick-6v6b-430-0.jpg',
  },
  {
    name: 'Nescafe Gold Blend Rich & Smooth Instant Coffee (100g Jar)',
    brand: 'Nescafe',
    category: 'beverages',
    price: 495,
    compareAt: 560,
    shortDesc: 'Crafted with carefully selected mountain-grown Arabica beans for rich aroma.',
    desc: 'Nescafe Gold Blend is freeze-dried to lock in the deep coffee aroma and golden richness that elevates your everyday morning cup.',
    tags: ['coffee', 'nescafe', 'instant coffee', 'nescafe gold', 'beverages'],
    specs: { Type: 'Instant Coffee', Weight: '100g Glass Jar' },
    image: '/products/wok-30cm-non-stick-6v6b-430-1.jpg',
  },
  {
    name: 'Davidoff Rich Aroma Freeze Dried Instant Coffee (100g)',
    brand: 'Davidoff',
    category: 'beverages',
    price: 699,
    compareAt: 850,
    shortDesc: 'Full-bodied South American and East African master blend with spicy aftertaste.',
    desc: 'Davidoff Rich Aroma is the choice for discerning coffee lovers who appreciate intense, full-bodied flavour crowned with an opulent crema.',
    tags: ['coffee', 'davidoff', 'rich aroma', 'instant coffee', 'luxury coffee', 'beverages'],
    specs: { Type: 'Instant Freeze Dried', Weight: '100g' },
    image: '/products/wok-30cm-non-stick-6v6b.jpg',
  },
]

async function run() {
  const categories = await db.category.findMany()
  const catMap = new Map()
  categories.forEach((c) => catMap.set(c.slug, c.id))

  let count = 0
  for (const item of EXTRA_PRODUCTS) {
    const brandSlug = slugify(item.brand)
    let brand = await db.brand.findUnique({ where: { slug: brandSlug } })
    if (!brand) {
      brand = await db.brand.create({ data: { name: item.brand, slug: brandSlug } })
      console.log(`Created brand: ${brand.name}`)
    }

    const catId = catMap.get(item.category)
    if (!catId) {
      console.log(`Missing category ${item.category}`)
      continue
    }

    const baseSlug = slugify(item.name)
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
        compareAtPrice: item.compareAt || null,
        sku,
        stock: Math.floor(20 + Math.random() * 120),
        lowStockThreshold: 5,
        rating: +(4.3 + Math.random() * 0.5).toFixed(1),
        ratingCount: Math.floor(300 + Math.random() * 3500),
        tags: item.tags.join(','),
        attributes: JSON.stringify(item.specs),
        images: JSON.stringify([item.image]),
        isActive: true,
        isTrending: Math.random() > 0.5,
        isDeal: Math.random() > 0.6,
      },
    })
    count++
    console.log(`Added: ${item.name} (${brand.name})`)
  }
  console.log(`Successfully added ${count} extra items!`)
}

run()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
