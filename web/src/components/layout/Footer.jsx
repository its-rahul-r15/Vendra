import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-white">
      <div className="container-app grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display text-3xl tracking-wide">Vendra</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            Shop electronics, watches and accessories from one convenient place.
          </p>
        </div>

        <div>
          <h4 className="font-display text-xl tracking-wide text-white/90">Explore</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/65">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/search" className="hover:text-white">Search</Link>
            <Link to="/search?filter=deals" className="hover:text-white">Deals</Link>
            <Link to="/orders" className="hover:text-white">Orders</Link>
            <Link to="/cart" className="hover:text-white">Cart</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-xl tracking-wide text-white/90">Support</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/65">
            <Link to="/account" className="hover:text-white">Account</Link>
            <span>Need help? Check your account orders.</span>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} Vendra. All rights reserved.
      </div>
    </footer>
  )
}
