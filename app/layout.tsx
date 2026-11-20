import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Loader } from '@/components/layout/Loader'
import { SiteChrome } from '@/components/layout/SiteChrome'

export const metadata: Metadata = {
  title: 'Gazi Taufiq — Product Designer | UI Engineer',
  description:
    'Product designer working in B2B SaaS (Hospitality) with a Masters from NID, shipping semantic HTML/CSS/JS years before AI coding.',
  openGraph: {
    title: 'Gazi Taufiq — Product Designer | UI Engineer',
    description:
      'Product designer working in B2B SaaS (Hospitality) with a Masters from NID.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // suppressHydrationWarning: the inline script below adds a class to <html> before React hydrates
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/wsu5vat.css" />
        {/* Repeat visits (same tab session): hide the loader before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('loaderSeen')||location.pathname.indexOf('/apps/')===0)document.documentElement.classList.add('loader-seen')}catch(e){}",
          }}
        />
        {/* No JS: never show a loader that can't finish */}
        <noscript>
          <style>{'.site-loader{display:none}html{overflow:auto!important}'}</style>
        </noscript>
      </head>
      <body>
        <SiteChrome loader={<Loader />} navbar={<Navbar />} footer={<Footer />}>
          {children}
        </SiteChrome>
      </body>
    </html>
  )
}
