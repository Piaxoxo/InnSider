import { chromium } from 'playwright-core'
const EXEC = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
const OUT = '/tmp/claude-0/-home-user-InnSider/0b0ed22b-fe28-5208-8f5e-baa17eea3901/scratchpad'
const b = await chromium.launch({ executablePath: EXEC, args: ['--use-gl=swiftshader','--enable-unsafe-swiftshader','--no-sandbox'] })
const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errs = []
p.on('pageerror', e => errs.push('PAGEERR: '+e.message))
await p.goto('http://localhost:4323/', { waitUntil: 'networkidle', timeout: 30000 })
await p.waitForTimeout(4200)
for (const id of ['menu','bar']) {
  await p.evaluate(s => document.getElementById(s)?.scrollIntoView({block:'start'}), id)
  await p.waitForTimeout(1300)
  await p.screenshot({ path: `${OUT}/y-${id}.png` })
}
// menu bottom (dish list)
await p.evaluate(() => { const el=document.getElementById('menu'); window.scrollBy(0, el.offsetHeight*0.6) })
await p.waitForTimeout(1000)
await p.screenshot({ path: `${OUT}/y-menu2.png` })
const rows = await p.evaluate(()=>document.querySelectorAll('.menu__row').length)
console.log('page errors:', errs.length, errs.slice(0,3), '| menu rows:', rows)
await b.close()
