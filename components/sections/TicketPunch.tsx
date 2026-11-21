'use client'
import Image from 'next/image'
import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'
import styles from './TicketPunch.module.css'

/**
 * "Tickets please!" (Figma: tickets-container). Inside this section the pointer becomes a hole
 * puncher. Clicking the ticket punches a hole, as many times as you like. Once the ticket is badly
 * punched (see RUIN_ABOVE and RUIN_AFTER_HOLES) the ticket disappears and a short message takes its place.
 * Nothing is saved: a refresh gives you a fresh ticket.
 */

/** Ticket size in design pixels */
const TICKET = { w: 170, h: 273 }
/** Hole radius in design pixels (Figma punch-hole is 16px wide) */
const HOLE_R = 8
/** The ticket is ruined once more than this share of its area is punched out, or after this many
    holes, whichever comes first. (6 holes cover about 2.6%, so the hole count is what triggers it.) */
const RUIN_ABOVE = 0.1
const RUIN_AFTER_HOLES = 6
/** Puncher image size and the point of it that makes the hole (a share of its width / height):
    between the middle and the end of the lower jaw */
const PUNCHER = { w: 163, h: 91, hotX: 0.18, hotY: 0.76 }
/** The punch sound. If the file is missing nothing plays and nothing breaks. */
const PUNCH_SOUND_SRC = '/audio/hole-punch.mp3'

interface Hole {
  id: number
  x: number
  y: number
}

export function TicketPunch() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const holeId = useRef(0)
  // Which 1px cells of the ticket are punched out, so overlapping holes count once
  const cells = useRef(new Uint8Array(TICKET.w * TICKET.h))
  const punchedCells = useRef(0)
  const holeCount = useRef(0)
  const soundMissing = useRef(false)

  const [holes, setHoles] = useState<Hole[]>([])
  const [ruined, setRuined] = useState(false)
  const [cursorOn, setCursorOn] = useState(false)
  const [pressed, setPressed] = useState(false)

  function playPunch() {
    if (soundMissing.current) return
    try {
      const audio = new Audio(PUNCH_SOUND_SRC)
      audio.volume = 0.8
      audio.addEventListener('error', () => (soundMissing.current = true), { once: true })
      audio.play().catch(() => {}) // blocked or missing: stay quiet
    } catch {
      // no audio support
    }
  }

  function punchAt(x: number, y: number) {
    if (ruined) return
    playPunch()
    holeCount.current++
    setHoles((prev) => [...prev, { id: holeId.current++, x, y }])
    // Mark the cells inside the circle that lie on the ticket
    for (let py = Math.max(0, Math.floor(y - HOLE_R)); py < Math.min(TICKET.h, Math.ceil(y + HOLE_R)); py++) {
      for (let px = Math.max(0, Math.floor(x - HOLE_R)); px < Math.min(TICKET.w, Math.ceil(x + HOLE_R)); px++) {
        const i = py * TICKET.w + px
        if (!cells.current[i] && (px + 0.5 - x) ** 2 + (py + 0.5 - y) ** 2 <= HOLE_R ** 2) {
          cells.current[i] = 1
          punchedCells.current++
        }
      }
    }
    if (holeCount.current >= RUIN_AFTER_HOLES || punchedCells.current / (TICKET.w * TICKET.h) > RUIN_ABOVE) {
      setRuined(true)
    }
  }

  function onTicketPointerDown(e: PointerEvent<HTMLDivElement>) {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const rect = e.currentTarget.getBoundingClientRect()
    punchAt(((e.clientX - rect.left) / rect.width) * TICKET.w, ((e.clientY - rect.top) / rect.height) * TICKET.h)
    setPressed(true)
  }

  // Keyboard: Enter or Space punches at a random spot, since there is no pointer position
  function onTicketKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    punchAt(12 + Math.random() * (TICKET.w - 24), 12 + Math.random() * (TICKET.h - 24))
  }

  function moveCursor(e: PointerEvent<HTMLElement>) {
    if (e.pointerType === 'touch' || !cursorRef.current) return
    cursorRef.current.style.transform = `translate3d(${e.clientX - PUNCHER.hotX * PUNCHER.w}px, ${
      e.clientY - PUNCHER.hotY * PUNCHER.h
    }px, 0)`
  }

  return (
    <section
      id="tickets"
      className={cn(
        styles.section,
        'max-w-[1600px] mx-auto px-6 md:px-12 py-[65px] lg:min-h-[423px]',
        'flex flex-col lg:flex-row items-center lg:justify-between gap-10'
      )}
      onPointerEnter={(e) => {
        if (e.pointerType === 'touch') return
        moveCursor(e)
        setCursorOn(true)
      }}
      onPointerMove={moveCursor}
      onPointerLeave={() => {
        setCursorOn(false)
        setPressed(false)
      }}
      onPointerUp={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
    >
      <div className="flex flex-col gap-[10px] text-[var(--color-black-50)] max-lg:items-center max-lg:text-center">
        <h2 className="text-heading">📣 Tickets please!</h2>
        <p className="text-body">Punch the ticket to continue the ride</p>
      </div>

      <div className="flex items-center gap-8 sm:gap-10 lg:gap-[115px] lg:mr-[clamp(0px,11.2vw,161px)]">
        <div className={styles.stage}>
          <div
            role="button"
            tabIndex={ruined ? -1 : 0}
            aria-label="Punch the ticket"
            aria-hidden={ruined}
            className={cn(styles.ticket, ruined && styles.ruined)}
            onPointerDown={onTicketPointerDown}
            onKeyDown={onTicketKeyDown}
          >
            <Image
              src="/images/ticket/tram-ticket.png"
              alt=""
              fill
              sizes="170px"
              className="object-fill pointer-events-none select-none"
              draggable={false}
            />
            {holes.map((h) => (
              <span
                key={h.id}
                className={styles.hole}
                style={{ left: h.x - HOLE_R, top: h.y - HOLE_R } as CSSProperties}
              />
            ))}
          </div>
          <p
            role="status"
            className={cn(styles.ruinedText, ruined && styles.show, 'text-body text-[var(--color-black-50)]')}
          >
            {ruined ? 'Your ticket is ruined!' : ''}
          </p>
        </div>

        <Image
          src="/images/ticket/puncher.png"
          alt=""
          width={PUNCHER.w}
          height={PUNCHER.h}
          aria-hidden="true"
          draggable={false}
          className={cn(styles.rest, cursorOn && styles.hidden, 'hidden sm:block select-none')}
        />
      </div>

      {/* The pointer while it is inside the section */}
      <div ref={cursorRef} aria-hidden="true" className={cn(styles.cursor, cursorOn && styles.on, pressed && styles.pressed)}>
        <div className={styles.cursorImg} style={{ transformOrigin: `${PUNCHER.hotX * 100}% ${PUNCHER.hotY * 100}%` }}>
          <Image src="/images/ticket/puncher.png" alt="" width={PUNCHER.w} height={PUNCHER.h} draggable={false} />
        </div>
      </div>
    </section>
  )
}
