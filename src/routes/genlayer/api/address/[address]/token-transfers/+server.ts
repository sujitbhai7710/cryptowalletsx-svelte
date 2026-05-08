import type { RequestHandler } from './$types';

// GenLayer doesn't have token-transfer endpoints
// Return empty result for compatibility
export const GET: RequestHandler = async () => {
  return new Response(JSON.stringify({ items: [], next_page_params: null }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
