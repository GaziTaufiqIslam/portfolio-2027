/**
 * Loader scene: the tram with a hand-drawn city sliding past behind it.
 *
 * Source: the Figma storyboard "loader-bg-anim-01 … 04". Each building starts at the right-hand
 * slot (largest, boldest line), shrinks as it moves left, and ends at the far left (smallest,
 * thinnest line). It then jumps back to the right at full size, and the loop repeats.
 *
 * Figma's middle stages are not evenly spaced, so only each building's FIRST and LAST pose are
 * taken from Figma. Every frame in between is a straight line (linear interpolation of centre
 * position and scale) from the first pose to the last.
 *
 * The animation runs at 6 frames per second over a 2s loop = 12 frames. Each building is visible
 * for 10 of them (first pose → last pose) and invisible for the 2 frames in which it travels
 * from the far left back to the far right. The CSS is generated from this data, so changing a
 * number below is all it takes to adjust the animation.
 */

export const CITY_LOOP_MS = 2000
export const CITY_FPS = 6
export const CITY_FRAMES = (CITY_LOOP_MS / 1000) * CITY_FPS // 12
/** Frames between one storyboard stage and the next (also how far apart the buildings start). */
const FRAMES_PER_STAGE = CITY_FRAMES / 4 // 3
/** A building is visible from its first pose to its last: 3 stages' worth of frames, plus the last frame. */
const VISIBLE_FRAMES = 3 * FRAMES_PER_STAGE + 1 // 10

/** Scene box in px at 100%. It is centred on the tram and ends at the tram's bottom edge. */
export const SCENE = { width: 380, height: 274 }
export const TRAM = { left: 121, top: 157, width: 138, height: 117 }

/** Figma scene (644×516, tram centred at x=327, scene top used as y=101) → this scene box. */
const ORIGIN = { x: 137, y: 101 }

/** [left, top, width, height] of a building's box in the Figma scene. */
type Cell = readonly [number, number, number, number]

interface BuildingDef {
  id: 'b1' | 'b2' | 'b3' | 'b4'
  src: string
  /**
   * Pixel size of the exported SVG frame (the drawing is at its first-pose size in it). The
   * drawing must be centred in the frame, because buildings are placed by their centre. Extra
   * empty space around it (as in building 3) is fine.
   */
  native: readonly [number, number]
  /** Storyboard stage (0–3) where the building is at its first pose. Sets when it starts in the loop. */
  firstStage: number
  /** First pose: right-hand slot, largest, boldest line (Figma storyboard stage `firstStage`). */
  first: Cell
  /** Last pose: far left, smallest, thinnest line (the storyboard stage just before `firstStage`). */
  last: Cell
}

// Layer order = Figma order: building 4 at the back, building 1 on top.
const BUILDINGS: readonly BuildingDef[] = [
  {
    id: 'b4', src: '/images/loader/building-4.svg', native: [86, 165], firstStage: 0,
    first: [338.91, 158.48, 141.454, 183.677],
    last: [230, 282, 40.041, 51.992],
  },
  {
    id: 'b3', src: '/images/loader/building-3.svg', native: [152, 272], firstStage: 3,
    first: [435, 101, 34, 253.016],
    last: [258, 252, 11.535, 85.842],
  },
  {
    id: 'b2', src: '/images/loader/building-2.svg', native: [87, 181], firstStage: 2,
    first: [412, 164, 84.38, 189.406],
    last: [255, 266, 28.38, 63.705],
  },
  {
    id: 'b1', src: '/images/loader/building-1.svg', native: [106, 149], firstStage: 1,
    first: [413, 177, 104, 153.052],
    last: [237, 295.33, 22.635, 33.311],
  },
]

interface Pose {
  /** Centre of the building, in scene px */
  cx: number
  cy: number
  /** Size relative to the exported SVG (1 = its first pose: largest, thickest line) */
  scale: number
  /** Line opacity: 0.8 at the first pose fading to 0.4 at the last, and 0 on the trip back */
  opacity: number
}

/** Opacity of a building's lines at its first pose (right-hand slot) and its last (far left). */
const OPACITY_FIRST = 0.8
const OPACITY_LAST = 0.4

