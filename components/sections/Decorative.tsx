'use client'

import Image from 'next/image'
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { flushSync } from 'react-dom'
import { cn } from '@/lib/utils'
import styles from './Decorative.module.css'

/**
 * Stickers between Contact and the footer (Figma: interests-container). You can pick each one up,
 * drag it anywhere in the section and drop it. While one is held, the section shows a graph-paper
 * grid and the sticker lifts. Drop positions are remembered for the browser tab (sessionStorage),
 * and a double-click puts a sticker back where it started.
 *
 * Every size and offset is a design pixel value multiplied by `--s`, which the section sets per
 * breakpoint. Scaling the numbers (rather than using a CSS transform) shrinks the layout box too,
 * so narrower screens never scroll sideways.
 */

/** The group of stickers as laid out in Figma. It is centred in the section. */
const GROUP = { width: 931, height: 235 }

/** Where the arrangement is remembered. One key for the site, so Home and About share it. */
const STORAGE_KEY = 'decorativePositions'

/** How long the sticker takes to catch up with the pointer (ms). Bigger = lazier trail. */
const TRAIL_MS = 60
/** Movement under this (px) still counts as a click, not a drag. */
const DRAG_THRESHOLD_PX = 3
/** The sticker has "arrived" once it is within this many px of where it is heading. */
const SETTLE_PX = 0.25

/**
 * `left`/`top` place each sticker's cell inside the group; the image is centred in its cell and
 * rotated, exactly as in the Figma frame.
 */
const stickers = [
  { id: 'dimsum',   src: '/images/decorative/dimsum.png',   left: 0,      top: 47.89, cell: [104.014, 104.014], size: [93.207, 93.207],   rotate: -7.1 },
  { id: 'camera',   src: '/images/decorative/camera.png',   left: 216.67, top: 59.56, cell: [174.851, 174.851], size: [136.812, 136.812], rotate: 19.65 },
  { id: 'jersey',   src: '/images/decorative/jersey.png',   left: 543.99, top: 0,     cell: [115.74, 126.551],  size: [107.526, 119.198], rotate: 4.08 },
  { id: 'cassette', src: '/images/decorative/cassette.png', left: 800.02, top: 63.9,  cell: [130.974, 130.974], size: [97.717, 97.717],   rotate: -26.4 },
] as const

type Sticker = (typeof stickers)[number]

/** A saved spot: the sticker's centre as a share (0 to 1) of the section's width and height. */
type Saved = Record<string, { x: number; y: number }>

/** Design pixels → scaled pixels */
const px = (value: number) => `calc(${value}px * var(--s))`
const round2 = (n: number) => Math.round(n * 100) / 100
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function readSaved(): Saved {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')
    const saved: Saved = {}
    for (const { id } of stickers) {
      const p = parsed?.[id]
      if (p && Number.isFinite(p.x) && Number.isFinite(p.y)) saved[id] = { x: clamp(p.x, 0, 1), y: clamp(p.y, 0, 1) }
    }
    return saved
  } catch {
    return {} // storage blocked or corrupted: just start fresh
  }
}

function writeSaved(saved: Saved) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
  } catch {
    // Storage can be blocked (private mode). The arrangement just won't survive a refresh.
  }
}

/** Where a sticker's cell sits: its starting spot, or the saved spot. */
function positionStyle(s: Sticker, saved: Saved[string] | undefined): CSSProperties {
  if (saved) {
    return {
      left: `calc(${round2(saved.x * 100)}% - ${round2(s.cell[0] / 2)}px * var(--s))`,
      top: `calc(${round2(saved.y * 100)}% - ${round2(s.cell[1] / 2)}px * var(--s))`,
    }
  }
  return {
    left: `calc(50% + ${round2(s.left - GROUP.width / 2)}px * var(--s))`,
    top: `calc(50% + ${round2(s.top - GROUP.height / 2)}px * var(--s))`,
  }
}

