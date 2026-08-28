import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET — get a room by slug (with all items, votes, comments, members)
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSession(req)
  const room = await db.shoppingRoom.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      },
      items: {
        orderBy: { createdAt: 'desc' },
        include: {
          product: {
            include: {
              brand: { select: { name: true } },
              category: { select: { name: true, slug: true } },
            },
          },
          addedBy: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          votes: { include: { member: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } } },
          comments: {
            orderBy: { createdAt: 'asc' },
            include: { member: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
          },
        },
      },
    },
  })
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })

  // Auto-join: if the user is signed in and not a member, add them
  let myMemberId: string | null = null
  let myRole: string | null = null
  if (user) {
    const existing = room.members.find((m) => m.userId === user.id)
    if (existing) {
      myMemberId = existing.id
      myRole = existing.role
    } else {
      const newMember = await db.shoppingRoomMember.create({
        data: { roomId: room.id, userId: user.id, role: 'MEMBER' },
      })
      myMemberId = newMember.id
      myRole = 'MEMBER'
      // notify the creator
      if (room.creatorId !== user.id) {
        await db.notification.create({
          data: { userId: room.creatorId, type: 'GENERAL', title: 'New member joined', body: `${user.firstName} joined "${room.name}"` },
        })
      }
    }
  }

  // Compute totals
  const totalCost = room.items.reduce((s, i) => s + i.product.price, 0)
  const memberCount = room.members.length

  // Per-person split
  let perPersonShare = 0
  if (room.splitType === 'SHARED_EQUALLY' && memberCount > 0) {
    perPersonShare = totalCost / memberCount
  }

  return NextResponse.json({
    room: {
      ...room,
      myMemberId,
      myRole,
      totalCost,
      memberCount,
      perPersonShare,
      overBudget: room.budget > 0 && totalCost > room.budget,
    },
  })
}

// PATCH — update room (budget, splitType, name, status)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const room = await db.shoppingRoom.findUnique({ where: { slug } })
  if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 })
  // Only creator can update
  if (room.creatorId !== user.id) return NextResponse.json({ error: 'Only the room creator can update settings' }, { status: 403 })

  const { name, description, budget, splitType, status } = await req.json()
  const updated = await db.shoppingRoom.update({
    where: { id: room.id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description: description || null }),
      ...(budget !== undefined && { budget: parseFloat(budget) || 0 }),
      ...(splitType && { splitType }),
      ...(status && { status }),
    },
  })
  return NextResponse.json({ room: updated })
}
