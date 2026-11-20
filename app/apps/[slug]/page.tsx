import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { apps, getApp } from '@/lib/apps'

type Props = { params: Promise<{ slug: string }> }

export const dynamicParams = false

export function generateStaticParams() {
  return apps.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const app = getApp((await params).slug)
  if (!app) return {}
  const title = `${app.title} — Gazi Taufiq`
  return {
    title,
    description: app.description,
    openGraph: { title, description: app.description, type: 'website' },
  }
}

export default async function AppPage({ params }: Props) {
  const app = getApp((await params).slug)
  if (!app) notFound()

  return (
    <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-24 flex flex-col items-center gap-3 text-center">
      <h1 className="text-title text-[var(--color-black-50)]">{app.title}</h1>
      <p className="text-body text-[var(--color-text-secondary)]">{app.description}</p>
      {app.status === 'coming-soon' && (
        <p className="mt-6 px-4 py-2 rounded-full border border-[var(--color-primary-200)] bg-[var(--color-primary-100)] text-[var(--color-primary-500)] text-body">
          Game coming soon
        </p>
      )}
    </div>
  )
}
