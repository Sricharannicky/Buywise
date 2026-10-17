'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChevronRight, Home, X } from 'lucide-react'
import { useStore } from '@/lib/store'
import { SmartImage } from '@/components/shared/smart-image'

export function MegaMenu({ categories }: { categories: any[] }) {
  const { megaMenuOpen, setMegaMenuOpen, navigate } = useStore()

  function go(category?: string, subcategory?: string) {
    setMegaMenuOpen(false)
    navigate({ name: 'catalog', category: subcategory || category })
  }

  return (
    <Sheet open={megaMenuOpen} onOpenChange={(o) => setMegaMenuOpen(o)}>
      <SheetContent side="left" className="w-full overflow-y-auto p-0 sm:max-w-md" hideClose>
        <SheetHeader className="flex-row items-center justify-between border-b border-border/60 px-4 py-3">
          <SheetTitle className="text-base">All Categories</SheetTitle>
          <button onClick={() => setMegaMenuOpen(false)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
        </SheetHeader>
        <div className="p-2">
          <button
            onClick={() => { setMegaMenuOpen(false); navigate({ name: 'home' }) }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" /> Home
          </button>
          <button
            onClick={() => go()}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
          >
            All Products
          </button>
          <div className="my-2 border-t border-border/40" />
          {categories.map((c) => (
            <div key={c.id} className="border-b border-border/30 py-1 last:border-0">
              <button
                onClick={() => go(c.slug)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-bold hover:bg-accent"
              >
                <span className="flex items-center gap-2">
                  <SmartImage src={c.imageUrl} alt={c.name} fallbackLabel={c.name} className="h-8 w-8 shrink-0 rounded-lg" />
                  {c.name}
                </span>
                {c.children?.length > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              </button>
              {c.children?.length > 0 && (
                <div className="ml-3 border-l border-border/30 pl-2">
                  {c.children.map((sub: any) => (
                    <button
                      key={sub.id}
                      onClick={() => go(c.slug, sub.slug)}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <SmartImage src={sub.imageUrl} alt={sub.name} fallbackLabel={sub.name} className="h-6 w-6 shrink-0 rounded-md" />
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
