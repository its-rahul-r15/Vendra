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
  RotateCcw,
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
        <Spinner className="size-8 text-[#dc2626]" />
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
    <div className="container-app py-8 sm:py-12 animate-rise max-w-6xl">
      {/* Breadcrumb Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#6e686a] hover:text-[#990024] transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Departments</span>
        </Link>

        {vendor.name && (
          <Link
            to={`/shops/${vendor._id || vendor.id}`}
            className="flex items-center gap-1.5 text-xs font-bold text-[#120b0d] hover:text-[#990024] transition-colors"
          >
            <Store className="size-3.5 text-[#990024]" />
            <span>Store: {vendor.name}</span>
          </Link>
        )}
      </div>

      <div className="grid gap-10 lg:grid-cols-12 items-start">
        {/* Product Media Column */}
        <div className="lg:col-span-7 overflow-hidden rounded-3xl bg-white p-6 sm:p-10 ring-1 ring-black/[0.05] shadow-xs">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#f7f6f3] flex items-center justify-center">
            <img
              src={resolveImage(image)}
              alt={item.name}
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_35px_rgba(0,0,0,0.12)] transition-transform duration-700 hover:scale-105"
            />
            {discount > 0 && (
              <span className="absolute left-4 top-4 rounded-full bg-[#990024] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-md">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Product Info Column */}
        <div className="lg:col-span-5 rounded-3xl bg-white p-6 sm:p-8 ring-1 ring-black/[0.05] shadow-xs space-y-6">
          {/* Badge & Category */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fdf2f4] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#990024]">
              <span>{item.categoryId?.name || 'Curated Department'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#120b0d] leading-snug">
              {item.name}
            </h1>
          </div>

          {/* Pricing Row */}
          <div className="border-y border-black/[0.05] py-4 flex items-baseline gap-3">
            <span className="text-3xl sm:text-4xl font-black text-[#120b0d] tracking-tight">
              {formatINRFromPaise(listing.pricePaise || 0)}
            </span>
            {listing.mrpPaise > listing.pricePaise && (
              <span className="text-base text-[#9c9597] line-through font-semibold">
                {formatINRFromPaise(listing.mrpPaise)}
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
              In Stock & Ready
            </span>
          </div>

          {/* Product Overview Text */}
          <div className="space-y-2 text-xs text-[#5c5658] leading-relaxed font-medium">
            <p className="font-bold uppercase tracking-wider text-[#120b0d] text-[11px]">
              Overview
            </p>
            <p>{item.description || 'Authentic brand product verified by Vendra.'}</p>
          </div>

          {/* Stepper + Add to Cart Actions */}
          <div className="pt-2">
            {available ? (
              <div className="flex items-center gap-3">
                {quantity > 0 ? (
                  <div className="flex h-12 flex-1 items-center justify-between rounded-full bg-[#fdf2f4] px-4 text-[#990024] font-bold">
                    <button
                      type="button"
                      onClick={() => setQuantity(id, quantity - 1)}
                      className="grid size-8 place-items-center rounded-full hover:bg-[#990024]/10 transition cursor-pointer"
                      aria-label="Decrease"
                    >
                      <Minus className="size-4 stroke-[2.5]" />
                    </button>
                    <span className="text-sm font-black text-[#120b0d]">
                      {quantity} in Bag
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(id, quantity + 1)}
                      className="grid size-8 place-items-center rounded-full hover:bg-[#990024]/10 transition cursor-pointer"
                      aria-label="Increase"
                    >
                      <Plus className="size-4 stroke-[2.5]" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await addItem(id, 1)
                        toast('Added to your bag!', 'success')
                      } catch (err) {
                        toast(err.message || 'Could not add to cart', 'error')
                      }
                    }}
                    className="flex-1 h-12 flex items-center justify-center gap-2 rounded-full bg-[#120b0d] hover:bg-[#990024] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <ShoppingBag className="size-4" />
                    <span>Add to Bag</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => navigate('/cart')}
                  className="h-12 rounded-full border border-black/15 hover:border-black/30 px-6 text-xs font-black uppercase tracking-wider text-[#120b0d] transition cursor-pointer"
                >
                  View Bag
                </button>
              </div>
            ) : (
              <p className="font-bold text-[#990024]">Currently Out of Stock</p>
            )}
          </div>

          {/* Guarantees */}
          <div className="pt-4 border-t border-black/[0.05] grid grid-cols-2 gap-4 text-xs font-semibold text-[#6e686a]">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-[#990024]" />
              <span>Free Express Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>100% Genuine Guaranteed</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
