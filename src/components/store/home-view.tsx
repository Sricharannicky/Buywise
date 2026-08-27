'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight, TrendingUp, Zap, Gift, Star } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/shared/product-card'
import { ProductImage } from '@/components/shared/product-image'

export function HomeView({ categories }: { categories: any[] }) {
  const { navigate, user, setAiOpen } = useStore()
  const [trending, setTrending] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.products.list({ flag: 'trending', limit: '10' }),
      api.products.list({ flag: 'newArrival', limit: '10' }),
      api.products.list({ flag: 'deal', limit: '10' }),
    ]).then(([t, n, d]) => {
      setTrending(t.products)
      setNewArrivals(n.products)
      setDeals(d.products)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-12 pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-rose-500" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.25),transparent_50%)]" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 md:py-20">
          <Badge className="bg-white/20 text-white backdrop-blur hover:bg-white/30">
            <Sparkles className="mr-1.5 h-3 w-3" /> Powered by AI Shopping Partner
          </Badge>
          <div className="max-w-2xl">
            <h1 className="text-balance text-4xl font-bold leading-tight text-white md:text-6xl">
              Shop smarter, <span className="text-white/90">not harder.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg text-white/90">
              Discover products, compare options, plan budgets and set goals — all with one trusted AI partner that genuinely helps you decide.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => setAiOpen(true)} className="bg-white text-violet-700 hover:bg-white/90">
              <Sparkles className="mr-2 h-4 w-4" /> Talk to your Shopping Partner
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate({ name: 'catalog' })} className="border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
              Browse products <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          {!user && (
            <p className="text-sm text-white/80">Demo account available — sign in with <span className="font-semibold text-white">demo@ai-shop.in</span> / demo1234</p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* Categories */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold">Shop by category</h2>
              <p className="text-sm text-muted-foreground">Explore our curated departments</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate({ name: 'catalog', category: c.slug })}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent to-muted text-3xl transition-transform group-hover:scale-110">
                  {c.imageUrl}
                </div>
                <span className="text-sm font-semibold">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        {/* AI Partner banner */}
        <section className="mt-12">
          <div className="relative overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-6 dark:border-violet-900 dark:from-violet-950/40 dark:to-fuchsia-950/40 md:p-8">
            <div className="relative z-10 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                  <Sparkles className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Meet your AI Shopping Partner</h3>
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">Ask in plain English: "I need a laptop under ₹70k for coding and gaming." Your partner searches, compares, checks your budget and finds the best value — without pushing you to overspend.</p>
                </div>
              </div>
              <Button onClick={() => setAiOpen(true)} className="shrink-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90">
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
            <h2 className="mb-4 text-2xl font-bold">Explore more</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 3).map((c) => (
                <button key={c.id} onClick={() => navigate({ name: 'catalog', category: c.slug })} className="group relative h-40 overflow-hidden rounded-2xl border border-border/60 text-left">
                  <ProductImage name={c.name + c.id} images={JSON.stringify([c.imageUrl])} className="absolute inset-0 h-full w-full opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 p-4">
                    <p className="text-lg font-bold text-white">{c.name}</p>
                    <p className="flex items-center gap-1 text-sm text-white/80">Shop now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Gift / Goal CTA */}
        <section className="mt-12 grid gap-4 md:grid-cols-2">
          <button onClick={() => navigate({ name: 'goals' })} className="group rounded-2xl border border-border/60 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-left dark:from-emerald-950/30 dark:to-teal-950/30">
            <Gift className="h-8 w-8 text-emerald-600" />
            <h3 className="mt-3 text-lg font-bold">Plan with goals</h3>
            <p className="mt-1 text-sm text-muted-foreground">Saving up for something special? Set a goal and let your AI partner find the right products at the right time.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">Create a goal <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
          </button>
          <button onClick={() => navigate({ name: 'budget' })} className="group rounded-2xl border border-border/60 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-left dark:from-amber-950/30 dark:to-orange-950/30">
            <Sparkles className="h-8 w-8 text-amber-600" />
            <h3 className="mt-3 text-lg font-bold">Budget intelligence</h3>
            <p className="mt-1 text-sm text-muted-foreground">Optionally share your budget and let your partner give honest affordability guidance before you buy.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700">Set up budget <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" /></span>
          </button>
        </section>
      </div>
    </div>
  )
}

function ProductSection({ title, icon, products, loading, onSeeAll, deal }: { title: string; icon: React.ReactNode; products: any[]; loading: boolean; onSeeAll: () => void; deal?: boolean }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-end justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
          </div>
        </div>
        <button onClick={onSeeAll} className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
          See all <ArrowRight className="h-3 w-3" />
        </button>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] animate-pulse rounded-xl bg-muted" />
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
