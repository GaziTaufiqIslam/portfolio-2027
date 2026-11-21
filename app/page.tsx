import { Hero } from '@/components/sections/Hero'
import { Works } from '@/components/sections/Works'
import { TicketPunch } from '@/components/sections/TicketPunch'
import { SideQuests } from '@/components/sections/SideQuests'
import { Contact } from '@/components/sections/Contact'
import { Decorative } from '@/components/sections/Decorative'

export default function HomePage() {
  return (
    <>
      <Hero />
      <Works />
      <TicketPunch />
      <SideQuests limit={3} showViewMore />
      <Contact />
      <Decorative />
    </>
  )
}
