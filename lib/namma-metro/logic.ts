// Pure game logic. No imports, so it can be unit-tested with `node --test`.

export type Rng = () => number

export interface Station {
  id: string
  name: string
}

export interface Part {
  id: number
  svg: string
  stationIds: string[]
  hiddenId: string
  code: string
  hint: string
}

export interface Scoring {
  perPart: number
  wrongPenalty: number
  hintPenalty: number
}

export interface PartResult {
  wrong: number
  hints: number
  solved: boolean
}

/** Small seeded RNG so shuffling can be tested. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Fisher-Yates. Returns a new array. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const out = items.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/**
 * The correct station plus (count - 1) wrong ones, shuffled. Wrong ones come
 * from other parts, because stations in the same part are visible on the map.
 */
export function buildOptions(
  part: Part,
  stations: readonly Station[],
  count = 4,
  rng: Rng = Math.random
): string[] {
  const pool = stations.filter(
    (s) => s.id !== part.hiddenId && !part.stationIds.includes(s.id)
  )
  const wrong = shuffle(pool, rng)
    .slice(0, Math.max(0, count - 1))
    .map((s) => s.id)
  return shuffle([part.hiddenId, ...wrong], rng)
}

export function checkAnswer(part: Part, chosenId: string): boolean {
  return chosenId === part.hiddenId
}

export function partScore(result: PartResult, scoring: Scoring): number {
  if (!result.solved) return 0
  const raw =
    scoring.perPart -
    result.wrong * scoring.wrongPenalty -
    result.hints * scoring.hintPenalty
  return Math.max(0, raw)
}

export function totalScore(results: readonly PartResult[], scoring: Scoring): number {
  return results.reduce((sum, r) => sum + partScore(r, scoring), 0)
}

export function maxScore(partCount: number, scoring: Scoring): number {
  return partCount * scoring.perPart
}

export function totalWrong(results: readonly PartResult[]): number {
  return results.reduce((sum, r) => sum + r.wrong, 0)
}

export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return m > 0 ? `${m}m ${String(s).padStart(2, '0')}s` : `${s}s`
}

export function fillTemplate(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (m, key) => (key in values ? values[key] : m))
}
