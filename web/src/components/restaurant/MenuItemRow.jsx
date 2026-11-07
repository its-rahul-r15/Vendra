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
    <article className="grid grid-cols-[1fr_auto] gap-4 border-b border-[#e2e8f0] py-5 last:border-b-0 hover:bg-white/60 p-3 rounded-2xl transition">
      <div className="min-w-0 pr-2">
        <div className="mb-2 flex items-center gap-2">
          {/* FSSAI standard veg / non-veg indicator badge */}
          <span
            className={cn(
              'inline-flex size-4 items-center justify-center rounded-[4px] border-2 bg-white shadow-xs',
              veg ? 'border-[#10b981]' : 'border-[#ef4444]',
            )}
            aria-label={veg ? 'Veg' : 'Non-veg'}
          >
            <span
              className={cn('size-2 rounded-full', veg ? 'bg-[#10b981]' : 'bg-[#ef4444]')}
            />
          </span>
          {item.isBestseller || item.bestseller ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-[#fff7ed] px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase text-[#ea580c] border border-[#ffedd5]">
              ★ Bestseller
            </span>
          ) : null}
        </div>
        <h4 className="text-base font-bold text-[#0f172a] leading-tight">{item.name}</h4>
        {price != null ? (
          <p className="mt-1.5 text-base font-extrabold text-[#0f172a] tracking-tight">{formatINR(price)}</p>
        ) : null}
        {item.description ? (
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#64748b]">
            {item.description}
          </p>
        ) : null}
      </div>

      <div className="flex w-[120px] flex-col items-center gap-2">
        <div className="relative size-[108px] overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#f8fafc] shadow-xs">
          {item.image || item.images?.length ? (
            <img
              src={itemImage(item)}
              alt=""
              className="size-full object-cover transition duration-300 hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-[#f1f5f9] text-[#94a3b8] text-xs font-medium">
              No image
            </div>
          )}
        </div>

        {quantity > 0 ? (
          <div className="flex h-9 w-full items-center justify-between rounded-xl border border-[#ff5a1f] bg-[#fff2ed] px-2.5 text-[#ff5a1f] font-bold shadow-xs">
            <button
              type="button"
              className="grid size-6 place-items-center rounded-lg hover:bg-[#ff5a1f]/20 active:scale-90 transition text-[#ff5a1f]"
              onClick={() => onChange?.(item, Math.max(0, quantity - 1))}
              aria-label="Decrease quantity"
              disabled={busy}
            >
              <Minus className="size-3.5 stroke-[2.5]" />
            </button>
            <span className="text-sm font-black text-[#0f172a]">{quantity}</span>
            <button
              type="button"
              className="grid size-6 place-items-center rounded-lg hover:bg-[#ff5a1f]/20 active:scale-90 transition text-[#ff5a1f]"
              onClick={() => onChange?.(item, quantity + 1)}
              aria-label="Increase quantity"
              disabled={busy}
            >
              <Plus className="size-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="flex h-9 w-full items-center justify-center rounded-xl bg-white border border-[#ff5a1f] text-[#ff5a1f] text-xs font-black uppercase tracking-wider hover:bg-[#ff5a1f] hover:text-white shadow-xs hover:shadow-[0_4px_12px_rgba(255,90,31,0.25)] active:scale-95 transition cursor-pointer"
            onClick={() => onAdd?.(item)}
            disabled={busy}
          >
            ADD +
          </button>
        )}
      </div>
    </article>
  )
}
