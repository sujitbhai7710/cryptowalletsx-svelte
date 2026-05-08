import type { RequestHandler } from './$types';

// socialscan doesn't have a balance-history endpoint per address
// Return empty result for compatibility with the Blockscout data model
export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({ items: [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
