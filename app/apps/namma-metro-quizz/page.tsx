import type { Metadata, Viewport } from 'next'
import { Game } from '@/components/apps/namma-metro/Game'
import { loadMaps } from '@/lib/namma-metro/loadMaps'

const title = "Be in the User's Shoes — Namma Metro Quizz"
const description =
  'Guess the cryptic Namma Metro station codes on the Purple Line and feel how users feel about unclear error messages.'

export const metadata: Metadata = {
  title,
  description,
  openGraph: { title, description, type: 'website' },
}

// viewport-fit=cover makes env(safe-area-inset-*) work on notched phones
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function NammaMetroQuizzPage() {
  return <Game maps={loadMaps()} />
}
