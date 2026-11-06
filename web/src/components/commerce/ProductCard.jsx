import { Link } from 'react-router-dom'
import { Minus, Plus, ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'

export function ProductCard({ product }) {
  const listingId = String(product._id || product.id)
  const itemData = product.itemId || product.product || {}
  const category = itemData.categoryId || itemData.category || {}
  const image = itemData.media?.find((media) => media.isPrimary)?.url || itemData.media?.[0]?.url
  const cartItem = useCartStore((state) => state.cart.items.find((entry) => entry.listingId === listingId))
  const addItem = useCartStore((state) => state.addItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const toast = useUiStore((state) => state.toast)
  const available = product.isAvailable !== false && (!product.stock?.track || product.stock.available > 0)
  const discount = product.mrpPaise > product.pricePaise
    ? Math.round((1 - product.pricePaise / product.mrpPaise) * 100)
    : 0

  return (
    <article className="group overflow-hidden rounded-2xl border border-line bg-surface shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link to={`/products/${listingId}`} className="relative block overflow-hidden bg-paper">
        <img src={resolveImage(image)} alt={itemData.name || 'Product'} className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
        {discount ? <span className="absolute left-2 top-2 rounded-md bg-brand px-2 py-1 text-[11px] font-bold text-white">{discount}% OFF</span> : null}
      </Link>
      <div className="p-3">
        <p className="truncate text-[11px] font-semibold text-muted">{category.name || itemData.brandId?.name || 'Featured product'}</p>
        <Link to={`/products/${listingId}`} className="mt-1 block min-h-10 text-sm font-bold leading-5 text-ink hover:text-brand">{itemData.name || 'Product'}</Link>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <p className="font-bold text-ink">{formatINRFromPaise(product.pricePaise || 0)}</p>
            {product.mrpPaise > product.pricePaise ? <p className="text-xs text-muted line-through">{formatINRFromPaise(product.mrpPaise)}</p> : <p className="text-xs text-muted">{itemData.attributes?.unit || 'piece'}</p>}
          </div>
          {cartItem ? (
            <div className="flex h-9 items-center gap-2 rounded-lg border border-brand/25 bg-brand/5 px-1 text-brand">
              <button type="button" aria-label="Remove one" onClick={() => setQuantity(listingId, cartItem.quantity - 1)} className="grid size-7 place-items-center"><Minus className="size-3.5" /></button>
              <span className="min-w-4 text-center text-sm font-bold">{cartItem.quantity}</span>
              <button type="button" aria-label="Add one" onClick={() => setQuantity(listingId, cartItem.quantity + 1)} className="grid size-7 place-items-center"><Plus className="size-3.5" /></button>
            </div>
          ) : (
            <button type="button" disabled={!available} onClick={() => { addItem(product); toast('Added to cart', 'success') }} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-brand/30 px-3 text-xs font-bold text-brand transition hover:bg-brand hover:text-white disabled:cursor-not-allowed disabled:opacity-50">
              <ShoppingCart className="size-3.5" /> {available ? 'Add' : 'Sold out'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
