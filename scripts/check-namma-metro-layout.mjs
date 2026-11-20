// Layout and flow check for the Namma Metro game at 375, 768 and 1280 px.
// Usage: BASE_URL=http://localhost:3000 node scripts/check-namma-metro-layout.mjs
// Needs Google Chrome (set CHROME_PATH if it is not in the default macOS location).
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const CHROME = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const config = JSON.parse(readFileSync(new URL('../lib/namma-metro/game.config.json', import.meta.url), 'utf8'))
const nameOf = (id) => config.stations.find((s) => s.id === id).name
const PORT = 9400 + Math.floor(Math.random() * 400)

const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=/tmp/nm-check-${PORT}`, 'about:blank'], { stdio: 'ignore' })
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
let failures = 0
const check = (ok, msg) => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`) }

let tabs
for (let i = 0; i < 30; i++) {
  try { tabs = await (await fetch(`http://localhost:${PORT}/json`)).json(); break } catch { await sleep(300) }
}
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl)
await new Promise((r) => (ws.onopen = r))
let id = 0
const pending = {}
ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pending[m.id]) pending[m.id](m.result) }
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending[i] = r; ws.send(JSON.stringify({ id: i, method, params })) })
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.value

const centre = (sel, text) => ev(`(()=>{const els=[...document.querySelectorAll(${JSON.stringify(sel)})];const el=${text ? `els.find(e=>e.textContent.includes(${JSON.stringify(text)}))` : 'els[0]'};if(!el)return null;el.scrollIntoView({block:'nearest',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2,w:r.width,h:r.height}})()`)
const click = async (p) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: p.x, y: p.y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: p.x, y: p.y, button: 'left', clickCount: 1 })
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: p.x, y: p.y, button: 'left', clickCount: 1 })
  await sleep(150)
}
const drag = async (from, to) => {
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x, y: from.y })
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x: from.x, y: from.y, button: 'left', clickCount: 1 })
  for (let i = 1; i <= 8; i++) {
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: from.x + ((to.x - from.x) * i) / 8, y: from.y + ((to.y - from.y) * i) / 8, button: 'left' })
    await sleep(20)
  }
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: to.x, y: to.y, button: 'left', clickCount: 1 })
  await sleep(200)
}

