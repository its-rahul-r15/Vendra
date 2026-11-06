import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
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
    <article className="group warm-card flex flex-col overflow-hidden bg-white">
      <Link to={`/products/${listingId}`} className="relative block aspect-square overflow-hidden bg-[#f4f2ec]">
        <img
          src={resolveImage(image)}
          alt={itemData.name || 'Product'}
          className="size-full object-cover transition duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />
        {discount > 0 ? (
          <span className="absolute left-3 top-3 rounded-md bg-[#0a0a0a] px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-white shadow-sm">
            {discount}% off
          </span>
        ) : null}
        {!available ? (
          <span className="absolute inset-0 grid place-items-center bg-black/40 text-sm font-semibold tracking-wider uppercase text-white backdrop-blur-[2px]">
            Sold out
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs font-medium text-[#737069]">
          <span className="truncate">{category.name || 'Marketplace'}</span>
          {vendor.name ? (
            <span className="truncate font-semibold text-[#121212]">{vendor.name}</span>
          ) : null}
        </div>

        <Link
          to={`/products/${listingId}`}
          className="mt-1.5 line-clamp-2 min-h-12 text-base font-semibold text-[#121212] transition hover:text-[#42403c]"
        >
          {itemData.name || 'Curated Product'}
        </Link>

        <div className="mt-auto pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-[#121212]">
              {formatINRFromPaise(product.pricePaise || 0)}
            </span>
            {product.mrpPaise > product.pricePaise ? (
              <span className="text-xs text-[#99958d] line-through">
                {formatINRFromPaise(product.mrpPaise)}
              </span>
            ) : null}
          </div>

          <div className="mt-3">
            {cartItem ? (
              <div className="flex h-10 w-full items-center justify-between rounded-lg border border-[#121212] bg-[#faf9f5] px-2 text-[#121212]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity(listingId, cartItem.quantity - 1)}
                  className="grid size-8 place-items-center rounded-md hover:bg-black/5"
                >
                  <Minus className="size-4" />
                </button>
                <span className="font-semibold text-sm">{cartItem.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity(listingId, cartItem.quantity + 1)}
                  className="grid size-8 place-items-center rounded-md hover:bg-black/5"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!available}
                onClick={() => {
                  addItem(product)
                  toast('Added to cart', 'success')
                }}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#0a0a0a] px-4 text-sm font-medium text-white transition duration-150 hover:bg-[#262626] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ShoppingBag className="size-4" />
                {available ? 'Add to cart' : 'Sold out'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
