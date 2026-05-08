import type { RequestHandler } from './$types';

const JUMPER_API_BASE = 'https://li.quest/v1';

export const GET: RequestHandler = async () => {
  try {
    const res = await fetch(`${JUMPER_API_BASE}/chains`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `Jumper API error: ${res.status}` }), { status: res.status });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch Jumper chains' }), { status: 500 });
  }
};
