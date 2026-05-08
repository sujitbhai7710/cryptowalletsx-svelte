import type { JumperTransfer, JumperStats, JumperChainActivity, JumperProtocolUsage } from '$lib/types';

// Comprehensive chain ID → name mapping for chains that may not appear in the Li.Fi /chains endpoint
const CHAIN_ID_NAMES: Record<string, string> = {
  '1': 'Ethereum',
  '10': 'OP Mainnet',
  '25': 'Cronos',
  '30': 'Rootstock',
  '56': 'BSC',
  '100': 'Gnosis',
  '130': 'Unichain',
  '137': 'Polygon',
  '143': 'Monad',
  '204': 'opBNB',
  '232': 'Lens',
  '250': 'Fantom',
  '288': 'Boba',
  '324': 'zkSync Era',
  '369': 'Pulsechain',
  '388': 'Cronos Zap',
  '592': 'Astar',
  '1088': 'Metis',
  '1101': 'Polygon zkEVM',
  '1135': 'Lisk',
  '1284': 'Moonbeam',
  '1285': 'Moonriver',
  '1625': 'Gravity',
  '1868': 'Soneium',
  '2000': 'Dogechain',
  '2222': 'Kava',
  '2741': 'Abstract',
  '42161': 'Arbitrum',
  '42220': 'Celo',
  '43114': 'Avalanche',
  '4326': 'MegaETH',
  '44787': 'Celo Alfajores',
  '534352': 'Scroll',
  '57073': 'Ink',
  '59144': 'Linea',
  '7777777': 'Zora',
  '81457': 'Blast',
  '8453': 'Base',
  '98866': 'Plume',
  '5042002': 'Arc Testnet',
  // Non-EVM chains that appear in Jumper transfers
  '1151111081099710': 'Solana',
  '20000000000001': 'Solana',
  '78431': 'Aptos',
  '501': 'Solana (Legacy)',
  // Testnets
  '11155111': 'Sepolia',
  '84532': 'Base Sepolia',
  '421614': 'Arbitrum Sepolia',
  '11155420': 'OP Sepolia',
  '97': 'BSC Testnet',
  '80001': 'Polygon Mumbai',
  '43113': 'Avalanche Fuji',
  '46630': 'Robinhood Testnet',
  '4441': 'LitVM',
  '912559': 'Seismic Testnet',
  '4221': 'GenLayer',
  '1913': 'SimpleChain',
};

function timeAgo(timestamp: number): string {
  const now = Date.now();
  const diffMs = now - timestamp;
  if (diffMs < 0) return 'just now';
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return '1 month ago';
  if (diffMonths < 12) return `${diffMonths} months ago`;
  const diffYears = Math.floor(diffMonths / 12);
  if (diffYears === 1) return '1 year ago';
  return `${diffYears} years ago`;
}

function isBridge(tx: JumperTransfer): boolean {
  const srcChainId = tx.sending?.chainId;
  const dstChainId = tx.receiving?.chainId;
  if (!srcChainId || !dstChainId) return true;
  return srcChainId !== dstChainId;
}

/**
 * Resolve a chain name from multiple sources in priority order:
 * 1. The chainName field embedded in the transfer side (from Li.Fi API)
 * 2. The chainNames map built from the /v1/chains endpoint
 * 3. The static CHAIN_ID_NAMES fallback mapping
 * 4. A generic "Chain <id>" fallback
 */
function resolveChainName(
  chainKey: string,
  chainId: number | undefined,
  inlineName: string | undefined,
  chainNames: Record<string, string>
): string {
  // 1. Use the name embedded in the transfer data itself (most reliable)
  if (inlineName) return inlineName;
  // 2. Use the name from the chains API lookup
  if (chainNames[chainKey]) return chainNames[chainKey];
  // 3. Use the static fallback mapping
  if (CHAIN_ID_NAMES[chainKey]) return CHAIN_ID_NAMES[chainKey];
  // 4. Generic fallback
  return `Chain ${chainId ?? '?'}`;
}

