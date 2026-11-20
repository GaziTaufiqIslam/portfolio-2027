import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  buildOptions,
  checkAnswer,
  fillTemplate,
  formatDuration,
  maxScore,
  mulberry32,
  partScore,
  shuffle,
  totalScore,
  type Part,
  type PartResult,
  type Station,
} from './logic.ts'
import { parseMap } from './parseMap.ts'

const config = JSON.parse(readFileSync(new URL('./game.config.json', import.meta.url), 'utf8'))
const stations: Station[] = config.stations
const parts: Part[] = config.parts
const scoring = config.scoring

test('config: 16 stations, 5 parts, each hidden station is in its part', () => {
  assert.equal(stations.length, 16)
  assert.equal(parts.length, 5)
  const ids = new Set(stations.map((s) => s.id))
  for (const p of parts) {
    assert.ok(p.stationIds.includes(p.hiddenId))
    for (const id of p.stationIds) assert.ok(ids.has(id), id)
  }
  assert.equal(parts.flatMap((p) => p.stationIds).length, 16)
})

test('config: every station id exists in its SVG part', () => {
  for (const p of parts) {
    const map = parseMap(readFileSync(new URL(`../../public${p.svg}`, import.meta.url), 'utf8'))
    for (const id of p.stationIds) assert.ok(map.stations[id], `${id} in ${p.svg}`)
  }
})

test('shuffle keeps all items and does not mutate the input', () => {
  const input = [1, 2, 3, 4, 5]
  const out = shuffle(input, mulberry32(7))
  assert.deepEqual([...out].sort(), input)
  assert.deepEqual(input, [1, 2, 3, 4, 5])
})

test('buildOptions: 4 unique options, correct one included, no same-part stations', () => {
  for (const part of parts) {
    for (let seed = 1; seed <= 25; seed++) {
      const opts = buildOptions(part, stations, 4, mulberry32(seed))
      assert.equal(opts.length, 4)
      assert.equal(new Set(opts).size, 4)
      assert.ok(opts.includes(part.hiddenId))
      for (const id of opts) {
        if (id !== part.hiddenId) assert.ok(!part.stationIds.includes(id))
      }
    }
  }
})

test('buildOptions: order changes with the seed', () => {
  const orders = new Set(
    Array.from({ length: 20 }, (_, i) => buildOptions(parts[0], stations, 4, mulberry32(i)).join())
  )
  assert.ok(orders.size > 1)
})

test('checkAnswer', () => {
  assert.equal(checkAnswer(parts[0], 'majestic'), true)
  assert.equal(checkAnswer(parts[0], 'ksr'), false)
})

test('partScore: penalties, floor at 0, unsolved is 0', () => {
  const r = (wrong: number, hints: number, solved = true): PartResult => ({ wrong, hints, solved })
  assert.equal(partScore(r(0, 0), scoring), 100)
  assert.equal(partScore(r(2, 0), scoring), 60)
  assert.equal(partScore(r(1, 1), scoring), 50)
  assert.equal(partScore(r(9, 3), scoring), 0)
  assert.equal(partScore(r(0, 0, false), scoring), 0)
})

test('totalScore and maxScore', () => {
  const results: PartResult[] = [
    { wrong: 0, hints: 0, solved: true },
    { wrong: 1, hints: 0, solved: true },
    { wrong: 0, hints: 1, solved: true },
    { wrong: 0, hints: 0, solved: true },
    { wrong: 0, hints: 0, solved: true },
  ]
  assert.equal(totalScore(results, scoring), 100 + 80 + 70 + 100 + 100)
  assert.equal(maxScore(5, scoring), 500)
})

test('formatDuration', () => {
  assert.equal(formatDuration(42_000), '42s')
  assert.equal(formatDuration(65_000), '1m 05s')
  assert.equal(formatDuration(-5), '0s')
})

test('fillTemplate replaces known keys and leaves unknown ones', () => {
  assert.equal(fillTemplate('Play: {GAME_URL} {x}', { GAME_URL: 'https://a.b' }), 'Play: https://a.b {x}')
})

test('parseMap reads stations, interchange lines and viewBox', () => {
  const p1 = parseMap(readFileSync(new URL('../../public/images/apps/namma-metro/purple-line-part-1.svg', import.meta.url), 'utf8'))
  assert.deepEqual(p1.viewBox, { x: 40, y: 50, w: 205, h: 150 })
  assert.equal(p1.stubs.length, 1)
  assert.equal(p1.stubs[0].colour, '#94fa72')
  assert.equal(p1.stations['majestic'].cx, 132.5)
  assert.equal(p1.stations['ksr'].cy, 153)
})
