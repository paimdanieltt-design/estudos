// Gera os ícones PNG do app a partir do SVG, usando o Chromium que já vem instalado.
import { chromium } from 'playwright-core'
import { readFileSync, writeFileSync } from 'node:fs'

const svg = readFileSync('public/icone.svg', 'utf8')
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
for (const tam of [192, 512]) {
  const page = await browser.newPage({ viewport: { width: tam, height: tam } })
  await page.setContent(`<body style="margin:0">${svg.replace('<svg ', `<svg width="${tam}" height="${tam}" `)}</body>`)
  writeFileSync(`public/icone-${tam}.png`, await page.screenshot({ omitBackground: true }))
}
await browser.close()
