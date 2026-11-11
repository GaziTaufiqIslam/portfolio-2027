import type { Metadata } from 'next'
import { SideQuests } from '@/components/sections/SideQuests'

export const metadata: Metadata = {
  title: 'Playground / All Side Quests — Gazi Taufiq',
  description: 'Experiments, more classroom projects and super fun-stuff.',
}

export default function PlaygroundPage() {
  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 pt-16">
      {/* Page title */}
      <div className="flex flex-col items-center gap-3 mb-4">
        <h1 className="text-title text-[var(--color-black-50)] text-center">
          Playground / All Side Quests
        </h1>
        <p className="text-body text-[var(--color-text-secondary)] text-center">
          Experiments, more classroom projects and super fun-stuff
        </p>
      </div>

      {/* Full grid — no limit, no "view more" */}
      <SideQuests showHeader={false} />
    </div>
  )
}
