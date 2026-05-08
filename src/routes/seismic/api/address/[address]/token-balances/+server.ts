import type { RequestHandler } from './$types';

// socialscan doesn't have a token-balances endpoint per address
// Return empty result for compatibility with the Blockscout data model
export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify([]), {
    headers: { 'Content-Type': 'application/json' },
  });
};
