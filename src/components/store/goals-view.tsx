'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Target, Plus, Trash2, Sparkles, TrendingUp } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import { EmptyState } from './cart-view'

export function GoalsView() {
  const { user, setAuthOpen, setAiOpen } = useStore()
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ title: '', targetAmount: '', currentAmount: '', targetDate: '' })

  async function load() {
    setLoading(true)
    try { const r = await api.goals.list(); setGoals(r.goals) } catch {} finally { setLoading(false) }
  }
  useEffect(() => { if (user) load() }, [user])

  async function create() {
    if (!form.title || !form.targetAmount) { toast.error('Title and target amount required'); return }
    try {
      await api.goals.create({ title: form.title, targetAmount: parseFloat(form.targetAmount), currentAmount: parseFloat(form.currentAmount) || 0, targetDate: form.targetDate || undefined })
      toast.success('Goal created')
      setOpen(false)
      setForm({ title: '', targetAmount: '', currentAmount: '', targetDate: '' })
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  async function addProgress(goalId: string, current: number) {
    const add = prompt('Add amount to savings:', '5000')
    if (!add) return
    const newAmount = current + parseFloat(add)
    await api.goals.update(goalId, { currentAmount: newAmount })
    load()
    toast.success('Progress updated')
  }

  async function remove(id: string) {
    await api.goals.remove(id)
    load()
    toast.success('Goal deleted')
  }

  if (!user) return <EmptyState icon={<Target />} title="Sign in to use goals" desc="Set savings goals and let your AI partner find the right products." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">My Goals</h1>
          <p className="text-sm text-muted-foreground">Save towards what matters — your AI partner will help you decide when to buy.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New goal</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a savings goal</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Goal title *</Label><Input placeholder="e.g. New gaming laptop" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Target amount (₹) *</Label><Input type="number" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} /></div>
              <div><Label>Already saved (₹)</Label><Input type="number" value={form.currentAmount} onChange={(e) => setForm({ ...form, currentAmount: e.target.value })} /></div>
              <div><Label>Target date</Label><Input type="date" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} /></div>
              <Button className="w-full" onClick={create}>Create goal</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6 border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-violet-600" />
          <p className="flex-1 text-sm text-violet-900 dark:text-violet-200">Ask your AI partner to recommend products for your goals, or to check if now is a good time to buy.</p>
          <Button size="sm" variant="outline" className="border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-300" onClick={() => setAiOpen(true)}>Ask AI</Button>
        </div>
      </Card>

      {loading ? <p className="text-muted-foreground">Loading…</p> : goals.length === 0 ? (
        <EmptyState icon={<Target />} title="No goals yet" desc="Create your first savings goal and start planning." action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create goal</Button>} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {goals.map((g) => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
            const remaining = Math.max(0, g.targetAmount - g.currentAmount)
            return (
              <Card key={g.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Target className="h-5 w-5" /></div>
                    <div>
                      <h3 className="font-semibold">{g.title}</h3>
                      {g.targetDate && <p className="text-xs text-muted-foreground">Target: {new Date(g.targetDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>}
                    </div>
                  </div>
                  <button onClick={() => remove(g.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold">{formatPrice(g.currentAmount)}</span>
                    <span className="text-muted-foreground">of {formatPrice(g.targetAmount)}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className={pct >= 100 ? 'font-semibold text-emerald-600' : 'text-muted-foreground'}>{pct >= 100 ? 'Goal achieved! 🎉' : `${pct}% complete`}</span>
                    {remaining > 0 && <span className="text-muted-foreground">{formatPrice(remaining)} to go</span>}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => addProgress(g.id, g.currentAmount)}><TrendingUp className="mr-2 h-3.5 w-3.5" /> Add to savings</Button>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
