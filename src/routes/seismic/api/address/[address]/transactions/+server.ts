import type { RequestHandler } from './$types';
import { SEISMIC_CONFIG } from '$lib/utils/constants';

function decimalToWei(decimalStr: string): string {
  // Convert decimal ETH value to wei (18 decimals)
  const num = parseFloat(decimalStr);
  if (isNaN(num) || num === 0) return '0';
  // Use string manipulation to avoid floating point errors
  const parts = decimalStr.split('.');
  const wholePart = parts[0] || '0';
  const fracPart = (parts[1] || '').padEnd(18, '0').slice(0, 18);
  // Remove leading zeros from whole part and combine
  const weiStr = (BigInt(wholePart) * BigInt(10**18) + BigInt(fracPart)).toString();
  return weiStr;
}

function transformTransaction(tx: any): any {
  // socialscan returns value as decimal (e.g., "0", "1.5") not wei
  // Convert to wei for Blockscout compatibility
  const valueWei = decimalToWei(String(tx.value ?? '0'));
  const feeWei = tx.transaction_fee ? decimalToWei(String(tx.transaction_fee)) : null;

  return {
    hash: tx.hash,
    from: tx.from_address ? { hash: tx.from_address, is_contract: tx.from_addr?.is_contract ?? false } : null,
    to: tx.to_address ? { hash: tx.to_address, is_contract: tx.to_addr?.is_contract ?? false } : null,
    value: valueWei,
    fee: feeWei ? { type: 'coin', value: feeWei } : null,
    timestamp: tx.block_timestamp ?? '',
    method: tx.method ?? null,
    status: tx.receipt_status === 1 ? 'ok' : 'error',
    gas_used: tx.receipt_gas_used?.toString() ?? null,
    block_number: tx.block_number ?? 0,
    nonce: 0,
    token_transfers: [],
    result: tx.receipt_status === 1 ? 'success' : 'reverted',
    confirmation_duration: [],
    type: null,
    raw_input: null,
    max_fee_per_gas: null,
    max_priority_fee_per_gas: null,
    base_fee_per_gas: null,
    priority_fee: null,
    gas_price: tx.gas_price?.toString() ?? null,
    has_error_in_internal_transactions: null,
    decoded_input: null,
    exchange_rate: null,
  };
}

export const GET: RequestHandler = async ({ params, url }) => {
  const { address } = params;
  const page = url.searchParams.get('page') || '1';
  const size = url.searchParams.get('size') || '50';

  try {
    const res = await fetch(`${SEISMIC_CONFIG.apiBase}/address/${address}/transactions?page=${page}&size=${size}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `API error: ${res.status}` }), { status: res.status });
    }
    const data = await res.json();

    const items = (data.items || data.transactions || []).map(transformTransaction);
    const total = data.total ?? items.length;

    // socialscan uses page/size pagination, not next_page_params
    const hasMore = items.length === parseInt(size) && (parseInt(page) * parseInt(size)) < total;

    const result = {
      items,
      next_page_params: hasMore ? { page: String(parseInt(page) + 1), size } : null,
    };

    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), { status: 500 });
  }
};
