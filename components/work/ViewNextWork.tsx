import { WorkCard } from '@/components/ui/WorkCard'
import type { WorkProject } from '@/lib/data'

export function ViewNextWork({ project }: { project: WorkProject }) {
  return (
    <div className="py-16 flex flex-col gap-6">
      {/* Label */}
      <div className="flex items-center gap-2">
        <span className="text-body text-[var(--color-primary-500)]">View next project</span>
        <svg
          width="16" height="16" viewBox="0 0 16 16" fill="none"
          className="rotate-90 text-[var(--color-primary-500)]" aria-hidden="true"
        >
          <path
            d="M8 3L8 13M8 3L4 7M8 3L12 7"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
      </div>

      <WorkCard project={project} variant="minimal" />
    </div>
  )
}
