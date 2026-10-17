import { db } from './db'
import { formatPrice, discountPercent, parseImages } from './format'
import type { Product } from '@prisma/client'

// ============================================================================
// AI SHOPPING PARTNER — Unified AI Orchestrator
// ----------------------------------------------------------------------------
// Internally orchestrates multiple specialized capabilities (search, comparison,
// goals, budget, cart optimization, price-watch) but exposes ONE assistant to
// the user. Uses a two-step ReAct-style loop:
//   1. LLM selects tools to call based on user intent + context.
//   2. Backend executes tools against real DB data.
//   3. LLM writes the final natural-language reply grounded in tool results.
// The AI never invents prices/stock — all facts come from backend tools.
// ============================================================================

export interface ToolResult {
  type: string
  data: any
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

// ----------------------------------------------------------------------------
// Context builder — sends only the minimum context required (privacy by design)
// ----------------------------------------------------------------------------
export async function buildUserContext(userId: string | null) {
  if (!userId) return { isLoggedIn: false }
  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      preferences: true,
      financial: true,
      cart: { include: { items: { where: { savedForLater: false }, include: { product: true } } } },
      goals: { include: { items: { include: { product: true } } } },
      priceWatches: { include: { product: true } },
      recentlyViewed: { include: { product: true }, orderBy: { viewedAt: 'desc' }, take: 5 },
    },
  })
  if (!user) return { isLoggedIn: false }
  const cartItems = (user.cart?.items || []).map((i) => ({
    id: i.id,
    productId: i.productId,
    name: i.product.name,
    price: i.product.price,
    quantity: i.quantity,
    emoji: parseImages(i.product.images)[0] || '📦',
  }))
  const cartSubtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0)
  return {
    isLoggedIn: true,
    user: { firstName: user.firstName, lastName: user.lastName, email: user.email },
    preferences: user.preferences,
    financial: user.financial
      ? {
          monthlyIncome: user.financial.monthlyIncome,
          monthlyShoppingBudget: user.financial.monthlyShoppingBudget,
          fixedExpenses: user.financial.fixedExpenses,
          savingsTarget: user.financial.savingsTarget,
        }
      : null,
    cart: { items: cartItems, subtotal: cartSubtotal, count: cartItems.reduce((s, i) => s + i.quantity, 0) },
    goals: user.goals.map((g) => ({
      id: g.id,
      title: g.title,
      targetAmount: g.targetAmount,
      currentAmount: g.currentAmount,
      remaining: Math.max(0, g.targetAmount - g.currentAmount),
      status: g.status,
    })),
    priceWatches: user.priceWatches.map((w) => ({ productId: w.productId, productName: w.product.name, currentPrice: w.product.price, targetPrice: w.targetPrice })),
    recentlyViewed: user.recentlyViewed.map((r) => ({ productId: r.productId, name: r.product.name })),
  }
}

