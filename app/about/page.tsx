import type { Metadata } from 'next'
import { AboutCollage } from '@/components/about/AboutCollage'
import { Decorative } from '@/components/sections/Decorative'

export const metadata: Metadata = {
  title: 'About — Gazi Taufiq',
  description:
    'Product designer and UI engineer. A mix of computer science, a design studio of my own, and a Masters of Design in Retail Experience at NID Bangalore.',
}

export default function AboutPage() {
  return (
    <>
      <AboutCollage />
      <Decorative />
    </>
  )
}
