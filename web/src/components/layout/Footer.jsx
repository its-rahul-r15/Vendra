import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-ink text-white">
      <div className="container-app grid gap-8 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2">
            <img src="/brand/ftafat-logo.png" alt="" className="h-9 brightness-0 invert" />
            <span className="font-display text-3xl tracking-wide">FTAFAT</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/65">
            Street-fast food delivery for your city. Order from kitchens nearby —
            hot, quick, no fuss.
          </p>
        </div>

        <div>
          <h4 className="font-display text-xl tracking-wide text-white/90">Explore</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/65">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/search" className="hover:text-white">Search</Link>
            <Link to="/orders" className="hover:text-white">Orders</Link>
            <Link to="/cart" className="hover:text-white">Cart</Link>
          </div>
        </div>

        <div>
          <h4 className="font-display text-xl tracking-wide text-white/90">Support</h4>
          <div className="mt-3 flex flex-col gap-2 text-sm text-white/65">
            <Link to="/account" className="hover:text-white">Account</Link>
            <a href="mailto:support@ftafat.com" className="hover:text-white">
              support@ftafat.com
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-white/45">
        © {new Date().getFullYear()} Ftafat. All rights reserved.
      </div>
    </footer>
  )
}
