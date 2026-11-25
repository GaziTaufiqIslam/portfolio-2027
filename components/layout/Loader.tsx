'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { cityBuildings, cityKeyframesCss, tramKeyframesCss } from './loaderScene'
import { SCRIBBLE_PATH, SCRIBBLE_STROKE, SCRIBBLE_VIEWBOX } from '@/lib/loaderScribble'

/** sessionStorage key. Must match the inline script in app/layout.tsx. */
const STORAGE_KEY = 'loaderSeen'
/** Minimum time the loader stays up, measured from navigation start (3 tram bounces). */
const MIN_MS = 1500
/** The scribble draws in, then draws out again. Each half takes this long (seconds). */
const HALF_S = 2
/** Safety cap: start the scribble even if something never finishes loading. */
const MAX_MS = 8000

type Phase = 'loading' | 'wiping' | 'done'

/**
 * First-visit loader. Shows the bouncing tram until the page, fonts and a
 * minimum time are done, then a purple scribble is drawn across the screen from
 * left to right (GSAP DrawSVG, 0 to 100%) and drawn away again from the left
 * (100% to 0), which reveals the page. The lavender loader screen is hidden at the
 * moment the scribble fully covers it, halfway through.
 *
 * Shown once per browser tab session. The inline script in app/layout.tsx adds
 * `loader-seen` to <html> before first paint when the flag already exists, which
 * hides this component with CSS so repeat visits never flash it.
 */
export function Loader() {
  const [phase, setPhase] = useState<Phase>('loading')
  const screenRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  // GSAP is fetched while the loader is up, so it is ready when the scribble starts
  const gsapRef = useRef<Promise<[typeof import('gsap'), typeof import('gsap/DrawSVGPlugin')]> | null>(null)
  const reduceMotion = useRef(false)

  function finish() {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Storage can be blocked (private mode). The loader just shows again next time.
    }
    document.documentElement.classList.add('loader-seen')
    setPhase('done')
  }

  useEffect(() => {
    // Already shown this session: CSS has hidden it, so just unmount.
    if (document.documentElement.classList.contains('loader-seen')) {
      setPhase('done')
      return
    }

    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!reduceMotion.current) {
      gsapRef.current = Promise.all([import('gsap'), import('gsap/DrawSVGPlugin')])
      gsapRef.current.catch(() => {}) // handled where it is used
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

  // Reduced motion: the CSS fade ends the loader. Otherwise the GSAP timeline below does.
  function handleAnimationEnd(e: React.AnimationEvent<HTMLDivElement>) {
    if (e.animationName === 'loader-fade') finish()
  }

  useEffect(() => {
    if (phase !== 'wiping' || reduceMotion.current) return
    let timeline: { kill: () => void } | undefined
    let cancelled = false
    gsapRef.current
      ?.then(([{ gsap }, { DrawSVGPlugin }]) => {
        const path = pathRef.current
        const svg = svgRef.current
        const screen = screenRef.current
        if (cancelled || !path || !svg || !screen) return
        gsap.registerPlugin(DrawSVGPlugin)

        // Which part of the path is actually on screen? On tall or narrow screens the sides are
        // cropped, so draw only that part and the visible sweep fills the whole time.
        const ctm = path.getScreenCTM()
        const total = path.getTotalLength()
        let from = 0
        let to = 100
        if (ctm) {
          const reach = (SCRIBBLE_STROKE / 2) * ctm.a
          const pt = svg.createSVGPoint()
          const steps = 600
          let first = -1
          let last = -1
          for (let i = 0; i <= steps; i++) {
            const p = path.getPointAtLength((total * i) / steps)
            pt.x = p.x
            pt.y = p.y
            const q = pt.matrixTransform(ctm)
            if (q.x + reach >= 0 && q.x - reach <= innerWidth && q.y + reach >= 0 && q.y - reach <= innerHeight) {
              if (first < 0) first = i
              last = i
            }
          }
          if (first >= 0) {
            from = Math.max(0, ((first - 2) / steps) * 100)
            to = Math.min(100, ((last + 2) / steps) * 100)
          }
        }

        const ease = 'power2.inOut' // the same curve as cubic-bezier(0.65, 0, 0.35, 1)
        gsap.set(path, { drawSVG: `${from}% ${from}%`, visibility: 'visible' })
        timeline = gsap
          .timeline({ onComplete: finish })
          .to(path, { drawSVG: `${from}% ${to}%`, duration: HALF_S, ease }) // 0 to 100%
          .set(screen, { visibility: 'hidden' }) // fully covered: drop the lavender screen
          .to(path, { drawSVG: `${to}% ${to}%`, duration: HALF_S, ease }) // 100% to 0, from the left
          .set(path, { visibility: 'hidden' })
      })
      .catch(finish) // GSAP did not load: just show the page
    return () => {
      cancelled = true
      timeline?.kill()
    }
  }, [phase])

  if (phase === 'done') return null

  const wiping = phase === 'wiping'

  return (
    <div className="site-loader" aria-hidden="true" onAnimationEnd={handleAnimationEnd}>
      {/* Lavender screen with tram, wordmark and tagline */}
      <div ref={screenRef} className={`loader-screen${wiping ? ' is-wiping' : ''}`}>
        <div className="flex flex-col items-center">
          {/* Keyframes for the city and the tram are generated from loaderScene.ts */}
          <style>{`${cityKeyframesCss()}\n${tramKeyframesCss()}`}</style>

          {/* Scene: hand-drawn city (behind) and the tram (in front) */}
          <div className="loader-scene">
            {cityBuildings.map((building) => (
              <div
                key={building.id}
                className="city-building"
                style={{ ...building.initialStyle, animationName: building.animation }}
              >
                <Image src={building.src} alt="" fill priority className="object-contain" />
              </div>
            ))}
            <div className="loader-tram">
              <Image src="/images/loader/tram.png" alt="" fill priority className="object-contain" />
            </div>
          </div>

          <Image
            src="/images/logo/wordmark.svg"
            alt=""
            width={179}
            height={69}
            priority
            // 48px, or 4vh if that is larger
            className="mt-[max(48px,4vh)] object-contain"
          />
          <p className="text-body mt-4 whitespace-nowrap text-[var(--color-black)]">
            Product Designer | UI Engineer
          </p>
        </div>
      </div>

      {/* Purple scribble, drawn across the screen and then away again (not used with reduced motion) */}
      {wiping && !reduceMotion.current && (
        <svg
          ref={svgRef}
          className="absolute inset-0 h-full w-full"
          viewBox={SCRIBBLE_VIEWBOX}
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <path
            ref={pathRef}
            d={SCRIBBLE_PATH}
            stroke="var(--color-primary-500)"
            strokeWidth={SCRIBBLE_STROKE}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ visibility: 'hidden' }}
          />
        </svg>
      )}
    </div>
  )
}
