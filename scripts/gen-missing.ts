import { db } from '../src/lib/db'
import fs from 'fs'
import path from 'path'

async function generateImage(prompt: string, dest: string): Promise<boolean> {
  return false
}

async function main() {
  // Find missing product images
  const products = await db.product.findMany({ select: { id: true, name: true, slug: true } })
  const missingProducts = products.filter(p => !fs.existsSync(path.join('public/products', p.slug + '.jpg')))
  console.log(`Missing products: ${missingProducts.length}`)

  let gen = 0
  for (const p of missingProducts) {
    const dest = path.join('public/products', p.slug + '.jpg')
    const prompt = `Professional e-commerce product photo of ${p.name}, single product centered, clean white studio background, soft natural shadow, sharp focus, high resolution, square 1:1, no text, no watermark, no logo`
    const ok = await generateImage(prompt, dest)
    if (ok) { gen++; console.log(`  ✅ ${p.name}`) }
    else { console.log(`  ❌ ${p.name} (rate limited)`) }
    await new Promise(r => setTimeout(r, 3000)) // 3s delay between generations
  }
  console.log(`Generated ${gen}/${missingProducts.length} product images`)

  // Find missing category images
  const cats = await db.category.findMany({ select: { id: true, name: true, slug: true } })
  const missingCats = cats.filter(c => !fs.existsSync(path.join('public/categories', c.slug + '.jpg')))
  console.log(`Missing categories: ${missingCats.length}`)

  let catGen = 0
  for (const c of missingCats) {
    const dest = path.join('public/categories', c.slug + '.jpg')
    const prompt = `E-commerce category tile photo featuring ${c.name} products, soft pastel background, studio lighting, no text, no watermark, professional product photography`
    const ok = await generateImage(prompt, dest)
    if (ok) { catGen++; console.log(`  ✅ ${c.name}`) }
    else { console.log(`  ❌ ${c.name} (rate limited)`) }
    await new Promise(r => setTimeout(r, 3000))
  }
  console.log(`Generated ${catGen}/${missingCats.length} category images`)

  // Final count
  const productFiles = fs.readdirSync('public/products').length
  const catFiles = fs.readdirSync('public/categories').length
  console.log(`\nFinal: ${productFiles} product images, ${catFiles} category images`)
  process.exit(0)
}
main()
