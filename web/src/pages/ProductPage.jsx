import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Store,
  Check,
} from 'lucide-react'
import { catalogApi } from '@/api'
import { useCartStore } from '@/stores/cart.store'
import { useUiStore } from '@/stores/ui.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { EmptyState } from '@/components/ui/EmptyState'

export function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const addItem = useCartStore((state) => state.addItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const quantity = useCartStore(
    (state) =>
      state.cart.items.find(
        (item) => item.id === id || item.listingId === id,
      )?.quantity || 0,
  )
  const toast = useUiStore((state) => state.toast)

  useEffect(() => {
    let active = true
    catalogApi
      .product(id)
      .then((data) => {
        if (active) setListing(data)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="container-app flex min-h-[50vh] items-center justify-center py-24">
        <Spinner className="size-8 text-[#0a0a0a]" />
      </div>
    )
  }

  if (error || !listing) {
    return (
      <EmptyState
        title="Product unavailable"
        description={error || 'We could not locate this marketplace item.'}
        actionLabel="Back to catalog"
        onAction={() => navigate('/search')}
      />
    )
  }

  const item = listing.itemId || {}
  const vendor = listing.vendorId || {}
  const image =
    item.media?.find((media) => media.isPrimary)?.url ||
    item.media?.[0]?.url ||
    listing.image
  const available =
    listing.isAvailable !== false &&
    (!listing.stock?.track || listing.stock.available > 0)
  const discount =
    listing.mrpPaise > listing.pricePaise
      ? Math.round((1 - listing.pricePaise / listing.mrpPaise) * 100)
      : 0

  return (
    <div className="container-app py-10 animate-rise">
      <Link
        to="/search"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#737069] hover:text-[#0a0a0a]"
      >
        <ArrowLeft className="size-4" /> Back to Marketplace
      </Link>

      <div className="grid gap-12 rounded-3xl border border-[#e7e5df] bg-white p-6 md:grid-cols-2 md:p-12 shadow-sm">
        {/* Product Media Column */}
        <div className="overflow-hidden rounded-2xl bg-[#faf9f5] border border-[#e7e5df]">
          <img
            src={resolveImage(image)}
            alt={item.name}
            className="aspect-square w-full object-cover"
          />
        </div>

        {/* Product Info Column */}
        <div className="flex flex-col">
          {/* Category & Vendor */}
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#737069]">
            <span>{item.categoryId?.name || 'Curated Product'}</span>
            {vendor.name ? (
              <Link
                to={`/shops/${vendor._id || vendor.id}`}
                className="flex items-center gap-1 text-[#121212] hover:underline"
              >
                <Store className="size-3.5" />
                <span>Sold by {vendor.name}</span>
              </Link>
            ) : null}
          </div>

          <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0a0a0a] sm:text-4xl">
            {item.name}
          </h1>

          {/* Pricing */}
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#0a0a0a]">
              {formatINRFromPaise(listing.pricePaise || 0)}
            </span>
            {listing.mrpPaise > listing.pricePaise ? (
              <>
                <span className="text-base text-[#99958d] line-through">
                  {formatINRFromPaise(listing.mrpPaise)}
                </span>
                <span className="rounded-md bg-[#faf9f5] px-2 py-0.5 text-xs font-bold text-[#0a0a0a] border border-[#e7e5df]">
                  Save {discount}%
                </span>
              </>
            ) : null}
          </div>

          <p className="mt-1 text-sm text-[#737069]">
            Unit: {item.attributes?.unit || 'piece'} · All taxes included
          </p>

          {/* Description */}
          {item.description ? (
            <div className="mt-6 border-t border-[#e7e5df] pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a0a0a]">
                Description
              </h3>
              <p className="mt-2 text-base text-[#575550] leading-relaxed">
                {item.description}
              </p>
            </div>
          ) : null}

          {/* Tags */}
          {item.tags?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[#faf9f5] border border-[#e7e5df] px-3 py-1 text-xs font-medium text-[#42403c]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {/* Action Row */}
          <div className="mt-8 border-t border-[#e7e5df] pt-8">
            <div className="flex flex-wrap items-center gap-4">
              {quantity ? (
                <div className="flex h-12 items-center gap-4 rounded-xl border border-[#121212] bg-[#faf9f5] px-4 text-[#121212]">
                  <button
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity(id, quantity - 1)}
                    className="grid size-8 place-items-center rounded-lg hover:bg-black/5"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="font-bold text-base">{quantity}</span>
                  <button
                    aria-label="Increase quantity"
                    disabled={!available}
                    onClick={() => setQuantity(id, quantity + 1)}
                    className="grid size-8 place-items-center rounded-lg hover:bg-black/5"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
              ) : (
                <Button
                  disabled={!available}
                  size="lg"
                  className="h-12 flex-1 text-base font-semibold"
                  onClick={() => {
                    addItem(listing)
                    toast('Added to cart', 'success')
                  }}
                >
                  <ShoppingBag className="mr-2 size-5" />
                  {available ? 'Add to Shopping Bag' : 'Out of Stock'}
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                className="h-12"
                onClick={() => navigate('/cart')}
              >
                View Cart
              </Button>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-auto grid gap-4 border-t border-[#e7e5df] pt-6 sm:grid-cols-2 md:mt-8">
            <div className="flex items-center gap-2.5 text-xs font-medium text-[#575550]">
              <Truck className="size-4 text-[#0a0a0a]" />
              <span>Standard delivery calculated at checkout</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-medium text-[#575550]">
              <ShieldCheck className="size-4 text-[#0a0a0a]" />
              <span>Direct merchant guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
