import type { RelayTx, RelayChain, RelayStats, RelayChainActivity, RelayTokenUsage } from '$lib/types';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
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

function isBridge(tx: RelayTx): boolean {
  if (!tx.data?.inTxs?.length || !tx.data?.outTxs?.length) return true;
  const inChain = tx.data.inTxs[0].chainId;
  const outChain = tx.data.outTxs[0].chainId;
  return inChain !== outChain;
}

export function processRelayData(
  transactions: RelayTx[],
  chains: RelayChain[]
): RelayStats {
  const chainMap = new Map<number, RelayChain>();
  for (const c of chains) {
    chainMap.set(c.id, c);
  }

  const totalNetworks = chains.length;
  let bridgeTransactions = 0;
  let swapTransactions = 0;
  let bridgeVolume = 0;
  let swapVolume = 0;
  let successCount = 0;
  let failCount = 0;

  const sourceChainCounts = new Map<number, number>();
  const destChainCounts = new Map<number, number>();
  const sourceChainVolume = new Map<number, number>();
  const destChainVolume = new Map<number, number>();
  const chainTxCounts = new Map<number, number>();
  const chainVolume = new Map<number, number>();

  const tokenMap = new Map<string, {
    symbol: string;
    name: string;
    chainId: number;
    chainName: string;
    chainIcon: string;
    tokenIcon: string;
    transactions: number;
    volume: number;
  }>();

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  let sevenDayBridgeTxs = 0;
  let sevenDaySwapTxs = 0;

  let earliestDate: string | null = null;
  let latestDate: string | null = null;

  const processedTxs = transactions.map((tx) => {
    const bridge = isBridge(tx);
    if (bridge) bridgeTransactions++;
    else swapTransactions++;

    const amountUsd = parseFloat(tx.data?.metadata?.currencyIn?.amountUsd || '0');
    if (bridge) bridgeVolume += amountUsd;
    else swapVolume += amountUsd;

    if (tx.status === 'success') successCount++;
    else if (tx.status === 'failure') failCount++;

    const sourceChainId = tx.data?.inTxs?.[0]?.chainId || 0;
    const destChainId = tx.data?.outTxs?.[0]?.chainId || 0;

    if (sourceChainId) {
      sourceChainCounts.set(sourceChainId, (sourceChainCounts.get(sourceChainId) || 0) + 1);
      sourceChainVolume.set(sourceChainId, (sourceChainVolume.get(sourceChainId) || 0) + amountUsd);
      chainTxCounts.set(sourceChainId, (chainTxCounts.get(sourceChainId) || 0) + 1);
      chainVolume.set(sourceChainId, (chainVolume.get(sourceChainId) || 0) + amountUsd);
    }
    if (destChainId) {
      destChainCounts.set(destChainId, (destChainCounts.get(destChainId) || 0) + 1);
      destChainVolume.set(destChainId, (destChainVolume.get(destChainId) || 0) + amountUsd);
      chainTxCounts.set(destChainId, (chainTxCounts.get(destChainId) || 0) + 1);
      chainVolume.set(destChainId, (chainVolume.get(destChainId) || 0) + amountUsd);
    }

    // Token usage tracking
    const currencyIn = tx.data?.metadata?.currencyIn;
    if (currencyIn) {
      const tokenKey = `${currencyIn.currency.symbol}-${currencyIn.currency.chainId}`;
      const existing = tokenMap.get(tokenKey);
      const chainInfo = chainMap.get(currencyIn.currency.chainId);
      if (existing) {
        existing.transactions++;
        existing.volume += amountUsd;
      } else {
        tokenMap.set(tokenKey, {
          symbol: currencyIn.currency.symbol,
          name: currencyIn.currency.name,
          chainId: currencyIn.currency.chainId,
          chainName: chainInfo?.displayName || `Chain ${currencyIn.currency.chainId}`,
          chainIcon: chainInfo?.iconUrl || '',
          tokenIcon: currencyIn.currency.metadata?.logoURI || '',
          transactions: 1,
          volume: amountUsd,
        });
      }
    }

    // 7-day activity
    const txTimestamp = new Date(tx.createdAt).getTime();
    if (txTimestamp >= sevenDaysAgo) {
      if (bridge) sevenDayBridgeTxs++;
      else sevenDaySwapTxs++;
    }

    // Track earliest/latest
    if (!earliestDate || tx.createdAt < earliestDate) earliestDate = tx.createdAt;
    if (!latestDate || tx.createdAt > latestDate) latestDate = tx.createdAt;

    const sourceChainName = chainMap.get(sourceChainId)?.displayName || `Chain ${sourceChainId}`;
    const destChainName = chainMap.get(destChainId)?.displayName || `Chain ${destChainId}`;

    return {
      id: tx.id,
      date: tx.createdAt,
      type: bridge ? 'Bridge' as const : 'Swap' as const,
      sourceChain: sourceChainId,
      sourceChainName,
      sourceToken: tx.data?.metadata?.currencyIn?.currency?.symbol || 'Unknown',
      destChain: destChainId,
      destChainName,
      destToken: tx.data?.metadata?.currencyOut?.currency?.symbol || 'Unknown',
      amount: tx.data?.metadata?.currencyIn?.amountFormatted || '0',
      amountUsd: amountUsd.toFixed(2),
      status: tx.status === 'success' ? 'Success' : tx.status === 'failure' ? 'Failed' : 'Pending',
      sourceTxHash: tx.data?.inTxs?.[0]?.hash || '',
      destTxHash: tx.data?.outTxs?.[0]?.hash || '',
    };
  });

  // Build chain activity
  const allChainIds = new Set([...sourceChainCounts.keys(), ...destChainCounts.keys()]);
  const chainActivity: RelayChainActivity[] = [];
  for (const chainId of allChainIds) {
    const chainInfo = chainMap.get(chainId);
    chainActivity.push({
      chainId,
      chainName: chainInfo?.displayName || `Chain ${chainId}`,
      chainIcon: chainInfo?.iconUrl || `https://assets.relay.link/icons/${chainId}/light.png`,
      sourceCount: sourceChainCounts.get(chainId) || 0,
      destCount: destChainCounts.get(chainId) || 0,
      sourceVolume: sourceChainVolume.get(chainId) || 0,
      destVolume: destChainVolume.get(chainId) || 0,
      active: true,
    });
  }
  chainActivity.sort((a, b) => (b.sourceCount + b.destCount) - (a.sourceCount + a.destCount));

  // Build token usage
  const tokenUsage: RelayTokenUsage[] = Array.from(tokenMap.values())
    .sort((a, b) => b.volume - a.volume);

  // Compute wallet age
  let walletAge = 'N/A';
  let daysActive = 0;
  let weeksActive = 0;
  let monthsActive = 0;
  if (earliestDate) {
    const ageMs = Date.now() - new Date(earliestDate).getTime();
    daysActive = Math.floor(ageMs / (1000 * 60 * 60 * 24));
    weeksActive = Math.floor(daysActive / 7);
    monthsActive = Math.floor(daysActive / 30);
    walletAge = timeAgo(earliestDate);
  }

  // Most active chain
  let mostActiveChain = 'N/A';
  let mostActiveChainTxs = 0;
  for (const [chainId, count] of chainTxCounts) {
    if (count > mostActiveChainTxs) {
      mostActiveChainTxs = count;
      mostActiveChain = chainMap.get(chainId)?.displayName || `Chain ${chainId}`;
    }
  }

  // Highest volume chain
  let highestVolumeChain = 'N/A';
  let highestVolumeAmount = 0;
  for (const [chainId, vol] of chainVolume) {
    if (vol > highestVolumeAmount) {
      highestVolumeAmount = vol;
      highestVolumeChain = chainMap.get(chainId)?.displayName || `Chain ${chainId}`;
    }
  }

  return {
    totalTransactions: transactions.length,
    bridgeTransactions,
    swapTransactions,
    totalVolume: bridgeVolume + swapVolume,
    bridgeVolume,
    swapVolume,
    successRate: transactions.length > 0 ? (successCount / transactions.length) * 100 : 0,
    successCount,
    failCount,
    networksUsed: allChainIds.size,
    totalNetworks,
    sourceChains: sourceChainCounts.size,
    destChains: destChainCounts.size,
    lastActivity: latestDate ? timeAgo(latestDate) : 'N/A',
    walletAge,
    daysActive,
    weeksActive,
    monthsActive,
    mostActiveChain,
    mostActiveChainTxs,
    highestVolumeChain,
    highestVolumeAmount,
    sevenDayBridgeTxs,
    sevenDaySwapTxs,
    chainActivity,
    tokenUsage,
    transactions: processedTxs,
  };
}
