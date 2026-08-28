'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { Header } from '@/components/shared/header'
import { Footer } from '@/components/shared/footer'
import { AuthModal } from '@/components/shared/auth-modal'
import { AIPartner } from '@/components/ai/ai-partner'
import { MiniCart } from '@/components/shared/mini-cart'
import { MegaMenu } from '@/components/shared/mega-menu'
import { HomeView } from '@/components/store/home-view'
import { CatalogView } from '@/components/store/catalog-view'
import { ProductView } from '@/components/store/product-view'
import { CartView } from '@/components/store/cart-view'
import { CheckoutView } from '@/components/store/checkout-view'
import { OrdersView } from '@/components/store/orders-view'
import { GoalsView } from '@/components/store/goals-view'
import { WishlistView, PriceWatchView } from '@/components/store/wishlist-pricewatch-view'
import { BudgetView, InsightsView } from '@/components/store/budget-insights-view'
import { AccountView } from '@/components/store/account-view'
import { RoomsView, RoomView } from '@/components/store/rooms-view'

export default function Page() {
  const { view, user, setUser, navigate } = useStore()
  const [categories, setCategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    api.categories().then((r) => { setCategories(r.categories); setBrands(r.brands) }).catch(() => {})
    api.auth.me().then((r) => setUser(r.user)).catch(() => {}).finally(() => setReady(true))
  }, [setUser])

  // Handle ?room=<slug> shareable link — auto-navigate to the room
  useEffect(() => {
    if (typeof window !== 'undefined' && ready) {
      const params = new URLSearchParams(window.location.search)
      const roomSlug = params.get('room')
      if (roomSlug) {
        navigate({ name: 'room', slug: roomSlug })
        // Clean the URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [ready, navigate])

  function renderView() {
    switch (view.name) {
      case 'home': return <HomeView categories={categories} />
      case 'catalog': return <CatalogView key={`${view.category || 'all'}-${view.query || ''}`} categories={categories} brands={brands} initialCategory={view.category} initialQuery={view.query} />
      case 'product': return <ProductView id={view.id} />
      case 'cart': return <CartView />
      case 'checkout': return <CheckoutView />
      case 'orders': return <OrdersView />
      case 'account': return <AccountView />
      case 'goals': return <GoalsView />
      case 'wishlist': return <WishlistView />
      case 'price-watch': return <PriceWatchView />
      case 'budget': return <BudgetView />
      case 'insights': return <InsightsView />
      case 'rooms': return <RoomsView />
      case 'room': return <RoomView slug={view.slug} />
      default: return <HomeView categories={categories} />
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
          <p className="text-sm text-muted-foreground">Loading Buywise…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header categories={categories} />
      <main className="flex-1">{renderView()}</main>
      <Footer />
      <AuthModal />
      <MiniCart />
      <MegaMenu categories={categories} />
      <AIPartner />
    </div>
  )
}