// ----------------------------------------------------------------------------
// Tool definitions exposed to the LLM
// ----------------------------------------------------------------------------
const TOOL_DEFINITIONS = `
You have access to these tools. Call them by returning a JSON object with a "toolCalls" array.

1. search_products
   params: { query?: string, category?: slug, maxPrice?: number, minPrice?: number, minRating?: number, sort?: "relevance"|"price-asc"|"price-desc"|"rating", limit?: number (default 5, max 8) }
   Returns matching products with real prices, stock and ratings.

2. get_product
   params: { productId: string }
   Returns full product details.

3. compare_products
   params: { productIds: string[] (2-3) }
   Returns a side-by-side comparison of real specs and prices.

4. get_cart
   params: {}
   Returns the user's current cart contents and subtotal.

5. check_affordability
   params: { price: number }
   Returns budget impact analysis using the user's real financial profile (if provided).

6. optimize_cart
   params: {}
   Analyzes the cart for duplicate products, cheaper alternatives and savings opportunities.

7. get_recommendations
   params: { intent?: string }
   Returns personalized recommendations based on cart, goals and recent views.

8. create_goal
   params: { title: string, targetAmount: number, targetDate?: string (YYYY-MM-DD) }
   PROPOSES a new savings goal. User must confirm before it is created.

9. create_price_watch
   params: { productId: string, targetPrice: number }
   PROPOSES a price alert. User must confirm before it is created.

10. add_to_cart
    params: { productId: string, quantity?: number (default 1) }
    PROPOSES adding to cart. User must confirm before it is added.

11. analyze_group_room
    params: { roomSlug: string }
    Analyzes a shared shopping room: products, votes, comments, budget, and members.
    Returns a group decision summary with vote tallies, budget status, per-person split,
    and identified group priorities. The AI explains differences between options but
    does NOT decide for the group — members make the final choice.

RULES:
- Always use tools to fetch real product data. NEVER invent prices, stock, specs or ratings.
- For write operations (create_goal, create_price_watch, add_to_cart), return them as proposals only.
- Call at most 3 tools per turn.
- If the user just makes small talk, you may respond without any tool calls.
- To recommend products, ALWAYS call search_products or get_recommendations first.
- For group shopping rooms, ALWAYS call analyze_group_room first before giving advice.
`

const SYSTEM_PROMPT = `You are "Buywise AI" — a single, unified, trusted shopping assistant for the Buywise e-commerce store.

PERSONA: Friendly, concise, transparent, practical and non-judgmental. You are a trusted partner, NOT a sales engine. You genuinely help users make good decisions.

CORE PRINCIPLES:
- Sometimes recommend waiting, saving, or choosing a cheaper alternative when that serves the user better.
- Never use aggressive sales language, fake urgency, or manipulative tactics.
- Distinguish what the user explicitly told you vs what was inferred. Never present inference as fact.
- For financial matters, use "estimated", "based on what you've shared", "you may want to consider". Never give guaranteed financial advice.
- For all factual product info (price, stock, specs, ratings), ALWAYS use tools — never invent numbers.
- Keep replies concise. Use 1-3 short paragraphs max for the message text. The structured cards carry the detail.
- Remember the conversation context. If the user said "under 70k" and now says "cheaper", they still mean the same category.

You respond with STRICT JSON only (no markdown fences, no prose outside JSON):
{
  "toolCalls": [ { "name": "tool_name", "args": { ... } } ],
  "replyPlan": "1-line note on what you intend to say, so the next step can write the final message"
}

If no tools are needed, return { "toolCalls": [], "replyPlan": "..." }.`

const FINAL_PROMPT = `You are "Buywise AI". Write the final reply to the user based on the conversation and the tool results below.

RULES:
- Be friendly, concise and honest. 1-3 short paragraphs.
- Reference the ACTUAL tool results — never invent prices, stock, specs or ratings.
- For financial/budget insights, use careful "estimated" language.
- If you proposed a write action (add_to_cart, create_goal, create_price_watch), mention it briefly in the message — the UI will show a confirmation card.
- If no products matched, say so honestly and suggest broadening criteria.
- Do not use markdown headings. Plain text with line breaks is fine.

Respond with STRICT JSON only:
{
  "message": "your reply text",
  "suggestions": ["short follow-up prompt 1", "short follow-up prompt 2"]
}`

// ----------------------------------------------------------------------------
// Tool execution — real DB queries, no hallucination
// ----------------------------------------------------------------------------
function serializeProduct(p: Product & { brand?: { name: string } | null, category?: { name: string; slug: string } | null }) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    discount: discountPercent(p.price, p.compareAtPrice),
    emoji: parseImages(p.images).find((x) => !x.startsWith('http')) || parseImages(p.images)[0] || '📦',
    images: p.images, // full JSON array [realUrl?, emoji]
    brand: p.brand?.name || null,
    category: p.category?.name || null,
    categorySlug: p.category?.slug || null,
    rating: p.rating,
    ratingCount: p.ratingCount,
    stock: p.stock,
    shortDescription: p.shortDescription,
    inStock: p.stock > 0,
  }
}

