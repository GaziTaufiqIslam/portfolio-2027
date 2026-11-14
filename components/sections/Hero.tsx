import Image from 'next/image'
import { Chip } from '@/components/ui/Chip'

const keywords = [
  'Design Engineer',
  'SaaS',
  'B2B',
  'AI-Native',
  'D2C / Retail',
  'M.Des + B.Tech',
]

export function Hero() {
  return (
    // xl and up: no fixed height. The section is as tall as its content plus 4vh above and below.
    <section className="max-w-[1600px] mx-auto px-6 md:px-12 py-16 lg:py-0 lg:min-h-[520px] xl:min-h-0 xl:py-[4vh] flex items-center">
      <div className="w-full flex flex-col lg:flex-row gap-10 items-center justify-between">

        {/* Left — text */}
        <div className="flex flex-col gap-12 w-full lg:w-[888px]">
          {/* Title block */}
          <div className="flex flex-col gap-6">
            {/* Overline */}
            <div className="flex items-center gap-2">
              <span className="text-small text-[var(--color-text-secondary)]">
                Currently designing Hospitality @
              </span>
              <div className="relative h-4 w-24 inline-block">
                <Image
                  src="/images/logo/amadeus-logo.svg"
                  alt="Amadeus"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </div>

            {/* Main headline */}
            <h1 className="text-title text-[var(--color-black-50)]">
              Product designer working in{' '}
              <span className="text-[var(--color-accent-500)]">B2B SaaS</span>{' '}
              (Hospitality) with a Masters from NID, shipping{' '}
              <span className="text-[var(--color-accent-500)]">semantic HTML/CSS/JS</span>{' '}
              years before AI coding
            </h1>
          </div>

          {/* Keyword chips */}
          <div className="flex flex-wrap gap-4">
            {keywords.map((kw) => (
              <Chip key={kw} label={kw} size="large" />
            ))}
          </div>
        </div>

        {/* Right — hero photo (placeholder, custom illustration coming soon) */}
        <div className="shrink-0 relative w-[320px] h-[380px] 2xl:mr-16">
          <Image
            src="/images/hero-photo.png"
            alt="Gazi Taufiq"
            fill
            className="object-cover"
            sizes="320px"
            priority
          />
        </div>
      </div>
    </section>
  )
}
