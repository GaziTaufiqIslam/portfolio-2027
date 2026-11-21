const missing = new Set<string>()

/** Plays a short sound effect. Stays quiet if the file is missing or the browser blocks audio. */
export function playSound(src: string, volume = 0.8) {
  if (missing.has(src)) return
  try {
    const audio = new Audio(src)
    audio.volume = volume
    audio.addEventListener('error', () => missing.add(src), { once: true })
    audio.play().catch(() => {})
  } catch {
    // no audio support
  }
}
