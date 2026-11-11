import Link from 'next/link'
import { sideQuests } from '@/lib/data'
import { SideQuestCard } from '@/components/ui/SideQuestCard'

interface SideQuestsProps {
  /** Cap the number of items shown. Omit to show all. */
  limit?: number
  /** Show the "View more" link (home page only) */
  showViewMore?: boolean
  /** Show the "Side Quests" title and subtitle. Hidden on the playground page, which has its own. */
  showHeader?: boolean
}

export function SideQuests({ limit, showViewMore = false, showHeader = true }: SideQuestsProps) {
  const items = limit ? sideQuests.slice(0, limit) : sideQuests

  return (
    <section className="max-w-[1600px] mx-auto px-6 md:px-12 py-20">
      {/* Section header */}
      {showHeader && (
        <div className="flex flex-col items-center gap-3 mb-12">
          <h2 className="text-heading text-[var(--color-black-50)]">Side Quests</h2>
          <p className="text-body text-[var(--color-text-secondary)] text-center">
            Experiments, more classroom projects and super fun-stuff
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((project) => (
          <SideQuestCard key={project.id} project={project} />
        ))}
      </div>

      {/* View more link — home page only */}
      {showViewMore && (
        <div className="flex justify-center mt-12">
          <Link
            href="/playground"
            className="link-sweep flex items-center gap-2 text-body text-[var(--color-primary-500)]"
          >
            View more
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3L13 8L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 8H13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </Link>
        </div>
      )}
    </section>
  )
}