async function executeTool(name: string, args: any, userId: string | null): Promise<ToolResult> {
  switch (name) {
    case 'search_products': {
      const where: any = { isActive: true }
      if (args.query) {
        // Split into words and match any — more forgiving than a single substring
        const words = String(args.query).split(/\s+/).filter((w) => w.length > 2)
        if (words.length) {
          const wordConditions: any[] = []
          for (const w of words) {
            wordConditions.push({ name: { contains: w } }, { description: { contains: w } }, { tags: { contains: w } }, { shortDescription: { contains: w } }, { brand: { name: { contains: w } } })
          }
          where.OR = wordConditions
        }
      }
      if (args.category) {
        where.AND = [{ OR: [{ category: { slug: args.category } }, { category: { parent: { slug: args.category } } }] }]
      }
      if (args.maxPrice) where.price = { ...where.price, lte: args.maxPrice }
      if (args.minPrice) where.price = { ...where.price, gte: args.minPrice }
      if (args.minRating) where.rating = { gte: args.minRating }
      let orderBy: any = [{ rating: 'desc' }, { ratingCount: 'desc' }]
      if (args.sort === 'price-asc') orderBy = { price: 'asc' }
      else if (args.sort === 'price-desc') orderBy = { price: 'desc' }
      else if (args.sort === 'rating') orderBy = { rating: 'desc' }
      const limit = Math.min(args.limit || 5, 8)
      const products = await db.product.findMany({
        where,
        orderBy,
        take: limit,
        include: { brand: { select: { name: true } }, category: { select: { name: true, slug: true } } },
      })
      return { type: 'product_list', data: { query: args.query || args.category || '*', count: products.length, products: products.map(serializeProduct) } }
    }
    case 'get_product': {
      const p = await db.product.findUnique({ where: { id: args.productId }, include: { brand: { select: { name: true } }, category: { select: { name: true, slug: true } } } })
      if (!p) return { type: 'error', data: { message: 'Product not found' } }
      return { type: 'product_detail', data: { ...serializeProduct(p), description: p.description, attributes: p.attributes ? JSON.parse(p.attributes) : {}, tags: p.tags } }
    }
    case 'compare_products': {
      const ids: string[] = args.productIds || []
      const products = await db.product.findMany({ where: { id: { in: ids } }, include: { brand: { select: { name: true } }, category: { select: { name: true, slug: true } } } })
      const ordered = ids.map((id) => products.find((p) => p.id === id)).filter((p): p is typeof products[number] => Boolean(p))
      return { type: 'comparison', data: { products: ordered.map((p) => ({ ...serializeProduct(p)!, specs: p.attributes ? JSON.parse(p.attributes) : {} })) } }
    }
    case 'get_cart': {
      if (!userId) return { type: 'error', data: { message: 'Please sign in to view your cart' } }
      const cart = await db.cart.findUnique({ where: { userId }, include: { items: { where: { savedForLater: false }, include: { product: { include: { brand: { select: { name: true } } } } } } } })
      const items = cart?.items || []
      const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
      return { type: 'cart_summary', data: { items: items.map((i) => ({ id: i.id, productId: i.productId, name: i.product.name, price: i.product.price, quantity: i.quantity, images: i.product.images, emoji: parseImages(i.product.images)[0] || '📦' })), subtotal, count: items.reduce((s, i) => s + i.quantity, 0) } }
    }
    case 'check_affordability': {
      if (!userId) return { type: 'affordability', data: { price: args.price, hasProfile: false, message: 'Add a financial profile in your account to get budget insights.' } }
      const fp = await db.financialProfile.findUnique({ where: { userId } })
      if (!fp || !fp.monthlyShoppingBudget) return { type: 'affordability', data: { price: args.price, hasProfile: false, message: 'Set a monthly shopping budget to analyse affordability.' } }
      // spending this month from orders
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0)
      const orders = await db.order.findMany({ where: { userId, createdAt: { gte: monthStart } } })
      const spentThisMonth = orders.reduce((s, o) => s + o.total, 0)
      const remaining = fp.monthlyShoppingBudget - spentThisMonth
      const pctOfBudget = Math.round((args.price / fp.monthlyShoppingBudget) * 100)
      const fits = args.price <= remaining
      return { type: 'affordability', data: { price: args.price, hasProfile: true, monthlyBudget: fp.monthlyShoppingBudget, spentThisMonth, remaining, pctOfBudget, fits, monthlyIncome: fp.monthlyIncome, savingsTarget: fp.savingsTarget } }
    }
    case 'optimize_cart': {
      if (!userId) return { type: 'error', data: { message: 'Please sign in to optimise your cart' } }
      const cart = await db.cart.findUnique({ where: { userId }, include: { items: { where: { savedForLater: false }, include: { product: { include: { category: true } } } } } })
      const items = cart?.items || []
      if (items.length === 0) return { type: 'cart_optimization', data: { opportunities: [], message: 'Your cart is empty.' } }
      const opportunities: any[] = []
      // detect duplicate categories
      const byCat: Record<string, typeof items> = {}
      for (const i of items) {
        const c = i.product.category?.name || 'Other'
        ;(byCat[c] = byCat[c] || []).push(i)
      }
      for (const [cat, list] of Object.entries(byCat)) {
        if (list.length > 1) {
          opportunities.push({ type: 'duplicate_category', category: cat, items: list.map((i) => ({ name: i.product.name, productId: i.productId, price: i.product.price })), suggestion: `You have ${list.length} ${cat.toLowerCase()} items. Consider whether you need all of them.` })
        }
      }
      // find cheaper alternatives within same category
      for (const i of items) {
        const cheaper = await db.product.findFirst({ where: { categoryId: i.product.categoryId, id: { not: i.productId }, price: { lt: i.product.price }, isActive: true }, orderBy: { price: 'asc' } })
        if (cheaper && i.product.price - cheaper.price > 500) {
          opportunities.push({ type: 'cheaper_alternative', current: { productId: i.productId, name: i.product.name, price: i.product.price }, alternative: { productId: cheaper.id, name: cheaper.name, price: cheaper.price }, savings: i.product.price - cheaper.price })
        }
      }
      const totalSavings = opportunities.filter((o) => o.savings).reduce((s, o) => s + o.savings, 0)
      const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
      return { type: 'cart_optimization', data: { subtotal, opportunities, totalSavings, itemCount: items.length } }
    }
    case 'get_recommendations': {
      const where: any = { isActive: true }
      // base on recently viewed / cart categories if logged in
      if (userId) {
        const rv = await db.recentlyViewed.findMany({ where: { userId }, orderBy: { viewedAt: 'desc' }, take: 3, include: { product: true } })
        if (rv.length) {
          const catIds = [...new Set(rv.map((r) => r.product.categoryId))]
          where.categoryId = { in: catIds }
        }
      }
      const products = await db.product.findMany({ where, orderBy: [{ isTrending: 'desc' }, { rating: 'desc' }], take: 5, include: { brand: { select: { name: true } }, category: { select: { name: true, slug: true } } } })
      return { type: 'product_list', data: { query: 'recommended', count: products.length, products: products.map(serializeProduct), reason: userId ? 'Based on your recent activity' : 'Popular right now' } }
    }
    case 'create_goal': {
      return { type: 'goal_proposal', data: { title: args.title, targetAmount: parseFloat(args.targetAmount), targetDate: args.targetDate || null } }
    }
    case 'create_price_watch': {
      const p = await db.product.findUnique({ where: { id: args.productId }, select: { name: true, price: true, images: true } })
      if (!p) return { type: 'error', data: { message: 'Product not found' } }
      return { type: 'price_watch_proposal', data: { productId: args.productId, productName: p.name, currentPrice: p.price, targetPrice: parseFloat(args.targetPrice), images: p.images, emoji: parseImages(p.images)[0] || '📦' } }
    }
    case 'add_to_cart': {
      const p = await db.product.findUnique({ where: { id: args.productId }, select: { name: true, price: true, images: true, stock: true } })
      if (!p) return { type: 'error', data: { message: 'Product not found' } }
      return { type: 'add_to_cart_proposal', data: { productId: args.productId, productName: p.name, price: p.price, quantity: args.quantity || 1, inStock: p.stock > 0, images: p.images, emoji: parseImages(p.images).find((x) => !x.startsWith('http')) || '📦' } }
    }
    case 'analyze_group_room': {
      const room = await db.shoppingRoom.findUnique({
        where: { slug: args.roomSlug },
        include: {
          members: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
          items: {
            include: {
              product: { include: { brand: { select: { name: true } } } },
              addedBy: { include: { user: { select: { id: true, firstName: true, lastName: true } } } },
              votes: true,
              comments: { include: { member: { include: { user: { select: { id: true, firstName: true, lastName: true } } } } } },
            },
          },
        },
      })
      if (!room) return { type: 'error', data: { message: 'Shopping room not found' } }

      // Build per-product summary with vote counts
      const products = room.items.map((item) => {
        const upVotes = item.votes.filter((v) => v.vote === 'UP').length
        const downVotes = item.votes.filter((v) => v.vote === 'DOWN').length
        return {
          itemId: item.id,
          productId: item.productId,
          name: item.product.name,
          price: item.product.price,
          emoji: parseImages(item.product.images).find((x) => !x.startsWith('http')) || '📦',
          images: item.product.images,
          brand: item.product.brand?.name || null,
          rating: item.product.rating,
          ratingCount: item.product.ratingCount,
          addedBy: item.addedBy.user.firstName + ' ' + item.addedBy.user.lastName,
          note: item.note,
          upVotes,
          downVotes,
          netVotes: upVotes - downVotes,
          commentCount: item.comments.length,
          comments: item.comments.map((c) => ({ author: c.member.user.firstName + ' ' + c.member.user.lastName, body: c.body })),
        }
      })

      const totalCost = room.items.reduce((s, i) => s + i.product.price, 0)
      const memberCount = room.members.length
      const perPersonShare = memberCount > 0 ? totalCost / memberCount : 0
      const overBudget = room.budget > 0 && totalCost > room.budget
      const remainingBudget = room.budget > 0 ? room.budget - totalCost : 0

      // Identify group preferences from comments
      const allComments = room.items.flatMap((i) => i.comments.map((c) => c.body.toLowerCase()))
      const priorities: Record<string, 'Very important' | 'Important' | 'Mentioned'> = {}
      if (allComments.some((c) => c.match(/price|cost|cheap|budget|afford|expensive/))) priorities['Price'] = 'Important'
      if (allComments.some((c) => c.match(/quality|rating|review|durable|build/))) priorities['Quality'] = 'Important'
      if (allComments.some((c) => c.match(/feature|function|spec|capability/))) priorities['Features'] = 'Important'
      if (allComments.some((c) => c.match(/brand|reliab|trust|warranty/))) priorities['Brand'] = 'Mentioned'
      if (allComments.some((c) => c.match(/deliver|shipping|fast|quick/))) priorities['Delivery'] = 'Mentioned'
      if (allComments.some((c) => c.match(/gift|present|look|appear|design|color/))) priorities['Appearance'] = 'Important'

      // Sort products by net votes
      const ranked = [...products].sort((a, b) => b.netVotes - a.netVotes)
      const topVoted = ranked[0]
      const bestRated = [...products].sort((a, b) => b.rating - a.rating)[0]
      const lowestPrice = [...products].sort((a, b) => a.price - b.price)[0]

      return {
        type: 'group_room_analysis',
        data: {
          roomName: room.name,
          roomSlug: room.slug,
          description: room.description,
          budget: room.budget,
          splitType: room.splitType,
          totalCost,
          perPersonShare,
          memberCount,
          overBudget,
          remainingBudget,
          members: room.members.map((m) => ({ name: m.user.firstName + ' ' + m.user.lastName, role: m.role })),
          products: ranked,
          topVoted: topVoted ? { name: topVoted.name, netVotes: topVoted.netVotes, price: topVoted.price } : null,
          bestRated: bestRated ? { name: bestRated.name, rating: bestRated.rating, price: bestRated.price } : null,
          lowestPrice: lowestPrice ? { name: lowestPrice.name, price: lowestPrice.price } : null,
          priorities,
        },
      }
    }
    default:
      return { type: 'error', data: { message: `Unknown tool: ${name}` } }
  }
}

