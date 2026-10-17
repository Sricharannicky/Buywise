'use client'

import { useEffect, useRef, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Sparkles, Send, X, ShoppingBag, Check, AlertCircle, Target, Tag, TrendingDown, Wallet, Loader2, Trash2, ArrowRight } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api, refreshCartCount } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { ProductImage } from '@/components/shared/product-image'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  toolResults?: any[]
  suggestions?: string[]
}

const STARTER_PROMPTS = [
  'I need a laptop under ₹70,000 for programming and gaming',
  'Compare the top headphones for travel',
  'Can I afford a ₹6,000 headphone right now?',
  'Optimise my cart for savings',
  'Help me set a savings goal for a new workstation',
]

export function AIPartner() {
  const { aiOpen, setAiOpen, user, setAuthOpen, navigate } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function send(text: string) {
    const message = text.trim()
    if (!message || loading) return
    if (!user) {
      setAuthOpen(true, 'login')
      return
    }
    const userMsg: ChatMessage = { role: 'user', content: message }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setLoading(true)
    try {
      const res = await api.ai.chat(message, conversationId || undefined)
      if (res.conversationId) setConversationId(res.conversationId)
      setMessages((m) => [...m, { role: 'assistant', content: res.message, toolResults: res.toolResults, suggestions: res.suggestions }])
    } catch (e: any) {
      setMessages((m) => [...m, { role: 'assistant', content: "I'm having trouble right now. You can still browse and shop — I'll be back shortly.", suggestions: [] }])
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setMessages([])
    setConversationId(null)
  }

  return (
    <>
      {/* Floating button */}
      {!aiOpen && (
        <button
          onClick={() => setAiOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 font-semibold text-white shadow-xl shadow-violet-500/30 transition-transform hover:scale-105 ai-pulse"
          aria-label="Open Buywise AI"
        >
          <Sparkles className="h-5 w-5" />
          <span className="hidden sm:inline">Buywise AI</span>
        </button>
      )}

      <Sheet open={aiOpen} onOpenChange={(o) => setAiOpen(o)}>
        <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg" hideClose>
          {/* Header */}
          <SheetHeader className="border-b border-border/60 bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3.5 text-primary-foreground">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <SheetTitle className="text-base font-bold text-white">Buywise AI</SheetTitle>
                  <p className="text-xs text-white/80">Your trusted shopping companion</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={reset} aria-label="New conversation">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => setAiOpen(false)} aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto bg-muted/20 p-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold">Hi{user ? `, ${user.firstName}` : ''}! I'm your Buywise AI.</h3>
                <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">I can help you discover products, compare options, plan budgets, set goals and find the best value — without pushing you to overspend.</p>
                <div className="mt-6 grid w-full gap-2">
                  {STARTER_PROMPTS.map((p) => (
                    <button key={p} onClick={() => send(p)} className="rounded-xl border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-accent">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={cn('flex animate-fade-in-up', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={cn('max-w-[88%] space-y-3', msg.role === 'user' ? 'items-end' : 'items-start')}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-violet-500" /> Buywise AI
                    </div>
                  )}
                  <div
                    className={cn(
                      'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'rounded-br-md bg-primary text-primary-foreground'
                        : 'rounded-bl-md bg-card text-card-foreground shadow-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {msg.toolResults?.map((tr, j) => (
                    <ToolResultCard key={j} result={tr} onNavigate={(id) => { navigate({ name: 'product', id }); setAiOpen(false) }} />
                  ))}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestions.map((s, k) => (
                        <button key={k} onClick={() => send(s)} className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300">
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-card px-4 py-3 shadow-sm">
                  <span className="flex gap-1">
                    <span className="ai-dot h-2 w-2 rounded-full bg-violet-400" style={{ animationDelay: '0s' }} />
                    <span className="ai-dot h-2 w-2 rounded-full bg-violet-400" style={{ animationDelay: '0.2s' }} />
                    <span className="ai-dot h-2 w-2 rounded-full bg-violet-400" style={{ animationDelay: '0.4s' }} />
                  </span>
                  <span className="text-xs text-muted-foreground">Thinking…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/60 bg-background p-3">
            <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex items-center gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything about shopping…"
                className="h-11 rounded-full border-border/60 bg-muted/40"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            <p className="mt-1.5 px-2 text-center text-[10px] text-muted-foreground">AI suggests — you decide. Prices &amp; stock are always fetched live.</p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

// ----------------------------------------------------------------------------
// Structured tool-result cards
// ----------------------------------------------------------------------------
function ToolResultCard({ result, onNavigate }: { result: any; onNavigate: (id: string) => void }) {
  const { type, data } = result
  switch (type) {
    case 'product_list':
      return (
        <Card className="overflow-hidden p-0">
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-3 py-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{data.reason || 'Results'}</span>
            <Badge variant="secondary" className="text-[10px]">{data.count} found</Badge>
          </div>
          <div className="max-h-80 overflow-y-auto scrollbar-thin">
            {data.products.map((p: any) => (
              <ProductRow key={p.id} product={p} onClick={() => onNavigate(p.id)} />
            ))}
            {data.products.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted-foreground">No products matched. Try broadening your criteria.</p>}
          </div>
        </Card>
      )
    case 'product_detail':
      return <Card className="overflow-hidden p-0"><ProductRow product={data} onClick={() => onNavigate(data.id)} showDesc /></Card>
    case 'comparison':
      return <ComparisonCard products={data.products} onNavigate={onNavigate} />
    case 'cart_summary':
      return (
        <Card className="p-3">
          <div className="mb-2 flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Your Cart</span>
            <Badge variant="secondary" className="ml-auto">{data.count} items</Badge>
          </div>
          <div className="space-y-1.5">
            {data.items.map((i: any) => (
              <div key={i.id} className="flex items-center gap-2 text-sm">
                <ProductImage name={i.name} images={i.images || JSON.stringify([i.emoji])} className="h-8 w-8 shrink-0 rounded-md" />
                <span className="flex-1 truncate">{i.name}</span>
                <span className="text-muted-foreground">×{i.quantity}</span>
                <span className="font-medium">{formatPrice(i.price * i.quantity)}</span>
              </div>
            ))}
            {data.items.length === 0 && <p className="py-2 text-center text-sm text-muted-foreground">Your cart is empty</p>}
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span><span>{formatPrice(data.subtotal)}</span>
          </div>
        </Card>
      )
    case 'affordability':
      return <AffordabilityCard data={data} />
    case 'cart_optimization':
      return <CartOptimizationCard data={data} onNavigate={onNavigate} />
    case 'goal_proposal':
      return <GoalProposalCard data={data} />
    case 'price_watch_proposal':
      return <PriceWatchProposalCard data={data} />
    case 'add_to_cart_proposal':
      return <AddToCartProposalCard data={data} />
    case 'group_room_analysis':
      return <GroupRoomAnalysisCard data={data} onNavigate={onNavigate} />
    case 'error':
      return (
        <Card className="flex items-center gap-2 border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" /> {data.message}
        </Card>
      )
    default:
      return null
  }
}

function ProductRow({ product, onClick, showDesc = false }: { product: any; onClick: () => void; showDesc?: boolean }) {
  // Use the full images array (real URL + emoji fallback) if available;
  // otherwise fall back to just the emoji.
  const images = product.images || JSON.stringify([product.emoji])
  return (
    <div className="flex w-full items-center gap-3 border-b border-border/40 px-3 py-2.5 transition-colors last:border-0 hover:bg-accent/50">
      <button onClick={onClick} className="shrink-0">
        <ProductImage name={product.name} images={images} className="h-12 w-12 rounded-lg" />
      </button>
      <button onClick={onClick} className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium">{product.name}</p>
        {showDesc && product.shortDescription && <p className="truncate text-xs text-muted-foreground">{product.shortDescription}</p>}
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>
          {product.compareAtPrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</span>}
          {!product.inStock && <Badge variant="destructive" className="text-[10px]">Out of stock</Badge>}
        </div>
      </button>
      <Button size="sm" variant="outline" onClick={onClick} className="shrink-0 rounded-full">
        View <ArrowRight className="ml-1 h-3 w-3" />
      </Button>
    </div>
  )
}

function ComparisonCard({ products, onNavigate }: { products: any[]; onNavigate: (id: string) => void }) {
  if (!products.length) return null
  // collect all spec keys
  const specKeys = new Set<string>()
  products.forEach((p) => Object.keys(p.specs || {}).forEach((k) => specKeys.add(k)))
  const keys = Array.from(specKeys)
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border/60 bg-muted/40 px-3 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Comparison</span>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60">
              <th className="w-24 p-2 text-left text-xs font-medium text-muted-foreground">Product</th>
              {products.map((p) => (
                <th key={p.id} className="p-2 text-left align-top">
                  <button onClick={() => onNavigate(p.id)} className="block text-left">
                    <ProductImage name={p.name} images={p.images || JSON.stringify([p.emoji])} className="mb-1.5 h-14 w-full rounded-lg" />
                    <p className="line-clamp-2 text-xs font-semibold">{p.name}</p>
                  </button>
                  <Button size="sm" variant="outline" onClick={() => onNavigate(p.id)} className="mt-1.5 w-full rounded-full text-[11px]">
                    View <ArrowRight className="ml-1 h-2.5 w-2.5" />
                  </Button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/40">
              <td className="p-2 text-xs font-medium text-muted-foreground">Price</td>
              {products.map((p) => <td key={p.id} className="p-2 font-bold">{formatPrice(p.price)}</td>)}
            </tr>
            <tr className="border-b border-border/40">
              <td className="p-2 text-xs font-medium text-muted-foreground">Rating</td>
              {products.map((p) => <td key={p.id} className="p-2">⭐ {p.rating.toFixed(1)}</td>)}
            </tr>
            {keys.map((k) => (
              <tr key={k} className="border-b border-border/40">
                <td className="p-2 text-xs font-medium text-muted-foreground">{k}</td>
                {products.map((p) => <td key={p.id} className="p-2 text-xs">{p.specs?.[k] || '—'}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function AffordabilityCard({ data }: { data: any }) {
  if (!data.hasProfile) {
    return (
      <Card className="flex items-center gap-3 p-3">
        <Wallet className="h-5 w-5 shrink-0 text-amber-500" />
        <p className="text-sm text-muted-foreground">{data.message}</p>
      </Card>
    )
  }
  const fits = data.fits
  return (
    <Card className={cn('p-3', fits ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/40' : 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40')}>
      <div className="mb-2 flex items-center gap-2">
        <Wallet className={cn('h-4 w-4', fits ? 'text-emerald-600' : 'text-amber-600')} />
        <span className="text-sm font-semibold">Budget Impact</span>
        <Badge variant="secondary" className={cn('ml-auto text-[10px]', fits ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{data.pctOfBudget}% of budget</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div><p className="text-muted-foreground">Monthly budget</p><p className="font-semibold">{formatPrice(data.monthlyBudget)}</p></div>
        <div><p className="text-muted-foreground">Spent this month</p><p className="font-semibold">{formatPrice(data.spentThisMonth)}</p></div>
        <div><p className="text-muted-foreground">Remaining</p><p className="font-semibold text-emerald-600">{formatPrice(data.remaining)}</p></div>
        <div><p className="text-muted-foreground">This purchase</p><p className="font-semibold">{formatPrice(data.price)}</p></div>
      </div>
      <p className={cn('mt-2 text-xs font-medium', fits ? 'text-emerald-700' : 'text-amber-700')}>
        {fits ? 'Fits your budget — but consider your active savings goals too.' : 'This would exceed your remaining monthly budget.'}
      </p>
    </Card>
  )
}

function CartOptimizationCard({ data, onNavigate }: { data: any; onNavigate: (id: string) => void }) {
  return (
    <Card className="p-3">
      <div className="mb-2 flex items-center gap-2">
        <TrendingDown className="h-4 w-4 text-emerald-600" />
        <span className="text-sm font-semibold">Cart Optimisation</span>
        {data.totalSavings > 0 && <Badge className="ml-auto bg-emerald-600 text-white">Save ~{formatPrice(data.totalSavings)}</Badge>}
      </div>
      {data.opportunities.length === 0 ? (
        <p className="py-2 text-sm text-muted-foreground">{data.message || 'Your cart looks efficient — no obvious savings found.'}</p>
      ) : (
        <div className="space-y-2">
          {data.opportunities.map((o: any, i: number) => (
            <div key={i} className="rounded-lg border border-border/60 bg-muted/30 p-2 text-xs">
              {o.type === 'cheaper_alternative' ? (
                <div>
                  <p className="font-medium">Cheaper alternative found</p>
                  <button onClick={() => onNavigate(o.alternative.productId)} className="mt-1 text-primary hover:underline">
                    {o.alternative.name} — {formatPrice(o.alternative.price)}
                  </button>
                  <p className="text-muted-foreground">instead of {o.current.name} ({formatPrice(o.current.price)}) · save {formatPrice(o.savings)}</p>
                </div>
              ) : (
                <div>
                  <p className="font-medium">{o.suggestion}</p>
                  <div className="mt-1 space-y-0.5 text-muted-foreground">
                    {o.items.map((it: any, j: number) => <p key={j}>• {it.name} — {formatPrice(it.price)}</p>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

function GoalProposalCard({ data }: { data: any }) {
  const [done, setDone] = useState(false)
  async function confirm() {
    try {
      await api.goals.create({ title: data.title, targetAmount: data.targetAmount, targetDate: data.targetDate })
      setDone(true)
      toast.success('Goal created', { description: data.title })
    } catch (e: any) { toast.error(e.message) }
  }
  return (
    <Card className="flex items-center gap-3 p-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Target className="h-5 w-5" /></div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{data.title}</p>
        <p className="text-xs text-muted-foreground">Target: {formatPrice(data.targetAmount)}{data.targetDate ? ` · by ${data.targetDate}` : ''}</p>
      </div>
      {done ? <Badge className="bg-emerald-600 text-white"><Check className="mr-1 h-3 w-3" /> Created</Badge> : <Button size="sm" onClick={confirm}>Create</Button>}
    </Card>
  )
}

function PriceWatchProposalCard({ data }: { data: any }) {
  const [done, setDone] = useState(false)
  async function confirm() {
    try {
      await api.priceWatch.create(data.productId, data.targetPrice)
      setDone(true)
      toast.success('Price alert set', { description: `${data.productName} below ${formatPrice(data.targetPrice)}` })
    } catch (e: any) { toast.error(e.message) }
  }
  return (
    <Card className="flex items-center gap-3 p-3">
      <ProductImage name={data.productName} images={data.images || JSON.stringify([data.emoji])} className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{data.productName}</p>
        <p className="text-xs text-muted-foreground">Alert me below {formatPrice(data.targetPrice)} (now {formatPrice(data.currentPrice)})</p>
      </div>
      {done ? <Badge className="bg-emerald-600 text-white"><Check className="mr-1 h-3 w-3" /> Set</Badge> : <Button size="sm" onClick={confirm}>Set alert</Button>}
    </Card>
  )
}

function AddToCartProposalCard({ data }: { data: any }) {
  const [done, setDone] = useState(false)
  async function confirm() {
    try {
      await api.cart.add(data.productId, data.quantity)
      await refreshCartCount()
      setDone(true)
      toast.success('Added to cart', { description: data.productName })
    } catch (e: any) { toast.error(e.message) }
  }
  return (
    <Card className="flex items-center gap-3 p-3">
      <ProductImage name={data.productName} images={data.images || JSON.stringify([data.emoji])} className="h-10 w-10 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{data.productName}</p>
        <p className="text-xs text-muted-foreground">{formatPrice(data.price)} × {data.quantity}</p>
      </div>
      {done ? <Badge className="bg-emerald-600 text-white"><Check className="mr-1 h-3 w-3" /> Added</Badge> : <Button size="sm" onClick={confirm} disabled={!data.inStock}>{data.inStock ? 'Add to cart' : 'Out of stock'}</Button>}
    </Card>
  )
}

// Group Room Analysis — AI-assisted collaborative decision summary
function GroupRoomAnalysisCard({ data, onNavigate }: { data: any; onNavigate: (id: string) => void }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-border/60 bg-gradient-to-r from-violet-50 to-fuchsia-50 px-3 py-2 dark:from-violet-950/30 dark:to-fuchsia-950/30">
        <span className="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-300">🤝 Group Decision Analysis</span>
      </div>
      <div className="space-y-3 p-3">
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[10px] text-muted-foreground">Members</p>
            <p className="text-sm font-bold">{data.memberCount}</p>
          </div>
          <div className={`rounded-lg p-2 ${data.overBudget ? 'bg-destructive/10' : 'bg-muted/40'}`}>
            <p className="text-[10px] text-muted-foreground">Total cost</p>
            <p className={`text-sm font-bold ${data.overBudget ? 'text-destructive' : ''}`}>{formatPrice(data.totalCost)}</p>
          </div>
          <div className="rounded-lg bg-muted/40 p-2">
            <p className="text-[10px] text-muted-foreground">Per person</p>
            <p className="text-sm font-bold">{formatPrice(data.perPersonShare)}</p>
          </div>
        </div>

        {data.budget > 0 && (
          <div className={`rounded-lg p-2 text-xs ${data.overBudget ? 'bg-destructive/10 text-destructive' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'}`}>
            {data.overBudget
              ? `⚠️ Over budget by ${formatPrice(-data.remainingBudget)}`
              : `✓ Within budget — ${formatPrice(data.remainingBudget)} remaining`}
          </div>
        )}

        {/* Highlights */}
        {(data.topVoted || data.bestRated || data.lowestPrice) && (
          <div className="space-y-1.5 rounded-lg border border-border/40 p-2">
            {data.topVoted && (
              <p className="text-xs"><span className="font-semibold text-amber-600">🏆 Group favourite:</span> {data.topVoted.name} ({data.topVoted.netVotes > 0 ? '+' : ''}{data.topVoted.netVotes} votes, {formatPrice(data.topVoted.price)})</p>
            )}
            {data.bestRated && (
              <p className="text-xs"><span className="font-semibold text-blue-600">⭐ Best rated:</span> {data.bestRated.name} ({data.bestRated.rating.toFixed(1)}★, {formatPrice(data.bestRated.price)})</p>
            )}
            {data.lowestPrice && (
              <p className="text-xs"><span className="font-semibold text-emerald-600">💰 Lowest price:</span> {data.lowestPrice.name} ({formatPrice(data.lowestPrice.price)})</p>
            )}
          </div>
        )}

        {/* Group priorities */}
        {Object.keys(data.priorities || {}).length > 0 && (
          <div className="rounded-lg border border-border/40 p-2">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Group priorities (from comments)</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(data.priorities).map(([k, v]: any) => (
                <span key={k} className={`rounded-full px-2 py-0.5 text-[10px] ${v === 'Important' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ranked products */}
        <div className="space-y-1.5">
          {data.products?.slice(0, 5).map((p: any, i: number) => (
            <div key={p.itemId} className="flex items-center gap-2 text-xs">
              <span className="w-4 text-muted-foreground">{i + 1}.</span>
              <button onClick={() => onNavigate(p.productId)} className="min-w-0 flex-1 truncate text-left hover:text-primary">{p.name}</button>
              <span className={`font-medium ${p.netVotes > 0 ? 'text-emerald-600' : p.netVotes < 0 ? 'text-rose-600' : 'text-muted-foreground'}`}>{p.netVotes > 0 ? '+' : ''}{p.netVotes}</span>
              <span className="font-medium">{formatPrice(p.price)}</span>
            </div>
          ))}
        </div>

        <p className="border-t border-border/40 pt-2 text-[10px] italic text-muted-foreground">
          The AI explains the differences — the group makes the final decision.
        </p>
      </div>
    </Card>
  )
}