/** Centre and relative size of a Figma box. `reference` is the first pose, which is scale 1. */
function cellPose(cell: Cell, reference: Cell): Pose {
  const [left, top, width, height] = cell
  return {
    cx: left + width / 2 - ORIGIN.x,
    cy: top + height / 2 - ORIGIN.y,
    scale: height / reference[3],
    opacity: OPACITY_FIRST,
  }
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/**
 * The 12 poses of one building, in loop order. A building's own frame `j` counts from its first
 * pose: j = 0 is the right-hand slot, j = 9 is the far-left slot, and j = 10 and 11 are the trip
 * back, when it is invisible (held at the left) so it never visibly flies across the scene.
 */
function framePoses(b: BuildingDef): Pose[] {
  const first = cellPose(b.first, b.first)
  const last = cellPose(b.last, b.first)
  return Array.from({ length: CITY_FRAMES }, (_, frame) => {
    const j = (frame - b.firstStage * FRAMES_PER_STAGE + CITY_FRAMES) % CITY_FRAMES
    const visible = j < VISIBLE_FRAMES
    const u = visible ? j / (VISIBLE_FRAMES - 1) : 1
    return {
      cx: lerp(first.cx, last.cx, u),
      cy: lerp(first.cy, last.cy, u),
      scale: lerp(first.scale, last.scale, u),
      // Lines fade evenly from 80% to 40% as the building moves left; hidden on the trip back
      opacity: visible ? lerp(OPACITY_FIRST, OPACITY_LAST, u) : 0,
    }
  })
}

const round = (n: number) => Math.round(n * 100) / 100
const round3 = (n: number) => Math.round(n * 1000) / 1000

/** Pixel box of the SVG for a pose, as CSS that follows the scene's `--s` scale factor. */
function boxDeclarations(b: BuildingDef, p: Pose): string {
  const width = b.native[0] * p.scale
  const height = b.native[1] * p.scale
  const px = (n: number) => `calc(${round(n)}px * var(--s))`
  return `left:${px(p.cx - width / 2)};top:${px(p.cy - height / 2)};width:${px(width)};height:${px(height)};opacity:${round3(p.opacity)}`
}

export interface CityBuilding {
  id: string
  src: string
  /** CSS animation name */
  animation: string
  /** Resting box (frame 0). Shown as-is when motion is reduced. */
  initialStyle: Record<string, string>
}

export const cityBuildings: CityBuilding[] = BUILDINGS.map((b) => ({
  id: b.id,
  src: b.src,
  animation: `city-${b.id}`,
  initialStyle: Object.fromEntries(
    boxDeclarations(b, framePoses(b)[0])
      .split(';')
      .map((d) => d.split(/:(.+)/).slice(0, 2) as [string, string])
  ),
}))

/**
 * @keyframes for every building. Used with `animation-timing-function: step-end`, so each
 * frame holds for 1/6s and then snaps to the next one with nothing in between.
 */
export function cityKeyframesCss(): string {
  return BUILDINGS.map((b) => {
    const frames = framePoses(b)
      .map((pose, i) => `${round((i / CITY_FRAMES) * 10000) / 100}%{${boxDeclarations(b, pose)}}`)
      .join('')
    return `@keyframes city-${b.id}{${frames}}`
  }).join('\n')
}

/**
 * Tram bounce: 800ms, one full bop (0 → up → down → 0) cut into 5 frames of 160ms (6.25fps).
 * Frames sample a sine wave at 0, 20, 40, 60 and 80% of the bop, with the same ±4px amplitude
 * as before, scaled with the scene.
 */
export const TRAM_BOUNCE_MS = 800
export const TRAM_BOUNCE_AMPLITUDE_PX = 4
const TRAM_FRAMES = 5

export function tramKeyframesCss(): string {
  const frames = Array.from({ length: TRAM_FRAMES }, (_, i) => {
    const offset = -TRAM_BOUNCE_AMPLITUDE_PX * Math.sin((2 * Math.PI * i) / TRAM_FRAMES)
    return `${(i / TRAM_FRAMES) * 100}%{transform:translateY(calc(${round(offset)}px * var(--s)))}`
  }).join('')
  return `@keyframes tram-bounce{${frames}}`
}
