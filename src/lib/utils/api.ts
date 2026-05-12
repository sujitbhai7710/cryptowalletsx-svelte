import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, ChainConfig } from '$lib/types';

const API_TIMEOUT = 15000;
const PAGINATED_TIMEOUT = 30000;

/**
 * Fetch with timeout to prevent infinite loading states.
 */
export function fetchWithTimeout(url: string, timeoutMs = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Fetch ALL pages from a paginated Blockscout API endpoint.
 * Blockscout v2 uses cursor-based pagination (next_page_params), so pages
 * must be fetched sequentially. However, we now fetch up to maxPages (default 50)
 * instead of the old limit of 5, giving us up to 2500 transactions instead of 250.
 *
 * @param endpoint - API endpoint path (e.g. '/transactions')
 * @param config - Chain configuration
 * @param address - Wallet address
 * @param maxPages - Maximum pages to fetch (default 50 = 2500 items at 50/page)
 */
export async function fetchPaginated(
  endpoint: string,
  config: ChainConfig,
  address: string,
  maxPages = 50
): Promise<any[]> {
  const useDirectFetch = config.corsEnabled !== false;

  function buildUrl(params?: Record<string, string>): string {
    const base = useDirectFetch
      ? `${config.apiBase}/addresses/${address}${endpoint}`
      : `/${config.id}/api/address/${address}${endpoint}`;
    if (params) {
      const qs = new URLSearchParams(params).toString();
      return qs ? `${base}?${qs}` : base;
    }
    return base;
  }

  const allItems: any[] = [];
  let pageParams: Record<string, string> | null = null;
  let pageCount = 0;

  do {
    const url = buildUrl(pageParams || undefined);
    try {
      const res = await fetchWithTimeout(url, PAGINATED_TIMEOUT);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        allItems.push(...items);
        pageParams = data.next_page_params || null;
        // If we got fewer items than expected, we've reached the end
        if (items.length === 0) break;
      } else {
        break;
      }
    } catch {
      break;
    }
    pageCount++;
  } while (pageParams && pageCount < maxPages);

  return allItems;
}

export interface BlockscoutFetchResult {
  addressDetails: AddressDetails | null;
  transactions: Transaction[];
  tokenTransfers: TokenTransfer[];
  tokenBalances: TokenBalance[];
  nfts: NFTItem[];
  allTokens: AllToken[];
}

/**
 * Fetch all wallet data from a Blockscout-compatible API.
 *
 * Strategy for speed & completeness:
 * 1. First fetch address details (single fast request)
 * 2. Then fire ALL other API calls in parallel:
 *    - token-balances, nft, tokens (single requests each)
 *    - transactions (up to 50 pages = 2500 items, was 5 pages = 250)
 *    - token-transfers (up to 30 pages = 1500 items, was 5 pages = 250)
 */
export async function fetchBlockscoutData(
  address: string,
  config: ChainConfig
): Promise<BlockscoutFetchResult> {
  const useDirectFetch = config.corsEnabled !== false;

  function apiUrl(endpoint: string): string {
    if (useDirectFetch) {
      return `${config.apiBase}/addresses/${address}${endpoint}`;
    }
    return `/${config.id}/api/address/${address}${endpoint}`;
  }

  const addrUrl = useDirectFetch
    ? `${config.apiBase}/addresses/${address}`
    : `/${config.id}/api/address/${address}`;

  // Step 1: Fetch address details first (needed anyway, and helps determine if wallet exists)
  let addressDetails: AddressDetails | null = null;
  try {
    const addrRes = await fetchWithTimeout(addrUrl);
    if (!addrRes.ok) {
      throw new Error(`Failed to fetch wallet data from ${config.name}. The API may be temporarily unavailable.`);
    }
    addressDetails = await addrRes.json();
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error(`Request timed out. The ${config.name} API is taking too long to respond. Please try again.`);
    }
    throw new Error(`Failed to fetch wallet data from ${config.name}. The API may be temporarily unavailable.`);
  }

  // Step 2: Fire ALL data requests in parallel
  const [tbRes, nftRes, tokRes, txResult, tfResult] = await Promise.all([
    fetchWithTimeout(apiUrl('/token-balances')).catch(() => null),
    fetchWithTimeout(apiUrl('/nft')).catch(() => null),
    fetchWithTimeout(apiUrl('/tokens')).catch(() => null),
    fetchPaginated('/transactions', config, address, 50),
    fetchPaginated('/token-transfers', config, address, 30),
  ]);

  let tokenBalances: TokenBalance[] = [];
  if (tbRes && tbRes.ok) {
    try {
      const tbData = await tbRes.json();
      tokenBalances = Array.isArray(tbData) ? tbData : (tbData.items || []);
    } catch { /* ignore */ }
  }

  let nfts: NFTItem[] = [];
  if (nftRes && nftRes.ok) {
    try {
      const nftData = await nftRes.json();
      nfts = nftData.items || [];
    } catch { /* ignore */ }
  }

  let allTokens: AllToken[] = [];
  if (tokRes && tokRes.ok) {
    try {
      const tokData = await tokRes.json();
      allTokens = tokData.items || [];
    } catch { /* ignore */ }
  }

  return {
    addressDetails,
    transactions: txResult,
    tokenTransfers: tfResult,
    nfts,
    tokenBalances,
    allTokens,
  };
}
