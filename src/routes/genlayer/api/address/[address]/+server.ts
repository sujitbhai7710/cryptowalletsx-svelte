import type { RequestHandler } from './$types';
import { GENLAYER_CONFIG } from '$lib/utils/constants';

export const GET: RequestHandler = async ({ params }) => {
  const { address } = params;
  const addrLower = address.toLowerCase();

  try {
    // GenLayer doesn't have address-specific endpoints
    // Fetch transactions and filter by address
    const res = await fetch(`${GENLAYER_CONFIG.apiBase}/transactions?page=1&page_size=50`, {
      headers: { 'Accept': 'application/json' },
    });

    let txCount = 0;
    let lastActive: string | null = null;

    if (res.ok) {
      const data = await res.json();
      const allTxs = data.transactions || data.items || data.data || [];
      const addrTxs = allTxs.filter((tx: any) => {
        const from = (tx.from_address || tx.from || '').toLowerCase();
        const to = (tx.to_address || tx.to || '').toLowerCase();
        return from === addrLower || to === addrLower;
      });
      txCount = addrTxs.length;
      if (addrTxs.length > 0) {
        lastActive = addrTxs[0].block_timestamp || addrTxs[0].created_at || null;
      }
    }

    const addressDetails = {
      hash: address,
      implementations: null,
      is_contract: false,
      is_verified: null,
      name: null,
      private_tags: [],
      public_tags: [],
      watchlist_names: [],
      ens_domain_name: null,
      coin_balance: '0',
      exchange_rate: null,
      has_token_transfers: false,
      has_tokens: false,
      has_nft: false,
      token_instances_count: 0,
      token_transfers_count: 0,
      transactions_count: txCount,
      gas_usage: '0',
      last_active_at: lastActive,
      created_at: null,
      creator_address_hash: null,
      creation_tx_hash: null,
    };

    return new Response(JSON.stringify(addressDetails), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch address details' }), { status: 500 });
  }
};
