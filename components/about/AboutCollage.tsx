import Image from 'next/image'
import { aboutPhotos, aboutText, type AboutPhoto, type AboutText } from '@/lib/data'
import { cn } from '@/lib/utils'
import styles from './AboutCollage.module.css'

function Photo({ photo, className }: { photo: AboutPhoto; className?: string }) {
  return (
    <div
      className={cn(styles.photo, className)}
      // The photo's own proportions, used on small screens and for the shorter portrait
      style={{ '--ar': `${photo.width} / ${photo.height}` } as React.CSSProperties}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        className="object-cover"
        sizes={`(min-width: 1024px) ${photo.lgVw}vw, ${photo.smVw}vw`}
      />
    </div>
  )
}

function TextBlock({
  text,
  tone,
  className,
}: {
  text: AboutText
  tone: 'purple' | 'red' | 'lilac'
  className: string
}) {
  return (
    <div className={cn(styles.text, className)}>
      <h2 className={cn('text-heading', styles.title, styles[tone])}>{text.heading}</h2>
      <div className={cn('text-body', styles.body)}>
        {text.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  )
}

/**
 * The About page collage. The grid and all placements live in AboutCollage.module.css.
 * The order below is the reading order, which is also the stacking order on small screens.
 */
export function AboutCollage() {
  const p = aboutPhotos

  return (
    <div className={styles.frame}>
      <div className={styles.grid}>
        <h1 className={cn('text-heading', styles.heading)}>About Me</h1>

        <Photo photo={p.portraitMural} className={styles.mural} />
        <Photo photo={p.portraitLookingUp} className={styles.lookingUp} />

        <Photo photo={p.armchair} className={styles.armchair} />
        <TextBlock text={aboutText.systems} tone="purple" className={styles.textSystems} />

        <Photo photo={p.groupTable} className={styles.group} />
        <Photo photo={p.sunsetTerrace} className={styles.sunset} />

        <TextBlock text={aboutText.business} tone="red" className={styles.textBusiness} />
        <Photo photo={p.reading} className={styles.reading} />

        <Photo photo={p.stairs} className={styles.stairs} />
        <TextBlock text={aboutText.keepsMeGoing} tone="lilac" className={styles.textKeeps} />
        <Photo photo={p.motorbikeGauge} className={styles.moto} />
      </div>

      <div className={styles.strip}>
        <Photo photo={p.galleryGroup} />
        <Photo photo={p.nightPortrait} />
        <Photo photo={p.sketch} />
        <Photo photo={p.fishingNets} />
      </div>

      <h2 className={cn('text-heading', styles.thanks)}>Thank you for reading!</h2>
    </div>
  )
}
