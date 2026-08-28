'use client'

import { Sparkles, Mail, Phone, MapPin, Shield, Truck, RotateCcw } from 'lucide-react'
import { useStore } from '@/lib/store'

export function Footer() {
  const navigate = useStore((s) => s.navigate)
  return (
    <footer className="mt-16 border-t border-border/60 bg-muted/30">
      {/* Trust badges */}
      <div className="border-b border-border/40">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
          {[
            { icon: Truck, title: 'Free Delivery', desc: 'On orders over ₹999' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '7-day return policy' },
            { icon: Shield, title: 'Secure Payments', desc: 'Encrypted checkout' },
            { icon: Sparkles, title: 'Buywise AI', desc: 'Always here to help' },
          ].map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-bold">Buywise<span className="text-primary">AI</span></span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Your trusted AI shopping partner — discover, compare, budget and decide with confidence.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Shop</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => navigate({ name: 'catalog' })} className="hover:text-primary">All Products</button></li>
            <li><button onClick={() => navigate({ name: 'catalog', category: 'electronics' })} className="hover:text-primary">Electronics</button></li>
            <li><button onClick={() => navigate({ name: 'catalog', category: 'home-living' })} className="hover:text-primary">Home & Living</button></li>
            <li><button onClick={() => navigate({ name: 'catalog', category: 'fashion' })} className="hover:text-primary">Fashion</button></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Account</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><button onClick={() => navigate({ name: 'orders' })} className="hover:text-primary">My Orders</button></li>
            <li><button onClick={() => navigate({ name: 'goals' })} className="hover:text-primary">My Goals</button></li>
            <li><button onClick={() => navigate({ name: 'wishlist' })} className="hover:text-primary">Wishlist</button></li>
            <li><button onClick={() => navigate({ name: 'budget' })} className="hover:text-primary">Budget & Finance</button></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@shopmate.ai</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> 1800-123-4567</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Bengaluru, India</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Buywise. Built with the Buywise AI.</p>
          <p>Demo store · demo@ai-shop.in / demo1234</p>
        </div>
      </div>
    </footer>
  )
}