export function processJumperData(
  transfers: JumperTransfer[],
  chainLogos: Record<string, string> = {},
  chainNames: Record<string, string> = {}
): JumperStats {
  let bridgeTransfers = 0;
  let swapTransfers = 0;
  let bridgeVolume = 0;
  let swapVolume = 0;
  let totalFees = 0;
  let successCount = 0;
  let failCount = 0;

  const sourceChainCounts = new Map<string, number>();
  const destChainCounts = new Map<string, number>();
  const sourceChainVolume = new Map<string, number>();
  const destChainVolume = new Map<string, number>();
  const chainTxCounts = new Map<string, number>();
  const chainVolume = new Map<string, number>();

  const protocolMap = new Map<string, {
    name: string;
    logoURI: string;
    type: 'Bridge' | 'Exchange';
    transactions: number;
    volume: number;
  }>();

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let sevenDayTransfers = 0;
  let sevenDayVolume = 0;
  let olderVolume = 0;

  let earliestTimestamp: number | null = null;
  let latestTimestamp: number | null = null;

  const processedTransfers = transfers.map((tx) => {
    const bridge = isBridge(tx);
    if (bridge) bridgeTransfers++;
    else swapTransfers++;

    // Volume from sending and receiving amounts
    const sendAmountUSD = parseFloat(tx.sending?.amountUSD || '0');
    const recvAmountUSD = parseFloat(tx.receiving?.amountUSD || '0');
    const vol = Math.max(sendAmountUSD, recvAmountUSD);
    if (bridge) bridgeVolume += vol;
    else swapVolume += vol;

    // Fees from gas costs
    const sendGasUSD = parseFloat(tx.sending?.gasAmountUSD || '0');
    const recvGasUSD = parseFloat(tx.receiving?.gasAmountUSD || '0');
    let feeCostsUSD = 0;
    if (tx.feeCosts && Array.isArray(tx.feeCosts)) {
      for (const fee of tx.feeCosts) {
        feeCostsUSD += parseFloat(fee.amountUSD || '0');
      }
    }
    totalFees += sendGasUSD + recvGasUSD + feeCostsUSD;

    // Status
    if (tx.status === 'DONE') successCount++;
    else if (tx.status === 'FAILED') failCount++;

    // Chain tracking using chainId as key
    const srcChainKey = String(tx.sending?.chainId || '0');
    const dstChainKey = String(tx.receiving?.chainId || '0');

    if (tx.sending?.chainId) {
      sourceChainCounts.set(srcChainKey, (sourceChainCounts.get(srcChainKey) || 0) + 1);
      sourceChainVolume.set(srcChainKey, (sourceChainVolume.get(srcChainKey) || 0) + vol);
      chainTxCounts.set(srcChainKey, (chainTxCounts.get(srcChainKey) || 0) + 1);
      chainVolume.set(srcChainKey, (chainVolume.get(srcChainKey) || 0) + vol);
    }
    if (tx.receiving?.chainId) {
      destChainCounts.set(dstChainKey, (destChainCounts.get(dstChainKey) || 0) + 1);
      destChainVolume.set(dstChainKey, (destChainVolume.get(dstChainKey) || 0) + vol);
      chainTxCounts.set(dstChainKey, (chainTxCounts.get(dstChainKey) || 0) + 1);
      chainVolume.set(dstChainKey, (chainVolume.get(dstChainKey) || 0) + vol);
    }

    // Populate chainNames map from transfer data (inline chainName), chains API, or static fallback
    // This ensures chainNames is populated for use in chain activity stats later
    if (!chainNames[srcChainKey]) {
      chainNames[srcChainKey] = tx.sending?.chainName || CHAIN_ID_NAMES[srcChainKey] || '';
    }
    if (!chainNames[dstChainKey]) {
      chainNames[dstChainKey] = tx.receiving?.chainName || CHAIN_ID_NAMES[dstChainKey] || '';
    }

    // Protocol tracking - tool is a string
    const protocolName = tx.tool || 'Unknown';
    const protocolType: 'Bridge' | 'Exchange' = bridge ? 'Bridge' : 'Exchange';
    if (protocolName && protocolName !== 'Unknown') {
      const existing = protocolMap.get(protocolName);
      if (existing) {
        existing.transactions++;
        existing.volume += vol;
      } else {
        protocolMap.set(protocolName, {
          name: protocolName,
          logoURI: '',
          type: protocolType,
          transactions: 1,
          volume: vol,
        });
      }
    }

    // Timestamp tracking
    const sendTs = (tx.sending?.timestamp || 0) * 1000; // API returns seconds
    const recvTs = (tx.receiving?.timestamp || 0) * 1000;
    const txTs = Math.max(sendTs, recvTs);

    // 7-day activity
    if (txTs >= sevenDaysAgo) {
      sevenDayTransfers++;
      sevenDayVolume += vol;
    } else {
      olderVolume += vol;
    }

    // Track earliest/latest
    if (txTs > 0) {
      if (!earliestTimestamp || txTs < earliestTimestamp) earliestTimestamp = txTs;
      if (!latestTimestamp || txTs > latestTimestamp) latestTimestamp = txTs;
    }

    // Resolve chain names using the multi-source helper (inline name > chains API > static map > fallback)
    const sourceChainName = resolveChainName(srcChainKey, tx.sending?.chainId, tx.sending?.chainName, chainNames);
    const destChainName = resolveChainName(dstChainKey, tx.receiving?.chainId, tx.receiving?.chainName, chainNames);

    return {
      id: tx.transactionId,
      date: txTs > 0 ? new Date(txTs).toISOString() : new Date().toISOString(),
      type: bridge ? 'Bridge' as const : 'Swap' as const,
      sourceChainName,
      sourceChainIcon: chainLogos[srcChainKey] || '',
      sourceToken: tx.sending?.token?.symbol || 'Unknown',
      destChainName,
      destChainIcon: chainLogos[dstChainKey] || '',
      destToken: tx.receiving?.token?.symbol || 'Unknown',
      fromAmount: tx.sending?.amount || '0',
      fromAmountUSD: sendAmountUSD.toFixed(2),
      toAmount: tx.receiving?.amount || '0',
      toAmountUSD: recvAmountUSD.toFixed(2),
      status: tx.status === 'DONE' ? 'Success' : tx.status === 'FAILED' ? 'Failed' : 'Pending',
      protocol: protocolName,
      protocolIcon: '',
      feesUSD: (sendGasUSD + recvGasUSD + feeCostsUSD).toFixed(2),
    };
  });

  // Build chain activity
  const allChainKeys = new Set([...sourceChainCounts.keys(), ...destChainCounts.keys()]);
  const chainActivity: JumperChainActivity[] = [];
  for (const chainKey of allChainKeys) {
    const chainName = resolveChainName(chainKey, parseInt(chainKey) || undefined, undefined, chainNames);
    const logo = chainLogos[chainKey] || '';
    chainActivity.push({
      chainId: parseInt(chainKey) || 0,
      chainKey,
      chainName,
      chainIcon: logo,
      sourceCount: sourceChainCounts.get(chainKey) || 0,
      destCount: destChainCounts.get(chainKey) || 0,
      sourceVolume: sourceChainVolume.get(chainKey) || 0,
      destVolume: destChainVolume.get(chainKey) || 0,
      active: true,
    });
  }
  chainActivity.sort((a, b) => (b.sourceCount + b.destCount) - (a.sourceCount + a.destCount));

  // Build protocol usage
  const protocolUsage: JumperProtocolUsage[] = Array.from(protocolMap.values())
    .sort((a, b) => b.transactions - a.transactions);

  // Compute wallet age
  let walletAge = 'N/A';
  let daysActive = 0;
  let weeksActive = 0;
  let monthsActive = 0;
  if (earliestTimestamp) {
    const ageMs = Date.now() - earliestTimestamp;
    daysActive = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    weeksActive = Math.floor(daysActive / 7);
    monthsActive = Math.floor(daysActive / 30);
    walletAge = timeAgo(earliestTimestamp);
  }

  // Most active chain
  let mostActiveChain = 'N/A';
  let mostActiveChainTxs = 0;
  for (const [chainKey, count] of chainTxCounts) {
    if (count > mostActiveChainTxs) {
      mostActiveChainTxs = count;
      mostActiveChain = resolveChainName(chainKey, parseInt(chainKey) || undefined, undefined, chainNames);
    }
  }

  // Highest volume chain
  let highestVolumeChain = 'N/A';
  let highestVolumeAmount = 0;
  for (const [chainKey, vol] of chainVolume) {
    if (vol > highestVolumeAmount) {
      highestVolumeAmount = vol;
      highestVolumeChain = resolveChainName(chainKey, parseInt(chainKey) || undefined, undefined, chainNames);
    }
  }

  // 7-day volume change percentage
  const sevenDayVolumeChange = olderVolume > 0
    ? ((sevenDayVolume - olderVolume / 7) / (olderVolume / 7)) * 100
    : sevenDayVolume > 0 ? 100 : 0;

  return {
    totalTransfers: transfers.length,
    bridgeTransfers,
    swapTransfers,
    totalVolume: bridgeVolume + swapVolume,
    bridgeVolume,
    swapVolume,
    totalFees,
    successRate: transfers.length > 0 ? (successCount / transfers.length) * 100 : 0,
    successCount,
    failCount,
    networksUsed: allChainKeys.size,
    totalNetworks: Object.keys(chainLogos).length || allChainKeys.size,
    sourceChains: sourceChainCounts.size,
    destChains: destChainCounts.size,
    lastActivity: latestTimestamp ? timeAgo(latestTimestamp) : 'N/A',
    walletAge,
    daysActive,
    weeksActive,
    monthsActive,
    mostActiveChain,
    mostActiveChainTxs,
    highestVolumeChain,
    highestVolumeAmount,
    sevenDayTransfers,
    sevenDayVolumeChange,
    chainActivity,
    protocolUsage,
    transfers: processedTransfers,
  };
}
