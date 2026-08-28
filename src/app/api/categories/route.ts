import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const categories = await db.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: 'asc' },
  })
  const brands = await db.brand.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json({ categories, brands })
}
