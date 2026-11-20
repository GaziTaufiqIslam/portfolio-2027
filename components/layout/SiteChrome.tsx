'use client'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Standalone apps under /apps/ run full screen without the site loader,
 * navbar and footer. Everywhere else the normal chrome is shown.
 */
export function SiteChrome({
  loader, navbar, footer, children,
}: { loader: ReactNode; navbar: ReactNode; footer: ReactNode; children: ReactNode }) {
  const standalone = usePathname()?.startsWith('/apps/')
  if (standalone) return <main>{children}</main>
  return (
    <>
      {loader}
      {navbar}
      {/* The tall navbar is in normal flow now, so no top offset is needed */}
      <main>{children}</main>
      {footer}
    </>
  )
}
