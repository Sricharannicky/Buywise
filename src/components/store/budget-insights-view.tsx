'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Wallet, TrendingUp, TrendingDown, Sparkles, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import { EmptyState } from './cart-view'

export function BudgetView() {
  const { user, setAuthOpen, setAiOpen } = useStore()
  const [profile, setProfile] = useState<any>(null)
  const [spending, setSpending] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ monthlyIncome: '', monthlyShoppingBudget: '', fixedExpenses: '', savingsTarget: '' })

  async function load() {
    setLoading(true)
    try {
      const r = await api.financial.get()
      setProfile(r.profile)
      setSpending(r.spending)
      if (r.profile) {
        setForm({
          monthlyIncome: String(r.profile.monthlyIncome || ''),
          monthlyShoppingBudget: String(r.profile.monthlyShoppingBudget || ''),
          fixedExpenses: String(r.profile.fixedExpenses || ''),
          savingsTarget: String(r.profile.savingsTarget || ''),
        })
      }
    } catch {} finally { setLoading(false) }
  }
  useEffect(() => { if (user) load() }, [user])

  async function save() {
    setSaving(true)
    try {
      await api.financial.save({
        monthlyIncome: parseFloat(form.monthlyIncome) || 0,
        monthlyShoppingBudget: parseFloat(form.monthlyShoppingBudget) || 0,
        fixedExpenses: parseFloat(form.fixedExpenses) || 0,
        savingsTarget: parseFloat(form.savingsTarget) || 0,
      })
      toast.success('Budget profile saved')
      load()
    } catch (e: any) { toast.error(e.message) } finally { setSaving(false) }
  }

  if (!user) return <EmptyState icon={<Wallet />} title="Sign in to set a budget" desc="Optionally share your budget for personalised affordability guidance." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />
  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><p className="text-muted-foreground">Loading…</p></div>

  const spentThisMonth = spending?.total || 0
  const budget = profile?.monthlyShoppingBudget || 0
  const budgetUsedPct = budget > 0 ? Math.min(100, Math.round((spentThisMonth / budget) * 100)) : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Budget & Finance</h1>
      <p className="mt-1 text-sm text-muted-foreground">Optional — your AI partner uses this for honest affordability guidance. Never required.</p>

      {/* Privacy note */}
      <Card className="mt-4 border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
        <p className="text-xs text-amber-800 dark:text-amber-300">🔒 We never ask for bank credentials, cards, PINs or OTPs. This is just an estimate to help you plan — not financial advice.</p>
      </Card>

      {/* This month summary */}
      {budget > 0 && (
        <Card className="mt-4 p-5">
          <h3 className="mb-3 font-semibold">This month</h3>
          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-sm"><span className="text-muted-foreground">Shopping budget used</span><span className="font-semibold">{formatPrice(spentThisMonth)} / {formatPrice(budget)}</span></div>
              <Progress value={budgetUsedPct} className="h-2" />
              <p className="mt-1 text-xs text-muted-foreground">{formatPrice(Math.max(0, budget - spentThisMonth))} remaining</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-xs text-muted-foreground">Orders</p><p className="text-lg font-bold">{spending?.orderCount || 0}</p></div>
              <div><p className="text-xs text-muted-foreground">Avg order</p><p className="text-lg font-bold">{formatPrice(spending?.avgOrderValue || 0)}</p></div>
              <div><p className="text-xs text-muted-foreground">Total spent</p><p className="text-lg font-bold">{formatPrice(spentThisMonth)}</p></div>
            </div>
          </div>
        </Card>
      )}

      {/* Budget form */}
      <Card className="mt-4 p-5">
        <h3 className="mb-4 font-semibold">Your financial profile</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label>Monthly income (₹)</Label><Input type="number" placeholder="50000" value={form.monthlyIncome} onChange={(e) => setForm({ ...form, monthlyIncome: e.target.value })} /></div>
          <div><Label>Monthly shopping budget (₹)</Label><Input type="number" placeholder="8000" value={form.monthlyShoppingBudget} onChange={(e) => setForm({ ...form, monthlyShoppingBudget: e.target.value })} /></div>
          <div><Label>Fixed monthly expenses (₹)</Label><Input type="number" placeholder="35000" value={form.fixedExpenses} onChange={(e) => setForm({ ...form, fixedExpenses: e.target.value })} /></div>
          <div><Label>Monthly savings target (₹)</Label><Input type="number" placeholder="15000" value={form.savingsTarget} onChange={(e) => setForm({ ...form, savingsTarget: e.target.value })} /></div>
        </div>
        <Button className="mt-4" onClick={save} disabled={saving}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : 'Save profile'}</Button>
      </Card>

      {/* Spending by category */}
      {spending && Object.keys(spending.byCategory || {}).length > 0 && (
        <Card className="mt-4 p-5">
          <h3 className="mb-3 font-semibold">Spending by category</h3>
          <div className="space-y-2">
            {Object.entries(spending.byCategory).sort((a: any, b: any) => b[1] - a[1]).map(([cat, amt]: any) => {
              const pct = spentThisMonth > 0 ? Math.round((amt / spentThisMonth) * 100) : 0
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm"><span>{cat}</span><span className="font-medium">{formatPrice(amt)} · {pct}%</span></div>
                  <Progress value={pct} className="h-1.5" />
                </div>
              )
            })}
          </div>
        </Card>
      )}

      <Card className="mt-4 border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <p className="flex-1 text-sm text-violet-900 dark:text-violet-200">Ask your AI partner "can I afford this?" before buying — it checks your real budget.</p>
          <Button size="sm" variant="outline" className="border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-300" onClick={() => setAiOpen(true)}>Ask AI</Button>
        </div>
      </Card>
    </div>
  )
}

