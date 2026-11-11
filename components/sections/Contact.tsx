'use client'

import { useState } from 'react'
import { CheckIcon, CopyIcon } from '@/components/ui/icons'

const socialLinks = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/gazitaufiq' },
  { label: 'Github',    href: 'https://github.com/GaziTaufiqIslam' },
  { label: 'Blog',      href: 'https://medium.com/@gazitaufiq' },
  { label: 'Instagram', href: 'https://www.instagram.com/gazitaufiq' },
  { label: 'Dribbble',  href: 'https://dribbble.com/gazitaufiq' },
]

const EMAIL = 'gazi.taufiq.islam@gmail.com'

export function Contact() {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // The clipboard is unavailable (e.g. a non-secure page) or access was denied.
      // The address is still visible and selectable, so just leave the label as is.
    }
  }

  return (
    <section
      id="contact"
      className="max-w-[1600px] mx-auto px-6 md:px-12 py-20"
    >
      <h2 className="text-heading text-[var(--color-black-50)] mb-6">
        Lets chat
      </h2>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        {/* Email + copy: one bordered box (Figma: contact-content) */}
        <div className="flex w-full max-w-full flex-col overflow-hidden rounded-lg border border-[var(--color-primary-200)] sm:w-[465px] sm:flex-row">
          {/* Email (Figma: contact-email) */}
          <div className="flex min-w-0 flex-1 items-center bg-[var(--color-white)] px-[10px] py-4">
            <a
              href={`mailto:${EMAIL}`}
              className="text-subheading text-[var(--color-black-50)] [overflow-wrap:anywhere]"
            >
              {EMAIL}
            </a>
          </div>

          {/* Copy button (Figma: contact-email-copy-button). Fixed minimum width so
              swapping to "Copied!" doesn't resize the box. */}
          <button
            type="button"
            onClick={handleCopy}
            className={`text-body-strong flex cursor-pointer items-center justify-center gap-2 bg-[var(--color-primary-100)] px-4 py-2 text-[var(--color-primary-500)] transition-colors duration-200 sm:min-w-[143px] ${
              // Figma's copied state keeps the resting lavender, so no hover darkening then.
              copied ? '' : 'hover:bg-[var(--color-primary-200)]'
            }`}
          >
            {/* Icon slot is always 24px tall so the button height is the same in both states */}
            <span className="flex h-6 shrink-0 items-center justify-center">
              {copied ? (
                // Figma: 24px green circle holding a check
                <span className="flex size-6 items-center justify-center rounded-full bg-[var(--color-status-success)] text-[var(--color-primary-100)]">
                  <CheckIcon />
                </span>
              ) : (
                <CopyIcon />
              )}
            </span>
            <span className="whitespace-nowrap">{copied ? 'Copied!' : 'Copy Email'}</span>
          </button>
        </div>

        {/* Social links (Figma: contact-links) */}
        <nav aria-label="Social links">
          <ul className="flex flex-wrap gap-x-[35px] gap-y-3">
            {socialLinks.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-sweep text-[var(--color-text-secondary)] hover:text-[var(--color-primary-500)] transition-colors"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  )
}
