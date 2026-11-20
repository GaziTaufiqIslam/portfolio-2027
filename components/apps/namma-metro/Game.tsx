'use client'
import { useCallback, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import config from '@/lib/namma-metro/game.config.json'
import {
  buildOptions, checkAnswer, fillTemplate, formatDuration, maxScore, shuffle,
  totalScore, totalWrong, partScore,
  type Part, type PartResult, type Station,
} from '@/lib/namma-metro/logic'
import type { ParsedMap } from '@/lib/namma-metro/parseMap'
import { Congrats } from './Congrats'
import { MapStage, type Orientation } from './MapStage'
import styles from './NammaMetro.module.css'

const stations = config.stations as Station[]
const parts = config.parts as Part[]
const nameOf = (id: string) => stations.find((s) => s.id === id)!.name
const emptyResults = (): PartResult[] => parts.map(() => ({ wrong: 0, hints: 0, solved: false }))

type Screen = 'welcome' | 'play' | 'done'

const wideQuery = '(min-width: 768px)'
function useOrientation(): Orientation {
  const wide = useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(wideQuery)
      m.addEventListener('change', cb)
      return () => m.removeEventListener('change', cb)
    },
    () => window.matchMedia(wideQuery).matches,
    () => false
  )
  return wide ? 'horizontal' : 'vertical'
}

const vibrate = (p: number | number[]) => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(p)
}

