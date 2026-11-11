import { Hero } from '@/components/sections/Hero'
import { Works } from '@/components/sections/Works'
import { SideQuests } from '@/components/sections/SideQuests'
import { Contact } from '@/components/sections/Contact'
import { Decorative } from '@/components/sections/Decorative'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Works />
      <SideQuests limit={3} showViewMore />
      <Contact />
      <Decorative />
    </>
  )
}
