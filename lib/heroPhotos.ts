import fs from 'node:fs'
import path from 'node:path'

/**
 * The photos that cycle inside the hero polaroids. Server-side only (it reads the disk).
 *
 * Files live in public/images/hero and are named `polaroid-<group>--<number>.png`, matching the
 * Figma layers: polaroid-1--01 … polaroid-1--04, polaroid-2--01 …, polaroid-3--01 …
 * Group 1 is the first polaroid in the stack, group 2 the second, group 3 the third.
 *
 * Only files that exist are returned, in number order. A group with one photo just shows it,
 * and a group with none leaves an empty polaroid. Adding a file to the folder is all it takes
 * to add a photo to the cycle.
 */
export function getHeroPhotoGroups(groupCount = 3): string[][] {
  const groups: { n: number; src: string }[][] = Array.from({ length: groupCount }, () => [])

  let names: string[] = []
  try {
    names = fs.readdirSync(path.join(process.cwd(), 'public/images/hero'))
  } catch {
    return groups.map(() => [])
  }

  for (const name of names) {
    const match = /^polaroid-(\d+)--(\d+)\.(png|jpe?g|webp|avif)$/i.exec(name)
    if (!match) continue
    const group = Number(match[1]) - 1
    if (group >= 0 && group < groupCount) groups[group].push({ n: Number(match[2]), src: `/images/hero/${name}` })
  }

  return groups.map((list) => list.sort((a, b) => a.n - b.n).map((p) => p.src))
}
