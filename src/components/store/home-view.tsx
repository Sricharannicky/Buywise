'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
  Star,
  Shield,
  Truck,
  RotateCcw,
  Headphones,
  Tag,
} from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { ProductCard } from '@/components/shared/product-card'
import { ProductImage, CategoryImage } from '@/components/shared/product-image'

// ---------------------------------------------------------------------------
// Slide definitions for the hero carousel
// ---------------------------------------------------------------------------
type Slide = {
  id: number
  eyebrow: string
  titleTop: string
  titleBottom: string
  titleAccent: string
  subtext: string
  cta: { label: string; action: () => void; variant: 'solid' | 'outline' }
  gradient: string
  glow: string
  accentText: string
}

export function HomeView({ categories }: { categories: any[] }) {
  const { navigate, user, setAiOpen, setAuthOpen } = useStore()
  const [trending, setTrending] = useState<any[]>([])
  const [newArrivals, setNewArrivals] = useState<any[]>([])
  const [deals, setDeals] = useState<any[]>([])
  const [featured, setFeatured] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // ---- Carousel state ----
  const [slide, setSlide] = useState(0)
  const [paused, setPaused] = useState(false)
  const slides: Slide[] = [
    {
      id: 0,
      eyebrow: 'Meet your Buywise AI',
      titleTop: 'Shop smarter,',
      titleBottom: 'not harder.',
      titleAccent: 'from-emerald-600 to-teal-500',
      subtext:
        'Discover products, compare options, plan budgets and set goals — all with one trusted AI partner that genuinely helps you decide.',
      cta: {
        label: 'Explore More',
        action: () => navigate({ name: 'catalog' }),
        variant: 'solid',
      },
      gradient: 'from-emerald-500 via-emerald-600 to-teal-700',
      glow: 'bg-emerald-300/30',
      accentText: 'text-emerald-50',
    },
    {
      id: 1,
      eyebrow: 'Today only',
      titleTop: 'Up to 40% off',
      titleBottom: 'top brands.',
      titleAccent: 'from-amber-500 to-orange-500',
      subtext:
        "Hand-picked deals across electronics, fashion, home and more. Refreshed daily so you never miss a bargain — but hurry, stock moves fast.",
      cta: {
        label: 'Shop Now',
        action: () => navigate({ name: 'catalog', query: 'deal' }),
        variant: 'solid',
      },
      gradient: 'from-amber-500 via-orange-500 to-rose-500',
      glow: 'bg-amber-300/30',
      accentText: 'text-amber-50',
    },
    {
      id: 2,
      eyebrow: 'Your personal shopper',
      titleTop: 'Ask anything,',
      titleBottom: 'buy with confidence.',
      titleAccent: 'from-violet-500 to-fuchsia-500',
      subtext:
        '"I need a laptop under ₹70k for coding and gaming" — your AI partner searches, compares, checks your budget and finds the best value, without pushing you to overspend.',
      cta: {
        label: 'Talk to your Partner',
        action: () => setAiOpen(true),
        variant: 'solid',
      },
      gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
      glow: 'bg-violet-300/30',
      accentText: 'text-violet-50',
    },
  ]

  // ---- Product fetch ----
  useEffect(() => {
    Promise.all([
      api.products.list({ flag: 'trending', limit: '10' }),
      api.products.list({ flag: 'newArrival', limit: '10' }),
      api.products.list({ flag: 'deal', limit: '10' }),
      api.products.list({ flag: 'featured', limit: '10' }),
    ])
      .then(([t, n, d, f]) => {
        setTrending(t.products)
        setNewArrivals(n.products)
        setDeals(d.products)
        setFeatured(f.products)
      })
      .finally(() => setLoading(false))
  }, [])

  // ---- Auto-rotate carousel (5s, pause on hover) ----
  useEffect(() => {
    if (paused) return
    const t = setInterval(() => {
      setSlide((s) => (s + 1) % slides.length)
    }, 5000)
    return () => clearInterval(t)
  }, [paused, slides.length])

  const goTo = useCallback((i: number) => setSlide(((i % slides.length) + slides.length) % slides.length), [slides.length])

  return (
    <div className="pb-10">
      {/* =============================================================== HERO CAROUSEL */}
      <section
        className="relative overflow-hidden"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Track of slides */}
        <div className="relative h-[460px] sm:h-[440px] md:h-[520px]">
          {slides.map((s, i) => (
            <div
              key={s.id}
              aria-hidden={i !== slide}
              className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                i === slide ? 'opacity-100' : 'pointer-events-none opacity-0'
              }`}
            >
              {/* Gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
              {/* Decorative glow blobs */}
              <div className={`absolute -right-24 -top-24 h-96 w-96 rounded-full ${s.glow} blur-3xl`} />
              <div className={`absolute -left-32 bottom-0 h-80 w-80 rounded-full ${s.glow} blur-3xl`} />
              {/* Soft pattern overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,oklch(1_0_0/0.18),transparent_45%),radial-gradient(circle_at_80%_70%,oklch(1_0_0/0.10),transparent_45%)]" />

              <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
                <div className="grid w-full items-center gap-6 md:grid-cols-2">
                  {/* Copy */}
                  <div className={`space-y-5 ${i === slide ? 'animate-fade-in-up' : ''}`}>
                    <span className={`inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ${s.accentText} backdrop-blur`}>
                      <Sparkles className="h-3 w-3" />
                      {s.eyebrow}
                    </span>
                    <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl">
                      {s.titleTop}<br />
                      <span className={`bg-gradient-to-r ${s.titleAccent} bg-clip-text text-transparent`}>
                        {s.titleBottom}
                      </span>
                    </h1>
                    <p className="max-w-md text-sm text-white/85 sm:text-base md:text-lg">{s.subtext}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        size="lg"
                        onClick={s.cta.action}
                        className="h-12 rounded-full bg-white px-7 text-foreground shadow-xl hover:bg-white/90"
                      >
                        {s.cta.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      {!user && i === 0 && (
                        <button
                          onClick={() => setAuthOpen(true, 'login')}
                          className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
                        >
                          Sign in with demo@ai-shop.in / demo1234
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Right visual: floating product collage on slide 0 & 1, interactive AI mockup on slide 2 */}
                  <div className="relative hidden h-[380px] md:block">
                    {i === 0 ? (
                      <>
                        <div className="absolute right-0 top-0 h-60 w-48 rotate-3 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                          {featured[0] && (
                            <ProductImage name={featured[0].name} images={featured[0].images} className="h-full w-full" priority />
                          )}
                        </div>
                        <div className="absolute left-4 top-24 h-52 w-40 -rotate-6 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                          {featured[1] && (
                            <ProductImage name={featured[1].name} images={featured[1].images} className="h-full w-full" priority />
                          )}
                        </div>
                        <div className="absolute bottom-0 right-12 h-44 w-36 rotate-6 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                          {featured[2] && (
                            <ProductImage name={featured[2].name} images={featured[2].images} className="h-full w-full" priority />
                          )}
                        </div>
                        {/* Floating AI badge */}
                        <div className="absolute left-0 bottom-20 flex items-center gap-2 rounded-full bg-white px-3.5 py-2 shadow-xl">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-xs">
                            <Sparkles className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-[10px] font-bold leading-none text-foreground">AI recommends</p>
                            <p className="text-[10px] text-muted-foreground">verified best value</p>
                          </div>
                        </div>
                      </>
                    ) : i === 1 ? (
                      <>
                        <div className="absolute right-4 top-2 h-64 w-52 rotate-4 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                          {(deals[0] || featured[0]) && (
                            <ProductImage name={(deals[0] || featured[0]).name} images={(deals[0] || featured[0]).images} className="h-full w-full" priority />
                          )}
                        </div>
                        <div className="absolute left-6 top-20 h-52 w-44 -rotate-6 overflow-hidden rounded-2xl border-4 border-white shadow-2xl transition-transform duration-500 hover:rotate-0">
                          {(deals[1] || featured[1]) && (
                            <ProductImage name={(deals[1] || featured[1]).name} images={(deals[1] || featured[1]).images} className="h-full w-full" priority />
                          )}
                        </div>
                        {/* Floating Hot Deal badge */}
                        <div className="absolute left-2 bottom-12 flex items-center gap-2 rounded-full bg-amber-400 px-4 py-2 text-foreground shadow-2xl font-bold text-xs uppercase tracking-wider animate-bounce">
                          <Zap className="h-4 w-4 fill-foreground" />
                          Flash Sale · Up to 40% Off
                        </div>
                      </>
                    ) : (
                      <div className="absolute right-4 top-1/2 flex w-80 -translate-y-1/2 flex-col gap-3 rounded-3xl bg-white/20 p-5 backdrop-blur-xl border border-white/30 shadow-2xl text-white">
                        <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-purple-700 font-bold text-xs">
                              <Sparkles className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-xs font-bold tracking-wide">Buywise AI Assistant</span>
                          </div>
                          <span className="rounded-full bg-emerald-400/30 px-2 py-0.5 text-[10px] font-medium text-emerald-200">Online</span>
                        </div>
                        <div className="space-y-2 text-xs">
                          <div className="rounded-xl bg-white/10 p-2.5 text-white/90">
                            "I need an ultrabook under ₹75,000 for coding & battery life"
                          </div>
                          <div className="rounded-xl bg-white/20 p-2.5 space-y-1.5 border border-white/20">
                            <p className="font-semibold text-emerald-200 text-[11px]">✓ Top match found within budget</p>
                            <p className="text-[11px] leading-relaxed text-white/90">
                              Aurora Pro 14 OLED offers 18h battery, 16GB RAM, and 512GB SSD. Perfect match!
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => setAiOpen(true)}
                          className="h-8 rounded-full bg-white text-purple-900 font-semibold hover:bg-white/90 text-xs shadow-md"
                        >
                          Try AI Shopping Partner
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Side arrow controls */}
        <button
          onClick={() => goTo(slide - 1)}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/35 sm:flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => goTo(slide + 1)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white/35 sm:flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Dot indicators */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === slide ? 'w-7 bg-white' : 'w-2 bg-white/45 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </section>

      {/* =============================================================== PROMO STRIP */}
      <div className="bg-foreground text-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-2 px-4 py-2.5 text-center sm:flex-row sm:gap-4">
          <span className="flex items-center gap-2 text-xs font-medium sm:text-sm">
            <Tag className="h-3.5 w-3.5 text-amber-400" />
            Get <span className="font-bold text-amber-400">UPTO 40% OFF</span> on your 1st order
          </span>
          <span className="hidden text-background/40 sm:inline">—</span>
          <button
            onClick={() => navigate({ name: 'catalog' })}
            className="text-xs font-bold uppercase tracking-wider text-amber-400 underline-offset-4 hover:underline sm:text-sm"
          >
            SHOP NOW
          </button>
        </div>
      </div>

      {/* =============================================================== TRUST STRIP */}
      <section className="border-b border-border/40 bg-card/40">
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
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* =============================================================== CATEGORY ROW */}
        <CategoryRow categories={categories} onPick={(slug) => navigate({ name: 'catalog', category: slug })} />

        {/* =============================================================== AI PARTNER BANNER */}
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
                  <p className="mt-1 max-w-md text-sm text-muted-foreground">
                    Ask in plain English: "I need a laptop under ₹70k for coding and gaming." Your partner searches,
                    compares, checks your budget and finds the best value — without pushing you to overspend.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setAiOpen(true)}
                className="shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 hover:opacity-90"
              >
                Start chatting <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* =============================================================== PRODUCT RAILS */}
        <ProductRail
          title="Trending Now"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          products={trending}
          loading={loading}
          onSeeAll={() => navigate({ name: 'catalog', query: 'trending' })}
        />

        <ProductRail
          title="Today's Deals"
          icon={<Zap className="h-5 w-5 text-deal" />}
          products={deals}
          loading={loading}
          onSeeAll={() => navigate({ name: 'catalog', query: 'deal' })}
        />

        <ProductRail
          title="New Arrivals"
          icon={<Star className="h-5 w-5 text-amber-500" />}
          products={newArrivals}
          loading={loading}
          onSeeAll={() => navigate({ name: 'catalog' })}
        />

        {/* =============================================================== EXPLORE MORE TILES */}
        {categories.length > 0 && (
          <section className="mt-12">
            <h2 className="mb-5 text-2xl font-bold tracking-tight md:text-3xl">Explore more</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={() => navigate({ name: 'catalog', category: c.slug })}
                  className="group relative h-44 overflow-hidden rounded-2xl border border-border/50 text-left"
                >
                  <CategoryImage name={c.name} imageUrl={c.imageUrl} className="absolute inset-0 h-full w-full" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 p-5">
                    <p className="text-lg font-bold text-white">{c.name}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-white/80">
                      Shop now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* =============================================================== GOAL / BUDGET CTAs */}
        <section className="mt-10 grid gap-4 md:grid-cols-2">
          <button
            onClick={() => navigate({ name: 'goals' })}
            className="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/30"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Plan with goals</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Saving up for something special? Set a goal and let your AI partner find the right products at the right time.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                Create a goal <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </button>
          <button
            onClick={() => navigate({ name: 'budget' })}
            className="group relative overflow-hidden rounded-2xl border border-amber-200/60 bg-gradient-to-br from-amber-50 to-orange-50 p-6 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30"
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white shadow-md">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Budget intelligence</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Optionally share your budget and let your partner give honest affordability guidance before you buy.
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                Set up budget <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </button>
        </section>
      </div>
    </div>
  )
}

// ===========================================================================
// Horizontally scrollable circular category row with arrows
// ===========================================================================
function CategoryRow({ categories, onPick }: { categories: any[]; onPick: (slug: string) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * 300, behavior: 'smooth' })
  }

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Shop by category</h2>
          <p className="text-sm text-muted-foreground">Swipe through our curated departments</p>
        </div>
        <div className="hidden gap-2 sm:flex">
          <button
            onClick={() => scrollBy(-1)}
            aria-label="Scroll categories left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="Scroll categories right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-muted"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none' }}
      >
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => onPick(c.slug)}
            className="group flex w-20 shrink-0 flex-col items-center gap-2 sm:w-24"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-border/60 bg-card shadow-sm transition-all duration-300 group-hover:-translate-y-0.5 group-hover:border-primary/40 group-hover:shadow-md sm:h-24 sm:w-24">
              <CategoryImage name={c.name} imageUrl={c.imageUrl} className="h-full w-full" />
            </div>
            <span className="line-clamp-2 text-center text-xs font-medium leading-tight text-foreground sm:text-sm">
              {c.name}
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}

// ===========================================================================
// Product rail — horizontally scrollable with arrows
// ===========================================================================
function ProductRail({
  title,
  icon,
  products,
  loading,
  onSeeAll,
}: {
  title: string
  icon: React.ReactNode
  products: any[]
  loading: boolean
  onSeeAll: () => void
}) {
  const scrollerRef = useRef<HTMLDivElement>(null)

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollBy({ left: dir * 500, behavior: 'smooth' })
  }

  return (
    <section className="mt-10">
      {/* Header */}
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onSeeAll}
            className="hidden items-center gap-1 text-sm font-semibold text-primary hover:gap-2 hover:underline sm:flex"
          >
            See all <ArrowRight className="h-3.5 w-3.5 transition-all" />
          </button>
          <div className="hidden gap-2 md:flex">
            <button
              onClick={() => scrollBy(-1)}
              aria-label={`Scroll ${title} left`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label={`Scroll ${title} right`}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card text-foreground transition-colors hover:bg-muted"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile "See all" — visible only on small screens */}
      <div className="mb-3 sm:hidden">
        <button
          onClick={onSeeAll}
          className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          See all <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Rail */}
      <div
        ref={scrollerRef}
        className="no-scrollbar -mx-1 flex gap-4 overflow-x-auto px-1 pb-2 scroll-smooth"
        style={{ scrollbarWidth: 'none' }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="shimmer min-w-[220px] max-w-[220px] flex-1 rounded-xl bg-muted"
                style={{ aspectRatio: '3 / 4' }}
              />
            ))
          : products.map((p) => (
              <div key={p.id} className="min-w-[220px] max-w-[220px]">
                <ProductCard product={p} />
              </div>
            ))}
      </div>
    </section>
  )
}
