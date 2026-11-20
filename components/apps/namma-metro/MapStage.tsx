'use client'
import type { ParsedMap } from '@/lib/namma-metro/parseMap'
import styles from './NammaMetro.module.css'

export type Orientation = 'vertical' | 'horizontal'

export interface StageStation {
  id: string
  name: string
}

interface Props {
  map: ParsedMap
  orientation: Orientation
  stations: StageStation[]
  hiddenId: string
  code: string
  solved: boolean
  /** a name is picked, or one is being dragged over the zone */
  armed: boolean
  hovering: boolean
  shaking: boolean
  onZoneTap: () => void
}

// Extra room around the exported map for the labels, in SVG units.
const LABEL_ROOM_VERTICAL = 130
// Horizontal: room above and below the line, which is cropped to its own height.
const HORIZONTAL_ROOM = 36

const pct = (v: number, total: number) => `${(v / total) * 100}%`

/**
 * Draws one exported map part (the SVG is used as is, rotated for phones) and
 * lays HTML labels over it, matched by each station's data-station id.
 */
export function MapStage({
  map, orientation, stations, hiddenId, code, solved, armed, hovering, shaking, onZoneTap,
}: Props) {
  const { x: vx, y: vy, w: vw, h: vh } = map.viewBox
  const vertical = orientation === 'vertical'

  // Stage size in SVG units. Vertical: the map is turned 90deg, labels go to its right.
  // Horizontal crops the empty space above and below the line so the map stays short.
  const boxes = Object.values(map.stations)
  const contentTop =
    Math.min(...boxes.map((b) => b.cy - b.h / 2), ...map.stubs.map((b) => b.y1)) - 6
  const contentBottom =
    Math.max(...boxes.map((b) => b.cy + b.h / 2), ...map.stubs.map((b) => b.y2)) + 6
  const originY = contentTop - HORIZONTAL_ROOM
  const stageW = vertical ? vh + LABEL_ROOM_VERTICAL : vw
  const stageH = vertical ? vw : contentBottom - contentTop + 2 * HORIZONTAL_ROOM

  const transform = vertical
    ? `translate(${vh} 0) rotate(90) translate(${-vx} ${-vy})`
    : `translate(${-vx} ${-originY})`
  const svgW = stageW
  const svgH = stageH

  const place = (id: string, index: number) => {
    const s = map.stations[id]
    // station centre and half-size in stage units
    const cx = vertical ? vh - (s.cy - vy) : s.cx - vx
    const cy = vertical ? s.cx - vx : s.cy - originY
    const hw = (vertical ? s.h : s.w) / 2
    const hh = (vertical ? s.w : s.h) / 2
    // an interchange line crossing this station pushes its label past the line
    const stub = map.stubs.find((b) => Math.abs(b.x - s.cx) < 1)
    let labelX: number
    let labelY: number
    let above = false
    if (vertical) {
      const reach = stub ? vh - (stub.y1 - vy) : cx + hw
      labelX = Math.max(cx + hw, reach) + 14
      labelY = cy
    } else {
      // labels alternate below and above the line so neighbours never collide
      above = index % 2 === 0
      labelX = cx
      labelY = above
        ? Math.min(cy - hh, stub ? stub.y1 - originY : cy - hh) - 8
        : Math.max(cy + hh, stub ? stub.y2 - originY : cy + hh) + 8
    }
    return { cx, cy, hw, hh, labelX, labelY, above }
  }

  return (
    <div
      // --reserved is the height taken by everything except the map (header, title,
      // hint, message, options), so the whole round fits on screen without scrolling
      className="relative w-full mx-auto [--reserved:36rem] md:[--reserved:27.5rem]"
      style={{
        aspectRatio: `${stageW} / ${stageH}`,
        maxWidth: `min(${vertical ? '30rem' : '38rem'}, max(14rem, calc((100dvh - var(--reserved)) * ${stageW / stageH})))`,
      }}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="absolute left-0 top-0"
        style={{ width: '100%', height: '100%' }}
        fill="none"
      >
        <g transform={transform} dangerouslySetInnerHTML={{ __html: map.inner }} />
      </svg>

      {stations.map((st, index) => {
        const p = place(st.id, index)
        const isHidden = st.id === hiddenId

        if (!isHidden) {
          return (
            <span
              key={st.id}
              className="absolute text-body-strong text-[var(--color-black-50)] leading-tight"
              style={{
                left: pct(p.labelX, stageW),
                top: pct(p.labelY, stageH),
                transform: vertical ? 'translateY(-50%)' : p.above ? 'translate(-50%, -100%)' : 'translateX(-50%)',
                maxWidth: vertical
                  ? pct(stageW - p.labelX - 4, stageW)
                  : '9rem',
                textAlign: vertical ? 'left' : 'center',
              }}
            >
              {st.name}
            </span>
          )
        }

        const ringState = solved ? 'solved' : hovering ? 'hover' : armed ? 'armed' : 'idle'
        return (
          <div key={st.id}>
            {/* Marker overlay: a 44px tap/drop area over the station circle */}
            <div
              data-drop
              onClick={onZoneTap}
              aria-hidden="true"
              className={`${styles.marker} ${styles[ringState]}`}
              style={{ left: pct(p.cx, stageW), top: pct(p.cy, stageH) }}
            >
              {solved && <Tick />}
            </div>

            {/* The code, or the answer once solved. This is the keyboard-focusable drop zone. */}
            <button
              type="button"
              data-drop
              onClick={onZoneTap}
              aria-label={
                solved
                  ? `Solved: ${st.name}`
                  : `Station hidden behind the code ${code}. ${armed ? 'Activate to place your pick here.' : 'Pick a name below first.'}`
              }
              className={`${styles.zone} ${styles[ringState]} ${shaking ? styles.shake : ''} text-body-strong`}
              style={{
                left: pct(p.labelX, stageW),
                top: pct(p.labelY, stageH),
                transform: vertical ? 'translateY(-50%)' : p.above ? 'translate(-50%, -100%)' : 'translateX(-50%)',
                maxWidth: vertical ? pct(stageW - p.labelX, stageW) : '14rem',
              }}
            >
              {solved ? (
                <>
                  <Tick small />
                  <span>{st.name}</span>
                </>
              ) : (
                <span className="font-mono tracking-wide">{code}</span>
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}

function Tick({ small }: { small?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={small ? 'w-5 h-5 shrink-0' : 'w-full h-full'}
      fill="none"
    >
      <circle cx="12" cy="12" r="12" fill="var(--color-status-success)" />
      <path d="M7 12.5l3.2 3.2L17 9" stroke="var(--color-white)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
