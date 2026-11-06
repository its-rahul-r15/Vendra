import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react'
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
  const quantity = useCartStore((state) => state.cart.items.find((item) => item.listingId === id)?.quantity || 0)
  const toast = useUiStore((state) => state.toast)

  useEffect(() => {
    let active = true
    catalogApi.product(id).then((data) => { if (active) setListing(data) }).catch((err) => { if (active) setError(err.message) }).finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  if (loading) return <div className="container-app flex justify-center py-24"><Spinner className="size-8" /></div>
  if (error || !listing) return <EmptyState title="Product unavailable" description={error || 'We could not find this product.'} actionLabel="Back to shop" onAction={() => navigate('/search')} />

  const item = listing.itemId
  const image = item.media?.find((media) => media.isPrimary)?.url || item.media?.[0]?.url
  const available = listing.isAvailable !== false && (!listing.stock?.track || listing.stock.available > 0)

  return (
    <div className="container-app py-7 md:py-10">
      <Link to="/search" className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-brand"><ArrowLeft className="size-4" /> Continue shopping</Link>
      <div className="grid gap-8 rounded-3xl border border-line bg-surface p-4 shadow-sm md:grid-cols-2 md:gap-10 md:p-8">
        <div className="overflow-hidden rounded-2xl bg-paper"><img src={resolveImage(image)} alt={item.name} className="aspect-square w-full object-cover" /></div>
        <div className="flex flex-col py-2">
          <p className="text-xs font-bold uppercase tracking-widest text-brand">{item.categoryId?.name || 'Vendra product'}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-ink md:text-4xl">{item.name}</h1>
          {item.rating ? <p className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-soft"><Star className="size-4 fill-amber-400 text-amber-400" />{Number(item.rating).toFixed(1)}</p> : null}
          <div className="mt-5 flex items-baseline gap-3"><span className="text-3xl font-extrabold text-ink">{formatINRFromPaise(listing.pricePaise)}</span>{listing.mrpPaise > listing.pricePaise ? <><span className="text-base text-muted line-through">{formatINRFromPaise(listing.mrpPaise)}</span><span className="text-sm font-bold text-brand">Save {formatINRFromPaise(listing.mrpPaise - listing.pricePaise)}</span></> : null}</div>
          <p className="mt-1 text-sm text-muted">{item.attributes?.unit || 'piece'}</p>
          {item.description ? <p className="mt-5 text-sm leading-6 text-ink-soft">{item.description}</p> : null}
          {item.tags?.length ? <div className="mt-5 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink-soft">{tag}</span>)}</div> : null}
          <div className="mt-6 flex gap-3">{quantity ? <div className="flex h-12 items-center gap-3 rounded-xl border border-brand/30 px-3 text-brand"><button aria-label="Decrease quantity" onClick={() => setQuantity(id, quantity - 1)}><Minus className="size-4" /></button><span className="font-bold">{quantity}</span><button aria-label="Increase quantity" disabled={!available} onClick={() => setQuantity(id, quantity + 1)}><Plus className="size-4" /></button></div> : <Button disabled={!available} className="h-12 flex-1" onClick={() => { addItem(listing); toast('Added to cart', 'success') }}><ShoppingCart className="mr-2 size-4" />{available ? 'Add to cart' : 'Sold out'}</Button>}<Button variant="outline" className="h-12" onClick={() => navigate('/cart')}>View cart</Button></div>
          <div className="mt-auto grid gap-3 border-t border-line pt-5 sm:grid-cols-2 md:mt-8"><p className="flex items-center gap-2 text-xs font-semibold text-ink-soft"><Truck className="size-4 text-brand" /> Delivery at checkout</p><p className="flex items-center gap-2 text-xs font-semibold text-ink-soft"><ShieldCheck className="size-4 text-brand" /> Secure purchase</p></div>
        </div>
      </div>
    </div>
  )
}
