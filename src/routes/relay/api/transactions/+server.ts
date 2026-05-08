import type { RequestHandler } from './$types';

const RELAY_API_BASE = 'https://api.relay.link';

export const GET: RequestHandler = async ({ url }) => {
  const address = url.searchParams.get('user');
  const continuation = url.searchParams.get('continuation');

  if (!address) {
    return new Response(JSON.stringify({ error: 'Missing user address' }), { status: 400 });
  }

  try {
    const params = new URLSearchParams({ user: address });
    if (continuation) params.set('continuation', continuation);

    const res = await fetch(`${RELAY_API_BASE}/requests/v2?${params}`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Relay API error: ${res.status}` }), { status: res.status });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch Relay transactions' }), { status: 500 });
  }
};
