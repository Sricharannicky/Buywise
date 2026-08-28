import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

// PATCH — vote on an item (toggle UP/DOWN)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in to vote' }, { status: 401 })
  const { vote } = await req.json() // 'UP' | 'DOWN' | null (null = remove vote)

  const item = await db.shoppingRoomItem.findUnique({ where: { id: itemId } })
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  const member = await db.shoppingRoomMember.findUnique({ where: { roomId_userId: { roomId: item.roomId, userId: user.id } } })
  if (!member) return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 })

  const existing = await db.shoppingRoomVote.findUnique({ where: { itemId_memberId: { itemId, memberId: member.id } } })
  if (vote === null) {
    if (existing) await db.shoppingRoomVote.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true, action: 'removed' })
  }
  if (existing) {
    // toggle: if same vote, remove; if different, update
    if (existing.vote === vote) {
      await db.shoppingRoomVote.delete({ where: { id: existing.id } })
      return NextResponse.json({ ok: true, action: 'removed' })
    }
    await db.shoppingRoomVote.update({ where: { id: existing.id }, data: { vote } })
    return NextResponse.json({ ok: true, action: 'updated' })
  }
  await db.shoppingRoomVote.create({ data: { itemId, memberId: member.id, vote } })
  return NextResponse.json({ ok: true, action: 'added' })
}

// POST — add a comment to an item
export async function POST(req: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const { itemId } = await params
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in to comment' }, { status: 401 })
  const { body: text } = await req.json()
  if (!text || !text.trim()) return NextResponse.json({ error: 'Comment cannot be empty' }, { status: 400 })

  const item = await db.shoppingRoomItem.findUnique({ where: { id: itemId } })
  if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

  const member = await db.shoppingRoomMember.findUnique({ where: { roomId_userId: { roomId: item.roomId, userId: user.id } } })
  if (!member) return NextResponse.json({ error: 'You are not a member of this room' }, { status: 403 })

  const comment = await db.shoppingRoomComment.create({
    data: { itemId, memberId: member.id, body: text.trim() },
    include: { member: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } },
  })
  return NextResponse.json({ comment })
}
