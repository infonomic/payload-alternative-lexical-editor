import { chromium } from '@playwright/test'

;(async () => {
  const start = Date.now()
  console.log('Launching browser...')
  const browser = await chromium.launch()
  console.log(`Browser launched in ${Date.now() - start}ms`)
  await browser.close()
})()
