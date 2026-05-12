<script lang="ts">
  import HomeScreen from '$lib/components/layerzero/HomeScreen.svelte';
  import WalletScreen from '$lib/components/layerzero/WalletScreen.svelte';
  import SEO from '$lib/components/SEO.svelte';

  // ── Constants ──
  const CUTOFF_TIMESTAMP = 1714521600; // May 1, 2024 00:00:00 UTC

  const CHAIN_MAP: Record<number, string> = {
    1: 'Ethereum',
    56: 'BNB Chain',
    97: 'BNB Testnet',
    137: 'Polygon',
    250: 'Fantom',
    288: 'Boba',
    321: 'KCC',
    688: 'Metis',
    1088: 'Metis',
    1101: 'Polygon zkEVM',
    1284: 'Moonbeam',
    1285: 'Moonriver',
    2001: 'Milkomeda',
    42161: 'Arbitrum',
    42220: 'Celo',
    43114: 'Avalanche',
    44787: 'Celo Alfajores',
    59144: 'Linea',
    534352: 'Scroll',
    57073: 'Ink',
    7777777: 'Zora',
    8453: 'Base',
    10: 'Optimism',
    421614: 'Arbitrum Sepolia',
    11155111: 'Sepolia',
    100: 'Gnosis',
    324: 'zkSync Era',
    5: 'Goerli',
    84532: 'Base Sepolia',
    17000: 'Holesky',
    5115: 'Citrea Testnet',
    690: 'Redstone',
    919: 'Mode Testnet',
    34443: 'Mode',
    5112: 'Conflux eSpace',
    7700: 'Canto',
    81457: 'Blast',
    130: 'Unichain',
    78600: 'Vana',
    101043: 'Lisk',
    4200: 'Merlin',
    660279: 'X Layer',
    999999999: 'Zora',
    7000: 'Zetachain',
    11235: 'Haustestnet',
    11236: 'Haus',
    42766: 'ZkFair',
    2332: 'RSS3 VSL',
    2358: 'RSS3 VSL Testnet',
    2020: 'Ronin',
    1329: 'Sei',
    7332: 'Energy Web X',
    2442: 'Polygon zkEVM Cardona',
    480: 'World Chain',
    8081: 'Shibarium',
    8082: 'Shibarium Testnet',
    901: 'Elastos Smart Chain',
    333: 'WEMIX',
    334: 'WEMIX Testnet',
    1868: 'Soneium',
    42793: 'Ethereum Classic',
    1313161554: 'Aurora',
    1666600000: 'Harmony',
    2222: 'Kava',
    204: 'OpBNB',
    28528: 'Optopia',
    54211: 'Suilend',
    196: 'X Layer Testnet',
    8329: 'Lorenzo',
    300: 'Cantina',
    888: 'Wanchain',
    858: 'Gravity Alpha',
    146: 'Exosama',
    999: 'Wemix 3.0 Testnet',
    4162: 'Sx Rollup',
    7878: 'GTN',
    8866: 'Lumoz',
    1127: 'Shrapnel',
  };

  function getChainName(chainId: number): string {
    return CHAIN_MAP[chainId] || `Chain ${chainId}`;
  }

  // ── State ──
  let address = $state('');
  let isLoading = $state(false);
  let loadError = $state('');
  let isRefreshing = $state(false);
  let rawMessages = $state<any[]>([]);

  // ── Computed stats ──
  let filteredMessages = $derived(
    rawMessages.filter((m: any) => {
      const ts = Number(m?.srcUaProtocol?.timestamp || m?.dstUaProtocol?.timestamp || 0);
      return ts >= CUTOFF_TIMESTAMP;
    })
  );

  let totalTransactions = $derived(filteredMessages.length);

  let sourceChainMap = $derived(() => {
    const map = new Map<string, { chainId: number; chainName: string; contracts: Set<string>; count: number }>();
    for (const msg of filteredMessages) {
      const chainId = Number(msg?.srcChainId || 0);
      const key = String(chainId);
      if (!map.has(key)) {
        map.set(key, { chainId, chainName: getChainName(chainId), contracts: new Set(), count: 0 });
      }
      const entry = map.get(key)!;
      const contract = msg?.srcUaAddress || '';
      if (contract) entry.contracts.add(contract.toLowerCase());
      entry.count++;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  });

  let destChainMap = $derived(() => {
    const map = new Map<string, { chainId: number; chainName: string; contracts: Set<string>; count: number }>();
    for (const msg of filteredMessages) {
      const chainId = Number(msg?.dstChainId || 0);
      const key = String(chainId);
      if (!map.has(key)) {
        map.set(key, { chainId, chainName: getChainName(chainId), contracts: new Set(), count: 0 });
      }
      const entry = map.get(key)!;
      const contract = msg?.dstUaAddress || '';
      if (contract) entry.contracts.add(contract.toLowerCase());
      entry.count++;
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  });

  let sourceChains = $derived(sourceChainMap().length);
  let destChains = $derived(destChainMap().length);

  let contractsInteracted = $derived(() => {
    const contracts = new Set<string>();
    for (const msg of filteredMessages) {
      const src = msg?.srcUaAddress;
      const dst = msg?.dstUaAddress;
      if (src) contracts.add(src.toLowerCase());
      if (dst) contracts.add(dst.toLowerCase());
    }
    return contracts.size;
  });

  let protocolsUsed = $derived(() => {
    const map = new Map<string, number>();
    for (const msg of filteredMessages) {
      const protocol = msg?.srcUaProtocol?.protocol || msg?.dstUaProtocol?.protocol || 'Unknown';
      const name = protocol || 'Unknown';
      map.set(name, (map.get(name) || 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  });

  let uniqueDaysActive = $derived(() => {
    const days = new Set<string>();
    for (const msg of filteredMessages) {
      const ts = Number(msg?.srcUaProtocol?.timestamp || msg?.dstUaProtocol?.timestamp || 0);
      if (ts > 0) {
        const date = new Date(ts * 1000);
        days.add(`${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`);
      }
    }
    return days.size;
  });

  let uniqueWeeksActive = $derived(() => {
    const weeks = new Set<string>();
    for (const msg of filteredMessages) {
      const ts = Number(msg?.srcUaProtocol?.timestamp || msg?.dstUaProtocol?.timestamp || 0);
      if (ts > 0) {
        const date = new Date(ts * 1000);
        const startOfYear = new Date(date.getUTCFullYear(), 0, 1);
        const weekNum = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getUTCDay() + 1) / 7);
        weeks.add(`${date.getUTCFullYear()}-W${weekNum}`);
      }
    }
    return weeks.size;
  });

  let uniqueMonthsActive = $derived(() => {
    const months = new Set<string>();
    for (const msg of filteredMessages) {
      const ts = Number(msg?.srcUaProtocol?.timestamp || msg?.dstUaProtocol?.timestamp || 0);
      if (ts > 0) {
        const date = new Date(ts * 1000);
        months.add(`${date.getUTCFullYear()}-${date.getUTCMonth()}`);
      }
    }
    return months.size;
  });

  // Assemble stats object for WalletScreen
  let stats = $derived(
    address && !isLoading && !loadError ? {
      totalTransactions,
      totalMessages: rawMessages.length,
      sourceChains,
      destChains,
      contractsInteracted: contractsInteracted(),
      sourceChainMap: sourceChainMap(),
      destChainMap: destChainMap(),
      protocolsUsed: protocolsUsed(),
      uniqueDaysActive: uniqueDaysActive(),
      uniqueWeeksActive: uniqueWeeksActive(),
      uniqueMonthsActive: uniqueMonthsActive(),
    } : null
  );

  // ── Data fetching with limit=150 and nextToken pagination ──
  async function fetchLayerZeroData(addr: string) {
    isLoading = true;
    loadError = '';
    rawMessages = [];

    try {
      const allMessages: any[] = [];
      let nextToken: string | null = null;
      let pageCount = 0;
      const MAX_PAGES = 20;

      do {
        let url = `https://scan.layerzero-api.com/v1/messages/wallet/${addr}?limit=150`;
        if (nextToken) {
          url += `&nextToken=${nextToken}`;
        }

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`API returned ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();

        if (data?.data?.messages) {
          allMessages.push(...data.data.messages);
        }

        nextToken = data?.data?.nextToken || data?.nextToken || null;
        pageCount++;
      } while (nextToken && pageCount < MAX_PAGES);

      rawMessages = allMessages;
    } catch (err: any) {
      loadError = err.message || 'Failed to fetch LayerZero data. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  async function handleRetry() {
    if (address) {
      await fetchLayerZeroData(address);
    }
  }

  async function handleRefresh() {
    isRefreshing = true;
    await fetchLayerZeroData(address);
    isRefreshing = false;
  }

  function handleAddressSubmit(addr: string) {
    address = addr;
    fetchLayerZeroData(addr);
  }

  function handleReset() {
    address = '';
    rawMessages = [];
    loadError = '';
  }
</script>

<SEO
  title="LayerZero Stats Checker"
  description="Track LayerZero cross-chain activity for airdrop eligibility. Check transactions, chains, and protocols since May 2024."
  keywords={["layerzero", "layerzero stats", "layerzero airdrop", "layerzero checker", "cross-chain", "bridge stats", "layerzero v2"]}
  canonicalUrl="https://cryptowalletsx.com/layerzero-stats"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'LayerZero Stats Checker',
        url: 'https://cryptowalletsx.com/layerzero-stats',
        description: 'Track LayerZero cross-chain activity for airdrop eligibility. Check transactions, chains, and protocols used.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'LayerZero Stats', item: 'https://cryptowalletsx.com/layerzero-stats' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Is the LayerZero stats checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required. Simply enter any wallet address to view its LayerZero cross-chain activity.' } },
          { '@type': 'Question', name: 'What chains does LayerZero support?', acceptedAnswer: { '@type': 'Answer', text: 'LayerZero supports over 80 blockchains including Ethereum, Arbitrum, Optimism, Polygon, Base, BNB Chain, Avalanche, and many more.' } },
          { '@type': 'Question', name: 'How current is the data?', acceptedAnswer: { '@type': 'Answer', text: 'We fetch data directly from the LayerZero API in real-time, so results reflect your latest on-chain activity with a 30-60 second delay for indexer processing.' } }
        ]
      }
    ]
  }}
/>

{#if address}
  <WalletScreen
    {address}
    onReset={handleReset}
    {isLoading}
    {loadError}
    {stats}
    {isRefreshing}
    onRetry={handleRetry}
    onRefresh={handleRefresh}
  />
{:else}
  <HomeScreen onAddressSubmit={handleAddressSubmit} />
{/if}

<!-- Static SEO Content for Crawlers -->
<div class="sr-only" aria-hidden="true">
  <h2>About LayerZero Stats Checker</h2>
  <p>The LayerZero Stats Checker tracks your cross-chain messaging activity across the LayerZero protocol. LayerZero is an omnichain interoperability protocol that enables secure cross-chain communication and asset transfers between over 80 blockchain networks. Our checker analyzes your wallet's bridge transactions, source and destination chains, contract interactions, and protocol usage patterns.</p>
  <h2>LayerZero Airdrop Eligibility</h2>
  <p>Our stats checker filters transactions from May 1, 2024 onwards, which is the cutoff date relevant for LayerZero's second airdrop eligibility. We track total transaction count, unique source and destination chains, contracts interacted with, protocols used (including Stargate, Core, and other LayerZero-connected protocols), and unique days, weeks, and months of activity. These metrics help you understand your cross-chain footprint and potential airdrop qualification.</p>
  <h2>What Metrics We Track</h2>
  <p>The LayerZero stats checker provides comprehensive analytics including: total cross-chain message count, source chain distribution showing which networks you bridge from most frequently, destination chain distribution showing where your assets flow, unique contract interactions across all chains, protocol diversity measuring how many different LayerZero-connected bridges and protocols you use, and activity consistency tracking your engagement over days, weeks, and months. All data is fetched in real-time from the LayerZero scan API.</p>
  <h2>Frequently Asked Questions</h2>
  <p>Is this tool free? Yes, completely free with no account required. Simply enter any wallet address to view its LayerZero cross-chain activity. What chains does LayerZero support? LayerZero supports over 80 blockchains including Ethereum, Arbitrum, Optimism, Polygon, Base, BNB Chain, Avalanche, and many more. How current is the data? We fetch data directly from the LayerZero API in real-time, so results reflect your latest on-chain activity with a 30-60 second delay for indexer processing.</p>
</div>

<!-- Related Tools Internal Links -->
<section class="max-w-5xl mx-auto px-4 sm:px-6 py-8">
  <h3 class="text-lg font-bold mb-4">Related Tools</h3>
  <div class="grid sm:grid-cols-3 gap-3">
    <a href="/relay" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-orange-500/30 transition-all">
      <span class="font-medium text-sm">Relay Bridge Analytics</span>
      <p class="text-xs text-muted-foreground mt-1">Cross-chain bridge & swap stats</p>
    </a>
    <a href="/jumper" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-indigo-500/30 transition-all">
      <span class="font-medium text-sm">Jumper Analytics</span>
      <p class="text-xs text-muted-foreground mt-1">Li.Fi bridge aggregator stats</p>
    </a>
    <a href="/soneium" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-purple-500/30 transition-all">
      <span class="font-medium text-sm">Soneium Wallet Score</span>
      <p class="text-xs text-muted-foreground mt-1">Sony L2 on-chain analytics</p>
    </a>
  </div>
</section>

