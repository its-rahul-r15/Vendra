import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-[#fcfbfa] via-[#faf2f4] via-40% to-[#f4d5de] text-[#120b0d] pt-8 sm:pt-12 pb-0 select-none">
      
      {/* Background Velvet Carmine Ambient Glows (Smooth Natural Diffusion) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-1/4 size-[400px] rounded-full bg-[#fcfbfa] blur-[90px]" />
        <div className="absolute bottom-0 right-1/4 size-[450px] rounded-full bg-[#ba2249]/15 blur-[130px]" />
      </div>

      <div className="relative z-10 container-app">
        {/* Main 2-Column Minimalist Architectural Stage (Clean, No bulky center content) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-10">
          
          {/* Left: Brand Contact, Socials & Legal Address */}
          <div className="space-y-4 text-left">
            {/* Minimalist Outlined Social Pills */}
            <div className="flex items-center gap-3 text-[#120b0d]">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="size-7 rounded-full border border-black/25 flex items-center justify-center hover:bg-[#120b0d] hover:text-white hover:border-[#120b0d] transition cursor-pointer text-[11px] font-bold"
                aria-label="Instagram"
              >
                ig
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="size-7 rounded-full border border-black/25 flex items-center justify-center hover:bg-[#120b0d] hover:text-white hover:border-[#120b0d] transition cursor-pointer text-[11px] font-bold"
                aria-label="LinkedIn"
              >
                in
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="size-7 rounded-full border border-black/25 flex items-center justify-center hover:bg-[#120b0d] hover:text-white hover:border-[#120b0d] transition cursor-pointer text-[11px] font-bold font-mono"
                aria-label="X"
              >
                𝕏
              </a>
            </div>

            {/* Direct Contact Email */}
            <div>
              <a
                href="mailto:concierge@vendra.io"
                className="text-base sm:text-lg font-black text-[#120b0d] hover:text-[#990024] hover:underline tracking-tight transition-colors"
              >
                concierge@vendra.io
              </a>
            </div>

            {/* Registered Headquarters Address */}
            <div className="text-xs text-[#5c5658] font-medium leading-relaxed max-w-xs">
              Vendra Technologies Pvt Ltd,<br />
              One Horizon Center, Golf Course Rd,<br />
              DLF Phase 5, Gurugram, 122002
            </div>
          </div>

          {/* Right: Clean Editorial Stack Navigation */}
          <div className="flex flex-col md:items-end justify-center space-y-2 text-sm sm:text-base font-bold text-[#120b0d]">
            <Link to="/categories" className="hover:text-[#990024] transition hover:translate-x-1 duration-200">
              Platform
            </Link>
            <Link to="/search" className="hover:text-[#990024] transition hover:translate-x-1 duration-200">
              Curations
            </Link>
            <Link to="/shops" className="hover:text-[#990024] transition hover:translate-x-1 duration-200">
              Brand Stores
            </Link>
            <Link to="/account" className="hover:text-[#990024] transition hover:translate-x-1 duration-200">
              Account
            </Link>
            <Link to="/vendor/login" className="hover:text-[#990024] transition hover:translate-x-1 duration-200 text-xs uppercase tracking-wider font-black text-[#990024]">
              Merchant Portal →
            </Link>
          </div>

        </div>

        {/* Sub-bar (Terms, Copyright, Privacy Policy) */}
        <div className="pt-6 pb-2 border-t border-black/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-[#6e686a]">
          <Link to="/categories" className="hover:text-[#120b0d] underline underline-offset-4">
            Terms and conditions
          </Link>

          <span>
            © {new Date().getFullYear()} Vendra. All Rights Reserved
          </span>

          <Link to="/categories" className="hover:text-[#120b0d] underline underline-offset-4">
            Privacy Policy
          </Link>
        </div>

        {/* ── 90% VISIBLE ARCHITECTURAL WATERMARK (Only bottom 10% clipped) ── */}
        <div className="h-28 sm:h-36 md:h-48 overflow-hidden text-center pointer-events-none select-none relative flex items-start justify-center">
          <span className="block text-[18vw] font-black leading-none tracking-[-0.07em] text-[#990024]/[0.13] uppercase -translate-y-[2%]">
            vendra
          </span>
        </div>

      </div>
    </footer>
  )
}
