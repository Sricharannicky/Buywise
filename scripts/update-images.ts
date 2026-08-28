// Update product images with real photos — direct key mapping
import { db } from '../src/lib/db'
import { slugify } from '../src/lib/format'
import imageMap from './image-map.json'

interface SeedProduct {
  name: string
  imageKey: string // matches key in image-map.json
  emoji: string
}

// (name, imageKey, emoji) — imageKey must match a key in image-map.json
const PRODUCTS: SeedProduct[] = [
  { name: 'Aurora Pro 14 Laptop', imageKey: 'aurora-pro-14', emoji: '💻' },
  { name: 'Vertex Strike 16 Gaming Laptop', imageKey: 'vertex-strike-16', emoji: '🖥️' },
  { name: 'Nimbus Air 13 Ultrabook', imageKey: 'nimbus-air-13', emoji: '💻' },
  { name: 'Forge Workstation 15', imageKey: 'forge-workstation-15', emoji: '💻' },
  { name: 'Lumen Quiet ANC Headphones', imageKey: 'lumen-quiet-anc', emoji: '🎧' },
  { name: 'Drift Buds Pro', imageKey: 'drift-buds-pro', emoji: '🎵' },
  { name: 'Quartz Studio Monitor Headphones', imageKey: 'quartz-studio-monitor', emoji: '🎧' },
  { name: 'Atlas X Pro Smartphone', imageKey: 'atlas-x-pro', emoji: '📱' },
  { name: 'Mira Lite 5G', imageKey: 'mira-lite-5g', emoji: '📲' },
  { name: 'Aurora Watch Series 7', imageKey: 'aurora-watch-series-7', emoji: '⌚' },
  { name: 'Drift Band Fit 3', imageKey: 'drift-band-fit-3', emoji: '⌚' },
  { name: 'Forge Ergonomic Office Chair', imageKey: 'forge-ergonomic-office-chair', emoji: '🪑' },
  { name: 'Halcyon 3-Seater Fabric Sofa', imageKey: 'halcyon-3-seater-sofa', emoji: '🛋️' },
  { name: 'Atlas Standing Desk Pro', imageKey: 'atlas-standing-desk-pro', emoji: '🗄️' },
  { name: 'Vertex Brew Pro Espresso Machine', imageKey: 'vertex-brew-pro-espresso', emoji: '☕' },
  { name: 'Nimbus Air Fryer 6L', imageKey: 'nimbus-air-fryer', emoji: '🍳' },
  { name: 'Lumen Chef Knife Set', imageKey: 'lumen-chef-knife-set', emoji: '🔪' },
  { name: 'Halcyon Aroma Diffuser', imageKey: 'halcyon-aroma-diffuser', emoji: '🪔' },
  { name: 'Quartz Table Lamp Warm', imageKey: 'quartz-table-lamp', emoji: '💡' },
  { name: 'Drift Run Pro Running Shoes', imageKey: 'drift-run-pro-shoes', emoji: '👟' },
  { name: 'Atlas Trek Hiking Boots', imageKey: 'atlas-trek-hiking-boots', emoji: '🥾' },
  { name: 'Mira Commuter Backpack 25L', imageKey: 'mira-commuter-backpack', emoji: '🎒' },
  { name: 'Halcyon Leather Tote', imageKey: 'halcyon-leather-tote', emoji: '👜' },
  { name: 'Quartz Heritage Auto Watch', imageKey: 'quartz-heritage-auto-watch', emoji: '⌚' },
  { name: 'Forge Adjustable Dumbbell Set', imageKey: 'forge-adjustable-dumbbell', emoji: '🏋️' },
  { name: 'Drift Yoga Mat Pro', imageKey: 'drift-yoga-mat-pro', emoji: '🧘' },
  { name: 'Atlas Camping Tent 4P', imageKey: 'atlas-camping-tent', emoji: '⛺' },
  { name: 'Mira Glow Vitamin C Serum', imageKey: 'mira-glow-vitamin-c', emoji: '🧴' },
  { name: 'Lumen Hydra Moisturiser', imageKey: 'lumen-hydra-moisturiser', emoji: '🧴' },
  { name: 'Forge Pro Beard Trimmer', imageKey: 'forge-pro-beard-trimmer', emoji: '✂️' },
]

async function main() {
  console.log('🖼️  Updating product images with real photos...')
  let updated = 0
  let missing = 0
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i]
    const slug = slugify(p.name) + '-' + i
    const imageUrl = (imageMap as Record<string, string>)[p.imageKey]
    if (!imageUrl) {
      console.warn(`  ⚠️  No image in map for key: ${p.imageKey}`)
      missing++
      continue
    }
    // Store as JSON array [realUrl, emojiFallback]
    const images = JSON.stringify([imageUrl, p.emoji])
    const result = await db.product.updateMany({ where: { slug }, data: { images } })
    if (result.count > 0) {
      updated++
      console.log(`  ✅ ${p.name}`)
    } else {
      console.warn(`  ⚠️  Product not found in DB: ${slug}`)
      missing++
    }
  }
  console.log(`\n✨ Updated ${updated} products with real images. Missing: ${missing}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
