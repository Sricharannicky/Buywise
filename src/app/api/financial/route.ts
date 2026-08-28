import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ profile: null, spending: { total: 0, byCategory: {}, orderCount: 0, avgOrderValue: 0 } })
  const profile = await db.financialProfile.findUnique({ where: { userId: user.id } })
  const orders = await db.order.findMany({ where: { userId: user.id, paymentStatus: { in: ['PAID', 'PENDING'] } }, include: { items: { include: { product: { include: { category: { select: { name: true } } } } } } } })
  let total = 0
  const byCategory: Record<string, number> = {}
  for (const o of orders) {
    total += o.total
    for (const item of o.items) {
      const cat = item.product.category?.name || 'Other'
      byCategory[cat] = (byCategory[cat] || 0) + item.total
    }
  }
  const avgOrderValue = orders.length ? total / orders.length : 0
  return NextResponse.json({ profile, spending: { total, byCategory, orderCount: orders.length, avgOrderValue } })
}

export async function POST(req: NextRequest) {
  const user = await getSession(req)
  if (!user) return NextResponse.json({ error: 'Please sign in' }, { status: 401 })
  const { monthlyIncome, monthlyShoppingBudget, fixedExpenses, savingsTarget } = await req.json()
  const profile = await db.financialProfile.upsert({
    where: { userId: user.id },
    update: {
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      monthlyShoppingBudget: parseFloat(monthlyShoppingBudget) || 0,
      fixedExpenses: parseFloat(fixedExpenses) || 0,
      savingsTarget: parseFloat(savingsTarget) || 0,
    },
    create: {
      userId: user.id,
      monthlyIncome: parseFloat(monthlyIncome) || 0,
      monthlyShoppingBudget: parseFloat(monthlyShoppingBudget) || 0,
      fixedExpenses: parseFloat(fixedExpenses) || 0,
      savingsTarget: parseFloat(savingsTarget) || 0,
    },
  })
  return NextResponse.json({ profile })
}
