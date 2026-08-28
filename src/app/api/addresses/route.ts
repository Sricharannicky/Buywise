import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ addresses: [] })
  const addresses = await db.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] })
  return NextResponse.json({ addresses })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  const { fullName, phone, line1, line2, city, state, pincode, isDefault } = await req.json()
  if (!fullName || !phone || !line1 || !city || !state || !pincode) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })
  if (isDefault) await db.address.updateMany({ where: { userId: user.id, isDefault: true }, data: { isDefault: false } })
  const address = await db.address.create({ data: { userId: user.id, fullName, phone, line1, line2: line2 || null, city, state, pincode, isDefault: !!isDefault } })
  return NextResponse.json({ address })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (id) await db.address.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}
