import type { RequestHandler } from './$types';

const RELAY_API_BASE = 'https://api.relay.link';

export const GET: RequestHandler = async () => {
  try {
    const res = await fetch(`${RELAY_API_BASE}/chains`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Relay API error: ${res.status}` }), { status: res.status });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch Relay chains' }), { status: 500 });
  }
};
