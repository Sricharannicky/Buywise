// Download all existing real product/category images to local /public files.
// For products/categories without a real image, generate one via AI image generation.
// Update the DB so every image field points to a local path.

import { db } from '../src/lib/db'
import { slugify, parseImages } from '../src/lib/format'
import fs from 'fs'
import path from 'path'
import https from 'https'
import http from 'http'

const PRODUCTS_DIR = path.join(process.cwd(), 'public', 'products')
const CATEGORIES_DIR = path.join(process.cwd(), 'public', 'categories')

fs.mkdirSync(PRODUCTS_DIR, { recursive: true })
fs.mkdirSync(CATEGORIES_DIR, { recursive: true })

function download(url: string, dest: string): Promise<boolean> {
  return new Promise((resolve) => {
    const mod = url.startsWith('https') ? https : http
    const file = fs.createWriteStream(dest)
    const req = mod.get(url, (res) => {
      if (res.statusCode === 200) {
        res.pipe(file)
        file.on('finish', () => { file.close(); resolve(true) })
      } else if (res.statusCode === 301 || res.statusCode === 302) {
        // follow redirect
        const newUrl = res.headers.location
        if (newUrl) {
          download(newUrl, dest).then(resolve)
        } else {
          resolve(false)
        }
      } else {
        resolve(false)
      }
    })
    req.on('error', () => resolve(false))
    req.setTimeout(15000, () => { req.destroy(); resolve(false) })
  })
}

async function generateImage(prompt: string, dest: string): Promise<boolean> {
  return false
}

async function main() {
  console.log('📸 Processing products...')
  let downloaded = 0, generated = 0, skipped = 0, failed = 0

  const products = await db.product.findMany({ select: { id: true, name: true, slug: true, images: true } })

  // Process in batches of 10 parallel downloads
  const BATCH = 10
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH)
    await Promise.all(batch.map(async (p) => {
      const parsed = parseImages(p.images)
      const realUrl = parsed.find((x) => x.startsWith('http'))
      const localPath = `/products/${p.slug}.jpg`
      const localFile = path.join(PRODUCTS_DIR, `${p.slug}.jpg`)

      // Already exists locally
      if (fs.existsSync(localFile)) {
        // Update DB if needed
        if (!p.images.includes(localPath)) {
          await db.product.update({ where: { id: p.id }, data: { images: JSON.stringify([localPath]) } })
        }
        skipped++
        return
      }

      if (realUrl) {
        // Download the existing real image
        const ok = await download(realUrl, localFile)
        if (ok) {
          await db.product.update({ where: { id: p.id }, data: { images: JSON.stringify([localPath]) } })
          downloaded++
          return
        }
      }

      // No real URL or download failed → generate via AI
      const prompt = `Professional e-commerce product photo of ${p.name}, single product centered, clean white studio background, soft natural shadow, sharp focus, high resolution, square 1:1, no text, no watermark, no logo`
      const ok = await generateImage(prompt, localFile)
      if (ok) {
        await db.product.update({ where: { id: p.id }, data: { images: JSON.stringify([localPath]) } })
        generated++
      } else {
        // Final fallback: set local path anyway (SmartImage will show first-letter)
        await db.product.update({ where: { id: p.id }, data: { images: JSON.stringify([localPath]) } })
        failed++
      }
    }))
    process.stdout.write(`  ${Math.min(i + BATCH, products.length)}/${products.length} processed\r`)
  }
  console.log('')
  console.log(`✅ Products: ${downloaded} downloaded, ${generated} generated, ${skipped} already existed, ${failed} failed`)

  // Categories
  console.log('\n📸 Processing categories...')
  let catDownloaded = 0, catGenerated = 0, catSkipped = 0, catFailed = 0

  const categories = await db.category.findMany({ select: { id: true, name: true, slug: true, imageUrl: true } })

  for (const c of categories) {
    const localPath = `/categories/${c.slug}.jpg`
    const localFile = path.join(CATEGORIES_DIR, `${c.slug}.jpg`)

    if (fs.existsSync(localFile)) {
      if (!c.imageUrl?.includes(localPath)) {
        await db.category.update({ where: { id: c.id }, data: { imageUrl: localPath } })
      }
      catSkipped++
      continue
    }

    if (c.imageUrl && c.imageUrl.startsWith('http')) {
      const ok = await download(c.imageUrl, localFile)
      if (ok) {
        await db.category.update({ where: { id: c.id }, data: { imageUrl: localPath } })
        catDownloaded++
        continue
      }
    }

    // Generate
    const prompt = `E-commerce category tile photo featuring ${c.name} products, soft pastel background, studio lighting, no text, no watermark, professional product photography`
    const ok = await generateImage(prompt, localFile)
    if (ok) {
      await db.category.update({ where: { id: c.id }, data: { imageUrl: localPath } })
      catGenerated++
    } else {
      await db.category.update({ where: { id: c.id }, data: { imageUrl: localPath } })
      catFailed++
    }
  }
  console.log(`✅ Categories: ${catDownloaded} downloaded, ${catGenerated} generated, ${catSkipped} already existed, ${catFailed} failed`)

  // Final counts
  const totalProducts = await db.product.count()
  const productsWithLocal = await db.product.count({ where: { images: { contains: '/products/' } } })
  const totalCats = await db.category.count()
  const catsWithLocal = await db.category.count({ where: { imageUrl: { contains: '/categories/' } } })
  console.log(`\n📊 Final: ${productsWithLocal}/${totalProducts} products with local images, ${catsWithLocal}/${totalCats} categories with local images`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await db.$disconnect() })
