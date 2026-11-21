'use client'

import Image from 'next/image'
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'
import styles from './HeroPolaroids.module.css'

/**
 * The hero image: three polaroids stacked on a sheet of paper, held by two strips of tape.
 * Hover it and the polaroids spread out into a grid with 16px gaps, the tape comes off (the
 * paper stays), and the photo in each polaroid changes once a second. Move away and the stack
 * folds back up, keeping whichever photos it was showing.
 *
 * Positions come from the Figma frames "home" (stacked) and "home-right-hovered" (spread), in
 * design pixels relative to the 414 × 426 hero-polaroids box. Everything is multiplied by `--s`.
 */

/** Space between the spread-out polaroids */
const GAP = 16
/** How often the photos change while spread out */
const CYCLE_MS = 1000
/** Wait this long after the pointer leaves before folding back up (stops flicker in the gaps) */
const CLOSE_DELAY_MS = 150
/** Below this width the spread would run off the screen, so it stays stacked */
const MIN_SPREAD_WIDTH_PX = 640
/** The cards start spread out and fold up this long after the loader ends, hinting at the hover. */
const INTRO_HOLD_MS = 1000

const CARD = { width: 246.426, openHeight: 20 + 277.985 + 36 }

/** Spread layout: two in a column on the right, one to the left of them */
const COLUMN_X = 138.426
const COLUMN_TOP = -75

/**
 * `rest` is the top-left of the card before it is tilted, so it turns around its centre.
 * Cards are listed back to front: card 1 is at the bottom of the stack, card 3 on top.
 */
const cards = [
  { rest: { left: 100.719, top: 83.269, rotate: 3.81 }, open: { left: COLUMN_X - GAP - CARD.width, top: 113.953 } },
  { rest: { left: 120.553, top: 72.046, rotate: -3.73 }, open: { left: COLUMN_X, top: COLUMN_TOP + CARD.openHeight + GAP } },
  { rest: { left: 94.821, top: 48.378, rotate: 0 }, open: { left: COLUMN_X, top: COLUMN_TOP } },
] as const

/**
 * Which photo each card starts on (bottom, middle, top). polaroid-1--01 and polaroid-3--01 are the
 * same picture, so the top card starts on its 4th photo. With these offsets the three cards show
 * three different people/shots at every step of the cycle.
 */
const START_OFFSET = [0, 0, 3]

/** Design pixels → scaled pixels */
const px = (value: number) => `calc(${Math.round(value * 1000) / 1000}px * var(--s))`

interface HeroPolaroidsProps {
  /** Photo URLs for each polaroid, in the order they cycle. Index 0 is the bottom card. */
  groups: string[][]
  className?: string
}

export function HeroPolaroids({ groups, className }: HeroPolaroidsProps) {
  const [open, setOpen] = useState(false)
  // Starts spread out (also in the server HTML), then folds up once the loader is done
  const [intro, setIntro] = useState(true)
  const [tick, setTick] = useState(0)
  const closeTimer = useRef<number | undefined>(undefined)

  const spread = open || intro
  // The loader adds `loader-seen` to <html> when its swipe ends (or before first paint on a
  // repeat visit). Fold the stack up INTRO_HOLD_MS after that.
  useEffect(() => {
    const html = document.documentElement
    let hold: number | undefined
    let observer: MutationObserver | undefined
    const begin = () => {
      hold = window.setTimeout(() => setIntro(false), INTRO_HOLD_MS)
    }
    if (html.classList.contains('loader-seen')) {
      begin()
    } else {
      observer = new MutationObserver(() => {
        if (!html.classList.contains('loader-seen')) return
        observer?.disconnect()
        begin()
      })
      observer.observe(html, { attributes: true, attributeFilter: ['class'] })
    }
    return () => {
      observer?.disconnect()
      window.clearTimeout(hold)
    }
  }, [])
  // Change the photos once a second, only while spread out and only if motion is welcome
  useEffect(() => {
    if (!spread || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const timer = window.setInterval(() => setTick((n) => n + 1), CYCLE_MS)
    return () => window.clearInterval(timer)
  }, [spread])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  function onEnter(e: PointerEvent<HTMLDivElement>) {
    // Touch has no hover, and a tap would spread it and fold it up again straight away
    if (e.pointerType === 'touch' || window.innerWidth < MIN_SPREAD_WIDTH_PX) return
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }

  function onLeave(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'touch') return
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  return (
    <div
      role="img"
      aria-label="Polaroid photos of Gazi Taufiq"
      className={cn(styles.root, open && styles.open, intro && styles.intro, '[--s:0.75] lg:[--s:0.85] xl:[--s:1]', className)}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <div className={styles.bg} aria-hidden="true">
        <Image src="/images/hero/polaroid-bg.png" alt="" fill sizes="414px" className="object-fill" priority />
      </div>

      {cards.map((card, i) => {
        const photos = groups[i] ?? []
        const current = photos.length ? (tick + (START_OFFSET[i] ?? 0)) % photos.length : 0
        return (
          <div
            key={i}
            aria-hidden="true"
            className={styles.card}
            style={
              {
                '--l0': px(card.rest.left),
                '--t0': px(card.rest.top),
                '--r0': `${card.rest.rotate}deg`,
                '--l1': px(card.open.left),
                '--t1': px(card.open.top),
                zIndex: 1 + i,
              } as CSSProperties
            }
          >
            <div className={styles.photo}>
              {photos.map((src, j) => (
                <Image
                  key={src}
                  src={src}
                  alt=""
                  fill
                  sizes="240px"
                  quality={70}
                  draggable={false}
                  // The first photo of each polaroid is what shows on load; the rest wait their turn
                  priority={j === 0}
                  className={cn(styles.shot, j === current && styles.on, 'object-cover')}
                />
              ))}
            </div>
          </div>
        )
      })}

      <div className={styles.tapes} aria-hidden="true">
        <Image src="/images/hero/polaroid-tapes.png" alt="" fill sizes="112px" className="object-fill" priority />
      </div>
    </div>
  )
}
