'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Check } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { toast } from 'sonner'

function GoogleIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  )
}

export function AuthModal() {
  const { authOpen, authMode, setAuthOpen, setUser } = useStore()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleSelectorOpen, setGoogleSelectorOpen] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [customGoogleName, setCustomGoogleName] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })

  function switchMode(mode: 'login' | 'register') {
    useStore.getState().setAuthOpen(true, mode)
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' })
    setGoogleSelectorOpen(false)
  }

  async function handleGoogleLogin(email?: string, name?: string) {
    setGoogleLoading(true)
    try {
      const chosenEmail = email || 'alex.morgan@gmail.com'
      const fullName = (name || 'Alex Morgan').trim()
      const parts = fullName.split(' ')
      const firstName = parts[0] || 'Google'
      const lastName = parts.slice(1).join(' ') || 'User'

      const res = await api.auth.google({
        email: chosenEmail,
        firstName,
        lastName,
      })

      const user = res.user
      setUser(user)
      setAuthOpen(false)
      setGoogleSelectorOpen(false)
      toast.success(`Welcome to Buywise, ${user.firstName}! Signed in with Google.`)
      refreshCartCount().catch(() => {})
    } catch (e: any) {
      toast.error(e.message || 'Google Sign-In failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      let user
      if (authMode === 'login') {
        const res = await api.auth.login(form.email, form.password)
        user = res.user
      } else {
        const res = await api.auth.register(form)
        user = res.user
      }
      // Close modal immediately and set user in store
      setUser(user)
      setAuthOpen(false)
      toast.success(authMode === 'login' ? `Welcome back, ${user.firstName}!` : `Welcome to Buywise, ${user.firstName}!`)
      // Refresh cart count in background
      refreshCartCount().catch(() => {})
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
    <Dialog open={authOpen} onOpenChange={(o) => { setAuthOpen(o); if (!o) setGoogleSelectorOpen(false) }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20">
            <Sparkles className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-xl font-bold">
            {authMode === 'login' ? 'Welcome back to Buywise' : 'Create your Buywise account'}
          </DialogTitle>
          <DialogDescription className="text-center text-xs sm:text-sm text-muted-foreground">
            {authMode === 'login'
              ? 'Sign in to access your cart, personalized recommendations & AI assistant'
              : 'Join to unlock smart shopping, price watches and your Buywise AI'}
          </DialogDescription>
        </DialogHeader>

        {/* Google Sign-In Main Action */}
        <div className="space-y-3 pt-1">
          <Button
            type="button"
            variant="outline"
            disabled={googleLoading || loading}
            onClick={() => setGoogleSelectorOpen((prev) => !prev)}
            className="relative flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border-border/80 bg-background font-medium shadow-xs hover:bg-muted/60 hover:text-foreground transition-all"
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <GoogleIcon className="h-4 w-4" />
            )}
            <span>Continue with Google</span>
          </Button>

          {/* Interactive Google Account Selector Tray */}
          {googleSelectorOpen && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs animate-fade-in space-y-2.5">
              <p className="font-semibold text-foreground flex items-center justify-between">
                <span>Select Google Account</span>
                <span className="text-[10px] font-normal text-muted-foreground">1-click sign-in</span>
              </p>

              {/* Pre-configured Google User */}
              <button
                type="button"
                onClick={() => handleGoogleLogin('alex.morgan@gmail.com', 'Alex Morgan')}
                className="w-full flex items-center justify-between gap-2.5 rounded-lg border border-border bg-card p-2 text-left hover:border-primary/50 hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-[11px]">
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">Alex Morgan</p>
                    <p className="text-[11px] text-muted-foreground truncate">alex.morgan@gmail.com</p>
                  </div>
                </div>
                <Check className="h-4 w-4 text-primary shrink-0 opacity-80" />
              </button>

              {/* Enter custom Google email */}
              <div className="pt-1 space-y-1.5">
                <p className="text-[11px] text-muted-foreground">Or sign in with your Google email:</p>
                <div className="flex gap-1.5">
                  <Input
                    placeholder="name@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="h-8 text-xs bg-background"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 px-3 text-xs"
                    disabled={!customGoogleEmail || !customGoogleEmail.includes('@')}
                    onClick={() => handleGoogleLogin(customGoogleEmail, customGoogleName || customGoogleEmail.split('@')[0])}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
              <span className="bg-background px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={submit} className="space-y-3">
          {authMode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName" className="text-xs">First name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">Last name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">Phone (optional)</Label>
              <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">Password</Label>
            <Input id="password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <Button type="submit" className="w-full h-10 rounded-xl" disabled={loading || googleLoading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {authMode === 'login' ? 'Sign in with Email' : 'Create account'}
          </Button>
        </form>

        {authMode === 'login' && (
          <button
            type="button"
            onClick={fillDemo}
            className="w-full rounded-lg border border-dashed border-border/80 bg-muted/40 px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
          >
            Use demo account → <span className="font-medium text-foreground">demo@ai-shop.in</span> / demo1234
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground pt-1">
          {authMode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => switchMode(authMode === 'login' ? 'register' : 'login')}
            className="font-semibold text-primary hover:underline"
          >
            {authMode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </DialogContent>
    </Dialog>
  )
}
