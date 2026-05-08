import type { RequestHandler } from './$types';
import { SEISMIC_CONFIG } from '$lib/utils/constants';

export const GET: RequestHandler = async () => {
  try {
    const res = await fetch(`${SEISMIC_CONFIG.apiBase}/stats`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `API error: ${res.status}` }), { status: res.status });
    }
    const data = await res.json();
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch stats' }), { status: 500 });
  }
};
