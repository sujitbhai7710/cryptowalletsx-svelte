import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.setViewportSize({ width: 1280, height: 900 });

await page.goto('https://cryptowalletsx.com/seismic', { waitUntil: 'domcontentloaded', timeout: 20000 });

// Get the page content first
const homeText = await page.evaluate(() => document.body.innerText.substring(0, 500));
console.log('Home page content:');
console.log(homeText);

// Try to find input and submit
const input = page.locator('input[placeholder*="Address"], input[placeholder*="0x"], input[placeholder*="wallet"]').first();
if (await input.count() > 0) {
  await input.fill('0xeb036d5fe3f841661c9e5d7bdcabd493fd86d177');
  const scanBtn = page.locator('button:has-text("Scan")').first();
  await scanBtn.click();
  
  console.log('Waiting for results...');
  try {
    await page.waitForSelector('text=/BRONZE|SILVER|GOLD|PLATINUM|DIAMOND/', { timeout: 60000 });
    const text = await page.evaluate(() => document.body.innerText.substring(0, 1500));
    console.log('Result:');
    console.log(text);
  } catch {
    // Check for errors
    const errorText = await page.evaluate(() => {
      const errEl = document.querySelector('[class*="error"], [class*="Error"]');
      return errEl ? errEl.textContent : 'No error element found';
    });
    console.log('Error or timeout:', errorText);
    await page.screenshot({ path: '/home/z/my-project/download/seismic_test.png' });
  }
} else {
  console.log('No input found on page');
}

await browser.close();
