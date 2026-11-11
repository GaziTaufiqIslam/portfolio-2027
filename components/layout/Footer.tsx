import Image from 'next/image'

const footerLinks = [
  { label: 'Work',       href: '/#works',    anchor: true,  external: false },
  { label: 'About',      href: '/about',     anchor: false, external: false },
  { label: 'Playground', href: '/playground',anchor: false, external: false },
  { label: 'Resume',     href: 'https://drive.google.com/file/d/1a1hiRMZJu955zxc7DqEk06V9PeeVB-hX/view?usp=sharing', anchor: false, external: true },
  { label: 'Contact',    href: '/#contact',  anchor: true,  external: false },
]

export function Footer() {
  return (
    <footer className="bg-[var(--color-bg)] border-t border-[var(--color-primary-200)]/30">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1">
            <div className="relative h-[65px] w-[169px] shrink-0">
              <Image
                src="/images/logo/wordmark.svg"
                alt="Gazi Taufiq"
                fill
                className="object-contain object-left"
              />
            </div>
            <span className="text-body text-[var(--color-text-secondary)]">©2026</span>
          </div>
          <p className="text-body text-[var(--color-text-secondary)]">
            Designed and coded with chowmein &amp; chaa-biskut
          </p>
        </div>

        {/* Nav links */}
        <nav aria-label="Footer navigation">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map(({ label, href, anchor, external }) => (
              <li key={label}>
                <a
                  href={href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noopener noreferrer' : undefined}
                  className="link-sweep text-body text-[var(--color-text-default)] hover:text-[var(--color-primary-500)] transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  )
}
