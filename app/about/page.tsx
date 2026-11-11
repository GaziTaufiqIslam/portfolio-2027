import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Gazi Taufiq',
  description: 'Product Designer and UI Engineer based in India.',
}

export default function AboutPage() {
  return (
    <div className="max-w-[1500px] mx-auto px-6 md:px-12 py-24 flex items-center justify-center min-h-[60vh]">
      <div className="text-center flex flex-col gap-4">
        <h1 className="text-title text-[var(--color-black-50)]">About</h1>
        <p className="text-subheading text-[var(--color-text-secondary)]">
          Coming soon — design in progress.
        </p>
      </div>
    </div>
  )
}
