import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'

export function ProductCard({ product }) {
  const listingId = String(product._id || product.id)
  const itemData = product.itemId || product.product || {}
  const category = itemData.categoryId || itemData.category || {}
  const vendor = product.vendorId || {}
  const image = itemData.media?.find((media) => media.isPrimary)?.url || itemData.media?.[0]?.url || product.image
  
  const cartItem = useCartStore((state) =>
    state.cart.items.find((entry) => entry.id === listingId || entry.listingId === listingId)
  )
  const addItem = useCartStore((state) => state.addItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const toast = useUiStore((state) => state.toast)

  const available = product.isAvailable !== false && (!product.stock?.track || product.stock.available > 0)
  const discount = product.mrpPaise > product.pricePaise
    ? Math.round((1 - product.pricePaise / product.mrpPaise) * 100)
    : 0

  return (
    <article className="group relative flex flex-col rounded-3xl bg-white p-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 ring-1 ring-black/[0.05]">
      {/* Product Image Frame */}
      <Link
        to={`/products/${listingId}`}
        className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-[#f4f2ee]"
      >
        <img
          src={resolveImage(image)}
          alt={itemData.name || 'Product'}
          className="size-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          loading="lazy"
        />

        {/* Soft Modern Discount Tag */}
        {discount > 0 ? (
          <span className="absolute left-3 top-3 rounded-full bg-[#990024] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
            {discount}% OFF
          </span>
        ) : null}

        {!available ? (
          <span className="absolute inset-0 grid place-items-center bg-[#120b0d]/70 text-xs font-black tracking-widest uppercase text-white backdrop-blur-[2px]">
            Sold Out
          </span>
        ) : null}
      </Link>

      {/* Info Section */}
      <div className="flex flex-1 flex-col pt-4 px-1 pb-1">
        {/* Category & Store Meta */}
        <div className="flex items-center justify-between gap-2 text-xs font-bold text-[#8c8587]">
          <span className="truncate uppercase tracking-wider text-[10px]">
            {category.name || 'Curated'}
          </span>
          {vendor.name ? (
            <span className="truncate text-[#990024] font-bold text-[11px]">
              {vendor.name}
            </span>
          ) : null}
        </div>

        {/* Product Title */}
        <Link
          to={`/products/${listingId}`}
          className="mt-1.5 line-clamp-2 min-h-11 text-sm sm:text-base font-black text-[#120b0d] group-hover:text-[#990024] transition-colors leading-snug tracking-tight"
        >
          {itemData.name || 'Curated Product'}
        </Link>

        {/* Micro Guarantee & Delivery */}
        <div className="mt-2 flex items-center gap-2 text-xs text-[#6e686a] font-medium">
          {Number(itemData.rating?.average || product.rating?.average || 0) > 0 ? (
            <>
              <div className="flex items-center gap-1 font-black text-[#120b0d] text-[11px]">
                <Star className="size-3 fill-[#f59e0b] text-[#f59e0b]" />
                <span>{Number(itemData.rating?.average || product.rating?.average).toFixed(1)}</span>
              </div>
              <span>•</span>
            </>
          ) : null}
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Free Express
          </span>
        </div>

        {/* Price & Action Row */}
        <div className="mt-auto pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 border-t border-black/[0.05]">
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-lg sm:text-xl font-black text-[#120b0d] tracking-tight truncate">
              {formatINRFromPaise(product.pricePaise)}
            </span>
            {discount > 0 ? (
              <span className="text-[11px] text-[#9c9597] line-through font-semibold truncate">
                {formatINRFromPaise(product.mrpPaise)}
              </span>
            ) : null}
          </div>

          {available ? (
            cartItem ? (
              <div className="flex h-9 items-center gap-2.5 rounded-full bg-[#fdf2f4] px-2.5 text-[#990024] font-bold flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(listingId, cartItem.quantity - 1)}
                  className="grid size-6 place-items-center rounded-full hover:bg-[#990024]/10 text-[#990024] transition cursor-pointer"
                  aria-label="Decrease"
                >
                  <Minus className="size-3 stroke-[2.5]" />
                </button>
                <span className="min-w-3 text-center text-xs font-black text-[#120b0d]">
                  {cartItem.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(listingId, cartItem.quantity + 1)}
                  className="grid size-6 place-items-center rounded-full hover:bg-[#990024]/10 text-[#990024] transition cursor-pointer"
                  aria-label="Increase"
                >
                  <Plus className="size-3 stroke-[2.5]" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await addItem(listingId, 1)
                    toast('Added to your bag!', 'success')
                  } catch (err) {
                    toast(err.message || 'Could not add to cart', 'error')
                  }
                }}
                className="flex h-10 min-h-[44px] items-center gap-2 rounded-full bg-[#120b0d] hover:bg-[#990024] px-4 text-xs font-black uppercase tracking-wider text-white active:scale-95 transition-all duration-200 cursor-pointer shadow-sm flex-shrink-0"
              >
                <ShoppingBag className="size-3.5" />
                <span>Add</span>
              </button>
            )
          ) : (
            <span className="text-xs font-medium text-[#9c9597] flex-shrink-0">Sold out</span>
          )}
        </div>
      </div>
    </article>
  )
}
