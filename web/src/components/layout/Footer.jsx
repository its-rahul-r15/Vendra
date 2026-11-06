import { Link } from 'react-router-dom'
import { ShieldCheck, ArrowUpRight, Store } from 'lucide-react'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#e7e5df] bg-white text-[#121212]">
      <div className="container-app py-16">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          {/* Brand Col */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-3xl font-black tracking-tight text-[#0a0a0a]">
                Vendra
              </span>
              <span className="rounded-full bg-[#121212] px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase text-white">
                Platform
              </span>
            </div>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-[#737069]">
              Curated multi-vendor marketplace connecting independent shops, boutiques, and merchants directly with discerning buyers.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#737069]">
              <ShieldCheck className="size-4 text-[#121212]" />
              <span>Verified Merchant Quality Guarantee</span>
            </div>
          </div>

          {/* Catalog & Shopping */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#121212]">
              Shopping
            </h4>
            <div className="mt-4 flex flex-col gap-2.5 text-base text-[#575550]">
              <Link to="/categories" className="transition hover:text-[#0a0a0a]">
                Category-Wise Shopping
              </Link>
              <Link to="/shops" className="transition hover:text-[#0a0a0a]">
                Shop Directory
              </Link>
              <Link to="/search" className="transition hover:text-[#0a0a0a]">
                All Marketplace Items
              </Link>
              <Link to="/search?filter=deals" className="transition hover:text-[#0a0a0a]">
                Curated Deals
              </Link>
              <Link to="/cart" className="transition hover:text-[#0a0a0a]">
                Shopping Bag
              </Link>
            </div>
          </div>

          {/* Vendors & Sellers */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#121212]">
              For Vendors
            </h4>
            <div className="mt-4 flex flex-col gap-2.5 text-base text-[#575550]">
              <Link
                to="/vendor/register"
                className="font-semibold text-[#0a0a0a] transition hover:underline flex items-center gap-1"
              >
                <span>Register as a Vendor</span>
                <ArrowUpRight className="size-3.5" />
              </Link>
              <Link to="/vendor/login" className="transition hover:text-[#0a0a0a]">
                Vendor Portal Sign In
              </Link>
              <Link to="/vendor/register" className="transition hover:text-[#0a0a0a]">
                Seller Onboarding Guide
              </Link>
              <Link to="/shops" className="transition hover:text-[#0a0a0a]">
                Partner Directory
              </Link>
            </div>
          </div>

          {/* User & Support */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#121212]">
              Customer Service
            </h4>
            <div className="mt-4 flex flex-col gap-2.5 text-base text-[#575550]">
              <Link to="/account" className="transition hover:text-[#0a0a0a]">
                Account & Addresses
              </Link>
              <Link to="/orders" className="transition hover:text-[#0a0a0a]">
                Track Orders
              </Link>
              <Link to="/login" className="transition hover:text-[#0a0a0a]">
                Sign in / Register
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#e7e5df] pt-8 text-sm text-[#737069]">
          <p>© {new Date().getFullYear()} Vendra Marketplace. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Authentic Products</span>
            <span>Secure Checkout</span>
            <span>Independent Shops</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
