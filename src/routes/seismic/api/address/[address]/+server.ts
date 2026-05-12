import type { RequestHandler } from './$types';
import { SEISMIC_CONFIG } from '$lib/utils/constants';

export const GET: RequestHandler = async ({ params }) => {
  const { address } = params;
  try {
    // socialscan doesn't have a direct address endpoint, so we construct from transactions + balance
    // Fire both requests in parallel for faster response
    const [txRes, balanceRes] = await Promise.allSettled([
      fetch(`${SEISMIC_CONFIG.apiBase}/address/${address}/transactions?page=1&size=50`, {
        headers: { 'Accept': 'application/json' },
      }),
      fetch(`${SEISMIC_CONFIG.rpcEndpoints[0]}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_getBalance',
          params: [address, 'latest'],
          id: 1,
        }),
      }),
    ]);

    let coinBalance = '0';
    if (balanceRes.status === 'fulfilled' && balanceRes.value.ok) {
      try {
        const balanceData = await balanceRes.value.json();
        if (balanceData.result) {
          // eth_getBalance returns hex (e.g. "0xde0b6b3a7640000");
          // convert to decimal WEI string to match the AddressDetails format
          // that Blockscout-style APIs return
          coinBalance = BigInt(balanceData.result).toString();
        }
      } catch {
        // Ignore balance parse errors
      }
    }

    if (txRes.status === 'rejected' || !txRes.value.ok) {
      // Return minimal address details with whatever balance we got
      return new Response(JSON.stringify({
        hash: address,
        implementations: null,
        is_contract: false,
        is_verified: null,
        name: null,
        private_tags: [],
        public_tags: [],
        watchlist_names: [],
        ens_domain_name: null,
        coin_balance: coinBalance,
        exchange_rate: null,
        has_token_transfers: false,
        has_tokens: false,
        has_nft: false,
        token_instances_count: 0,
        token_transfers_count: 0,
        transactions_count: 0,
        gas_usage: '0',
        last_active_at: null,
        created_at: null,
        creator_address_hash: null,
        creation_tx_hash: null,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const data = await txRes.value.json();
    const items = data.data || data.items || data.transactions || [];
    const txCount = data.total ?? items.length;

    // Estimate gas_usage from fetched transactions
    let totalGasUsed = BigInt(0);
    let earliestTimestamp: string | null = null;
    let latestTimestamp: string | null = null;
    let hasTokenTransfers = false;
    let hasTokens = false;
    let tokenTransfersCount = 0;
    let nftCount = 0;

    for (const tx of items) {
      // Accumulate gas usage
      if (tx.receipt_gas_used) {
        try {
          totalGasUsed += BigInt(tx.receipt_gas_used);
        } catch {
          // Skip invalid gas values
        }
      }

      // Track timestamps
      const ts = tx.block_timestamp;
      if (ts) {
        if (!earliestTimestamp || ts < earliestTimestamp) {
          earliestTimestamp = ts;
        }
        if (!latestTimestamp || ts > latestTimestamp) {
          latestTimestamp = ts;
        }
      }

      // Count token transfers
      if (tx.token_transfers && Array.isArray(tx.token_transfers)) {
        tokenTransfersCount += tx.token_transfers.length;
        if (tx.token_transfers.length > 0) {
          hasTokenTransfers = true;
          hasTokens = true;
        }
        // Check for NFT transfers within token_transfers
        for (const tf of tx.token_transfers) {
          if (tf.token_type === 'ERC-721' || tf.token_type === 'ERC-1155') {
            nftCount++;
          }
        }
      }
      // Heuristic: if value is 0 and it's a contract interaction, likely a token transfer
      const value = parseFloat(String(tx.value ?? '0'));
      if (value === 0 && tx.to_address && tx.to_addr?.is_contract) {
        hasTokenTransfers = true;
        hasTokens = true;
      }
    }

    // Scale gas_usage estimate: if we fetched < total txs, extrapolate
    const fetchedCount = items.length;
    let estimatedGasUsage = totalGasUsed;
    if (fetchedCount > 0 && txCount > fetchedCount) {
      estimatedGasUsage = totalGasUsed * BigInt(Math.ceil(txCount / fetchedCount));
    }

    // Detect contract deployment: if first tx has to=null and from matches address
    let isContract = false;
    let creatorAddressHash: string | null = null;
    let creationTxHash: string | null = null;
    for (const tx of items) {
      if (tx.to_address === null || tx.to === null) {
        if (tx.from_address?.toLowerCase() === address.toLowerCase() || tx.from?.hash?.toLowerCase() === address.toLowerCase()) {
          isContract = true;
          creatorAddressHash = tx.from_address || tx.from?.hash || null;
          creationTxHash = tx.hash || tx.transaction_hash || null;
          break;
        }
      }
    }

    const addressDetails = {
      hash: address,
      implementations: null,
      is_contract: isContract,
      is_verified: null,
      name: null,
      private_tags: [],
      public_tags: [],
      watchlist_names: [],
      ens_domain_name: null,
      coin_balance: coinBalance,
      exchange_rate: null,
      has_token_transfers: hasTokenTransfers,
      has_tokens: hasTokens,
      has_nft: nftCount > 0,
      token_instances_count: nftCount,
      token_transfers_count: tokenTransfersCount,
      transactions_count: txCount,
      gas_usage: estimatedGasUsage.toString(),
      last_active_at: latestTimestamp,
      created_at: earliestTimestamp,
      creator_address_hash: creatorAddressHash,
      creation_tx_hash: creationTxHash,
    };

    return new Response(JSON.stringify(addressDetails), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch address details' }), { status: 500 });
  }
};
