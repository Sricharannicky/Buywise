import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('[Seed] Seeding authentic pen products...')

  const category = await prisma.category.findFirst({
    where: { slug: 'pens-office-supplies' },
  })

  if (!category) {
    console.error('Category pens-office-supplies not found!')
    return
  }

  // Ensure brands exist
  const brands = [
    { name: 'Parker', slug: 'parker' },
    { name: 'Pilot', slug: 'pilot' },
    { name: 'Uni-ball', slug: 'uni-ball' },
    { name: 'Lamy', slug: 'lamy' },
    { name: 'Cello', slug: 'cello' },
  ]

  const brandMap = new Map<string, string>()
  for (const b of brands) {
    const existing = await prisma.brand.findUnique({ where: { slug: b.slug } })
    if (existing) {
      brandMap.set(b.slug, existing.id)
    } else {
      const created = await prisma.brand.create({ data: b })
      brandMap.set(b.slug, created.id)
    }
  }

  const penProducts = [
    {
      name: 'Parker Jotter Stainless Steel CT Ballpoint Pen',
      slug: 'parker-jotter-stainless-steel-ct-ballpoint-pen-classic',
      price: 495,
      compareAtPrice: 650,
      discount: 24,
      image: '/products/parker-jotter-stainless-steel-ct-ballpoint-pen.jpg',
      brandSlug: 'parker',
      rating: 4.8,
      ratingCount: 3240,
      stock: 85,
      shortDescription: 'Iconic stainless steel barrel with signature arrow clip and smooth Quinkflow blue refill.',
      description: 'The Parker Jotter stands as a design icon since 1954. Featuring an all-stainless steel body, high-shine chrome trim, and the signature click mechanism. Perfect for everyday professional and personal writing.',
      tags: 'pen,pens,ballpoint,parker,jotter,stainless steel,writing,stationery,office',
      attributes: {
        'Pen Type': 'Ballpoint Pen',
        'Ink Color': 'Blue',
        'Tip Size': 'Medium (1.0mm)',
        'Body Material': 'Stainless Steel',
        'Mechanism': 'Retractable Click',
      },
    },
    {
      name: 'Pilot V5 Liquid Ink Rollerball Pens (Pack of 3) - Blue',
      slug: 'pilot-v5-liquid-ink-rollerball-pens-pack-of-3-blue',
      price: 210,
      compareAtPrice: 270,
      discount: 22,
      image: '/products/pilot-v5-liquid-ink-rollerball-pens.jpg',
      brandSlug: 'pilot',
      rating: 4.8,
      ratingCount: 5410,
      stock: 140,
      shortDescription: 'Hi-Tecpoint 0.5mm precision needle point roller pen with pure liquid ink controller.',
      description: 'The legendary Pilot V5 features a unique liquid ink formula and multi-groove ink controller that ensures a consistent, skip-free flow until the very last drop. Transparent barrel window lets you monitor ink level.',
      tags: 'pen,pens,rollerball,pilot,v5,liquid ink,blue,stationery,student,writing',
      attributes: {
        'Pen Type': 'Rollerball Pen',
        'Ink Color': 'Blue',
        'Tip Size': 'Extra Fine (0.5mm)',
        'Pack Quantity': '3 Pens',
        'Ink Type': 'Pure Liquid Ink',
      },
    },
    {
      name: 'Uni-ball Eye UB-150 Roller Pen (Pack of 3) - Waterproof Ink',
      slug: 'uniball-eye-ub150-roller-pen-pack-of-3-waterproof',
      price: 240,
      compareAtPrice: 300,
      discount: 20,
      image: '/products/uniball-eye-ub150-roller-pen-pack.jpg',
      brandSlug: 'uni-ball',
      rating: 4.7,
      ratingCount: 2890,
      stock: 110,
      shortDescription: 'World-favorite rollerball with tamper-proof, fade-proof Super Ink and stainless steel tip.',
      description: 'Uni-ball Eye UB-150 delivers ultra-smooth writing with permanent waterproof pigment ink. The uni-flow system guarantees continuous write-out at constant density. Ideal for document signing and long note-taking sessions.',
      tags: 'pen,pens,rollerball,uniball,eye,waterproof,super ink,writing,office',
      attributes: {
        'Pen Type': 'Rollerball Pen',
        'Ink Color': 'Blue',
        'Tip Size': 'Fine (0.5mm)',
        'Pack Quantity': '3 Pens',
        'Special Feature': 'Waterproof Super Ink',
      },
    },
    {
      name: 'Lamy Safari Fountain Pen - Charcoal Matte Black (Fine Nib)',
      slug: 'lamy-safari-fountain-pen-charcoal-matte-black-fine',
      price: 2490,
      compareAtPrice: 3100,
      discount: 20,
      image: '/products/lamy-safari-fountain-pen-charcoal-matte.jpg',
      brandSlug: 'lamy',
      rating: 4.9,
      ratingCount: 1650,
      stock: 45,
      shortDescription: 'Ergonomic ABS fountain pen with polished steel fine nib and flexible brass wire clip.',
      description: 'Designed by Wolfgang Fabian, the Lamy Safari is one of the most popular fountain pens in the world. Made of sturdy ABS plastic with recessed grip sections that encourage proper finger placement. Includes blue ink cartridge.',
      tags: 'pen,pens,fountain pen,lamy,safari,charcoal,fine nib,luxury,writing',
      attributes: {
        'Pen Type': 'Fountain Pen',
        'Nib Size': 'Fine (F)',
        'Body Material': 'Sturdy ABS Plastic',
        'Filling System': 'Cartridge / Converter (Z28 compatible)',
        'Origin': 'Made in Germany',
      },
    },
    {
      name: 'Cello Gripper Ballpoint Pens (Pack of 10) - Smooth Writing',
      slug: 'cello-gripper-ballpoint-pens-pack-of-10-smooth',
      price: 100,
      compareAtPrice: 150,
      discount: 33,
      image: '/products/cello-gripper-ballpoint-pens-pack.jpg',
      brandSlug: 'cello',
      rating: 4.6,
      ratingCount: 4200,
      stock: 220,
      shortDescription: 'Comfortable rubberized grip ball pens with low-viscosity ink for non-stop writing.',
      description: 'Cello Gripper is India’s beloved exam pen. The soft elastomeric rubber grip provides fatigue-free writing during long exams and daily office work. 0.7mm Swiss-carbide ball ensures clear and smudge-free lines.',
      tags: 'pen,pens,ballpoint,cello,gripper,pack of 10,blue,exam,student,writing',
      attributes: {
        'Pen Type': 'Ballpoint Pen',
        'Ink Color': 'Blue',
        'Tip Size': 'Fine (0.7mm)',
        'Pack Quantity': '10 Pens',
        'Grip': 'Elastomeric Rubber Grip',
      },
    },
  ]

  for (const p of penProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: p.slug } })
    const brandId = brandMap.get(p.brandSlug)!
    const data = {
      sku: 'PEN-' + p.brandSlug.toUpperCase() + '-' + Math.random().toString(36).substring(2, 7).toUpperCase(),
      name: p.name,
      slug: p.slug,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: JSON.stringify([p.image]),
      brandId,
      categoryId: category.id,
      rating: p.rating,
      ratingCount: p.ratingCount,
      stock: p.stock,
      shortDescription: p.shortDescription,
      description: p.description,
      tags: p.tags,
      attributes: JSON.stringify(p.attributes),
      isActive: true,
      isFeatured: true,
    }

    if (existing) {
      await prisma.product.update({ where: { id: existing.id }, data })
      console.log('Updated pen:', p.name)
    } else {
      await prisma.product.create({ data })
      console.log('Created pen:', p.name)
    }
  }

  console.log('[Seed] Successfully seeded all authentic pen products!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
