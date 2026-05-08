import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken, ChainConfig } from '$lib/types';

const API_TIMEOUT = 15000;

/**
 * Fetch with timeout to prevent infinite loading states.
 */
export function fetchWithTimeout(url: string, timeoutMs = API_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Fetch paginated Blockscout API endpoint, following next_page_params.
 */
export async function fetchPaginated(
  endpoint: string,
  config: ChainConfig,
  address: string,
  maxPages = 5
): Promise<any[]> {
  const allItems: any[] = [];
  const useDirectFetch = config.corsEnabled !== false;

  function apiUrl(ep: string): string {
    if (useDirectFetch) {
      return `${config.apiBase}/addresses/${address}${ep}`;
    }
    return `/${config.id}/api/address/${address}${ep}`;
  }

  let pageParams: Record<string, string> | null = null;
  let pageCount = 0;
  do {
    const queryParams = new URLSearchParams();
    if (pageParams) Object.entries(pageParams).forEach(([k, v]) => queryParams.set(k, v));
    const url = apiUrl(endpoint) + (queryParams.toString() ? `?${queryParams}` : '');
    try {
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const data = await res.json();
        allItems.push(...(data.items || []));
        pageParams = data.next_page_params || null;
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
 * Fires all 6 API calls in parallel for speed.
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

  // Fire ALL 6 requests in parallel
  const [addrRes, tbRes, nftRes, tokRes, txResult, tfResult] = await Promise.all([
    fetchWithTimeout(addrUrl),
    fetchWithTimeout(apiUrl('/token-balances')).catch(() => null),
    fetchWithTimeout(apiUrl('/nft')).catch(() => null),
    fetchWithTimeout(apiUrl('/tokens')).catch(() => null),
    fetchPaginated('/transactions', config, address),
    fetchPaginated('/token-transfers', config, address),
  ]);

  // Address details is required - throw if it fails
  if (!addrRes || !addrRes.ok) {
    throw new Error(`Failed to fetch wallet data from ${config.name}. The API may be temporarily unavailable.`);
  }

  const addressDetails: AddressDetails = await addrRes.json();

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
    tokenBalances,
    nfts,
    allTokens,
  };
}
