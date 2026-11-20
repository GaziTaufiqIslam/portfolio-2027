import { readFileSync } from 'fs'
import path from 'path'
import config from './game.config.json'
import { parseMap, type ParsedMap } from './parseMap'

/** Reads the exported SVG parts at build time, so the page stays fully static. */
export function loadMaps(): ParsedMap[] {
  return config.parts.map((part) =>
    parseMap(readFileSync(path.join(process.cwd(), 'public', part.svg), 'utf8'))
  )
}
