import { create } from 'zustand'

export type View =
  | { name: 'home' }
  | { name: 'catalog'; category?: string; query?: string; aiQuery?: string }
  | { name: 'product'; id: string }
  | { name: 'cart' }
  | { name: 'checkout' }
  | { name: 'orders' }
  | { name: 'order'; id: string }
  | { name: 'account' }
  | { name: 'goals' }
  | { name: 'wishlist' }
  | { name: 'price-watch' }
  | { name: 'budget' }
  | { name: 'insights' }

interface AppState {
  view: View
  history: View[]
  user: { id: string; firstName: string; lastName: string; email: string; role: string; phone?: string | null } | null
  cartCount: number
  aiOpen: boolean
  authOpen: boolean
  authMode: 'login' | 'register'
  navigate: (view: View) => void
  back: () => void
  setUser: (u: AppState['user']) => void
  setCartCount: (n: number) => void
  setAiOpen: (open: boolean) => void
  setAuthOpen: (open: boolean, mode?: 'login' | 'register') => void
}

export const useStore = create<AppState>((set, get) => ({
  view: { name: 'home' },
  history: [],
  user: null,
  cartCount: 0,
  aiOpen: false,
  authOpen: false,
  authMode: 'login',
  navigate: (view) => {
    const { view: current, history } = get()
    set({ view, history: [...history, current].slice(-20) })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  },
  back: () => {
    const { history } = get()
    if (history.length > 0) {
      const prev = history[history.length - 1]
      set({ view: prev, history: history.slice(0, -1) })
      if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      set({ view: { name: 'home' } })
    }
  },
  setUser: (u) => set({ user: u }),
  setCartCount: (n) => set({ cartCount: n }),
  setAiOpen: (open) => set({ aiOpen: open }),
  setAuthOpen: (open, mode) => set({ authOpen: open, authMode: mode || get().authMode }),
}))
