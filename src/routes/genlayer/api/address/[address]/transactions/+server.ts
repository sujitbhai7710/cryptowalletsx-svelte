import type { RequestHandler } from './$types';
import { GENLAYER_CONFIG } from '$lib/utils/constants';

function decimalToWei(decimalStr: string): string {
  const num = parseFloat(decimalStr);
  if (isNaN(num) || num === 0) return '0';
  const parts = decimalStr.split('.');
  const wholePart = parts[0] || '0';
  const fracPart = (parts[1] || '').padEnd(18, '0').slice(0, 18);
  return (BigInt(wholePart) * BigInt(10**18) + BigInt(fracPart)).toString();
}

function transformGenlayerTx(tx: any): any {
  // Map GenLayer statuses to Blockscout-like statuses
  const statusMap: Record<string, string> = {
    'finalized': 'ok',
    'accepted': 'ok',
    'committed': 'ok',
    'revealing': 'ok',
    'proposing': 'ok',
    'pending': 'pending',
    'uninitialized': 'pending',
  };

  const txStatus = tx.status ? (statusMap[tx.status.toLowerCase()] || 'ok') : 'ok';

  // Convert value - might be decimal or wei, handle both
  let valueWei = '0';
  try {
    const rawValue = String(tx.value || '0');
    if (rawValue.includes('.')) {
      valueWei = decimalToWei(rawValue);
    } else {
      // Already in wei or integer format
      valueWei = rawValue;
    }
  } catch { valueWei = '0'; }

  // Convert fee similarly
  let feeWei: string | null = null;
  try {
    const rawFee = tx.fee || tx.gas_fee;
    if (rawFee) {
      const feeStr = String(rawFee);
      feeWei = feeStr.includes('.') ? decimalToWei(feeStr) : feeStr;
    }
  } catch { feeWei = null; }

  // Determine if 'to' is a contract - GenLayer intelligent contracts are Python-based
  const toIsContract = tx.to_address ? (tx.to_addr?.is_contract ?? true) : (tx.to ? true : false);

  return {
    hash: tx.hash || tx.transaction_hash,
    from: tx.from_address ? { hash: tx.from_address, is_contract: false } : (tx.from ? { hash: tx.from, is_contract: false } : null),
    to: tx.to_address ? { hash: tx.to_address, is_contract: toIsContract } : (tx.to ? { hash: tx.to, is_contract: toIsContract } : null),
    value: valueWei,
    fee: feeWei ? { type: 'coin', value: feeWei } : null,
    timestamp: tx.block_timestamp || tx.created_at || '',
    method: tx.type || tx.method || null,
    status: txStatus,
    gas_used: tx.gas_used?.toString() || null,
    block_number: tx.block_number || 0,
    nonce: tx.nonce || 0,
    token_transfers: [],
    result: txStatus === 'ok' ? 'success' : 'pending',
    confirmation_duration: [],
    type: null,
    raw_input: null,
    max_fee_per_gas: null,
    max_priority_fee_per_gas: null,
    base_fee_per_gas: null,
    priority_fee: null,
    gas_price: null,
    has_error_in_internal_transactions: null,
    decoded_input: null,
    exchange_rate: null,
  };
}

export const GET: RequestHandler = async ({ params, url }) => {
  const { address } = params;
  const addrLower = address.toLowerCase();
  const page = url.searchParams.get('page') || '1';
  const pageSize = url.searchParams.get('page_size') || '50';

  try {
    // GenLayer doesn't have address-specific transaction endpoints
    // Fetch all transactions and filter server-side
    const res = await fetch(`${GENLAYER_CONFIG.apiBase}/transactions?page=${page}&page_size=100`, {
      headers: { 'Accept': 'application/json' },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `API error: ${res.status}` }), { status: res.status });
    }

    const data = await res.json();
    const allTxs = data.transactions || data.items || data.data || [];

    // Filter transactions by address
    const addrTxs = allTxs.filter((tx: any) => {
      const from = (tx.from_address || tx.from || '').toLowerCase();
      const to = (tx.to_address || tx.to || '').toLowerCase();
      return from === addrLower || to === addrLower;
    });

    const items = addrTxs.map(transformGenlayerTx);

    const result = {
      items,
      next_page_params: null, // GenLayer pagination is limited
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), { status: 500 });
  }
};
