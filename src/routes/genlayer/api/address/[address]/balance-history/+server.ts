import type { RequestHandler } from './$types';

// GenLayer doesn't have balance-history endpoints
// Return empty result for compatibility
export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({ items: [] }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
