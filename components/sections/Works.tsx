import { workProjects } from '@/lib/data'
import { WorkCard } from '@/components/ui/WorkCard'

export function Works() {
  return (
    <section id="works" className="max-w-[1600px] mx-auto px-6 md:px-12 py-20">
      {/* Section header */}
      <div className="flex flex-col items-center gap-3 mb-16">
        <h2 className="text-heading text-[var(--color-black-50)]">Work</h2>
        <p className="text-body text-[var(--color-text-secondary)] text-center">
          Case studies? we don&apos;t do that here, just have fun.
        </p>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-20">
        {workProjects.map((project) => (
          <WorkCard key={project.slug} project={project} variant="full" />
        ))}
      </div>
    </section>
  )
}
