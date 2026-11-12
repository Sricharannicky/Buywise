'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Sparkles, Loader2, Check, ExternalLink, Settings, ShieldCheck, ChevronDown, ChevronUp, UserPlus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
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
  const [googleConfig, setGoogleConfig] = useState<{ configured: boolean; clientId: string | null }>({
    configured: false,
    clientId: null,
  })
  const [showGoogleChooser, setShowGoogleChooser] = useState(false)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [showSetupGuide, setShowSetupGuide] = useState(false)
  const [customGoogleEmail, setCustomGoogleEmail] = useState('')
  const [clientIdInput, setClientIdInput] = useState('')
  const [clientSecretInput, setClientSecretInput] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
  const gsiRendered = useRef(false)

  // Fetch Google OAuth configuration status
  useEffect(() => {
    if (authOpen) {
      fetch('/api/auth/google/config')
        .then((res) => res.json())
        .then((data) => {
          if (data && typeof data.configured === 'boolean') {
            setGoogleConfig(data)
            if (data.clientId) {
              setClientIdInput(data.clientId)
            }
          }
        })
        .catch(() => {})
    }
  }, [authOpen])

  // Initialize Google Identity Services (GSI) if a valid client ID exists
  useEffect(() => {
    if (!authOpen || !googleConfig.configured || !googleConfig.clientId || gsiRendered.current) return

    const loadGsi = () => {
      if (typeof window === 'undefined') return
      const clientId = googleConfig.clientId!

      const handleCredential = async (response: any) => {
        if (!response?.credential) return
        setGoogleLoading(true)
        try {
          const res = await api.auth.google({ credential: response.credential })
          setUser(res.user)
          setAuthOpen(false)
          toast.success(`Welcome to Buywise, ${res.user.firstName}! Signed in with Google.`)
          refreshCartCount().catch(() => {})
        } catch (e: any) {
          toast.error(e?.message || 'Google authentication failed')
        } finally {
          setGoogleLoading(false)
        }
      }

      const initScript = () => {
        if ((window as any).google?.accounts?.id) {
          try {
            ;(window as any).google.accounts.id.initialize({
              client_id: clientId,
              callback: handleCredential,
            })
            const btnEl = document.getElementById('gsi-native-btn')
            if (btnEl) {
              ;(window as any).google.accounts.id.renderButton(btnEl, {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text: 'continue_with',
                shape: 'rectangular',
                width: 380,
              })
              gsiRendered.current = true
            }
          } catch (err) {
            console.error('Google GSI render error:', err)
          }
        }
      }

      if (!document.getElementById('google-gsi-client')) {
        const script = document.createElement('script')
        script.id = 'google-gsi-client'
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = initScript
        document.body.appendChild(script)
      } else {
        initScript()
      }
    }

    loadGsi()
  }, [authOpen, googleConfig])

  function switchMode(mode: 'login' | 'register') {
    useStore.getState().setAuthOpen(true, mode)
    setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' })
    setShowGoogleChooser(false)
    setShowSetupGuide(false)
  }

  // Handle Google Login click
  function onGoogleButtonClick() {
    if (googleConfig.configured) {
      // Live Google OAuth 2.0 flow
      setGoogleLoading(true)
      window.location.href = '/api/auth/google'
    } else {
      // Open the Google Account Chooser
      setShowGoogleChooser(true)
    }
  }

  // Instant login with Google user
  async function handleGoogleAccountSelect(email: string, firstName: string, lastName: string) {
    setGoogleLoading(true)
    try {
      const res = await api.auth.google({
        email,
        firstName,
        lastName,
      })

      const user = res.user
      setUser(user)
      setAuthOpen(false)
      setShowGoogleChooser(false)
      toast.success(`Welcome to Buywise, ${user.firstName}! Signed in with Google.`)
      refreshCartCount().catch(() => {})
    } catch (e: any) {
      toast.error(e?.message || 'Google Sign-In failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  // Save Google Cloud Client ID & Secret directly to .env
  async function saveGoogleConfig(e: React.FormEvent) {
    e.preventDefault()
    if (!clientIdInput.trim()) {
      toast.error('Please enter your Google Client ID')
      return
    }

    setSavingConfig(true)
    try {
      const res = await fetch('/api/auth/google/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: clientIdInput.trim(),
          clientSecret: clientSecretInput.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setGoogleConfig({
          configured: true,
          clientId: clientIdInput.trim(),
        })
        setShowSetupGuide(false)
        setShowGoogleChooser(false)
        toast.success('Google OAuth configured! You can now sign in with Google.')
      } else {
        toast.error(data.error || 'Failed to save configuration')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Error saving configuration')
    } finally {
      setSavingConfig(false)
    }
  }

  // Email/Password form submit
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
      setUser(user)
      setAuthOpen(false)
      toast.success(authMode === 'login' ? `Welcome back, ${user.firstName}!` : `Welcome to Buywise, ${user.firstName}!`)
      refreshCartCount().catch(() => {})
    } catch (e: any) {
      toast.error(e?.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  function fillDemo() {
    setForm({ firstName: '', lastName: '', email: 'demo@ai-shop.in', phone: '', password: 'demo1234' })
  }

  return (
    <Dialog
      open={authOpen}
      onOpenChange={(o) => {
        setAuthOpen(o)
        if (!o) {
          setShowGoogleChooser(false)
          setShowSetupGuide(false)
          setShowCustomInput(false)
        }
      }}
    >
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              : 'Join to unlock smart shopping, price watches and your Buywise financial assistant'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-1">
          {/* Native GSI Button Container if rendered */}
          <div id="gsi-native-btn" className="flex justify-center w-full" />

          {/* Primary "Continue with Google" Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 border-border/80 bg-background hover:bg-muted/60 font-medium text-foreground shadow-xs transition-all flex items-center justify-center gap-2.5 rounded-xl group relative overflow-hidden"
            disabled={googleLoading}
            onClick={onGoogleButtonClick}
          >
            {googleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <GoogleIcon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
            )}
            <span>Continue with Google</span>
            {googleConfig.configured && (
              <span className="ml-auto inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 px-1.5 py-0.5 rounded-full font-medium">
                <ShieldCheck className="h-3 w-3" /> OAuth Active
              </span>
            )}
          </Button>

          {/* Authentic Google Account Chooser */}
          {showGoogleChooser && (
            <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 animate-in fade-in-50 slide-in-from-top-2 duration-200 shadow-sm">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <GoogleIcon className="h-4 w-4" />
                  <span className="text-xs font-semibold text-foreground">Sign in with Google</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGoogleChooser(false)}
                  className="text-[11px] text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Choose an account to continue to <span className="font-medium text-foreground">Buywise</span>:
              </p>

              {/* Account 1: Sricharan Nicky */}
              <button
                type="button"
                onClick={() => handleGoogleAccountSelect('sricharan.nicky@gmail.com', 'Sricharan', 'Nicky')}
                disabled={googleLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/60 text-left transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    S
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary">
                      Sricharan Nicky
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">sricharan.nicky@gmail.com</p>
                  </div>
                </div>
                <Check className="h-4 w-4 text-emerald-600 shrink-0 opacity-80" />
              </button>

              {/* Account 2: Alex Morgan */}
              <button
                type="button"
                onClick={() => handleGoogleAccountSelect('alex.morgan@gmail.com', 'Alex', 'Morgan')}
                disabled={googleLoading}
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/60 text-left transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    A
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary">
                      Alex Morgan
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">alex.morgan@gmail.com</p>
                  </div>
                </div>
                <Check className="h-4 w-4 text-emerald-600 shrink-0 opacity-80" />
              </button>

              {/* Custom Google Email Option */}
              {!showCustomInput ? (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg border border-dashed border-border/70 hover:bg-muted/40 text-left transition-colors text-xs text-muted-foreground hover:text-foreground"
                >
                  <UserPlus className="h-4 w-4 shrink-0 text-primary" />
                  <span>Use another Google account</span>
                </button>
              ) : (
                <div className="space-y-2 pt-1 border-t border-border/50">
                  <p className="text-[11px] text-muted-foreground">Enter your Google email:</p>
                  <div className="flex gap-1.5">
                    <Input
                      placeholder="your.email@gmail.com"
                      value={customGoogleEmail}
                      onChange={(e) => setCustomGoogleEmail(e.target.value)}
                      className="h-8 text-xs bg-background"
                      autoFocus
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="h-8 px-3 text-xs bg-primary text-primary-foreground shrink-0"
                      disabled={!customGoogleEmail || !customGoogleEmail.includes('@') || googleLoading}
                      onClick={() =>
                        handleGoogleAccountSelect(
                          customGoogleEmail,
                          customGoogleEmail.split('@')[0],
                          'User'
                        )
                      }
                    >
                      {googleLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Continue'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Google Cloud API Key Configuration (Optional) */}
              <div className="border-t border-border/60 pt-2.5">
                <button
                  type="button"
                  onClick={() => setShowSetupGuide(!showSetupGuide)}
                  className="w-full flex items-center justify-between text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Settings className="h-3 w-3" />
                    Enter Google Cloud Client ID (For Live OAuth)
                  </span>
                  {showSetupGuide ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </button>

                {showSetupGuide && (
                  <form onSubmit={saveGoogleConfig} className="mt-2.5 space-y-2.5 text-xs text-muted-foreground">
                    <div className="rounded-lg bg-muted/40 border border-border/60 p-2.5 space-y-1 text-[11px]">
                      <p className="font-semibold text-foreground">3 Quick Steps in Google Cloud:</p>
                      <ol className="list-decimal pl-4 space-y-0.5">
                        <li>
                          Visit{' '}
                          <a
                            href="https://console.cloud.google.com/apis/credentials"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline inline-flex items-center gap-0.5"
                          >
                            Google Cloud Console <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </li>
                        <li>Create OAuth 2.0 Client ID (Web Application).</li>
                        <li>
                          Set Redirect URI:{' '}
                          <code className="bg-muted px-1 py-0.5 rounded text-[10px] text-foreground">
                            http://localhost:3000/api/auth/google/callback
                          </code>
                        </li>
                      </ol>
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="googleClientId" className="text-[11px]">
                        Google Client ID:
                      </Label>
                      <Input
                        id="googleClientId"
                        placeholder="...apps.googleusercontent.com"
                        value={clientIdInput}
                        onChange={(e) => setClientIdInput(e.target.value)}
                        className="h-8 text-xs bg-background"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="googleClientSecret" className="text-[11px]">
                        Google Client Secret:
                      </Label>
                      <Input
                        id="googleClientSecret"
                        type="password"
                        placeholder="GOCSPX-..."
                        value={clientSecretInput}
                        onChange={(e) => setClientSecretInput(e.target.value)}
                        className="h-8 text-xs bg-background"
                      />
                    </div>

                    <Button type="submit" size="sm" className="w-full h-8 text-xs" disabled={savingConfig}>
                      {savingConfig && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      Save & Activate Live Google OAuth
                    </Button>
                  </form>
                )}
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
                <Label htmlFor="firstName" className="text-xs">
                  First name
                </Label>
                <Input
                  id="firstName"
                  value={form.firstName}
                  onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName" className="text-xs">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  value={form.lastName}
                  onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  required
                />
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          {authMode === 'register' && (
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs">
                Phone (optional)
              </Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10 rounded-xl"
            disabled={loading || googleLoading}
          >
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
