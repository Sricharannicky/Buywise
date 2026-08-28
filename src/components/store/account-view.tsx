'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Package, Target, Heart, Tag, Wallet, BarChart3, Sparkles, ChevronRight, Settings, Shield, Users } from 'lucide-react'
import { useStore } from '@/lib/store'

export function AccountView() {
  const { user, navigate, setAiOpen, setAuthOpen } = useStore()

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"><Settings className="h-8 w-8" /></div>
        <h2 className="mt-4 text-xl font-bold">My Account</h2>
        <p className="mt-1 text-sm text-muted-foreground">Sign in to manage your profile, orders, goals and AI preferences.</p>
        <Button className="mt-4" onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>
      </div>
    )
  }

  const cards = [
    { icon: Package, title: 'My Orders', desc: 'Track and manage your orders', action: () => navigate({ name: 'orders' }) },
    { icon: Target, title: 'My Goals', desc: 'Savings goals and progress', action: () => navigate({ name: 'goals' }) },
    { icon: Users, title: 'Shopping Rooms', desc: 'Shop together with friends', action: () => navigate({ name: 'rooms' }) },
    { icon: Heart, title: 'Wishlist', desc: 'Saved products', action: () => navigate({ name: 'wishlist' }) },
    { icon: Tag, title: 'Price Watch', desc: 'Price drop alerts', action: () => navigate({ name: 'price-watch' }) },
    { icon: Wallet, title: 'Budget & Finance', desc: 'Optional financial profile', action: () => navigate({ name: 'budget' }) },
    { icon: BarChart3, title: 'Shopping Insights', desc: 'Spending patterns & AI insights', action: () => navigate({ name: 'insights' }) },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Profile header */}
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-2xl font-bold text-white backdrop-blur">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
              <p className="text-sm text-white/80">{user.email}</p>
              {user.phone && <p className="text-sm text-white/80">{user.phone}</p>}
            </div>
          </div>
        </div>
      </Card>

      {/* AI Partner banner */}
      <Card className="mt-4 flex items-center gap-4 border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-violet-900 dark:text-violet-200">Your Buywise AI</h3>
          <p className="text-sm text-violet-800 dark:text-violet-300">Discover, compare, budget and decide — all in one chat.</p>
        </div>
        <Button onClick={() => setAiOpen(true)} className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90">Chat now</Button>
      </Card>

      {/* Dashboard cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {cards.map((c) => (
          <button key={c.title} onClick={c.action} className="group text-left">
            <Card className="flex h-full flex-col p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></div>
                <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </div>
              <h3 className="mt-3 font-semibold">{c.title}</h3>
              <p className="text-sm text-muted-foreground">{c.desc}</p>
            </Card>
          </button>
        ))}
      </div>

      {/* Account info */}
      <Card className="mt-6 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold"><Shield className="h-4 w-4 text-primary" /> Account details</h3>
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div><p className="text-muted-foreground">First name</p><p className="font-medium">{user.firstName}</p></div>
          <div><p className="text-muted-foreground">Last name</p><p className="font-medium">{user.lastName}</p></div>
          <div><p className="text-muted-foreground">Email</p><p className="font-medium">{user.email}</p></div>
          <div><p className="text-muted-foreground">Phone</p><p className="font-medium">{user.phone || 'Not set'}</p></div>
          <div><p className="text-muted-foreground">Role</p><Badge variant="secondary">{user.role}</Badge></div>
        </div>
      </Card>
    </div>
  )
}
