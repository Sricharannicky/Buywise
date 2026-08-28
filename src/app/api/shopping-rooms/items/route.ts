import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// POST — add a product to a room
export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in to add products' }, { status: 401 })
  const { roomId, productId, note } = await req.json()
  if (!roomId || !productId) return NextResponse.json({ error: 'Room and product are required' }, { status: 400 })

  const member = await db.shoppingRoomMember.findUnique({ where: { roomId_userId: { roomId, userId: user.id } } })
  if (!member) return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 })

  // Prevent duplicates
  const existing = await db.shoppingRoomItem.findFirst({ where: { roomId, productId } })
  if (existing) return NextResponse.json({ error: 'This product is already in the room' }, { status: 409 })

  const item = await db.shoppingRoomItem.create({
    data: { roomId, productId, addedById: member.id, note: note || null },
    include: {
      product: { include: { brand: { select: { name: true } } } },
      addedBy: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
    },
  })

  // Notify all other members
  const otherMembers = await db.shoppingRoomMember.findMany({ where: { roomId, userId: { not: user.id } } })
  await db.notification.createMany({
    data: otherMembers.map((m) => ({
      userId: m.userId,
      type: 'GENERAL',
      title: 'New product added',
      body: `${user.firstName} added ${item.product.name} to the room`,
    })),
  })

  return NextResponse.json({ item })
}

// DELETE — remove a product from a room
export async function DELETE(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const itemId = searchParams.get('itemId')
  if (!itemId) return NextResponse.json({ error: 'itemId required' }, { status: 400 })

  const item = await db.shoppingRoomItem.findUnique({ where: { id: itemId }, include: { room: true } })
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  // Only the adder or the room creator can remove
  const member = await db.shoppingRoomMember.findUnique({ where: { roomId_userId: { roomId: item.roomId, userId: user.id } } })
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 })
  if (item.addedById !== member.id && item.room.creatorId !== user.id) {
    return NextResponse.json({ error: 'Only the person who added it or the room creator can remove it' }, { status: 403 })
  }

  await db.shoppingRoomItem.delete({ where: { id: itemId } })
  return NextResponse.json({ ok: true })
}
