import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

// Capture console messages
page.on('console', msg => {
  if (msg.type() === 'error' || msg.type() === 'warning') {
    console.log(`[BROWSER ${msg.type().toUpperCase()}] ${msg.text()}`);
  }
});

// Capture network errors
page.on('requestfailed', request => {
  console.log(`[NETWORK ERROR] ${request.url()} - ${request.failure()?.errorText}`);
});

await page.goto('https://cryptowalletsx.com/soneium', { waitUntil: 'domcontentloaded', timeout: 20000 });

const input = page.locator('input[placeholder*="wallet"], input[placeholder*="0x"]').first();
await input.fill('0xe8a16e8C99210EddD85423962A21A1F38A1B47eb');
const analyzeBtn = page.locator('button:has-text("Analyze")').first();
await analyzeBtn.click();

// Wait for loading to complete
await page.waitForTimeout(15000);

// Check if data loaded
const text = await page.evaluate(() => {
  const body = document.body.innerText;
  const addrIdx = body.indexOf('Transactions');
  if (addrIdx > -1) {
    const section = body.substring(addrIdx, addrIdx + 200);
    return section;
  }
  return 'No Transactions section found';
});
console.log('Transactions section:', text);

// Check for any error messages
const errorText = await page.locator('.text-red-400, .text-red-500').allTextContents();
console.log('Error texts:', errorText);

await browser.close();
