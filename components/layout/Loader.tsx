'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

/** sessionStorage key. Must match the inline script in app/layout.tsx. */
const STORAGE_KEY = 'loaderSeen'
/** Minimum time the loader stays up, measured from navigation start (3 tram bounces). */
const MIN_MS = 1500
/** Safety cap: start the swipe even if something never finishes loading. */
const MAX_MS = 8000

type Phase = 'loading' | 'wiping' | 'done'

/**
 * First-visit loader. Shows the bouncing tram until the page, fonts and a
 * minimum time are done, then a purple panel swipes left to right across the
 * screen. The panel fully covers the screen at the 50% mark of the swipe, which
 * is exactly when the loader layer hides itself (see loader-screen-hide in
 * globals.css), so the page is revealed by the panel's trailing edge.
 *
 * Shown once per browser tab session. The inline script in app/layout.tsx adds
 * `loader-seen` to <html> before first paint when the flag already exists, which
 * hides this component with CSS so repeat visits never flash it.
 */
export function Loader() {
  const [phase, setPhase] = useState<Phase>('loading')

  useEffect(() => {
    // Already shown this session: CSS has hidden it, so just unmount.
    if (document.documentElement.classList.contains('loader-seen')) {
      setPhase('done')
      return
    }

    let cancelled = false
    const startWipe = () => {
      if (!cancelled) setPhase('wiping')
    }

    const windowLoaded =
      document.readyState === 'complete'
        ? Promise.resolve()
        : new Promise<void>((resolve) =>
            window.addEventListener('load', () => resolve(), { once: true })
          )
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve()

    // performance.now() counts from navigation start, which is about when the
    // server-rendered loader first painted.
    const elapsed = performance.now()
    const minWait = new Promise<void>((resolve) =>
      setTimeout(resolve, Math.max(0, MIN_MS - elapsed))
    )

    Promise.all([windowLoaded, fontsReady, minWait]).then(startWipe)
    const cap = setTimeout(startWipe, Math.max(0, MAX_MS - elapsed))

    return () => {
      cancelled = true
      clearTimeout(cap)
    }
  }, [])

  function handleAnimationEnd(e: React.AnimationEvent<HTMLDivElement>) {
    // The tram loops forever and never fires this; the screen-hide animation
    // also ends here, so only react to the swipe (or the reduced-motion fade).
    if (e.animationName !== 'loader-wipe' && e.animationName !== 'loader-fade') return
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Storage can be blocked (private mode). The loader just shows again next time.
    }
    document.documentElement.classList.add('loader-seen')
    setPhase('done')
  }

  if (phase === 'done') return null

  const wiping = phase === 'wiping'

  return (
    <div className="site-loader" aria-hidden="true" onAnimationEnd={handleAnimationEnd}>
      {/* Lavender screen with tram, wordmark and tagline */}
      <div className={`loader-screen${wiping ? ' is-wiping' : ''}`}>
        <div className="flex flex-col items-center">
          <div className="loader-tram">
            <Image src="/images/tram.png" alt="" width={138} height={117} priority />
          </div>
          <Image
            src="/images/logo/wordmark.svg"
            alt=""
            width={179}
            height={69}
            priority
            className="mt-[48px] object-contain"
          />
          <p className="text-body mt-4 whitespace-nowrap text-[var(--color-black)]">
            Product Designer | UI Engineer
          </p>
        </div>
      </div>

      {/* Purple swipe panel */}
      <div className={`loader-panel${wiping ? ' is-wiping' : ''}`} />
    </div>
  )
}
