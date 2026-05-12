import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await page.goto('https://cryptowalletsx.com/soneium', { waitUntil: 'domcontentloaded', timeout: 20000 });

const input = page.locator('input[placeholder*="wallet"], input[placeholder*="0x"]').first();
await input.fill('0xe8a16e8C99210EddD85423962A21A1F38A1B47eb');
const analyzeBtn = page.locator('button:has-text("Analyze")').first();
await analyzeBtn.click();

await page.waitForSelector('text=/NEWBIE|BRONZE|SILVER|GOLD|MASTER|LEGEND/', { timeout: 120000 });
await page.waitForTimeout(5000);

const text = await page.evaluate(() => {
  const body = document.body.innerText;
  const addrIdx = body.indexOf('Soneium Address');
  if (addrIdx > -1) return body.substring(addrIdx, addrIdx + 800);
  return body.substring(0, 800);
});
console.log(text);

await browser.close();
