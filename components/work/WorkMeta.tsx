import Image from 'next/image'
import type { WorkProject } from '@/lib/data'

export function WorkMeta({ project }: { project: WorkProject }) {
  const { meta, org, orgLogo } = project

  return (
    <div className="flex flex-wrap gap-6 py-6 border-b border-[var(--color-border-tertiary)]/30">
      {/* Company */}
      <div className="flex flex-col gap-2 w-[160px]">
        <span className="text-body text-[var(--color-text-secondary)]">For</span>
        <div className="relative h-5 w-28">
          <Image src={orgLogo} alt={org} fill className="object-contain object-left" />
        </div>
      </div>

      {/* Industry */}
      <div className="flex flex-col gap-2 w-[160px]">
        <span className="text-body text-[var(--color-text-secondary)]">Industry</span>
        <span className="text-body-strong text-[var(--color-black-50)]">{meta.industry}</span>
      </div>

      {/* Role */}
      <div className="flex flex-col gap-2 w-[260px]">
        <span className="text-body text-[var(--color-text-secondary)]">Role</span>
        <span className="text-body-strong text-[var(--color-black-50)] whitespace-pre-line">{meta.role}</span>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-2 w-[100px]">
        <span className="text-body text-[var(--color-text-secondary)]">Timeline</span>
        <span className="text-body-strong text-[var(--color-black-50)]">{meta.timeline}</span>
      </div>

      {/* Tools */}
      <div className="flex flex-col gap-3">
        <span className="text-body text-[var(--color-text-secondary)]">Tools</span>
        <div className="flex gap-3">
          {meta.tools.map((tool) => (
            <div
              key={tool.name}
              className="relative size-12 rounded-[10px] overflow-hidden border border-[var(--color-border-tertiary)]/40 bg-[var(--color-white)]"
            >
              <Image
                src={tool.icon}
                alt={tool.name}
                fill
                className="object-contain p-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