// ----------------------------------------------------------------------------
// Multi-provider LLM client (Groq / OpenAI compatible)
// ----------------------------------------------------------------------------
const DEFAULT_MODEL = process.env.GROQ_MODEL || process.env.OPENAI_MODEL || 'llama-3.3-70b-versatile'

async function callLLMJson(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string> {
  const apiKey = (process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY || process.env.AI_API_KEY || '').trim()
  if (!apiKey) throw new Error('No AI API key configured')

  const isOpenAI = apiKey.startsWith('sk-') && !apiKey.startsWith('gsk_')
  const endpoint = isOpenAI
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.groq.com/openai/v1/chat/completions'
  const model = isOpenAI
    ? (process.env.OPENAI_MODEL || 'gpt-4o-mini')
    : (process.env.GROQ_MODEL || DEFAULT_MODEL)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 12000)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 1200,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      throw new Error(`LLM provider error ${res.status}: ${errText.slice(0, 200)}`)
    }
    const json = await res.json()
    return json.choices?.[0]?.message?.content || ''
  } finally {
    clearTimeout(timeoutId)
  }
}

// ----------------------------------------------------------------------------
// Deterministic Semantic Intent Router
// ----------------------------------------------------------------------------
function parseNumericPrice(text: string): number | null {
  const lower = text.toLowerCase()
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|l)\b/)
  if (lakhMatch) return parseFloat(lakhMatch[1]) * 100000
  const kMatch = lower.match(/(\d+(?:\.\d+)?)\s*k\b/)
  if (kMatch) return parseFloat(kMatch[1]) * 1000
  const numMatch = lower.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{3})+|\d{3,7})\b/)
  if (numMatch) return parseFloat(numMatch[1].replace(/,/g, ''))
  return null
}

