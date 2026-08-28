import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ goals: [] })
  const goals = await db.goal.findMany({
    where: { userId: user.id },
    include: { items: { include: { product: { include: { brand: { select: { name: true } } } } } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ goals })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  const { title, targetAmount, currentAmount = 0, targetDate } = await req.json()
  if (!title || !targetAmount) return NextResponse.json({ error: 'Title and target amount required' }, { status: 400 })
  const goal = await db.goal.create({
    data: { userId: user.id, title, targetAmount: parseFloat(targetAmount), currentAmount: parseFloat(currentAmount) || 0, targetDate: targetDate ? new Date(targetDate) : null },
  })
  await db.notification.create({ data: { userId: user.id, type: 'GOAL', title: 'Goal created', body: `You created the goal "${title}".` } })
  return NextResponse.json({ goal })
}

export async function PATCH(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { goalId, currentAmount, addProduct, productId, status } = await req.json()
  if (currentAmount !== undefined) {
    await db.goal.updateMany({ where: { id: goalId, userId: user.id }, data: { currentAmount: parseFloat(currentAmount) } })
  }
  if (status) {
    await db.goal.updateMany({ where: { id: goalId, userId: user.id }, data: { status } })
  }
  if (addProduct && productId) {
    const goal = await db.goal.findFirst({ where: { id: goalId, userId: user.id } })
    if (goal) await db.goalItem.create({ data: { goalId: goal.id, productId } })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const goalId = searchParams.get('goalId')
  if (goalId) await db.goal.deleteMany({ where: { id: goalId, userId: user.id } })
  return NextResponse.json({ ok: true })
}
