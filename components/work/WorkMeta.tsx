import Image from 'next/image'
import type { WorkProject } from '@/lib/data'

export function WorkMeta({ project }: { project: WorkProject }) {
  const { meta, org, orgLogo } = project

  return (
    // pr-6 matches the gap-6 between the columns, so the tools icons don't touch the right edge
    <div className="flex flex-wrap gap-6 pr-6 py-6 border-b border-[var(--color-border-tertiary)]/30">
      {/* Columns share the row by flex ratio (company 2, industry 2, role 3, timeline 1,
          tools 2). min-w-28 only decides when a column drops to a new row on narrow screens. */}

      {/* Company */}
      <div className="flex flex-[2] min-w-28 flex-col gap-2">
        <span className="text-body text-[var(--color-text-secondary)]">For</span>
        <div className="relative h-[30px] w-[168px] max-w-full">
          <Image src={orgLogo} alt={org} fill className="object-contain object-left" />
        </div>
      </div>

      {/* Industry */}
      <div className="flex flex-[2] min-w-28 flex-col gap-2">
        <span className="text-body text-[var(--color-text-secondary)]">Industry</span>
        <span className="text-body-strong text-[var(--color-black-50)]">{meta.industry}</span>
      </div>

      {/* Role */}
      <div className="flex flex-[2] min-w-28 flex-col gap-2">
        <span className="text-body text-[var(--color-text-secondary)]">Role</span>
        <span className="text-body-strong text-[var(--color-black-50)] whitespace-pre-line">{meta.role}</span>
      </div>

      {/* Timeline */}
      <div className="flex flex-1 min-w-28 flex-col gap-2">
        <span className="text-body text-[var(--color-text-secondary)]">Timeline</span>
        <span className="text-body-strong text-[var(--color-black-50)]">{meta.timeline}</span>
      </div>

      {/* Tools: the icons wrap onto new lines inside whatever width this column gets. */}
      <div className="flex flex-[3] min-w-28 flex-col gap-3">
        <span className="text-body text-[var(--color-text-secondary)]">Tools</span>
        {/* The tool icons are full 48px tiles with their own rounded corners and colours,
            so they fill the box with no extra frame or padding. */}
        <div className="flex flex-wrap gap-3">
          {meta.tools.map((tool) => (
            <div key={tool.name} className="relative size-12 rounded-[10px] overflow-hidden">
              <Image
                src={tool.icon}
                alt={tool.name}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