function extractSemanticTools(msg: string): Array<{ name: string; args: any }> {
  const lower = msg.toLowerCase().trim()

  // Greeting
  if (/^(hi|hello|hey|greetings|hola|good morning|good evening|howdy)\b/i.test(lower) && lower.length < 25) {
    return []
  }

  // Affordability intent
  if (lower.includes('afford') || lower.includes('can i buy') || lower.includes('can i get') || lower.includes('budget') || lower.includes('salary')) {
    const price = parseNumericPrice(lower) || 5000
    return [{ name: 'check_affordability', args: { price } }]
  }

  // Cart optimization
  if (lower.includes('optimise') || lower.includes('optimize') || lower.includes('my cart') || (lower.includes('cart') && lower.includes('save'))) {
    return [{ name: 'get_cart', args: {} }, { name: 'optimize_cart', args: {} }]
  }

  // Price alert
  if (lower.includes('price alert') || lower.includes('price drop') || lower.includes('track price') || lower.includes('watch price')) {
    const clean = lower.replace(/price alert|price drop|track price|watch price/g, '').trim()
    return [{ name: 'search_products', args: { query: clean || 'deals', limit: 3 } }]
  }

  // Comparison
  if (lower.includes('compare')) {
    const clean = lower.replace(/compare|vs|between|the/g, ' ').trim()
    return [{ name: 'search_products', args: { query: clean || 'laptop', limit: 2 } }]
  }

  // Product search
  const price = parseNumericPrice(lower)
  const cleanQuery = lower
    .replace(/(?:under|below|less than|within|around|upto|up to)\s*(?:₹|rs\.?|inr)?\s*(\d+(?:\.\d+)?\s*(?:lakh|lac|l|k)?|\d[\d,]*)?/gi, ' ')
    .replace(/\b(?:i need|i want|show me|find|looking for|recommend|suggest|give me|a|an|the|best|top|for|right now|please)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (cleanQuery.length >= 2 || price !== null) {
    return [{
      name: 'search_products',
      args: {
        query: cleanQuery || undefined,
        maxPrice: price || undefined,
        minRating: (lower.includes('best') || lower.includes('top rated')) ? 4.0 : undefined,
        limit: 5,
      }
    }]
  }

  return []
}

function generateFallbackResponse(userMessage: string, toolResults: ToolResult[]): { message: string; suggestions: string[] } {
  const lower = userMessage.toLowerCase().trim()

  // 1. Affordability
  const affordResult = toolResults.find((t) => t.type === 'affordability')
  if (affordResult) {
    const { data } = affordResult
    if (!data.hasProfile) {
      return {
        message: `I'd love to help evaluate affordability for ₹${data.price?.toLocaleString('en-IN') || 'this item'}. Once you add your monthly shopping budget in Account > Budget & Finance, I can give you personalized, honest guidance. In the meantime, you can explore whether it fits your current plans!`,
        suggestions: ['Set up budget in Account', 'Create a savings goal', 'Search similar products']
      }
    }
    if (data.fits) {
      return {
        message: `Yes, you can comfortably afford it! At ${formatPrice(data.price)}, this purchase fits within your monthly shopping budget of ${formatPrice(data.monthlyBudget)}. You will have ${formatPrice(data.remaining)} remaining for the month (${data.pctOfBudget}% of your shopping budget).`,
        suggestions: ['Add to cart', 'View my budget', 'Compare alternatives']
      }
    } else {
      return {
        message: `Heads up: At ${formatPrice(data.price)}, this exceeds your remaining monthly shopping budget of ${formatPrice(data.remaining)} (total monthly budget: ${formatPrice(data.monthlyBudget)}). You might want to wait, set a savings goal, or check out a lower-cost alternative.`,
        suggestions: ['Create a savings goal', 'Search lower-cost options', 'View budget details']
      }
    }
  }

  // 2. Product list
  const prodResult = toolResults.find((t) => t.type === 'product_list')
  if (prodResult) {
    const { data } = prodResult
    const qName = data.query === '*' || !data.query ? 'products' : data.query
    if (data.products.length === 0) {
      return {
        message: `I searched our catalog for "${qName}", but couldn't find an exact match in that price range. Try broadening your criteria or browsing our categories!`,
        suggestions: ['Browse all products', 'Browse Electronics', 'Browse Books & Stationery']
      }
    }
    return {
      message: `Here are the top ${qName} options I found for you in our catalog:`,
      suggestions: ['Compare top 2', 'Show under ₹50,000', 'Check customer reviews']
    }
  }

  // 3. Comparison
  const compResult = toolResults.find((t) => t.type === 'comparison')
  if (compResult) {
    return {
      message: `Here is a side-by-side comparison of the options:`,
      suggestions: ['Add best rated to cart', 'Check affordability', 'Ask for recommendation']
    }
  }

  // 4. Cart optimization
  const cartOptResult = toolResults.find((t) => t.type === 'cart_optimization')
  if (cartOptResult) {
    return {
      message: `I analyzed your cart items. Here are smart ways to optimize your purchase:`,
      suggestions: ['Apply coupon SAVE10', 'Proceed to checkout', 'Keep shopping']
    }
  }

  // 5. Greetings
  if (/^(hi|hello|hey|greetings|hola|good morning|good evening|howdy)\b/i.test(lower)) {
    return {
      message: `Hi there! I'm your Buywise AI shopping partner. I can help you search our catalog (e.g. "under 1 lakh laptop"), check affordability against your budget ("Can I afford a ₹6,000 headphone?"), compare items, or optimize your cart. What are you shopping for today?`,
      suggestions: ['Laptops under ₹70,000', 'Top headphones for travel', 'Can I afford a ₹6,000 purchase?', 'Optimise my cart']
    }
  }

  // 6. Generic intelligent response
  return {
    message: `I'm here to help you shop smarter! You can ask me to search products ('under 1 lakh laptop'), check affordability ('Can I afford ₹6,000?'), compare items ('compare laptops'), or optimize your cart.`,
    suggestions: ['Laptops under ₹70,000', 'Top deals today', 'Can I afford a ₹6,000 purchase?']
  }
}

// ----------------------------------------------------------------------------
// Main orchestrator entry point
// ----------------------------------------------------------------------------
export async function chat(userId: string | null, userMessage: string, history: AIMessage[]) {
  const context = await buildUserContext(userId)

  const contextBlock = `USER CONTEXT (do not reveal raw numbers unprompted; use tools):
${JSON.stringify(context, null, 2)}`

  let toolCalls: Array<{ name: string; args: any }> = []
  let replyPlan = ''

  // Attempt Step 1: LLM Tool Selection
  try {
    const raw = await callLLMJson([
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + TOOL_DEFINITIONS + '\n\n' + contextBlock },
      ...history.slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
    ])
    const parsed = parseJsonLoose(raw)
    toolCalls = parsed.toolCalls || []
    replyPlan = parsed.replyPlan || ''
  } catch (e: any) {
    // If LLM fails or is not configured, fall through to deterministic semantic extraction
  }

  // If LLM returned no tools or wasn't configured, use semantic intent extraction
  if (toolCalls.length === 0) {
    toolCalls = extractSemanticTools(userMessage)
  }

  // STEP 2 — execute tools
  const toolResults: ToolResult[] = []
  for (const call of toolCalls.slice(0, 3)) {
    try {
      const result = await executeTool(call.name, call.args || {}, userId)
      toolResults.push(result)
    } catch (e) {
      toolResults.push({ type: 'error', data: { message: `Tool ${call.name} failed` } })
    }
  }

  // STEP 3 — final response grounded in tool results
  let message = ''
  let suggestions: string[] = []

  // Attempt LLM generation
  try {
    const raw = await callLLMJson([
      { role: 'system', content: FINAL_PROMPT },
      ...history.slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user', content: userMessage },
      {
        role: 'assistant',
        content: `Reply plan: ${replyPlan}\n\nTool results (use these real numbers, do not invent):\n${JSON.stringify(toolResults, null, 2)}`,
      },
    ])
    const parsed = parseJsonLoose(raw)
    if (parsed.message) message = parsed.message
    if (Array.isArray(parsed.suggestions)) suggestions = parsed.suggestions
  } catch (e) {
    // LLM call failed or no key
  }

  // If no message from LLM, generate deterministic natural language response from tool results
  if (!message) {
    const fallback = generateFallbackResponse(userMessage, toolResults)
    message = fallback.message
    if (suggestions.length === 0) suggestions = fallback.suggestions
  }

  return { message, toolResults, suggestions }
}

// ----------------------------------------------------------------------------
// Loose JSON parser — handles markdown fences and trailing text
// ----------------------------------------------------------------------------
function parseJsonLoose(raw: string): any {
  if (!raw) return {}
  let text = raw.trim()
  // strip code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenceMatch) text = fenceMatch[1].trim()
  // find first { and last }
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start !== -1 && end !== -1 && end > start) {
    text = text.slice(start, end + 1)
  }
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

export { formatPrice }
