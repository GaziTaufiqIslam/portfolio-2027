import Image from 'next/image'

interface NdaOverlayProps {
  src: string
  /** The image's pixel size; the block keeps the same proportions as the image. */
  width: number
  height: number
}

export function NdaOverlay({ src, width, height }: NdaOverlayProps) {
  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {/* Blurred background images */}
      <Image
        src={src}
        alt=""
        fill
        className="object-cover blur-sm scale-105 opacity-60 pointer-events-none select-none"
        sizes="100vw"
        aria-hidden="true"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-[var(--color-bg)]/60" />

      {/* NDA message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center px-6">
        {/* Lock icon */}
        <div className="flex items-center justify-center size-14 drop-shadow-lg text-[var(--color-black-50)]">
          <svg
            width="54"
            height="54"
            viewBox="0 0 54 54"
            fill="none"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect x="9" y="24" width="36" height="27" rx="4" stroke="currentColor" strokeWidth="2.5"/>
            <path d="M18 24v-7a9 9 0 0 1 18 0v7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="27" cy="37" r="3" fill="currentColor"/>
            <line x1="27" y1="40" x2="27" y2="45" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-heading text-[var(--color-black-50)]">
          The project is under NDA
        </p>
        <p className="text-body text-[var(--color-text-secondary)]">
          I will be happy to discuss more over a private meet
        </p>
      </div>
    </div>
  )
}
