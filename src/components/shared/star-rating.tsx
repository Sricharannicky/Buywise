'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({ rating, size = 14, className = '', showNumber = false, count }: { rating: number; size?: number; className?: string; showNumber?: boolean; count?: number }) {
  const full = Math.floor(rating)
  const half = rating - full >= 0.5
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((i) => {
          const isFull = i < full
          const isHalf = i === full && half
          return (
            <Star
              key={i}
              width={size}
              height={size}
              className={cn(
                isFull ? 'fill-amber-400 text-amber-400' : isHalf ? 'fill-amber-200 text-amber-400' : 'fill-muted text-muted-foreground/40'
              )}
            />
          )
        })}
      </div>
      {showNumber && <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}{count !== undefined ? ` (${count})` : ''}</span>}
    </div>
  )
}
