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
    <article className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#e7e5df] py-5 last:border-b-0">
      <div className="min-w-0">
        <div className="mb-1.5 flex items-center gap-2">
          <span
            className={cn(
              'inline-flex size-3.5 items-center justify-center rounded-[3px] border',
              veg ? 'border-[#1e7041]' : 'border-[#b82828]',
            )}
            aria-label={veg ? 'Veg' : 'Non-veg'}
          >
            <span
              className={cn('size-1.5 rounded-full', veg ? 'bg-[#1e7041]' : 'bg-[#b82828]')}
            />
          </span>
          {item.isBestseller || item.bestseller ? (
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a37237]">
              Popular
            </span>
          ) : null}
        </div>
        <h4 className="text-base font-semibold text-[#121212]">{item.name}</h4>
        {price != null ? (
          <p className="mt-1 text-base font-bold text-[#121212]">{formatINR(price)}</p>
        ) : null}
        {item.description ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[#737069]">
            {item.description}
          </p>
        ) : null}
      </div>

      <div className="flex w-[116px] flex-col items-center gap-2">
        {item.image || item.images?.length ? (
          <img
            src={itemImage(item)}
            alt=""
            className="size-[104px] rounded-xl object-cover border border-[#e7e5df]"
            loading="lazy"
          />
        ) : (
          <div className="size-[104px] rounded-xl bg-[#f4f2ec] border border-[#e7e5df]" />
        )}

        {quantity > 0 ? (
          <div className="flex h-9 w-full items-center justify-between rounded-lg border border-[#121212] bg-[#faf9f5] px-2 text-[#121212]">
            <button
              type="button"
              className="grid size-7 place-items-center rounded-md hover:bg-black/5"
              onClick={() => onChange?.(id, quantity - 1)}
              disabled={busy}
              aria-label="Decrease"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="text-sm font-semibold">{quantity}</span>
            <button
              type="button"
              className="grid size-7 place-items-center rounded-md hover:bg-black/5"
              onClick={() => onChange?.(id, quantity + 1)}
              disabled={busy}
              aria-label="Increase"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="primary"
            className="h-9 w-full text-xs font-medium"
            onClick={() => onAdd?.(id)}
            disabled={busy || item.isAvailable === false}
          >
            {item.isAvailable === false ? 'Sold out' : 'Add to cart'}
          </Button>
        )}
      </div>
    </article>
  )
}
