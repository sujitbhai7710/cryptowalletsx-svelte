import { chromium } from 'playwright';

const chains = [
  { name: 'SimpleChain', path: '/simplechain', addr: '0xc02D33ACAf90CcC6fd58bA45A00138E9fdf11713' },
  { name: 'Base', path: '/base', addr: '0x5739430639B19433Acd98ccb188Ea8582e514768' },
  { name: 'Ink', path: '/ink', addr: '0x5739430639B19433Acd98ccb188Ea8582e514768' },
  { name: 'LitVM', path: '/litvm', addr: '0x5739430639B19433Acd98ccb188Ea8582e514768' },
  { name: 'Seismic', path: '/seismic', addr: '0xeb036d5fe3f841661c9e5d7bdcabd493fd86d177' },
  { name: 'GenLayer', path: '/genlayer', addr: '0x5739430639B19433Acd98ccb188Ea8582e514768' },
  { name: 'DAC Chain', path: '/dachain', addr: '0xDDdA78Bb7Ed612BDDeF4C0172111541D06252b89' },
  { name: 'Doma', path: '/doma', addr: '0x86f79e6B64E26814dFb4f3657EF455a9C6CA4354' },
  { name: 'Robinhood', path: '/robinhood', addr: '0x5739430639B19433Acd98ccb188Ea8582e514768' },
  { name: 'Soneium', path: '/soneium', addr: '0x5739430639B19433Acd98ccb188Ea8582e514768' },
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const chain of chains) {
  const page = await browser.newPage();
  try {
    console.log(`Testing ${chain.name}...`);
    await page.goto(`https://cryptowalletsx.com${chain.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    const input = page.locator('input[placeholder*="Address"], input[placeholder*="0x"], input[placeholder*="wallet"]').first();
    await input.fill(chain.addr);
    
    const scanBtn = page.locator('button:has-text("Scan")').first();
    await scanBtn.click({ timeout: 5000 });
    
    // Wait for either success or error
    const result = await Promise.race([
      page.waitForSelector('text=/BRONZE|SILVER|GOLD|PLATINUM|DIAMOND/', { timeout: 120000 })
        .then(() => 'success'),
      page.waitForSelector('text=Failed to Load', { timeout: 120000 })
        .then(() => 'error'),
    ]).catch(() => 'timeout');
    
    await page.waitForTimeout(2000);
    
    if (result === 'error') {
      const errText = await page.evaluate(() => {
        const errEl = document.body.querySelector('[class*="error"], [class*="Error"]');
        return errEl ? errEl.textContent.substring(0, 200) : 'Unknown error';
      });
      console.log(`  ❌ ${chain.name}: ERROR - ${errText}`);
      results.push({ chain: chain.name, status: 'error', error: errText });
    } else if (result === 'timeout') {
      console.log(`  ⏱️ ${chain.name}: TIMEOUT (still loading)`);
      results.push({ chain: chain.name, status: 'timeout' });
    } else {
      const text = await page.evaluate(() => document.body.innerText.substring(0, 1000));
      const totalMatch = text.match(/Total\s+(\d+)/);
      const rankMatch = text.match(/(BRONZE|SILVER|GOLD|PLATINUM|DIAMOND)/i);
      const totalTx = totalMatch ? totalMatch[1] : '?';
      console.log(`  ✅ ${chain.name}: TXs=${totalTx}, Rank=${rankMatch ? rankMatch[1] : '?'}`);
      results.push({ chain: chain.name, status: 'success', totalTx, rank: rankMatch?.[1] });
    }
    
    await page.screenshot({ path: `/home/z/my-project/download/${chain.name.toLowerCase().replace(/\s+/g,'_')}_test.png` });
    
  } catch (e) {
    console.log(`  ❌ ${chain.name}: ${e.message.substring(0, 100)}`);
    results.push({ chain: chain.name, status: 'exception', error: e.message.substring(0, 80) });
  } finally {
    await page.close();
  }
}

await browser.close();

console.log('\n=== SUMMARY ===');
results.forEach(r => {
  const icon = r.status === 'success' ? '✅' : r.status === 'error' ? '❌' : '⏱️';
  console.log(`${icon} ${r.chain}: ${r.status}${r.totalTx ? ` (TXs=${r.totalTx})` : ''}${r.error ? ` - ${r.error}` : ''}`);
});
