import { useEffect, useState } from 'react'

/**
 * Ultra-Minimal Luxury Splash Screen for Vendra
 * - Exactly ONE text element: "VENDRA" in high-end, wide tracked typography
 * - No dots, no icons, no sub-labels, no extra decoration
 * - Premium minimal line-pulse loader: a sleek, razor-thin luminous line with a subtle ambient sheen
 * - Glides smoothly bottom-to-top (`-translate-y-full`) on completion
 */
export function SplashScreen({ isReady = true, onFinished }) {
  const [visible, setVisible] = useState(true)
  const [slideOut, setSlideOut] = useState(false)
  const [progress, setProgress] = useState(20)

  useEffect(() => {
    const t1 = setTimeout(() => setProgress(55), 250)
    const t2 = setTimeout(() => setProgress(88), 600)
    const t3 = setTimeout(() => setProgress(100), 950)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  useEffect(() => {
    if (isReady && progress >= 100) {
      const exitTimer = setTimeout(() => {
        setSlideOut(true)
      }, 350)

      const cleanupTimer = setTimeout(() => {
        setVisible(false)
        if (onFinished) onFinished()
      }, 1200)

      return () => {
        clearTimeout(exitTimer)
        clearTimeout(cleanupTimer)
      }
    }
  }, [isReady, progress, onFinished])

  if (!visible) return null

  return (
    <div
      aria-hidden={slideOut}
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center select-none transition-transform duration-[850ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        slideOut ? '-translate-y-full pointer-events-none' : 'translate-y-0'
      }`}
      style={{
        background: '#8f0e2b',
      }}
    >
      {/* Centerpiece: Pure, ultra-clean Minimal Brand Typography & Premium Thin Line Loader */}
      <div className="flex flex-col items-center">
        {/* Single pure text */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-[0.32em] text-white uppercase font-sans pl-[0.32em]">
          VENDRA
        </h1>

        {/* Ultra-luxe thin line progress track */}
        <div className="mt-8 w-36 sm:w-44 h-[1.5px] bg-white/15 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-white transition-all duration-500 ease-out shadow-[0_0_12px_rgba(255,255,255,0.85)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}
