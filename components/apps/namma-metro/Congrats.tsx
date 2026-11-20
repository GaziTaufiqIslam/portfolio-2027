'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import config from '@/lib/namma-metro/game.config.json'
import { fillTemplate } from '@/lib/namma-metro/logic'
import { renderResultCard } from './resultCard'
import styles from './NammaMetro.module.css'

interface Props {
  score: number
  max: number
  time: string
  wrong: number
  onReplay: () => void
}

const hiddenIndexes = config.parts.map((p) => config.stations.findIndex((s) => s.id === p.hiddenId))

export function Congrats({ score, max, time, wrong, onReplay }: Props) {
  const gameUrl =
    config.gameUrl || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '')
  const defaultMessage = fillTemplate(config.share.message, { GAME_URL: gameUrl })

  const [message, setMessage] = useState(defaultMessage)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [status, setStatus] = useState('')

  useEffect(() => {
    let url: string | null = null
    let cancelled = false
    renderResultCard({
      title: config.welcome.title,
      subtitle: '',
      score, max, time, wrong,
      url: gameUrl,
      stationCount: config.stations.length,
      hiddenIndexes,
    })
      .then((b) => {
        if (cancelled) return
        url = URL.createObjectURL(b)
        setBlob(b)
        setImgUrl(url)
      })
      .catch(() => setStatus('Could not create the image.'))
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [score, max, time, wrong, gameUrl])

  const copy = async (text: string, ok: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setStatus(ok)
    } catch {
      setStatus('Could not copy. Select the text and copy it by hand.')
    }
  }

  const share = async () => {
    try {
      if (blob && typeof navigator.canShare === 'function') {
        const file = new File([blob], 'purple-line-result.png', { type: 'image/png' })
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ text: message, files: [file] })
          return
        }
      }
      if (typeof navigator.share === 'function') {
        await navigator.share({ text: message })
        return
      }
      await copy(message, 'Sharing is not supported here. Message copied instead.')
    } catch (e) {
      if ((e as Error).name !== 'AbortError') setStatus('Sharing failed. Try Copy text.')
    }
  }

  const enc = encodeURIComponent
  const links = [
    {
      label: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(gameUrl)}`,
      // LinkedIn cannot prefill text, so the message is copied for pasting.
      onClick: () => copy(message, 'Message copied. Paste it into your LinkedIn post.'),
    },
    { label: 'X', href: `https://twitter.com/intent/tweet?text=${enc(message)}` },
    { label: 'WhatsApp', href: `https://wa.me/?text=${enc(message)}` },
  ]

  return (
    <div className="mx-auto w-full max-w-[40rem] px-5 py-8 flex flex-col gap-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
      <div className="text-center flex flex-col gap-2">
        <h1 className="text-title text-[var(--color-black-50)]">{config.result.heading}</h1>
        <p className="text-body text-[var(--color-grey-900)]">{config.result.line}</p>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        {[
          ['Score', `${score}/${max}`],
          ['Time', time],
          ['Wrong attempts', String(wrong)],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border-2 border-[var(--color-primary-200)] bg-[var(--color-primary-100)] p-3">
            <dt className="text-body text-[var(--color-grey-900)]">{k}</dt>
            <dd className="text-subheading text-[var(--color-primary-500)] break-words">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="grid grid-cols-2 gap-3">
        <button type="button" className={`${styles.btn} text-body-strong`} onClick={share}>
          Share
        </button>
        <button type="button" className={`${styles.btn} ${styles.secondary} text-body-strong`} onClick={onReplay}>
          Play again
        </button>
      </div>

      <div className="rounded-2xl overflow-hidden border-2 border-[var(--color-primary-200)] bg-[var(--color-white)] aspect-[1080/1350] w-full max-w-[26rem] mx-auto">
        {imgUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt={`Result card: ${score} out of ${max} points, ${time}, ${wrong} wrong attempts`} className="w-full h-full" />
        )}
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body-strong text-[var(--color-black-50)]">Your post (you can edit it)</span>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={9}
          className="w-full rounded-xl border-2 border-[var(--color-primary-200)] bg-[var(--color-white)] p-3 text-[1rem] leading-snug text-[var(--color-black-50)] focus-visible:outline-3 focus-visible:outline-[var(--color-primary-500)]"
        />
      </label>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={l.onClick}
              className={`${styles.btn} ${styles.secondary} text-body-strong inline-flex items-center justify-center text-center`}
            >
              {l.label}
            </a>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className={`${styles.btn} ${styles.secondary} text-body-strong`} onClick={() => copy(message, 'Message copied.')}>
            Copy text
          </button>
          {imgUrl ? (
            <a
              href={imgUrl}
              download="purple-line-result.png"
              className={`${styles.btn} ${styles.secondary} text-body-strong inline-flex items-center justify-center`}
            >
              Download image
            </a>
          ) : (
            <button type="button" disabled className={`${styles.btn} ${styles.secondary} text-body-strong`}>
              Download image
            </button>
          )}
        </div>
        <p className="text-body text-[var(--color-grey-900)] text-center min-h-[44px] flex items-center justify-center">
          <span>
            Made by{' '}
            <Link href="/" className="text-body-strong text-[var(--color-primary-500)] underline underline-offset-4">
              Gazi Taufiq
            </Link>
          </span>
        </p>
      </div>

      <p role="status" aria-live="polite" className="text-body text-center text-[var(--color-grey-900)] min-h-6">
        {status}
      </p>
    </div>
  )
}
