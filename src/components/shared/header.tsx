'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from '@/components/ui/dropdown-menu'
import { Sparkles, Search, ShoppingCart, Heart, User, Menu, Package, Target, Tag, Wallet, BarChart3, LogOut, Bell, ChevronDown, Home, ArrowLeft, Users, Camera, LayoutGrid } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function Header({ categories }: { categories: any[] }) {
  const { navigate, user, setUser, cartCount, setAiOpen, setAuthOpen, view, back, history, setMiniCartOpen, setMegaMenuOpen } = useStore()
  const [query, setQuery] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    refreshCartCount()
    if (user) {
      api.notifications.list().then((r) => setNotifications(r.notifications)).catch(() => {})
    }
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [user])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (query.trim()) {
      navigate({ name: 'catalog', query: query.trim() })
    }
  }

  async function logout() {
    await api.auth.logout()
    setUser(null)
    toast.success('Signed out')
    navigate({ name: 'home' })
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  return (
    <header className={cn('sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur-xl transition-shadow', scrolled && 'shadow-sm')}>
      {/* Top announcement bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1.5 text-[11px]">
          <p className="font-medium">Free delivery on orders over ₹999 · Trusted Buywise AI Partner</p>
          <div className="hidden items-center gap-4 md:flex">
            <button onClick={() => navigate({ name: 'orders' })} className="hover:opacity-80">Track Order</button>
            <button onClick={() => navigate({ name: 'account' })} className="hover:opacity-80">My Account</button>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3">
        {/* Mega menu trigger — "ALL" hamburger, visible on all screens */}
        <Button variant="outline" size="sm" onClick={() => setMegaMenuOpen(true)} className="shrink-0 gap-1.5 rounded-lg" aria-label="All categories">
          <LayoutGrid className="h-4 w-4" /> <span className="hidden sm:inline">All</span>
        </Button>

        {/* Back button — shown when there's history to go back to */}
        {history.length > 0 && (
          <Button variant="ghost" size="icon" onClick={back} className="shrink-0" aria-label="Go back" title="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}

        {/* Logo */}
        <button onClick={() => navigate({ name: 'home' })} className="flex shrink-0 items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="text-lg font-bold tracking-tight">Buy</span>
            <span className="text-lg font-bold text-primary">wise</span>
          </div>
        </button>

        {/* Search */}
        <form onSubmit={submitSearch} className="relative flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands…"
            className="h-11 rounded-full border-border/50 bg-muted/40 pl-10 pr-12 transition-all focus-visible:border-primary/40 focus-visible:bg-card"
          />
          <button type="button" onClick={() => setAiOpen(true)} className="absolute right-1 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Image search / Ask AI">
            <Camera className="h-4 w-4" />
          </button>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {user && (
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-deal ring-2 ring-background" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between px-2 py-1.5">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={async () => { await api.notifications.markAllRead(); const r = await api.notifications.list(); setNotifications(r.notifications) }} className="text-xs text-primary hover:underline">Mark all read</button>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {notifications.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-muted-foreground">No notifications yet</p>
                  ) : notifications.map((n) => (
                    <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2" onClick={async () => { if (!n.isRead) { await api.notifications.markRead(n.id); const r = await api.notifications.list(); setNotifications(r.notifications) } }}>
                      <div className="flex w-full items-center gap-2">
                        {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        <span className="text-sm font-medium">{n.title}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{n.body}</span>
                    </DropdownMenuItem>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button variant="ghost" size="icon" onClick={() => user ? navigate({ name: 'wishlist' }) : setAuthOpen(true, 'login')} aria-label="Wishlist" className="hidden sm:flex">
            <Heart className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon" onClick={() => user ? setMiniCartOpen(true) : setAuthOpen(true, 'login')} aria-label="Cart" className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-deal px-1 text-[10px] font-bold text-white ring-2 ring-background">{cartCount}</Badge>
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-1 gap-1.5 px-1.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-semibold">{user.firstName} {user.lastName}</p>
                  <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ name: 'account' })}><User className="mr-2 h-4 w-4" /> My Account</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'orders' })}><Package className="mr-2 h-4 w-4" /> My Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'goals' })}><Target className="mr-2 h-4 w-4" /> My Goals</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'rooms' })}><Users className="mr-2 h-4 w-4" /> Shopping Rooms</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'wishlist' })}><Heart className="mr-2 h-4 w-4" /> Wishlist</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'price-watch' })}><Tag className="mr-2 h-4 w-4" /> Price Watch</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ name: 'budget' })}><Wallet className="mr-2 h-4 w-4" /> Budget &amp; Finance</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'insights' })}><BarChart3 className="mr-2 h-4 w-4" /> Shopping Insights</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" /> Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" onClick={() => setAuthOpen(true, 'login')} className="ml-1 rounded-full">
              <User className="mr-1.5 h-4 w-4" /> Sign in
            </Button>
          )}
        </div>
      </div>

      {/* Category nav (desktop) */}
      <nav className="hidden border-t border-border/40 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 no-scrollbar">
          <button
            onClick={() => navigate({ name: 'home' })}
            className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors', view.name === 'home' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
          >
            <Home className="h-3.5 w-3.5" /> Home
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => navigate({ name: 'catalog', category: c.slug })}
              className={cn('flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors', view.name === 'catalog' && view.category === c.slug ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent hover:text-foreground')}
            >
              {c.name}
            </button>
          ))}
          <div className="ml-auto shrink-0">
            <button onClick={() => setAiOpen(true)} className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-1.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-105">
              <Sparkles className="h-3.5 w-3.5" /> Buywise AI
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}
