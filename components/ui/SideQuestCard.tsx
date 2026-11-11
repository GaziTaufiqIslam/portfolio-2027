'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Chip } from './Chip'
import type { SideQuestProject } from '@/lib/data'

interface SideQuestCardProps {
  project: SideQuestProject
}

export function SideQuestCard({ project }: SideQuestCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  // True once the clip is actually playing, so the video fades in over the
  // image instead of flashing a blank frame while it loads.
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    // React doesn't reliably render the `muted` attribute, and browsers only
    // allow autoplay on muted videos, so set it explicitly before playing.
    video.muted = true
    video.play().catch(() => {
      // Autoplay blocked (e.g. data saver): the image stays visible instead.
    })
  }, [])

  // Hover pauses the clip in place; leaving resumes it. Mouse only, so a tap on
  // a touch screen can't leave the video stuck paused.
  function handlePointerEnter(e: React.PointerEvent) {
    if (e.pointerType === 'mouse') videoRef.current?.pause()
  }

  function handlePointerLeave(e: React.PointerEvent) {
    if (e.pointerType === 'mouse') videoRef.current?.play().catch(() => {})
  }

  return (
    // Polaroid: white frame with 20px sides, 32px top, 24px bottom. The border and
    // shadow only appear on hover (the border is transparent until then so nothing shifts).
    <div className="flex flex-col gap-6 rounded-2xl border border-transparent bg-[var(--color-white)] px-5 pt-8 pb-6 transition-[border-color,box-shadow] duration-300 hover:border-[var(--color-primary-200)] hover:shadow-soft">
      {/* Thumbnail: looping video by default (image underneath as fallback), paused on hover */}
      <div
        className="relative w-full aspect-[481/400] overflow-hidden rounded-[4px]"
        onPointerEnter={project.video ? handlePointerEnter : undefined}
        onPointerLeave={project.video ? handlePointerLeave : undefined}
      >
        <Image
          src={project.image}
          alt={project.caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />

        {project.video && (
          <video
            ref={videoRef}
            src={project.video}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
            onPlaying={() => setPlaying(true)}
            className={`absolute inset-0 size-full object-cover pointer-events-none transition-opacity duration-200 ${
              playing ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-6">
        <p className="text-body text-[var(--color-text-default)]">{project.caption}</p>
        <div className="flex flex-wrap gap-3">
          {project.chips.map((chip) => (
            <Chip key={chip.label} label={chip.label} size="small" />
          ))}
        </div>
      </div>
    </div>
  )
}
