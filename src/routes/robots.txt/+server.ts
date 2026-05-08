import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: https://cryptowalletsx.com/sitemap.xml
`;

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'max-age=3600',
    },
  });
};
