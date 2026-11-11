import Image from 'next/image'

/**
 * Scattered objects between Contact and the footer (Figma: interests-container).
 *
 * Every size and offset below is a design pixel value multiplied by `--s`, which
 * the section sets per breakpoint. Scaling the numbers (rather than using a CSS
 * transform) shrinks the layout box too, so narrower screens never scroll sideways.
 *
 * `left`/`top` place each object's cell inside the group; the image is centred in
 * its cell and rotated, exactly as in the Figma frame.
 */
const GROUP = { width: 931, height: 235 }

const objects = [
  { src: '/images/decorative/dimsum.png',   left: 0,      top: 47.89, cell: [104.014, 104.014], size: [93.207, 93.207],    rotate: -7.1 },
  { src: '/images/decorative/camera.png',   left: 216.67, top: 59.56, cell: [174.851, 174.851], size: [136.812, 136.812],  rotate: 19.65 },
  { src: '/images/decorative/jersey.png',   left: 543.99, top: 0,     cell: [115.74, 126.551],  size: [107.526, 119.198],  rotate: 4.08 },
  { src: '/images/decorative/cassette.png', left: 800.02, top: 63.9,  cell: [130.974, 130.974], size: [97.717, 97.717],    rotate: -26.4 },
] as const

/** Design pixels → scaled pixels */
const px = (value: number) => `calc(${value}px * var(--s))`

export function Decorative() {
  return (
    <section
      aria-hidden="true"
      // Hidden on the smallest screens. Full size at 2xl, scaled down at xl and below.
      className="hidden sm:flex min-h-[340px] items-center justify-center overflow-hidden px-6 md:px-12 pointer-events-none select-none [--s:0.5] md:[--s:0.6] lg:[--s:0.75] xl:[--s:0.85] 2xl:[--s:1]"
    >
      <div className="relative" style={{ width: px(GROUP.width), height: px(GROUP.height) }}>
        {objects.map((item) => (
          <div
            key={item.src}
            className="absolute flex items-center justify-center"
            style={{
              left: px(item.left),
              top: px(item.top),
              width: px(item.cell[0]),
              height: px(item.cell[1]),
            }}
          >
            <div
              className="relative"
              style={{
                width: px(item.size[0]),
                height: px(item.size[1]),
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              <Image src={item.src} alt="" fill className="object-cover" sizes="140px" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
