// Polaroid — stripped to a plain image slot.
// White frame, tape decoration, and hover animation removed.
// Custom illustration will be added here later.

import Image from 'next/image'

interface PolaroidProps {
  src: string
  alt: string
  rotate?: number
  className?: string
}

export function Polaroid({ src, alt, className }: PolaroidProps) {
  return (
    <div className={`relative w-[280px] h-[320px] ${className ?? ''}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="280px"
      />
    </div>
  )
}
