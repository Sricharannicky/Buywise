// Frontend API client — all requests use relative paths (gateway-safe)
import { useStore } from './store'

const TOKEN_KEY = 'buywise_session_token'

// Store/retrieve the session token from localStorage (fallback for iframe contexts
// where SameSite cookies may be blocked)
export function setSessionToken(token: string) {
  try { localStorage.setItem(TOKEN_KEY, token) } catch {}
}
export function getSessionToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
export function clearSessionToken() {
  try { localStorage.removeItem(TOKEN_KEY) } catch {}
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getSessionToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(url, {
    credentials: 'include', // try cookies too (belt and suspenders)
    headers,
    ...options,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as any)?.error || `Request failed (${res.status})`)
  }
  return data as T
}

export const api = {
  auth: {
    me: () => request<{ user: any }>('/api/auth/me'),
    login: async (email: string, password: string) => {
      const res = await request<{ user: any; token?: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      // The API returns a token for localStorage-based auth (iframe fallback)
      if ((res as any).token) setSessionToken((res as any).token)
      return { user: res.user }
    },
    register: async (data: any) => {
      const res = await request<{ user: any; token?: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if ((res as any).token) setSessionToken((res as any).token)
      return { user: res.user }
    },
    google: async (data: { credential?: string; email?: string; firstName?: string; lastName?: string }) => {
      const res = await request<{ user: any; token?: string }>('/api/auth/google', {
        method: 'POST',
        body: JSON.stringify(data),
      })
      if ((res as any).token) setSessionToken((res as any).token)
      return { user: res.user }
    },
    logout: async () => {
      clearSessionToken()
      return request('/api/auth/logout', { method: 'POST' })
    },
  },
  products: {
    list: (params: Record<string, string | undefined>) => {
      const q = new URLSearchParams()
      Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v) })
      return request<{ products: any[]; total: number }>(`/api/products?${q.toString()}`)
    },
    get: (id: string) => request<{ product: any; related: any[] }>(`/api/products/${id}`),
  },
  categories: () => request<{ categories: any[]; brands: any[] }>('/api/categories'),
  cart: {
    get: () => request<{ items: any[]; subtotal: number; count: number }>('/api/cart'),
    add: (productId: string, quantity = 1) =>
      request('/api/cart', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
    update: (itemId: string, updates: any) =>
      request('/api/cart', { method: 'PATCH', body: JSON.stringify({ itemId, ...updates }) }),
    remove: (itemId: string) => request(`/api/cart?itemId=${itemId}`, { method: 'DELETE' }),
  },
  wishlist: {
    get: () => request<{ items: any[] }>('/api/wishlist'),
    toggle: (productId: string) => request<{ action: string }>('/api/wishlist', { method: 'POST', body: JSON.stringify({ productId }) }),
    remove: (itemId: string) => request(`/api/wishlist?itemId=${itemId}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request<{ orders: any[] }>('/api/orders'),
    create: (data: any) => request<{ order: any }>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
  },
  goals: {
    list: () => request<{ goals: any[] }>('/api/goals'),
    create: (data: any) => request<{ goal: any }>('/api/goals', { method: 'POST', body: JSON.stringify(data) }),
    update: (goalId: string, updates: any) => request('/api/goals', { method: 'PATCH', body: JSON.stringify({ goalId, ...updates }) }),
    remove: (goalId: string) => request(`/api/goals?goalId=${goalId}`, { method: 'DELETE' }),
  },
  priceWatch: {
    list: () => request<{ watches: any[] }>('/api/price-watch'),
    create: (productId: string, targetPrice: number) =>
      request('/api/price-watch', { method: 'POST', body: JSON.stringify({ productId, targetPrice }) }),
    remove: (watchId: string) => request(`/api/price-watch?watchId=${watchId}`, { method: 'DELETE' }),
  },
  financial: {
    get: () => request<{ profile: any; spending: any }>('/api/financial'),
    save: (data: any) => request<{ profile: any }>('/api/financial', { method: 'POST', body: JSON.stringify(data) }),
  },
  reviews: {
    list: (productId: string) => request<{ reviews: any[] }>(`/api/reviews?productId=${productId}`),
    create: (data: any) => request<{ review: any }>('/api/reviews', { method: 'POST', body: JSON.stringify(data) }),
  },
  addresses: {
    list: () => request<{ addresses: any[] }>('/api/addresses'),
    create: (data: any) => request<{ address: any }>('/api/addresses', { method: 'POST', body: JSON.stringify(data) }),
    remove: (id: string) => request(`/api/addresses?id=${id}`, { method: 'DELETE' }),
  },
  notifications: {
    list: () => request<{ notifications: any[] }>('/api/notifications'),
    markRead: (id: string) => request('/api/notifications', { method: 'PATCH', body: JSON.stringify({ notificationId: id, isRead: true }) }),
    markAllRead: () => request('/api/notifications', { method: 'PATCH', body: JSON.stringify({ markAllRead: true }) }),
  },
  ai: {
    chat: (message: string, conversationId?: string) =>
      request<{ message: string; toolResults: any[]; suggestions: string[]; conversationId: string | null }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message, conversationId }),
      }),
    conversations: () => request<{ conversations: any[] }>('/api/ai/chat'),
    conversation: (id: string) => request<{ conversation: any }>(`/api/ai/conversations/${id}`),
  },
  rooms: {
    list: () => request<{ rooms: any[] }>('/api/shopping-rooms'),
    create: (data: any) => request<{ room: any }>('/api/shopping-rooms', { method: 'POST', body: JSON.stringify(data) }),
    get: (slug: string) => request<{ room: any }>(`/api/shopping-rooms/${slug}`),
    update: (slug: string, data: any) => request<{ room: any }>(`/api/shopping-rooms/${slug}`, { method: 'PATCH', body: JSON.stringify(data) }),
    addItem: (roomId: string, productId: string, note?: string) =>
      request<{ item: any }>('/api/shopping-rooms/items', { method: 'POST', body: JSON.stringify({ roomId, productId, note }) }),
    removeItem: (itemId: string) => request(`/api/shopping-rooms/items?itemId=${itemId}`, { method: 'DELETE' }),
    vote: (itemId: string, vote: string | null) =>
      request(`/api/shopping-rooms/items/${itemId}`, { method: 'PATCH', body: JSON.stringify({ vote }) }),
    comment: (itemId: string, body: string) =>
      request<{ comment: any }>(`/api/shopping-rooms/items/${itemId}`, { method: 'POST', body: JSON.stringify({ body }) }),
  },
}

// Helper to refresh cart count globally
export async function refreshCartCount() {
  try {
    const { count } = await api.cart.get()
    useStore.getState().setCartCount(count)
  } catch {
    // not logged in
  }
}
