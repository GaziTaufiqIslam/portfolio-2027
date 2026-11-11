import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { workProjects } from '@/lib/data'
import { getNextProject, getSidebarLinks } from '@/lib/utils'
import { WorkHero } from '@/components/work/WorkHero'
import { WorkMeta } from '@/components/work/WorkMeta'
import { WorkSidebar } from '@/components/work/WorkSidebar'
import { WorkMain } from '@/components/work/WorkMain'
import { ViewNextWork } from '@/components/work/ViewNextWork'

interface Params {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return workProjects.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const project = workProjects.find((p) => p.slug === slug)
  if (!project) return {}
  return {
    title: `${project.title} — Gazi Taufiq`,
    description: project.subtitle,
  }
}

export default async function WorkPage({ params }: Params) {
  const { slug } = await params
  const project = workProjects.find((p) => p.slug === slug)
  if (!project) notFound()

  const nextProject = getNextProject(project.slug)

  return (
    <>
      {/* Full-width hero */}
      <WorkHero project={project} />

      {/* Two-column layout: sidebar + main */}
      <div className="max-w-[1600px] mx-auto relative flex">
        {/* Sidebar starts right where the hero ends, beside the metadata */}
        <WorkSidebar links={getSidebarLinks(project)} />

        {/* Right column: metadata, then the images, then "view next" */}
        <div className="flex-1 min-w-0">
          <div className="px-6 md:px-9">
            <WorkMeta project={project} />
          </div>

          <WorkMain project={project} />

          {/* View next project */}
          <div className="px-6 md:px-9 border-t border-[var(--color-border-tertiary)]/30">
            <ViewNextWork project={nextProject} />
          </div>
        </div>
      </div>
    </>
  )
}