const HEIGHT = Number(process.env.DESKTOP_HEIGHT || 720)
for (const width of [375, 768, 1280]) {
  console.log(`\n== ${width}px ==`)
  await send('Emulation.setDeviceMetricsOverride', { width, height: width < 700 ? 780 : HEIGHT, deviceScaleFactor: 1, mobile: width < 700 })
  await send('Page.navigate', { url: `${BASE}/apps/namma-metro-quizz` })
  await sleep(2500)

  check(!(await ev('document.documentElement.scrollWidth > innerWidth')), 'welcome: no horizontal scroll')
  const start = await centre('button', 'Start')
  check(start && start.h >= 44 && start.w >= 44, 'welcome: Start is at least 44px')
  await click(start)

  for (let i = 0; i < config.parts.length; i++) {
    // parts are played in a random order, so find which one is on screen by its code
    const bodyText = await ev('document.body.innerText')
    const part = config.parts.find((x) => bodyText.includes(x.code))
    const tag = `part ${i + 1}`
    await send('Page.captureScreenshot', { format: 'png' }).then(async (r) => (await import('node:fs')).writeFileSync(`/tmp/nm-${width}-p${i + 1}.png`, Buffer.from(r.data, 'base64')))
    check(!(await ev('document.documentElement.scrollWidth > innerWidth')), `${tag}: no horizontal scroll`)

    // every station label is on screen and not clipped horizontally
    const labels = await ev(`(()=>{const out=[];for(const n of ${JSON.stringify(part.stationIds.map(nameOf))}){const el=[...document.querySelectorAll('main span.absolute, main button[data-drop], footer button')].find(e=>e.textContent.trim()===n);if(el){const r=el.getBoundingClientRect();out.push([n,r.left>=0&&r.right<=innerWidth])}}return out})()`)
    const visible = labels.filter(([, ok]) => ok).length
    check(visible === labels.length && labels.length >= part.stationIds.length - 1, `${tag}: station labels fit the width`)

    // the whole round fits on screen: no vertical scroll, so the hint stays visible
    await ev('window.scrollTo(0,0)')
    check((await ev('document.documentElement.scrollHeight - innerHeight')) <= 1, `${tag}: no vertical scroll`)
    const hintBtn = await centre('footer button', 'Hint')
    await click(hintBtn)
    check((await ev('document.documentElement.scrollHeight - innerHeight')) <= 1, `${tag}: still no vertical scroll with the hint open`)
    check(hintBtn && hintBtn.y > 0 && hintBtn.y < (width < 700 ? 780 : HEIGHT), `${tag}: Hint button in view`)

    // labels do not overlap each other
    const overlap = await ev(`(()=>{const els=[...document.querySelectorAll('main span.absolute, main button[data-drop]')].map(e=>e.getBoundingClientRect());for(let a=0;a<els.length;a++)for(let b=a+1;b<els.length;b++){const p=els[a],q=els[b];if(p.left<q.right&&q.left<p.right&&p.top<q.bottom&&q.top<p.bottom)return true}return false})()`)
    check(!overlap, `${tag}: labels do not overlap`)

    // touch targets and font size
    const small = await ev(`[...document.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&(r.height<44||r.width<44)}).map(b=>b.textContent.trim())`)
    check(small.length === 0, `${tag}: all buttons >= 44x44 ${small.length ? JSON.stringify(small) : ''}`)
    const tiny = await ev(`[...document.querySelectorAll('main *, footer *')].filter(e=>e.children.length===0&&e.textContent.trim()&&parseFloat(getComputedStyle(e).fontSize)<16).length`)
    check(tiny === 0, `${tag}: text is at least 16px`)

    // options pinned in the viewport
    const opt = await centre('footer button[aria-pressed]')
    check(opt && opt.y > 0 && opt.y < (width < 700 ? 780 : HEIGHT), `${tag}: options are in view`)

    // flow: wrong first (tap a wrong option then the code), then right (drag on odd parts, tap on even)
    const optNames = await ev(`[...document.querySelectorAll('footer button[aria-pressed]')].map(b=>b.textContent.trim())`)
    check(optNames.length === 4 && new Set(optNames).size === 4 && optNames.includes(nameOf(part.hiddenId)), `${tag}: 4 unique options incl. the answer`)
    const wrongName = optNames.find((n) => n !== nameOf(part.hiddenId))
    await click(await centre('footer button[aria-pressed]', wrongName))
    await click(await centre('main button[data-drop]'))
    check((await ev(`document.querySelector('[role=status]').textContent`)).includes('Try again'), `${tag}: wrong answer message`)
    check((await ev(`[...document.querySelectorAll('footer button[aria-pressed]')].filter(b=>b.getAttribute('aria-disabled')==='true').length`)) === 1, `${tag}: wrong option is marked`)

    if (i % 2 === 0) {
      await drag(await centre('footer button[aria-pressed]', nameOf(part.hiddenId)), await centre('main button[data-drop]'))
    } else {
      await click(await centre('footer button[aria-pressed]', nameOf(part.hiddenId)))
      await click(await centre('main button[data-drop]'))
    }
    const solved = await ev(`document.querySelector('[role=status]').textContent`)
    check(solved.includes('Now it makes sense'), `${tag}: ${i % 2 === 0 ? 'drag' : 'tap'} answer accepted`)
    await click(await centre('footer button'))
    await sleep(200)
  }

  const done = await ev('document.body.innerText')
  check(done.includes('Congratulations! You navigated the Purple Line'), 'result: heading shown')
  check(done.includes('5 wrong attempts') || /Wrong attempts\s*5/.test(done), 'result: 5 wrong attempts counted')
  check(/Score\s*\d+\/500/.test(done), "result: score shown")
  check(!(await ev('document.documentElement.scrollWidth > innerWidth')), 'result: no horizontal scroll')
  await sleep(800)
  check(await ev(`!!document.querySelector('img[alt^="Result card"]')`), 'result: share image generated')
  await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }).then(async (r) => (await import('node:fs')).writeFileSync(`/tmp/nm-${width}-result.png`, Buffer.from(r.data, 'base64')))
}

console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed')
ws.close()
chrome.kill()
process.exit(failures ? 1 : 0)
