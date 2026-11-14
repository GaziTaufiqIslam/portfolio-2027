import Image from 'next/image'
import Link from 'next/link'
import { Chip } from './Chip'
import type { WorkProject } from '@/lib/data'

interface WorkCardProps {
  project: WorkProject
  /**
   * "full"    — home page card: overline · title · body · hook · chips · image
   * "minimal" — work page "View next" card: overline · title · chips · image
   */
  variant?: 'full' | 'minimal'
}

export function WorkCard({ project, variant = 'full' }: WorkCardProps) {
  if (variant === 'minimal') {
    return (
      <Link
        href={`/work/${project.slug}`}
        className="group flex gap-6 items-center p-6 border border-[var(--color-primary-200)] rounded-2xl w-full hover:border-[var(--color-primary-500)] hover:bg-[var(--color-white)] transition-colors duration-300"
      >
        {/* Text */}
        <div className="flex flex-col gap-8 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-small-strong text-[var(--color-black-50)]">{project.overline}</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-border-tertiary)]" />
            <div className="relative h-5 w-24 shrink-0">
              <Image src={project.orgLogo} alt={project.org} fill className="object-contain object-left" />
            </div>
          </div>
          <h3 className="text-heading text-[var(--color-black-50)] group-hover:text-[var(--color-primary-500)] transition-colors">
            {project.title}
          </h3>
          <div className="flex flex-wrap gap-3">
            {project.chips.slice(0, 5).map((chip) => (
              <Chip key={chip.label} label={chip.label} size="small" />
            ))}
          </div>
        </div>

        {/* Thumbnail */}
        <div className="relative w-[280px] h-[180px] rounded-lg overflow-hidden shrink-0 hidden md:block">
          <Image src={project.heroImage} alt={project.title} fill className="object-cover" sizes="280px" quality={70} />
        </div>
      </Link>
    )
  }

  // ── Full variant (home page) ───────────────────────────────────────────────
  return (
    <Link href={`/work/${project.slug}`} className="group block w-full">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10 w-full border border-transparent hover:border-[var(--color-primary-200)] hover:bg-[var(--color-white)] hover:shadow-soft rounded-2xl p-6 transition-all duration-300">

        {/* Text column — fills available space, max 80% at 2xl+ */}
        <div className="flex flex-col gap-8 w-full lg:flex-1 lg:min-w-0 2xl:max-w-[80%]">

          {/* Overline: type · dot · org logo */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="text-[var(--color-black-50)] whitespace-nowrap"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '14px', lineHeight: 1.4 }}
            >
              {project.overline}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-border-tertiary)]" />
            <div className="relative h-5 w-28 shrink-0">
              <Image src={project.orgLogo} alt={project.org} fill className="object-contain object-left" />
            </div>
          </div>

          {/* Body block: title + description + hook */}
          <div className="flex flex-col gap-6">
            {/* Title — 24px Medium */}
            <h3
              className="text-[var(--color-black-50)] group-hover:text-[var(--color-primary-500)] transition-colors"
              style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '24px', lineHeight: 1.2, letterSpacing: '-0.48px' }}
            >
              {project.title}
            </h3>

            {/* Body paragraph — 16px Roman */}
            {project.body && (
              <p
                className="text-[var(--color-text-default)]"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '16px', lineHeight: 1.4, letterSpacing: '-0.16px' }}
              >
                {project.body}
              </p>
            )}

            {/* Hook line — 14px Roman */}
            {project.hook && (
              <p
                className="text-[var(--color-text-default)]"
                style={{ fontFamily: 'var(--font-body)', fontWeight: 400, fontSize: '14px', lineHeight: 1.4 }}
              >
                {project.hook}
              </p>
            )}
          </div>

          {/* Chips — gap-16px per Figma */}
          <div className="flex flex-wrap gap-4">
            {project.chips.map((chip) => (
              <Chip key={chip.label} label={chip.label} size="small" />
            ))}
          </div>
        </div>

        {/* Image — proportional width, capped at 486px */}
        <div className="relative w-full lg:w-[38%] lg:max-w-[486px] h-[240px] lg:h-[364px] rounded-lg overflow-hidden shrink-0">
          <Image
            src={project.heroImage}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 486px"
            quality={70}
          />
        </div>
      </div>
    </Link>
  )
}
