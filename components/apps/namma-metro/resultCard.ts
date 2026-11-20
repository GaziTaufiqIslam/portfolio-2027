export interface ResultCardData {
  title: string
  subtitle: string
  score: number
  max: number
  time: string
  wrong: number
  url: string
  stationCount: number
  hiddenIndexes: number[]
}

const W = 1080
const H = 1350

const css = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draws the shareable result card in the browser and returns a PNG blob. */
export async function renderResultCard(data: ResultCardData): Promise<Blob> {
  if (document.fonts) await document.fonts.ready
  const font = getComputedStyle(document.body).fontFamily || 'sans-serif'
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const bg = css('--color-bg')
  const ink = css('--color-black-50')
  const purple = css('--color-primary-500')
  const lilac = css('--color-primary-100')
  const lilac2 = css('--color-primary-200')
  const green = css('--color-status-success')
  const white = css('--color-white')

  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // card
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.12)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 12
  roundRect(ctx, 60, 60, W - 120, H - 120, 48)
  ctx.fillStyle = white
  ctx.fill()
  ctx.restore()

  ctx.textAlign = 'center'
  ctx.fillStyle = purple
  ctx.font = `700 28px ${font}`
  ctx.fillText('NAMMA METRO · PURPLE LINE', W / 2, 160)

  ctx.fillStyle = ink
  ctx.font = `700 76px ${font}`
  ctx.fillText(data.title, W / 2, 270)

  // mini Purple Line: a stepped line with one dot per station
  const lineY = 450
  const x0 = 150
  const x1 = W - 150
  const stepAt = x0 + (x1 - x0) * 0.55
  const yFor = (x: number) => (x < stepAt ? lineY + 40 : lineY - 40)
  ctx.strokeStyle = '#A753FA'
  ctx.lineWidth = 16
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(x0, lineY + 40)
  ctx.lineTo(stepAt - 30, lineY + 40)
  ctx.lineTo(stepAt + 30, lineY - 40)
  ctx.lineTo(x1, lineY - 40)
  ctx.stroke()
  for (let i = 0; i < data.stationCount; i++) {
    const x = x0 + ((x1 - x0) * i) / (data.stationCount - 1)
    const y = yFor(x)
    const solved = data.hiddenIndexes.includes(i)
    ctx.beginPath()
    ctx.arc(x, y, solved ? 22 : 13, 0, Math.PI * 2)
    ctx.fillStyle = solved ? green : white
    ctx.fill()
    ctx.lineWidth = 6
    ctx.strokeStyle = solved ? green : '#4B400F'
    ctx.stroke()
    if (solved) {
      ctx.strokeStyle = white
      ctx.lineWidth = 6
      ctx.beginPath()
      ctx.moveTo(x - 9, y + 1)
      ctx.lineTo(x - 2, y + 8)
      ctx.lineTo(x + 10, y - 7)
      ctx.stroke()
    }
  }

  // score
  ctx.fillStyle = ink
  ctx.font = `500 34px ${font}`
  ctx.fillText('My score', W / 2, 640)
  ctx.fillStyle = purple
  ctx.font = `700 190px ${font}`
  ctx.fillText(`${data.score}`, W / 2, 810)
  ctx.fillStyle = ink
  ctx.font = `500 40px ${font}`
  ctx.fillText(`out of ${data.max}`, W / 2, 870)

  // stats
  const stats: [string, string][] = [
    ['Time', data.time],
    ['Wrong attempts', String(data.wrong)],
  ]
  stats.forEach(([label, value], i) => {
    const bx = 130 + i * 430
    roundRect(ctx, bx, 930, 390, 150, 28)
    ctx.fillStyle = lilac
    ctx.fill()
    ctx.lineWidth = 3
    ctx.strokeStyle = lilac2
    ctx.stroke()
    ctx.fillStyle = ink
    ctx.font = `500 28px ${font}`
    ctx.fillText(label, bx + 195, 983)
    ctx.font = `700 54px ${font}`
    ctx.fillText(value, bx + 195, 1050)
  })

  ctx.fillStyle = ink
  ctx.font = `500 34px ${font}`
  ctx.fillText('An error that is just a code is no help.', W / 2, 1160)
  ctx.fillStyle = purple
  ctx.font = `700 34px ${font}`
  ctx.fillText(data.url.replace(/^https?:\/\//, ''), W / 2, 1230)

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png')
  )
}
