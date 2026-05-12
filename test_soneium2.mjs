import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto('https://cryptowalletsx.com/soneium', { waitUntil: 'domcontentloaded', timeout: 20000 });

const input = page.locator('input[placeholder*="wallet"], input[placeholder*="0x"]').first();
await input.fill('0x5739430639B19433Acd98ccb188Ea8582e514768');
const analyzeBtn = page.locator('button:has-text("Analyze")').first();
await analyzeBtn.click();

// Wait for tier badge to appear
await page.waitForSelector('text=/NEWBIE|BRONZE|SILVER|GOLD|MASTER|LEGEND/', { timeout: 120000 });
await page.waitForTimeout(5000);

// Look for the score and stats
const text = await page.evaluate(() => {
  const body = document.body.innerText;
  // Find the section after "Soneium Address"
  const addrIdx = body.indexOf('Soneium Address');
  if (addrIdx > -1) {
    return body.substring(addrIdx, addrIdx + 1000);
  }
  return 'Could not find wallet section. First 2000 chars:\n' + body.substring(0, 2000);
});
console.log(text);

await page.screenshot({ path: '/home/z/my-project/download/soneium_wallet.png', fullPage: true });
console.log('\nScreenshot saved');

await browser.close();
