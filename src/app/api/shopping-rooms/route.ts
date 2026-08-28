import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'
import crypto from 'crypto'

function generateSlug(): string {
  return crypto.randomBytes(6).toString('base64url').replace(/[-_]/g, '').slice(0, 10)
}

// GET — list rooms the current user is a member of
export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ rooms: [] })
  const memberships = await db.shoppingRoomMember.findMany({
    where: { userId: user.id },
    include: {
      room: {
        include: {
          members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          items: { include: { product: { select: { id: true, name: true, price: true, images: true } } } },
        },
      },
    },
    orderBy: { joinedAt: 'desc' },
  })
  const rooms = memberships.map((m) => ({
    ...m.room,
    myRole: m.role,
    itemCount: m.room.items.length,
    memberCount: m.room.members.length,
  }))
  return NextResponse.json({ rooms })
}

// POST — create a new room
export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in to create a room' }, { status: 401 })
  const { name, description, budget, splitType } = await req.json()
  if (!name) return NextResponse.json({ error: 'Room name is required' }, { status: 400 })

  // Generate a unique slug
  let slug = generateSlug()
  while (await db.shoppingRoom.findUnique({ where: { slug } })) {
    slug = generateSlug()
  }

  const room = await db.shoppingRoom.create({
    data: {
      slug,
      name,
      description: description || null,
      creatorId: user.id,
      budget: parseFloat(budget) || 0,
      splitType: splitType || 'SHARED_EQUALLY',
      members: {
        create: { userId: user.id, role: 'CREATOR' },
      },
    },
    include: { members: true },
  })

  await db.notification.create({
    data: { userId: user.id, type: 'GENERAL', title: 'Shopping Room created', body: `You created "${name}". Share the link to invite friends!` },
  })

  return NextResponse.json({ room })
}