export function Game({ maps }: { maps: ParsedMap[] }) {
  const [screen, setScreen] = useState<Screen>('welcome')
  const [partIndex, setPartIndex] = useState(0)
  // order the parts are played in, shuffled on every start
  const [order, setOrder] = useState<number[]>(() => parts.map((_, i) => i))
  const [results, setResults] = useState<PartResult[]>(emptyResults)
  const [options, setOptions] = useState<string[]>([])
  const [tried, setTried] = useState<string[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [hintShown, setHintShown] = useState(false)
  const [message, setMessage] = useState<{ text: string; kind: 'info' | 'ok' | 'bad' }>({ text: '', kind: 'info' })
  const [shaking, setShaking] = useState(false)
  const [times, setTimes] = useState<{ start: number; end: number }>({ start: 0, end: 0 })

  const startRound = useCallback((index: number, ord: number[]) => {
    setPartIndex(index)
    setOptions(buildOptions(parts[ord[index]], stations, config.optionsCount))
    setTried([])
    setSelected(null)
    setHintShown(false)
    setMessage({ text: '', kind: 'info' })
  }, [])

  const start = () => {
    setResults(emptyResults())
    setTimes({ start: Date.now(), end: 0 })
    const ord = shuffle(parts.map((_, i) => i))
    setOrder(ord)
    startRound(0, ord)
    setScreen('play')
    window.scrollTo(0, 0)
  }

  if (screen === 'welcome') return <Welcome onStart={start} />

  if (screen === 'done') {
    return (
      <Congrats
        score={totalScore(results, config.scoring)}
        max={maxScore(parts.length, config.scoring)}
        time={formatDuration(times.end - times.start)}
        wrong={totalWrong(results)}
        onReplay={start}
      />
    )
  }

  return (
    <Play
      key={partIndex}
      map={maps[order[partIndex]]}
      part={parts[order[partIndex]]}
      partIndex={partIndex}
      results={results}
      options={options}
      tried={tried}
      selected={selected}
      hintShown={hintShown}
      message={message}
      shaking={shaking}
      setSelected={setSelected}
      onHint={() => {
        setHintShown(true)
        setResults((r) => r.map((x, i) => (i === partIndex ? { ...x, hints: x.hints + 1 } : x)))
      }}
      onSubmit={(id) => {
        const part = parts[order[partIndex]]
        if (results[partIndex].solved || tried.includes(id)) return
        if (checkAnswer(part, id)) {
          setResults((r) => r.map((x, i) => (i === partIndex ? { ...x, solved: true } : x)))
          setSelected(null)
          setMessage({ text: fillTemplate(config.play.correct, { name: nameOf(id) }), kind: 'ok' })
          vibrate(30)
        } else {
          setResults((r) => r.map((x, i) => (i === partIndex ? { ...x, wrong: x.wrong + 1 } : x)))
          setTried((t) => [...t, id])
          setSelected(null)
          setMessage({ text: `${nameOf(id)}? ${config.play.wrong}`, kind: 'bad' })
          setShaking(true)
          setTimeout(() => setShaking(false), 450)
          vibrate([40, 30, 40])
        }
      }}
      onWarn={(text) => setMessage({ text, kind: 'info' })}
      onNext={() => {
        if (partIndex === parts.length - 1) {
          setTimes((t) => ({ ...t, end: Date.now() }))
          setScreen('done')
          window.scrollTo(0, 0)
        } else {
          startRound(partIndex + 1, order)
        }
      }}
    />
  )
}

function Welcome({ onStart }: { onStart: () => void }) {
  const w = config.welcome
  return (
    <div className="min-h-dvh flex flex-col items-center justify-between px-5 pt-[max(2rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-[34rem] my-auto flex flex-col gap-6 py-8">
        <h1 className="text-title text-[var(--color-black-50)] text-center">{w.title}</h1>
        <div className="flex flex-col gap-4 text-center">
          <p className="text-body text-[var(--color-grey-900)]">{w.intro}</p>
          <p className="text-body-strong text-[var(--color-black-50)]">{w.question}</p>
        </div>
        <div className="rounded-2xl border-2 border-[var(--color-primary-200)] bg-[var(--color-primary-100)] p-5">
          <h2 className="text-subheading text-[var(--color-primary-500)] mb-3">How to play</h2>
          <ul className="flex flex-col gap-2">
            {w.howToPlay.map((t) => (
              <li key={t} className="text-body text-[var(--color-black-50)] flex gap-3">
                <span aria-hidden="true" className="text-[var(--color-primary-500)]">●</span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <button type="button" onClick={onStart} className={`${styles.btn} text-heading w-full`}>
          {w.startLabel}
        </button>
      </div>
      <p className="text-body text-[var(--color-grey-900)] text-center">{w.footer}</p>
    </div>
  )
}

interface PlayProps {
  map: ParsedMap
  part: Part
  partIndex: number
  results: PartResult[]
  options: string[]
  tried: string[]
  selected: string | null
  hintShown: boolean
  message: { text: string; kind: 'info' | 'ok' | 'bad' }
  shaking: boolean
  setSelected: (id: string | null) => void
  onHint: () => void
  onSubmit: (id: string) => void
  onWarn: (text: string) => void
  onNext: () => void
}

function Play(p: PlayProps) {
  const part = p.part
  const result = p.results[p.partIndex]
  const orientation = useOrientation()
  const stageRef = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{ id: string; x: number; y: number } | null>(null)
  const [over, setOver] = useState(false)
  const gesture = useRef<{ id: string; sx: number; sy: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)

  const stageStations = useMemo(
    () => part.stationIds.map((id) => ({ id, name: nameOf(id) })),
    [part]
  )

  const overZone = (x: number, y: number) => {
    const pad = 16 // the drop area is bigger than the visible circle
    const nodes = stageRef.current?.querySelectorAll<HTMLElement>('[data-drop]') ?? []
    return Array.from(nodes).some((n) => {
      const r = n.getBoundingClientRect()
      return x >= r.left - pad && x <= r.right + pad && y >= r.top - pad && y <= r.bottom + pad
    })
  }

  const onZoneTap = () => {
    if (result.solved) return
    if (p.selected) p.onSubmit(p.selected)
    else p.onWarn(config.play.pickFirst)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, id: string) => {
    if (e.button !== 0 || result.solved || p.tried.includes(id)) return
    e.currentTarget.setPointerCapture(e.pointerId)
    gesture.current = { id, sx: e.clientX, sy: e.clientY, moved: false }
  }
  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const g = gesture.current
    if (!g) return
    if (!g.moved && Math.hypot(e.clientX - g.sx, e.clientY - g.sy) > 8) {
      g.moved = true
      p.setSelected(g.id)
    }
    if (g.moved) {
      setDrag({ id: g.id, x: e.clientX, y: e.clientY })
      setOver(overZone(e.clientX, e.clientY))
    }
  }
  const endGesture = (e: React.PointerEvent<HTMLButtonElement>, cancelled: boolean) => {
    const g = gesture.current
    gesture.current = null
    if (!g) return
    if (g.moved) {
      suppressClick.current = true // the click that follows a drag is not a tap
      if (!cancelled && overZone(e.clientX, e.clientY)) p.onSubmit(g.id)
      else p.setSelected(null)
    }
    setDrag(null)
    setOver(false)
  }
  const onOptionClick = (id: string) => {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    if (result.solved || p.tried.includes(id)) return
    p.setSelected(p.selected === id ? null : id)
  }

  const progress = (p.partIndex + (result.solved ? 1 : 0)) / parts.length
  const last = p.partIndex === parts.length - 1
  const score = totalScore(p.results, config.scoring)
  const msgColour =
    p.message.kind === 'ok'
      ? 'text-[var(--color-black-50)]'
      : p.message.kind === 'bad'
        ? 'text-[var(--color-accent-700)]'
        : 'text-[var(--color-grey-900)]'

  return (
    <div className="min-h-dvh flex flex-col">
      <header className="px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3 max-w-[48rem] w-full mx-auto">
        <div className="flex items-baseline justify-between mb-2">
          <p className="text-body-strong text-[var(--color-black-50)]">
            Part {p.partIndex + 1} of {parts.length}
          </p>
          <p className="text-body text-[var(--color-grey-900)]">Score {score}</p>
        </div>
        <div
          role="progressbar"
          aria-label="Progress"
          aria-valuemin={0}
          aria-valuemax={parts.length}
          aria-valuenow={p.partIndex + (result.solved ? 1 : 0)}
          aria-valuetext={`Part ${p.partIndex + 1} of ${parts.length}`}
          className="h-2.5 rounded-full bg-[var(--color-primary-200)] overflow-hidden"
        >
          <div
            className="h-full bg-[var(--color-primary-500)] transition-[width] duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center gap-4 px-5 py-4 w-full max-w-[48rem] mx-auto">
        <h1 className="text-subheading text-[var(--color-black-50)] text-center">
          Which station is behind the code?
        </h1>
        <div ref={stageRef} className="w-full">
          <MapStage
            map={p.map}
            orientation={orientation}
            stations={stageStations}
            hiddenId={part.hiddenId}
            code={part.code}
            solved={result.solved}
            armed={!!p.selected}
            hovering={over}
            shaking={p.shaking}
            onZoneTap={onZoneTap}
          />
        </div>
        {p.hintShown && (
          <p className="text-body text-[var(--color-primary-500)] bg-[var(--color-primary-100)] rounded-xl px-4 py-2 text-center">
            Hint: {part.hint}
          </p>
        )}
        <p role="status" aria-live="polite" className={`text-body-strong text-center min-h-[1.5rem] ${msgColour}`}>
          {p.message.kind === 'bad' && <span aria-hidden="true">✕ </span>}
          {p.message.kind === 'ok' && <span aria-hidden="true">✓ </span>}
          {p.message.text}
        </p>
      </main>

      {/* Pinned to the bottom of the screen */}
      <footer className="sticky bottom-0 bg-[var(--color-bg)] border-t-2 border-[var(--color-primary-200)] px-5 pt-3 pb-[calc(3rem+env(safe-area-inset-bottom))] md:pb-4">
        <div className="max-w-[48rem] mx-auto flex flex-col gap-3">
          {result.solved ? (
            <button type="button" className={`${styles.btn} text-heading w-full`} onClick={p.onNext} autoFocus>
              {last ? config.play.finishLabel : config.play.nextLabel}
            </button>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-body text-[var(--color-grey-900)]" id="options-help">
                  Drag a name onto the code, or tap a name and then the code.
                </p>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.secondary} text-body-strong shrink-0`}
                  onClick={p.onHint}
                  disabled={p.hintShown}
                >
                  {config.play.hintLabel} (−{config.scoring.hintPenalty})
                </button>
              </div>
              <div role="group" aria-labelledby="options-help" className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {p.options.map((id) => {
                  const isTried = p.tried.includes(id)
                  const isSel = p.selected === id
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={isSel}
                      aria-disabled={isTried}
                      onClick={() => onOptionClick(id)}
                      onPointerDown={(e) => onPointerDown(e, id)}
                      onPointerMove={onPointerMove}
                      onPointerUp={(e) => endGesture(e, false)}
                      onPointerCancel={(e) => endGesture(e, true)}
                      className={`${styles.option} ${isSel ? styles.selected : ''} ${isTried ? styles.tried : ''} ${drag?.id === id ? styles.dragging : ''} text-body-strong`}
                    >
                      {isTried && <span aria-hidden="true">✕ </span>}
                      {nameOf(id)}
                      {isTried && <span className="sr-only"> (wrong)</span>}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </footer>

      {drag && (
        <div className={`${styles.ghost} text-body-strong`} style={{ left: drag.x, top: drag.y }} aria-hidden="true">
          {nameOf(drag.id)}
        </div>
      )}
    </div>
  )
}
