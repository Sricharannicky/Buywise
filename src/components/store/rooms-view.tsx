'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ProductImage } from '@/components/shared/product-image'
import { Users, Plus, ArrowRight, Copy, Check, Sparkles, Wallet, Package } from 'lucide-react'
import { useStore } from '@/lib/store'
import { api } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { toast } from 'sonner'
import { EmptyState } from './cart-view'

export function RoomsView() {
  const { navigate, user, setAuthOpen, setAiOpen } = useStore()
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', budget: '', splitType: 'SHARED_EQUALLY' })

  async function load() {
    setLoading(true)
    try { const r = await api.rooms.list(); setRooms(r.rooms) } catch {} finally { setLoading(false) }
  }
  useEffect(() => { if (user) load() }, [user])

  async function create() {
    if (!form.name) { toast.error('Please enter a room name'); return }
    try {
      const r = await api.rooms.create(form)
      toast.success('Shopping room created!')
      setOpen(false)
      setForm({ name: '', description: '', budget: '', splitType: 'SHARED_EQUALLY' })
      navigate({ name: 'room', slug: r.room.slug })
    } catch (e: any) { toast.error(e.message) }
  }

  if (!user) return <EmptyState icon={<Users />} title="Sign in to use Shopping Rooms" desc="Create a room, invite friends, and shop together." action={<Button onClick={() => setAuthOpen(true, 'login')}>Sign in</Button>} />

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Shopping Rooms</h1>
          <p className="text-sm text-muted-foreground">Shop together with friends, family or partners — vote, comment and decide as a group.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> New room</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create a shopping room</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Room name *</Label><Input placeholder="e.g. Birthday Gift Shopping" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>Description (optional)</Label><Textarea placeholder="What is this room for?" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Group budget (₹)</Label><Input type="number" placeholder="8000" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
                <div>
                  <Label>Payment split</Label>
                  <Select value={form.splitType} onValueChange={(v) => setForm({ ...form, splitType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHARED_EQUALLY">Shared equally</SelectItem>
                      <SelectItem value="FIXED">Fixed amount</SelectItem>
                      <SelectItem value="CUSTOM">Custom split</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={create}>Create room</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI banner */}
      <Card className="mb-6 border-violet-200/60 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-fuchsia-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <p className="flex-1 text-sm text-violet-900 dark:text-violet-200">Create a room, invite friends with a shareable link, and let Buywise AI help your group reach a decision together.</p>
          <Button size="sm" variant="outline" className="border-violet-300 text-violet-700 dark:border-violet-700 dark:text-violet-300" onClick={() => setAiOpen(true)}>Ask AI</Button>
        </div>
      </Card>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : rooms.length === 0 ? (
        <EmptyState icon={<Users />} title="No shopping rooms yet" desc="Create your first room to shop together with friends and family." action={<Button onClick={() => setOpen(true)}><Plus className="mr-2 h-4 w-4" /> Create room</Button>} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rooms.map((room) => (
            <Card key={room.id} className="cursor-pointer p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg" onClick={() => navigate({ name: 'room', slug: room.slug })}>
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Users className="h-5 w-5" /></div>
                {room.myRole === 'CREATOR' && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Creator</span>}
              </div>
              <h3 className="mt-3 font-semibold">{room.name}</h3>
              {room.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{room.description}</p>}
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {room.memberCount} members</span>
                <span className="flex items-center gap-1"><Package className="h-3 w-3" /> {room.itemCount} products</span>
                {room.budget > 0 && <span className="flex items-center gap-1"><Wallet className="h-3 w-3" /> {formatPrice(room.budget)}</span>}
              </div>
              <Button size="sm" variant="ghost" className="mt-3 w-full">Open room <ArrowRight className="ml-1 h-3 w-3" /></Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export function RoomView({ slug }: { slug: string }) {
  const { navigate, user, setAuthOpen, setAiOpen } = useStore()
  const [room, setRoom] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [commentText, setCommentText] = useState<Record<string, string>>({})

  async function load() {
    setLoading(true)
    try { const r = await api.rooms.get(slug); setRoom(r.room) } catch (e: any) { toast.error(e.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [slug])

  async function searchProducts(q: string) {
    setSearchQuery(q)
    if (q.length < 2) { setSearchResults([]); return }
    try {
      const r = await api.products.list({ q, limit: '6' })
      setSearchResults(r.products)
    } catch {}
  }

  async function addProduct(productId: string) {
    try {
      await api.rooms.addItem(room.id, productId)
      toast.success('Product added to room')
      setSearchQuery(''); setSearchResults([])
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  async function removeProduct(itemId: string) {
    try { await api.rooms.removeItem(itemId); toast.success('Removed'); load() } catch (e: any) { toast.error(e.message) }
  }

  async function vote(itemId: string, vote: 'UP' | 'DOWN') {
    try { await api.rooms.vote(itemId, vote); load() } catch (e: any) { toast.error(e.message) }
  }

  async function addComment(itemId: string) {
    const text = commentText[itemId]?.trim()
    if (!text) return
    try {
      await api.rooms.comment(itemId, text)
      setCommentText({ ...commentText, [itemId]: '' })
      load()
    } catch (e: any) { toast.error(e.message) }
  }

  function shareLink() {
    const url = `${window.location.origin}/?room=${room.slug}`
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('Room link copied!', { description: 'Share it with your friends' })
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (loading) return <div className="mx-auto max-w-4xl px-4 py-8"><p className="text-muted-foreground">Loading room…</p></div>
  if (!room) return <div className="mx-auto max-w-4xl px-4 py-20 text-center"><p>Room not found.</p></div>

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate({ name: 'rooms' })} className="mb-3 text-sm text-muted-foreground hover:text-primary">← All rooms</button>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{room.name}</h1>
              {room.myRole === 'CREATOR' && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Creator</span>}
            </div>
            {room.description && <p className="mt-1 text-sm text-muted-foreground">{room.description}</p>}
          </div>
          <Button variant="outline" onClick={shareLink}>
            {copied ? <Check className="mr-2 h-4 w-4 text-emerald-600" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied!' : 'Share link'}
          </Button>
        </div>
      </div>

      {/* Budget + split summary */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="h-4 w-4" /><span className="text-xs font-medium">Group budget</span></div>
          <p className="mt-1 text-xl font-bold">{room.budget > 0 ? formatPrice(room.budget) : 'No limit'}</p>
        </Card>
        <Card className={`p-4 ${room.overBudget ? 'border-destructive/40 bg-destructive/5' : ''}`}>
          <div className="flex items-center gap-2 text-muted-foreground"><Package className="h-4 w-4" /><span className="text-xs font-medium">Total selected</span></div>
          <p className={`mt-1 text-xl font-bold ${room.overBudget ? 'text-destructive' : ''}`}>{formatPrice(room.totalCost)}</p>
          {room.overBudget && <p className="text-xs text-destructive">Over budget by {formatPrice(-room.remainingBudget)}</p>}
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span className="text-xs font-medium">Per person ({room.memberCount})</span></div>
          <p className="mt-1 text-xl font-bold">{formatPrice(room.perPersonShare)}</p>
          <p className="text-xs text-muted-foreground">{room.splitType === 'SHARED_EQUALLY' ? 'Split equally' : room.splitType === 'FIXED' ? 'Fixed amount' : 'Custom'}</p>
        </Card>
      </div>

      {/* AI analysis button */}
      <Card className="mb-6 border-violet-200/60 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-fuchsia-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-violet-900 dark:text-violet-200">AI Group Decision Helper</p>
            <p className="text-xs text-violet-800/80 dark:text-violet-300/80">Let Buywise AI analyze votes, priorities and budget to help your group decide.</p>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:opacity-90" onClick={() => setAiOpen(true)}>Analyze</Button>
        </div>
      </Card>

      {/* Add product */}
      <div className="mb-6">
        {!showAddProduct ? (
          <Button variant="outline" onClick={() => { if (!user) { setAuthOpen(true, 'login'); return } setShowAddProduct(true) }}><Plus className="mr-2 h-4 w-4" /> Add a product</Button>
        ) : (
          <Card className="p-4">
            <div className="relative mb-3">
              <Input placeholder="Search products to add…" value={searchQuery} onChange={(e) => searchProducts(e.target.value)} />
            </div>
            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-2">
                    <ProductImage name={p.name} images={p.images} className="h-10 w-10 shrink-0 rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
                    </div>
                    <Button size="sm" onClick={() => addProduct(p.id)}>Add</Button>
                  </div>
                ))}
              </div>
            )}
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => { setShowAddProduct(false); setSearchQuery(''); setSearchResults([]) }}>Cancel</Button>
          </Card>
        )}
      </div>

      {/* Products in room */}
      {room.items.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 text-sm text-muted-foreground">No products yet. Add the first one to get started!</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {room.items.map((item: any) => {
            const upVotes = item.votes.filter((v: any) => v.vote === 'UP').length
            const downVotes = item.votes.filter((v: any) => v.vote === 'DOWN').length
            const myVote = item.votes.find((v: any) => v.member.userId === user?.id)?.vote
            return (
              <Card key={item.id} className="overflow-hidden p-0">
                <div className="flex gap-4 p-4">
                  {/* Vote column */}
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => vote(item.id, 'UP')} className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${myVote === 'UP' ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <span className="text-sm font-bold">{upVotes - downVotes}</span>
                    <button onClick={() => vote(item.id, 'DOWN')} className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${myVote === 'DOWN' ? 'bg-rose-100 text-rose-600' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  {/* Product thumbnail */}
                  <button onClick={() => navigate({ name: 'product', id: item.productId })} className="shrink-0">
                    <ProductImage name={item.product.name} images={item.product.images} className="h-20 w-20 rounded-xl" />
                  </button>

                  {/* Product info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.product.brand?.name}</p>
                        <button onClick={() => navigate({ name: 'product', id: item.productId })} className="text-left text-sm font-semibold hover:text-primary">{item.product.name}</button>
                        <p className="mt-0.5 text-lg font-bold">{formatPrice(item.product.price)}</p>
                        <p className="text-xs text-muted-foreground">Added by {item.addedBy.user.firstName} {item.addedBy.user.lastName}</p>
                        {item.note && <p className="mt-1 rounded-lg bg-muted/40 px-2 py-1 text-xs italic">"{item.note}"</p>}
                      </div>
                      {(room.myRole === 'CREATOR' || item.addedBy.userId === user?.id) && (
                        <button onClick={() => removeProduct(item.id)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                      )}
                    </div>

                    {/* Comments */}
                    {item.comments.length > 0 && (
                      <div className="mt-3 space-y-1.5 border-t border-border/40 pt-3">
                        {item.comments.map((c: any) => (
                          <div key={c.id} className="text-xs">
                            <span className="font-semibold">{c.member.user.firstName} {c.member.user.lastName}:</span>{' '}
                            <span className="text-muted-foreground">{c.body}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add comment */}
                    <div className="mt-2 flex gap-2">
                      <Input
                        placeholder="Add a comment…"
                        value={commentText[item.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [item.id]: e.target.value })}
                        onKeyDown={(e) => { if (e.key === 'Enter') addComment(item.id) }}
                        className="h-8 text-xs"
                      />
                      <Button size="sm" variant="ghost" className="h-8 px-2 text-xs" onClick={() => addComment(item.id)}>Send</Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Members */}
      <Card className="mt-6 p-4">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4" /> Members ({room.members.length})</h3>
        <div className="flex flex-wrap gap-2">
          {room.members.map((m: any) => (
            <div key={m.id} className="flex items-center gap-2 rounded-full border border-border/50 px-3 py-1.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{m.user.firstName[0]}{m.user.lastName[0]}</div>
              <span className="text-xs font-medium">{m.user.firstName} {m.user.lastName}</span>
              {m.role === 'CREATOR' && <span className="text-[9px] text-primary">★</span>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
