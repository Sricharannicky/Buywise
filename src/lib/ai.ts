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

RULES:
- Always use tools to fetch real product data. NEVER invent prices, stock, specs or ratings.
- For write operations (create_goal, create_price_watch, add_to_cart), return them as proposals only.
- Call at most 3 tools per turn.
- If the user just makes small talk, you may respond without any tool calls.
- To recommend products, ALWAYS call search_products or get_recommendations first.
`

const SYSTEM_PROMPT = `You are the "AI Shopping Partner" — a single, unified, trusted shopping assistant for an e-commerce store.

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

const FINAL_PROMPT = `You are the "AI Shopping Partner". Write the final reply to the user based on the conversation and the tool results below.

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
    emoji: parseImages(p.images)[0] || '📦',
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
      const ordered = ids.map((id) => products.find((p) => p.id === id)).filter(Boolean)
      return { type: 'comparison', data: { products: ordered.map((p) => ({ ...serializeProduct(p)!, specs: p!.attributes ? JSON.parse(p!.attributes) : {} })) } }
    }
    case 'get_cart': {
      if (!userId) return { type: 'error', data: { message: 'Please sign in to view your cart' } }
      const cart = await db.cart.findUnique({ where: { userId }, include: { items: { where: { savedForLater: false }, include: { product: { include: { brand: { select: { name: true } } } } } } } })
      const items = cart?.items || []
      const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0)
      return { type: 'cart_summary', data: { items: items.map((i) => ({ id: i.id, productId: i.productId, name: i.product.name, price: i.product.price, quantity: i.quantity, emoji: parseImages(i.product.images)[0] || '📦' })), subtotal, count: items.reduce((s, i) => s + i.quantity, 0) } }
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
      return { type: 'price_watch_proposal', data: { productId: args.productId, productName: p.name, currentPrice: p.price, targetPrice: parseFloat(args.targetPrice), emoji: parseImages(p.images)[0] || '📦' } }
    }
    case 'add_to_cart': {
      const p = await db.product.findUnique({ where: { id: args.productId }, select: { name: true, price: true, images: true, stock: true } })
      if (!p) return { type: 'error', data: { message: 'Product not found' } }
      return { type: 'add_to_cart_proposal', data: { productId: args.productId, productName: p.name, price: p.price, quantity: args.quantity || 1, inStock: p.stock > 0, emoji: parseImages(p.images)[0] || '📦' } }
    }
    default:
      return { type: 'error', data: { message: `Unknown tool: ${name}` } }
  }
}

// ----------------------------------------------------------------------------
// Main orchestrator entry point
// ----------------------------------------------------------------------------
export async function chat(userId: string | null, userMessage: string, history: AIMessage[]) {
  const context = await buildUserContext(userId)

  // STEP 1 — intent + tool selection
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  const zai = await ZAI.create()

  const contextBlock = `USER CONTEXT (do not reveal raw numbers unprompted; use tools):
${JSON.stringify(context, null, 2)}`

  const step1Messages = [
    { role: 'assistant' as const, content: SYSTEM_PROMPT + '\n\n' + TOOL_DEFINITIONS + '\n\n' + contextBlock },
    ...history.slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
  ]

  let toolCalls: Array<{ name: string; args: any }> = []
  let replyPlan = ''
  try {
    const completion = await zai.chat.completions.create({
      messages: step1Messages,
      thinking: { type: 'disabled' },
    })
    const raw = completion.choices[0]?.message?.content || ''
    const parsed = parseJsonLoose(raw)
    toolCalls = parsed.toolCalls || []
    replyPlan = parsed.replyPlan || ''
  } catch (e) {
    // fall through with no tools
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
  const finalMessages = [
    { role: 'assistant' as const, content: FINAL_PROMPT },
    ...history.slice(-8).map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user' as const, content: userMessage },
    {
      role: 'assistant' as const,
      content: `Reply plan: ${replyPlan}\n\nTool results (use these real numbers, do not invent):\n${JSON.stringify(toolResults, null, 2)}`,
    },
  ]

  let message = "I'm here to help with your shopping. Could you tell me more about what you're looking for?"
  let suggestions: string[] = []
  try {
    const completion = await zai.chat.completions.create({
      messages: finalMessages,
      thinking: { type: 'disabled' },
    })
    const raw = completion.choices[0]?.message?.content || ''
    const parsed = parseJsonLoose(raw)
    if (parsed.message) message = parsed.message
    if (Array.isArray(parsed.suggestions)) suggestions = parsed.suggestions
  } catch (e) {
    // graceful fallback
    if (toolResults.length > 0) {
      message = "Here's what I found. Let me know if you'd like to narrow it down."
    }
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
