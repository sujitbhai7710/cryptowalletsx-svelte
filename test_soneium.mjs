import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto('https://cryptowalletsx.com/soneium', { waitUntil: 'domcontentloaded', timeout: 20000 });

const input = page.locator('input[placeholder*="wallet"], input[placeholder*="0x"]').first();
await input.fill('0x5739430639B19433Acd98ccb188Ea8582e514768');

// Soneium uses "Analyze" button
const analyzeBtn = page.locator('button:has-text("Analyze")').first();
await analyzeBtn.click();
console.log('Clicked Analyze button');

// Wait for results
try {
  await page.waitForSelector('text=/NEWBIE|BRONZE|SILVER|GOLD|MASTER|LEGEND/', { timeout: 120000 });
  console.log('Score loaded!');
  
  const text = await page.evaluate(() => document.body.innerText.substring(0, 2000));
  console.log(text);
} catch (e) {
  console.log('Timeout or error:', e.message.substring(0, 100));
  // Check for error
  const hasError = await page.locator('text=error, text=Error, text=Failed').count();
  console.log('Error elements found:', hasError);
  await page.screenshot({ path: '/home/z/my-project/download/soneium_test.png' });
}

await browser.close();
