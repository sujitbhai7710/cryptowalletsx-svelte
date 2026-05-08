import type { RequestHandler } from './$types';

const DOMAIN = 'https://cryptowalletsx.com';

const staticPages = [
  '',
  '/checker',
  '/about',
  '/contact',
  '/privacy',
  '/blog',
  '/arc',
  '/simplechain',
  '/base',
  '/ink',
  '/relay',
  '/litvm',
  '/seismic',
  '/genlayer',
  '/jumper',
  '/dachain',
  '/doma',
  '/robinhood',
  '/linea',
  '/sahara-ai-stats-checker',
  '/pharos-stats-checker',
  '/monad-testnet',
  '/game-of-mito',
  '/mitosis',
];

const blogSlugs = [
  'arc-testnet',
  'simplechain',
  'base',
  'ink',
  'relay',
  'litvm',
  'seismic',
  'genlayer',
  'jumper',
  'dachain',
  'doma',
  'robinhood',
];

function getUrl(path: string, changefreq: string, priority: string) {
  return `  <url>
    <loc>${DOMAIN}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export const GET: RequestHandler = async () => {
  const urls: string[] = [];

  // Home page
  urls.push(getUrl('', 'daily', '1.0'));

  // Tool pages
  urls.push(getUrl('/checker', 'weekly', '0.9'));

  // Chain tool pages
  const chainPages = [
    '/arc', '/simplechain', '/base', '/ink', '/relay',
    '/litvm', '/seismic', '/genlayer', '/jumper', '/dachain', '/doma', '/robinhood',
  ];
  for (const page of chainPages) {
    urls.push(getUrl(page, 'daily', '0.8'));
  }

  // Concluded airdrop pages
  const concludedPages = [
    '/linea', '/linea/bulk', '/sahara-ai-stats-checker',
    '/pharos-stats-checker', '/monad-testnet', '/game-of-mito',
    '/game-of-mito/bulk', '/mitosis',
  ];
  for (const page of concludedPages) {
    urls.push(getUrl(page, 'monthly', '0.3'));
  }

  // Static pages
  urls.push(getUrl('/about', 'monthly', '0.4'));
  urls.push(getUrl('/contact', 'monthly', '0.4'));
  urls.push(getUrl('/privacy', 'yearly', '0.2'));
  urls.push(getUrl('/blog', 'weekly', '0.7'));

  // Blog posts
  for (const slug of blogSlugs) {
    urls.push(getUrl(`/blog/${slug}`, 'weekly', '0.6'));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600',
    },
  });
};
