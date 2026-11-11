import Image from 'next/image'
import { Chip } from '@/components/ui/Chip'
import type { WorkProject } from '@/lib/data'

export function WorkHero({ project }: { project: WorkProject }) {
  return (
    <div
      className="w-full border-b border-[var(--color-accent-200)] py-16 lg:py-20"
      style={{ borderBottomWidth: '0.6px' }}
    >
      <div className="max-w-[1500px] mx-auto px-6 md:px-12 flex flex-col gap-10">
        {/* Title + image */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          {/* Text */}
          <div className="flex flex-col gap-6 w-full lg:w-[772px]">
            <h1 className="text-title text-[var(--color-black-50)]">
              {project.title}
            </h1>
            <p className="text-subheading text-[var(--color-text-secondary)]">
              {project.subtitle}
            </p>
          </div>

          {/* Hero image */}
          <div className="relative w-full lg:w-[485px] h-[280px] lg:h-[363px] rounded-lg overflow-hidden shrink-0">
            <Image
              src={project.heroImage}
              alt={project.title}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 485px"
            />
          </div>
        </div>

        {/* Keyword chips */}
        <div className="flex flex-wrap gap-4 justify-center">
          {project.chips.map((chip) => (
            <Chip key={chip.label} label={chip.label} size="large" />
          ))}
        </div>
      </div>
    </div>
  )
}
