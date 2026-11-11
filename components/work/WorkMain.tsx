import Image from 'next/image'
import { NdaOverlay } from './NdaOverlay'
import type { WorkProject } from '@/lib/data'

export function WorkMain({ project }: { project: WorkProject }) {
  return (
    <div className="flex flex-col w-full">
      {project.bodyImages.map((image, i) => (
        // The id comes straight from this image's own `nav.anchor`, so a sidebar
        // link always jumps to the image it was defined on. scroll-mt-20 keeps the
        // top of the image clear of the fixed 80px navbar after a jump.
        <section
          key={`${image.src}-${i}`}
          id={image.nav?.anchor}
          className="w-full scroll-mt-20"
        >
          {image.nda ? (
            <NdaOverlay src={image.src} width={image.width} height={image.height} />
          ) : (
            // Full column width at the image's own proportions (no cropping).
            // width/height only reserve space before the image loads.
            <Image
              src={image.src}
              alt={image.alt ?? ''}
              width={image.width}
              height={image.height}
              className="block w-full h-auto"
              sizes="(min-width: 1024px) calc(100vw - 252px), 100vw"
            />
          )}
        </section>
      ))}
    </div>
  )
}
