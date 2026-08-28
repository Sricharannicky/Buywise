'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, TrendingUp, Zap, Star, Shield, Truck, RotateCcw, Headphones } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/shared/product-card'
import { ProductImage, CategoryImage } from '@/components/shared/product-image'

export function HomeView({ categories }: { categories: any[] }) {
  const { navigate, user, setAiOpen } = useStore()
  const [trending, setTrending] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.products.list({ flag: 'trending', limit: '10' }),
      api.products.list({ flag: 'newArrival', limit: '10' }),
      api.products.list({ flag: 'deal', limit: '10' }),
      api.products.list({ flag: 'featured', limit: '10' }),
    ]).then(([t, n, d, f]) => {
      setTrending(t.products)
      setNewArrivals(n.products)
      setDeals(d.products)
      setFeatured(f.products)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/40">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-background to-violet-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,oklch(0.85_0.08_162/0.4),transparent_45%),radial-gradient(circle_at_85%_70%,oklch(0.80_0.10_280/0.3),transparent_45%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(1_0_0/0.6),transparent_50%)]" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-20">
          <div className="grid items-center gap-8 md:grid-cols-2">
            {/* Left: copy */}
            <div className="space-y-6">
              <Badge className="border-primary/20 bg-primary/10 text-primary hover:bg-primary/15">
                <Sparkles className="mr-1.5 h-3 w-3" /> Meet your Buywise AI
              </Badge>
              <div>
                <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-foreground md:text-6xl">
                  Shop smarter,<br />
                  <span className="bg-gradient-to-r from-emerald-600 to-violet-600 bg-clip-text text-transparent">not harder.</span>
                </h1>
                <p className="mt-4 max-w-md text-base text-muted-foreground md:text-lg">
                  Discover products, compare options, plan budgets and set goals — all with one trusted AI partner that genuinely helps you decide.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setAiOpen(true)} className="h-12 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 text-white shadow-lg shadow-violet-500/25 hover:opacity-90">
                  <Sparkles className="mr-2 h-4 w-4" /> Talk to your Partner
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ name: 'catalog' })} className="h-12 rounded-full px-6">
                  Browse products <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
              {!user && (
                <p className="text-sm text-muted-foreground">
                  Try the demo — <button onClick={() => useStore.getState().setAuthOpen(true, 'login')} className="font-semibold text-primary hover:underline">sign in</button> with <span className="font-medium text-foreground">demo@ai-shop.in</span> / demo1234
                </p>
              )}
            </div>

            {/* Right: floating product collage */}
            <div className="relative hidden h-[420px] md:block">
              <div className="absolute right-0 top-0 h-64 w-52 rotate-3 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                {featured[0] && <ProductImage name={featured[0].name} images={featured[0].images} className="h-full w-full" priority />}
              </div>
              <div className="absolute left-4 top-24 h-56 w-44 -rotate-6 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                {featured[1] && <ProductImage name={featured[1].name} images={featured[1].images} className="h-full w-full" priority />}
              </div>
              <div className="absolute bottom-0 right-12 h-48 w-40 rotate-6 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                {featured[2] && <ProductImage name={featured[2].name} images={featured[2].images} className="h-full w-full" priority />}
              </div>
              {/* Floating AI badge */}
              <div className="absolute left-0 bottom-16 flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-xl">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold leading-none text-foreground">AI suggests</p>
                  <p className="text-[10px] text-muted-foreground">the best value</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-t border-border/40 bg-background/60 backdrop-blur">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-3 md:grid-cols-4">
            {[
              { icon: Truck, label: 'Free delivery', sub: 'Over ₹999' },
              { icon: RotateCcw, label: '7-day returns', sub: 'Easy & free' },
              { icon: Shield, label: 'Secure payments', sub: 'Encrypted' },
              { icon: Headphones, label: 'AI support 24/7', sub: 'Always here' },
            ].map((b) => (
              <div key={b.label} className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <b.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-tight">{b.label}</p>
                  <p className="text-[10px] text-muted-foreground">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* Categories */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Shop by category</h2>
              <p className="text-sm text-muted-foreground">Explore our curated departments</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate({ name: 'catalog', category: c.slug })}
                className="group flex flex-col items-center gap-2.5 overflow-hidden rounded-2xl border border-border/50 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-t-2xl">
                  <CategoryImage name={c.name} imageUrl={c.imageUrl} className="h-full w-full" />
                </div>
                <span className="px-2 pb-3 text-center text-xs font-semibold leading-tight md:text-sm">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* AI Partner banner */}
        <section className="mt-10">
          <div className="relative overflow-hidden rounded-3xl border border-violet-200/60 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50 p-6 dark:border-violet-900/50 dark:from-violet-950/40 dark:via-card dark:to-fuchsia-950/40 md:p-8">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-to-br from-violet-400/20 to-fuchsia-400/20 blur-3xl" />
            <div className="relative z-10 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Your Buywise AI</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">Ask in plain English: "I need a laptop under ₹70k for coding and gaming." Your partner searches, compares, checks your budget and finds the best value — without pushing you to overspend.</p>
                </div>
              </div>
              <Button onClick={() => setAiOpen(true)} className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 hover:opacity-90">
                Start chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Trending */}
        <ProductSection title="Trending now" icon={<TrendingUp className="h-5 w-5 text-primary" />} products={trending} loading={loading} onSeeAll={() => navigate({ name: 'catalog', query: 'trending' })} />

        {/* Deals */}
        <ProductSection title="Today's deals" icon={<Zap className="h-5 w-5 text-deal" />} products={deals} loading={loading} onSeeAll={() => navigate({ name: 'catalog' })} deal />

        {/* New Arrivals */}
        <ProductSection title="New arrivals" icon={<Star className="h-5 w-5 text-amber-500" />} products={newArrivals} loading={loading} onSeeAll={() => navigate({ name: 'catalog' })} />

        {/* Featured categories grid */}
        {categories.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-2xl font-bold tracking-tight md:text-3xl">Explore more</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 3).map((c) => (
                <button key={c.id} onClick={() => navigate({ name: 'catalog', category: c.slug })} className="group relative h-44 overflow-hidden rounded-2xl border border-border/50 text-left">
                  <CategoryImage name={c.name} imageUrl={c.imageUrl} className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <p className="text-lg font-bold text-white">{c.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-white/80">Shop now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Gift / Goal CTA */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <button onClick={() => navigate({ name: 'goals' })} className="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/30">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Plan with goals</h3>
              <p className="mt-1 text-sm text-muted-foreground">Saving up for something special? Set a goal and let your AI partner find the right products at the right time.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">Create a goal <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </button>
          <button onClick={() => navigate({ name: 'budget' })} className="group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Budget intelligence</h3>
              <p className="mt-1 text-sm text-muted-foreground">Optionally share your budget and let your partner give honest affordability guidance before you buy.</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-400">Set up budget <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
            </div>
          </button>
        </section>
      </div>
    </div>
  )
}

function ProductSection({ title, icon, products, loading, onSeeAll, deal }: { title: string; icon: React.ReactNode; products: any[]; loading: boolean; onSeeAll: () => void; deal?: boolean }) {
  return (
    <section className="mt-10">
      <div className="mb-5 flex items-end justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <div>
            <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
          </div>
        </div>
        <button onClick={onSeeAll} className="flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 hover:underline">
          See all <ArrowRight className="h-3.5 w-3.5 transition-all" />
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer aspect-[3/4] rounded-xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.slice(0, 5).map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </section>
  )
}
