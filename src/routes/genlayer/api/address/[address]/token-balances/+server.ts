import type { RequestHandler } from './$types';

// GenLayer doesn't have token-balance endpoints
// Return empty result for compatibility
export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify([]), {
    headers: { 'Content-Type': 'application/json' },
  });
};
