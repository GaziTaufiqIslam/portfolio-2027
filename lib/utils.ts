import { workProjects, type WorkProject } from './data'

/** Merge class names (lightweight cn helper, no clsx dependency needed) */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

/** Sidebar (scrollspy) links for a work page, in body order. Only images with a `nav` get one. */
export function getSidebarLinks(project: WorkProject): { label: string; anchor: string }[] {
  return project.bodyImages.flatMap((image) => (image.nav ? [image.nav] : []))
}

/** Returns the next project in circular order */
export function getNextProject(currentSlug: string): WorkProject {
  const index = workProjects.findIndex((p) => p.slug === currentSlug)
  const nextIndex = (index + 1) % workProjects.length
  return workProjects[nextIndex]
}
