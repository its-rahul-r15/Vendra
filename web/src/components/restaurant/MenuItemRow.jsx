import { Minus, Plus } from 'lucide-react'
import { itemImage } from '@/utils/media'
import { formatINR } from '@/utils/money'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

export function MenuItemRow({ item, quantity = 0, onAdd, onChange, busy }) {
  const id = item._id || item.id
  const price = item.price ?? item.sellingPrice ?? item.discountedPrice
  const veg = item.isVeg ?? item.veg ?? item.dietaryType === 'veg'

  return (
    <article className="grid grid-cols-[1fr_auto] gap-4 border-b border-line py-5 last:border-b-0">
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex size-3.5 items-center justify-center rounded-[3px] border',
              veg ? 'border-veg' : 'border-nonveg',
            )}
            aria-label={veg ? 'Veg' : 'Non-veg'}
          >
            <span
              className={cn('size-1.5 rounded-full', veg ? 'bg-veg' : 'bg-nonveg')}
            />
          </span>
          {item.isBestseller || item.bestseller ? (
            <span className="text-[11px] font-bold uppercase tracking-wide text-ember">
              Bestseller
            </span>
          ) : null}
        </div>
        <h4 className="text-base font-bold text-ink">{item.name}</h4>
        {price != null ? (
          <p className="mt-1 text-sm font-semibold text-ink-soft">{formatINR(price)}</p>
        ) : null}
        {item.description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {item.description}
          </p>
        ) : null}
      </div>

      <div className="flex w-[116px] flex-col items-center gap-2">
        {item.image || item.images?.length ? (
          <img
            src={itemImage(item)}
            alt=""
            className="size-[108px] rounded-2xl object-cover shadow-sm"
            loading="lazy"
          />
        ) : (
          <div className="size-[108px] rounded-2xl bg-paper" />
        )}

        {quantity > 0 ? (
          <div className="flex h-10 w-full items-center justify-between rounded-xl border border-brand/30 bg-brand/5 px-2 text-brand">
            <button
              type="button"
              className="grid size-7 place-items-center rounded-lg hover:bg-brand/10"
              onClick={() => onChange?.(id, quantity - 1)}
              disabled={busy}
              aria-label="Decrease"
            >
              <Minus className="size-4" />
            </button>
            <span className="text-sm font-bold">{quantity}</span>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-lg hover:bg-brand/10"
              onClick={() => onChange?.(id, quantity + 1)}
              disabled={busy}
              aria-label="Increase"
            >
              <Plus className="size-4" />
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="w-full border-brand/25 text-brand hover:bg-brand hover:text-white"
            onClick={() => onAdd?.(id)}
            disabled={busy || item.isAvailable === false}
          >
            {item.isAvailable === false ? 'Sold out' : 'Add'}
          </Button>
        )}
      </div>
    </article>
  )
}
