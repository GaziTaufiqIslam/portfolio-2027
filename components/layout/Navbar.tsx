'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

const navLinks = [
  { label: 'Work',       href: '/#works',    anchor: true,  external: false },
  { label: 'About',      href: '/about',     anchor: false, external: false },
  { label: 'Playground', href: '/playground',anchor: false, external: false },
  { label: 'Resume',     href: 'https://drive.google.com/file/d/1a1hiRMZJu955zxc7DqEk06V9PeeVB-hX/view?usp=sharing', anchor: false, external: true },
  { label: 'Contact',    href: '/#contact',  anchor: true,  external: false },
]

/** The compact bar never appears until the page has scrolled past this many px. */
const SCROLL_THRESHOLD = 100
/** Ignore scroll movements smaller than this, so the bar doesn't flicker. */
const SCROLL_DELTA = 8

type BarName = 'tall' | 'compact'
type NavLinkData = (typeof navLinks)[number]

function NavLink({ link, className, onClick }: { link: NavLinkData; className: string; onClick?: () => void }) {
  const { label, href, anchor, external } = link
  // Anchor and external links are plain <a> tags (full navigation); the rest use client-side routing.
  if (anchor || external) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
        className={className}
        onClick={onClick}
      >
        {label}
      </a>
    )
  }
  return (
    <Link href={href} className={className} onClick={onClick}>
      {label}
    </Link>
  )
}

