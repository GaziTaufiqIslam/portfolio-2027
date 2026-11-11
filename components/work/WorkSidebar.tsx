'use client'

import { useEffect, useState } from 'react'

interface SidebarLink {
  label: string
  anchor: string
}

export function WorkSidebar({ links }: { links: SidebarLink[] }) {
  const [active, setActive] = useState<string>(links[0]?.anchor ?? '')

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    links.forEach(({ anchor }) => {
      const el = document.getElementById(anchor)
      if (!el) return

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(anchor)
        },
        // Trigger when section enters the top 30% of viewport
        { rootMargin: '-10% 0px -60% 0px' }
      )
      obs.observe(el)
      observers.push(obs)
    })

    return () => observers.forEach((obs) => obs.disconnect())
  }, [links])

  return (
    <aside
      className="hidden lg:flex flex-col justify-center gap-4 sticky top-0 h-screen w-[252px] shrink-0 pl-12"
      aria-label="Page sections"
    >
      {links.map(({ label, anchor }) => (
        <a
          key={anchor}
          href={`#${anchor}`}
          className={`link-sweep self-start text-body transition-colors ${
            active === anchor
              ? 'text-[var(--color-primary-500)] font-semibold'
              : 'text-[var(--color-text-default)] hover:text-[var(--color-primary-500)]'
          }`}
        >
          {label}
        </a>
      ))}
    </aside>
  )
}
