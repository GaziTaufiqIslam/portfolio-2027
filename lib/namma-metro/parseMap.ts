// Pure parser for the exported Purple Line SVG parts. Reads station positions
// by `data-station`, so the map itself is never redrawn.

export interface MapStation {
  /** centre of the marker, in the SVG's own coordinates */
  cx: number
  cy: number
  /** marker bounding box, stroke included */
  w: number
  h: number
}

/** Interchange line. In the exports these are always vertical (x1 === x2). */
export interface MapStub {
  x: number
  y1: number
  y2: number
  colour: string
}

export interface ParsedMap {
  viewBox: { x: number; y: number; w: number; h: number }
  /** SVG markup between <svg> and </svg> */
  inner: string
  stations: Record<string, MapStation>
  stubs: MapStub[]
}

const attr = (tag: string, name: string): string | undefined =>
  new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1]

const num = (tag: string, name: string): number => Number(attr(tag, name) ?? NaN)

const PURPLE = '#a753fa'

export function parseMap(svg: string): ParsedMap {
  const open = /<svg\b[^>]*>/.exec(svg)
  if (!open) throw new Error('Not an SVG')
  const vb = /viewBox="([^"]+)"/.exec(open[0])?.[1].trim().split(/\s+/).map(Number)
  if (!vb || vb.length !== 4 || vb.some(Number.isNaN)) throw new Error('Missing viewBox')
  const end = svg.lastIndexOf('</svg>')
  const inner = svg.slice(open.index + open[0].length, end).trim()

  const stations: Record<string, MapStation> = {}
  const stubs: MapStub[] = []

  for (const m of inner.matchAll(/<(circle|rect|line)\b[^>]*\/?>/g)) {
    const tag = m[0]
    const kind = m[1]
    const id = attr(tag, 'data-station')
    if (kind === 'circle' && id) {
      const r = num(tag, 'r')
      const sw = num(tag, 'stroke-width') || 0
      const d = (r + sw / 2) * 2
      stations[id] = { cx: num(tag, 'cx'), cy: num(tag, 'cy'), w: d, h: d }
    } else if (kind === 'rect' && id) {
      const x = num(tag, 'x')
      const y = num(tag, 'y')
      const w = num(tag, 'width')
      const h = num(tag, 'height')
      const sw = num(tag, 'stroke-width') || 0
      stations[id] = { cx: x + w / 2, cy: y + h / 2, w: w + sw, h: h + sw }
    } else if (kind === 'line') {
      const x1 = num(tag, 'x1')
      const x2 = num(tag, 'x2')
      const colour = (attr(tag, 'stroke') ?? '').toLowerCase()
      if (x1 === x2 && colour && colour !== PURPLE) {
        stubs.push({
          x: x1,
          y1: Math.min(num(tag, 'y1'), num(tag, 'y2')),
          y2: Math.max(num(tag, 'y1'), num(tag, 'y2')),
          colour,
        })
      }
    }
  }

  return { viewBox: { x: vb[0], y: vb[1], w: vb[2], h: vb[3] }, inner, stations, stubs }
}