function Hamburger({ open, onClick }: { open: boolean; onClick: () => void }) {
  return (
    <button
      className="md:hidden flex flex-col gap-1.5 p-2"
      aria-label="Toggle menu"
      aria-expanded={open}
      onClick={onClick}
    >
      <span className={`block h-0.5 w-6 bg-[var(--color-black-50)] transition-transform duration-200 ${open ? 'rotate-45 translate-y-2' : ''}`} />
      <span className={`block h-0.5 w-6 bg-[var(--color-black-50)] transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
      <span className={`block h-0.5 w-6 bg-[var(--color-black-50)] transition-transform duration-200 ${open ? '-rotate-45 -translate-y-2' : ''}`} />
    </button>
  )
}

export function Navbar() {
  const pathname = usePathname()
  // The compact bar is visible only while scrolling up, past SCROLL_THRESHOLD.
  const [showCompact, setShowCompact] = useState(false)
  // Which bar's mobile menu is open (each bar has its own).
  const [openMenu, setOpenMenu] = useState<BarName | null>(null)

  useEffect(() => {
    let lastY = window.scrollY
    let frame = 0

    function update() {
      frame = 0
      const y = window.scrollY

      // Near the top the tall bar is on screen, so the compact one stays away.
      if (y <= SCROLL_THRESHOLD) {
        lastY = y
        setShowCompact(false)
        return
      }

      const delta = y - lastY
      if (Math.abs(delta) < SCROLL_DELTA) return // too small to count as a direction change
      lastY = y

      if (delta < 0) {
        setShowCompact(true) // scrolling up: slide down into view
      } else {
        setShowCompact(false) // scrolling down: slide away
        setOpenMenu((open) => (open === 'compact' ? null : open))
      }
    }

    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    // Refreshing mid-page starts hidden; the bar returns on the first scroll up.
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  function isActive(href: string) {
    if (href.startsWith('/#')) return false
    return pathname === href
  }

  function desktopClass(href: string) {
    return `link-sweep text-body transition-colors duration-200 ${
      isActive(href)
        ? 'text-[var(--color-primary-500)] font-semibold'
        : 'text-[var(--color-black-50)] hover:text-[var(--color-primary-500)]'
    }`
  }

  function toggleMenu(bar: BarName) {
    setOpenMenu((open) => (open === bar ? null : bar))
  }

  function renderLinks() {
    return (
      <ul className="hidden md:flex items-center gap-6">
        {navLinks.map((link) => (
          <li key={link.label}>
            <NavLink link={link} className={desktopClass(link.href)} />
          </li>
        ))}
      </ul>
    )
  }

  function renderMobileMenu(bar: BarName) {
    return (
      <div
        className={[
          // Hangs below its bar so it never pushes the page content down
          'md:hidden absolute top-full left-0 right-0 bg-[var(--color-bg)] border-t border-[var(--color-primary-200)]/30 overflow-hidden',
          'transition-all duration-300 ease-in-out',
          openMenu === bar ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <ul className="flex flex-col gap-4 px-6 py-4">
          {navLinks.map((link) => (
            <li key={link.label}>
              <NavLink
                link={link}
                className="text-body text-[var(--color-black-50)]"
                onClick={() => setOpenMenu(null)}
              />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <>
      {/* ── Tall bar: part of the page, scrolls away with it ─────────────── */}
      <header className="relative z-40 h-[120px] w-full">
        <nav
          aria-label="Primary"
          className="max-w-[1600px] mx-auto px-12 h-full flex items-center justify-between"
        >
          <a href="/" className="flex flex-row items-center gap-4 shrink-0">
            {/* Full wordmark */}
            <div className="relative h-[56px] w-[159px] shrink-0 overflow-hidden">
              <Image
                src="/images/logo/wordmark.svg"
                alt="Gazi Taufiq"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            {/* Tagline — Text Pro 55 Roman 24px dark */}
            <span
              className="text-[var(--color-grey-900)] whitespace-nowrap hidden sm:block"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontSize: '24px',
                lineHeight: 1.2,
                letterSpacing: '-0.48px',
              }}
            >
              Product Designer | UI Engineer
            </span>
          </a>

          {renderLinks()}
          <Hamburger open={openMenu === 'tall'} onClick={() => toggleMenu('tall')} />
        </nav>
        {renderMobileMenu('tall')}
      </header>

      {/* ── Compact bar: fixed, slides in when scrolling up ──────────────── */}
      <header
        // `inert` keeps the hidden bar out of the tab order and the accessibility tree.
        inert={!showCompact}
        className={[
          'fixed top-0 left-0 right-0 z-50 h-[80px] w-full',
          'bg-[var(--color-bg)] shadow-soft',
          'transition-transform duration-300 ease-in-out',
          // 110% (not 100%) so the shadow doesn't peek out below the screen edge
          showCompact ? 'translate-y-0' : '-translate-y-[110%]',
        ].join(' ')}
      >
        <nav
          aria-label="Primary (sticky)"
          className="max-w-[1600px] mx-auto px-12 h-full flex items-center justify-between"
        >
          <a href="/" className="flex items-center gap-2 shrink-0">
            {/* Small icon logo */}
            <div className="relative h-[47px] w-[32px] shrink-0 overflow-hidden">
              <Image
                src="/images/logo/icon-logo.svg"
                alt="Gazi Taufiq"
                fill
                className="object-contain"
                priority
              />
            </div>
            {/* Name in body font — Text Pro 65 Medium 20px */}
            <span
              className="text-[var(--color-black-50)] whitespace-nowrap"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: '20px',
                lineHeight: 1.2,
                letterSpacing: '-0.4px',
              }}
            >
              Gazi Taufiq
            </span>
            {/* Dot separator */}
            <span className="w-1 h-1 rounded-full bg-[var(--color-border-tertiary)] shrink-0" />
            {/* Tagline — Text Pro 55 Roman 20px grey */}
            <span
              className="whitespace-nowrap hidden sm:block"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 400,
                fontSize: '20px',
                lineHeight: 1.25,
                letterSpacing: '-0.4px',
                color: 'var(--color-grey-900)',
              }}
            >
              Product Designer | UI Engineer
            </span>
          </a>

          {renderLinks()}
          <Hamburger open={openMenu === 'compact'} onClick={() => toggleMenu('compact')} />
        </nav>
        {renderMobileMenu('compact')}
      </header>
    </>
  )
}