interface Point { x: number; y: number }

/** The sticker currently being held (or gliding into place after being let go). */
interface Drag {
  id: string
  el: HTMLElement
  pointerId: number
  startClient: Point
  /** Pointer position inside the section when it was pressed */
  startInSection: Point
  lastClient: Point
  /** Sticker centre inside the section when it was picked up */
  home: { cx: number; cy: number }
  half: { w: number; h: number }
  /** Where the sticker is heading, and where it is now, as offsets from `home` (px) */
  target: Point
  cur: Point
  moved: boolean
  released: boolean
  /** Saved spot, written on release and put into state once the sticker has settled */
  final?: { x: number; y: number }
  raf: number
  lastTime: number
  reduceMotion: boolean
}

export function Decorative() {
  const sectionRef = useRef<HTMLElement>(null)
  const drag = useRef<Drag | null>(null)
  const [saved, setSaved] = useState<Saved>({})
  const [heldId, setHeldId] = useState<string | null>(null)
  const [resettingId, setResettingId] = useState<string | null>(null)
  // Stacking order, last = on top. Whatever you touched last sits above the rest.
  const [stack, setStack] = useState<string[]>(() => stickers.map((s) => s.id))

  // Apply remembered positions before the first paint after hydration
  useLayoutEffect(() => {
    setSaved(readSaved())
  }, [])

  useEffect(
    () => () => {
      if (drag.current) cancelAnimationFrame(drag.current.raf)
      document.documentElement.classList.remove('deco-dragging')
    },
    []
  )

  function apply(d: Drag) {
    d.el.style.setProperty('--dx', `${d.cur.x}px`)
    d.el.style.setProperty('--dy', `${d.cur.y}px`)
  }

  /** Where the pointer wants the sticker, kept inside the section */
  function wantedOffset(d: Drag, rect: DOMRect): Point {
    return {
      x: clamp(d.lastClient.x - rect.left - d.startInSection.x, d.half.w - d.home.cx, rect.width - d.half.w - d.home.cx),
      y: clamp(d.lastClient.y - rect.top - d.startInSection.y, d.half.h - d.home.cy, rect.height - d.half.h - d.home.cy),
    }
  }

  /** One animation frame: ease the sticker towards the pointer, a little behind it */
  function tick(now: number) {
    const d = drag.current
    const section = sectionRef.current
    if (!d || !section) return

    if (!d.released) d.target = wantedOffset(d, section.getBoundingClientRect())

    const dt = Math.min(now - d.lastTime, 64)
    d.lastTime = now
    const k = d.reduceMotion ? 1 : 1 - Math.exp(-dt / TRAIL_MS) // frame-rate independent easing
    d.cur.x += (d.target.x - d.cur.x) * k
    d.cur.y += (d.target.y - d.cur.y) * k
    apply(d)

    if (d.released && Math.abs(d.target.x - d.cur.x) < SETTLE_PX && Math.abs(d.target.y - d.cur.y) < SETTLE_PX) {
      settle(d)
      return
    }
    d.raf = requestAnimationFrame(tick)
  }

  /** The sticker has arrived: make its spot permanent in the layout and clear the drag offset */
  function settle(d: Drag) {
    cancelAnimationFrame(d.raf)
    d.cur = { ...d.target }
    apply(d)
    const final = d.final
    if (final) {
      // Commit the new left/top to the DOM first, then drop the offset, so there is no jump
      flushSync(() => setSaved((prev) => ({ ...prev, [d.id]: final })))
    }
    d.el.style.removeProperty('--dx')
    d.el.style.removeProperty('--dy')
    if (drag.current === d) drag.current = null
  }

  function onPointerDown(e: PointerEvent<HTMLDivElement>, id: string) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (drag.current) {
      if (drag.current.released) settle(drag.current) // still gliding from the last drop
      else return // another pointer is already dragging
    }
    const section = sectionRef.current
    if (!section) return

    const el = e.currentTarget
    const rect = section.getBoundingClientRect()
    el.setPointerCapture(e.pointerId) // keeps the drag going even when the pointer leaves the sticker

    drag.current = {
      id,
      el,
      pointerId: e.pointerId,
      startClient: { x: e.clientX, y: e.clientY },
      startInSection: { x: e.clientX - rect.left, y: e.clientY - rect.top },
      lastClient: { x: e.clientX, y: e.clientY },
      home: { cx: el.offsetLeft + el.offsetWidth / 2, cy: el.offsetTop + el.offsetHeight / 2 },
      half: { w: el.offsetWidth / 2, h: el.offsetHeight / 2 },
      target: { x: 0, y: 0 },
      cur: { x: 0, y: 0 },
      moved: false,
      released: false,
      raf: 0,
      lastTime: 0,
      reduceMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    }

    setHeldId(id)
    setStack((prev) => [...prev.filter((x) => x !== id), id])
    document.documentElement.classList.add('deco-dragging')
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId || d.released) return
    d.lastClient = { x: e.clientX, y: e.clientY }
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startClient.x, e.clientY - d.startClient.y) < DRAG_THRESHOLD_PX) return
      d.moved = true
      d.lastTime = performance.now()
      d.raf = requestAnimationFrame(tick)
    }
  }

  function onRelease(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    const section = sectionRef.current
    if (!d || !section || d.pointerId !== e.pointerId || d.released) return

    d.released = true
    setHeldId(null)
    document.documentElement.classList.remove('deco-dragging')

    if (!d.moved) {
      drag.current = null // just a click: nothing moved, nothing to save
      return
    }

    // Lock in where it is heading, remember that spot, and let the loop glide it there
    const rect = section.getBoundingClientRect()
    d.target = wantedOffset(d, rect)
    d.final = {
      x: clamp((d.home.cx + d.target.x) / rect.width, 0, 1),
      y: clamp((d.home.cy + d.target.y) / rect.height, 0, 1),
    }
    writeSaved({ ...readSaved(), [d.id]: d.final })
  }

  /** Double-click: back to the starting spot */
  function onDoubleClick(id: string) {
    if (drag.current) return
    setResettingId(id)
    setSaved((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    const stored = readSaved()
    delete stored[id]
    writeSaved(stored)
    window.setTimeout(() => setResettingId((current) => (current === id ? null : current)), 400)
  }

  return (
    <section
      ref={sectionRef}
      aria-hidden="true"
      // Hidden on the smallest screens. Full size at 2xl, scaled down at xl and below.
      className={cn(
        styles.section,
        'hidden sm:block [--s:0.5] md:[--s:0.6] lg:[--s:0.75] xl:[--s:0.85] 2xl:[--s:1]',
        heldId && styles.dragging
      )}
    >
      <div className={styles.grid} />

      {stickers.map((s) => (
        <div
          key={s.id}
          title="Click & hold to drag"
          className={cn(styles.item, heldId === s.id && styles.held, resettingId === s.id && styles.resetting)}
          style={{
            ...positionStyle(s, saved[s.id]),
            width: px(s.cell[0]),
            height: px(s.cell[1]),
            zIndex: 1 + stack.indexOf(s.id),
          }}
          onPointerDown={(e) => onPointerDown(e, s.id)}
          onPointerMove={onPointerMove}
          onPointerUp={onRelease}
          onPointerCancel={onRelease}
          onLostPointerCapture={onRelease}
          onDoubleClick={() => onDoubleClick(s.id)}
        >
          <div
            className={styles.body}
            style={{ width: px(s.size[0]), height: px(s.size[1]), '--r': `${s.rotate}deg` } as CSSProperties}
          >
            <Image src={s.src} alt="" fill className="object-cover" sizes="200px" draggable={false} />
          </div>
        </div>
      ))}
    </section>
  )
}
