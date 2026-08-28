'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { toast } from 'sonner'

export function AuthModal() {
  const { authOpen, authMode, setAuthOpen, setUser } = useStore()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })

  function switchMode(mode: 'login' | 'register') {
    useStore.getState().setAuthOpen(true, mode)
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (authMode === 'login') {
        const { user } = await api.auth.login(form.email, form.password)
        setUser(user)
        toast.success(`Welcome back, ${user.firstName}!`)
      } else {
        const { user } = await api.auth.register(form)
        setUser(user)
        toast.success(`Welcome to Buywise, ${user.firstName}!`)
      }
      await refreshCartCount()
      setAuthOpen(false)
    } catch (e: any) {
      toast.error(e.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setForm({ firstName: '', lastName: '', email: 'demo@ai-shop.in', phone: '', password: 'demo1234' })
  }

  return (
    <Dialog open={authOpen} onOpenChange={(o) => setAuthOpen(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl">
            {authMode === 'login' ? 'Welcome back' : 'Create your account'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {authMode === 'login' ? 'Sign in to sync your cart, goals and AI partner' : 'Join to unlock your Buywise AI'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {authMode === 'login' ? 'Sign in' : 'Create account'}
          </Button>
        </form>
        {authMode === 'login' && (
          <button onClick={fillDemo} className="w-full rounded-lg border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground hover:bg-muted">
            Use demo account → <span className="font-medium text-foreground">demo@ai-shop.in</span> / demo1234
          </button>
        )}
        <p className="text-center text-sm text-muted-foreground">
          {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')} className="font-semibold text-primary hover:underline">
            {authMode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