export function InsightsView() {
  const { user, setAuthOpen } = useStore()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) api.financial.get().then(setData).finally(() => setLoading(false)) }, [user])

  if (!user) return <EmptyState icon={<TrendingUp />} title="Sign in to see insights" desc="Your shopping patterns and AI-powered insights appear here." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />
  if (loading) return <div className="mx-auto max-w-3xl px-4 py-8"><p className="text-muted-foreground">Loading…</p></div>

  const s = data?.spending
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold md:text-3xl">Shopping Insights</h1>
      <p className="mt-1 text-sm text-muted-foreground">Your AI partner's view of your shopping patterns.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card className="p-5"><div className="flex items-center gap-2 text-muted-foreground"><TrendingUp className="h-4 w-4" /><span className="text-xs font-medium">Total spent</span></div><p className="mt-2 text-2xl font-bold">{formatPrice(s?.total || 0)}</p></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-muted-foreground"><TrendingDown className="h-4 w-4" /><span className="text-xs font-medium">Orders placed</span></div><p className="mt-2 text-2xl font-bold">{s?.orderCount || 0}</p></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /><span className="text-xs font-medium">Avg. order value</span></div><p className="mt-2 text-2xl font-bold">{formatPrice(s?.avgOrderValue || 0)}</p></Card>
        <Card className="p-5"><div className="flex items-center gap-2 text-muted-foreground"><Sparkles className="h-4 w-4" /><span className="text-xs font-medium">Top category</span></div><p className="mt-2 text-2xl font-bold">{s && Object.keys(s.byCategory || {}).length ? Object.entries(s.byCategory).sort((a: any, b: any) => b[1] - a[1])[0][0] : '—'}</p></Card>
      </div>
      {(!s || s.orderCount === 0) && (
        <Card className="mt-4 p-6 text-center">
          <p className="text-sm text-muted-foreground">We're still learning your shopping patterns. Place an order to unlock personalised insights.</p>
        </Card>
      )}
    </div>
  )
}
