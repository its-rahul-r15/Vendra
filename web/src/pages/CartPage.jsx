import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cart.store'
import { formatINRFromPaise } from '@/utils/money'
import { resolveImage } from '@/utils/media'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'

export function CartPage() {
  const navigate = useNavigate()
  const cart = useCartStore((state) => state.cart)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const clear = useCartStore((state) => state.clear)

  if (!cart.items.length) return <EmptyState title="Your cart is empty" description="Explore electronics, accessories, watches and more." actionLabel="Start shopping" onAction={() => navigate('/search')} />

  return (
    <div className="container-app grid gap-7 py-8 lg:grid-cols-[1.4fr_0.8fr]">
      <section className="rounded-3xl border border-line bg-surface p-5 md:p-7">
        <div className="mb-4 flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-brand">Ready when you are</p><h1 className="mt-1 text-3xl font-extrabold text-ink">Shopping cart</h1></div><button type="button" onClick={clear} className="text-sm font-semibold text-muted hover:text-red-600">Clear cart</button></div>
        <div className="divide-y divide-line">{cart.items.map((item) => <div key={item.listingId} className="flex items-center gap-3 py-4 md:gap-4">
          <Link to={`/products/${item.listingId}`} className="size-20 shrink-0 overflow-hidden rounded-xl bg-paper"><img src={resolveImage(item.image)} alt="" className="size-full object-cover" /></Link>
          <div className="min-w-0 flex-1"><Link to={`/products/${item.listingId}`} className="line-clamp-2 font-bold text-ink hover:text-brand">{item.name}</Link><p className="mt-1 text-sm text-muted">{formatINRFromPaise(item.pricePaise)} · {item.unit}</p></div>
          <div className="flex items-center gap-1 rounded-lg border border-brand/25 bg-brand/5 p-1 text-brand"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity(item.listingId, item.quantity - 1)} className="grid size-7 place-items-center">{item.quantity === 1 ? <Trash2 className="size-3.5" /> : <Minus className="size-3.5" />}</button><span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span><button type="button" aria-label="Increase quantity" onClick={() => setQuantity(item.listingId, item.quantity + 1)} className="grid size-7 place-items-center"><Plus className="size-3.5" /></button></div>
          <p className="hidden w-20 text-right font-bold text-ink sm:block">{formatINRFromPaise(item.pricePaise * item.quantity)}</p>
        </div>)}</div>
        <Link to="/search" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand"><ShoppingCart className="size-4" /> Continue shopping</Link>
      </section>
      <aside className="h-fit rounded-3xl border border-line bg-surface p-5 shadow-sm md:p-6"><h2 className="text-lg font-extrabold text-ink">Order summary</h2><div className="mt-4 flex justify-between text-sm"><span className="text-muted">Subtotal</span><span className="font-bold">{formatINRFromPaise(cart.subtotal)}</span></div><p className="mt-3 text-xs text-muted">Delivery and taxes are calculated securely at checkout.</p><Button className="mt-5 w-full" onClick={() => navigate('/checkout')}>Continue to checkout</Button><p className="mt-3 text-center text-xs text-muted">Secure checkout · Easy order tracking</p></aside>
    </div>
  )
}
