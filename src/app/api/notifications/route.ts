import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ notifications: [] })
  const notifications = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' }, take: 30 })
  return NextResponse.json({ notifications })
}

export async function PATCH(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { notificationId, isRead, markAllRead } = await req.json()
  if (markAllRead) {
    await db.notification.updateMany({ where: { userId: user.id, isRead: false }, data: { isRead: true } })
  } else if (notificationId) {
    await db.notification.updateMany({ where: { id: notificationId, userId: user.id }, data: { isRead } })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (id) await db.notification.deleteMany({ where: { id, userId: user.id } })
  return NextResponse.json({ ok: true })
}
