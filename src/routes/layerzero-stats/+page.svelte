<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import {
    Search,
    ArrowLeftRight,
    Activity,
    Globe,
    Layers,
    Calendar,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    Link2,
    Hash,
    Clock,
    CalendarDays,
    CalendarRange,
    Loader2,
    AlertCircle,
    FileCode2,
  } from 'lucide-svelte';
  import { isValidEvmAddress, truncateAddress } from '$lib/utils/format';

  // ── State ──
  let inputAddress = $state('');
  let address = $state('');
  let isLoading = $state(false);
  let error = $state('');
  let rawMessages = $state<any[]>([]);

  let expandedSrcChains = $state<Set<string>>(new Set());
  let expandedDstChains = $state<Set<string>>(new Set());

  // ── Constants ──
  const CUTOFF_TIMESTAMP = 1714521600; // May 1, 2024 00:00:00 UTC

  // ── Chain name map ──
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

  let hasResults = $derived(totalTransactions > 0);

  // ── Data fetching ──
  async function fetchLayerZeroData(addr: string) {
    isLoading = true;
    error = '';
    rawMessages = [];

    try {
      const allMessages: any[] = [];

      // First page
      const url1 = `https://scan.layerzero-api.com/v1/messages/wallet/${addr}?limit=1000`;
      const res1 = await fetch(url1);
      if (!res1.ok) {
        throw new Error(`API returned ${res1.status}: ${res1.statusText}`);
      }
      const data1 = await res1.json();
      if (data1?.data?.messages) {
        allMessages.push(...data1.data.messages);
      }

      // Check for nextToken and fetch second page
      const nextToken = data1?.data?.nextToken || data1?.nextToken;
      if (nextToken) {
        try {
          const url2 = `https://scan.layerzero-api.com/v1/messages/wallet/${addr}?limit=1000&nextToken=${nextToken}`;
          const res2 = await fetch(url2);
          if (res2.ok) {
            const data2 = await res2.json();
            if (data2?.data?.messages) {
              allMessages.push(...data2.data.messages);
            }
          }
        } catch {
          // Second page failure is non-critical
        }
      }

      rawMessages = allMessages;
    } catch (err: any) {
      error = err.message || 'Failed to fetch LayerZero data. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleSearch() {
    const addr = inputAddress.trim();
    if (!addr) {
      error = 'Please enter a wallet address';
      return;
    }
    if (!isValidEvmAddress(addr)) {
      error = 'Invalid EVM address format. Must start with 0x and be 42 characters.';
      return;
    }
    error = '';
    address = addr;
    fetchLayerZeroData(addr);
  }

  function handleRetry() {
    if (address) {
      fetchLayerZeroData(address);
    }
  }

  function toggleSrcChain(key: string) {
    const next = new Set(expandedSrcChains);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    expandedSrcChains = next;
  }

  function toggleDstChain(key: string) {
    const next = new Set(expandedDstChains);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    expandedDstChains = next;
  }

  const sampleAddresses = [
    '0xA012B32d3568CC93713A5e63DF7a772Af034af9A',
    '0x5739430639B19433Acd98ccb188Ea8582e514768',
  ];
</script>

<SEO
  title="LayerZero Stats Checker - CryptoWalletsX"
  description="Track your LayerZero cross-chain activity for the second airdrop. Check total transactions, source and destination chains, contracts interacted, protocols used, and unique activity metrics from May 1, 2024."
  keywords={["layerzero", "layerzero stats", "layerzero airdrop", "layerzero checker", "cross-chain", "bridge stats", "layerzero v2"]}
  canonicalUrl="https://cryptowalletsx.com/layerzero-stats"
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <main class="flex-1">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 mesh-gradient"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-r from-cyan-500/8 to-teal-500/8 rounded-full blur-3xl"></div>

      <div class="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <Badge class="mb-6 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/15">
          <Layers class="w-3 h-3 mr-1" />
          Cross-Chain Protocol
        </Badge>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-4">
          <span class="gradient-text">LayerZero</span>
          <br />
          <span class="text-foreground">Stats Checker</span>
        </h1>

        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Track your LayerZero cross-chain activity for the <span class="text-cyan-500 font-semibold">second airdrop</span>.
          Analyze transactions, chain coverage, and protocol interactions from May 1, 2024.
        </p>

        <!-- Search Input -->
        <div class="max-w-xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-2 p-2 bg-card border border-border/50 rounded-2xl shadow-lg shadow-cyan-500/5 backdrop-blur-xl">
            <Input
              value={inputAddress}
              oninput={(e) => { inputAddress = (e.target as HTMLInputElement).value; error = ''; }}
              onkeydown={(e) => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="Enter EVM Address (0x...)"
              class="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
            />
            <Button
              onclick={handleSearch}
              disabled={isLoading}
              class="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white px-6 rounded-xl shadow-md shadow-cyan-500/25"
            >
              {#if isLoading}
                <Loader2 class="w-4 h-4 sm:mr-2 animate-spin" />
              {:else}
                <Search class="w-4 h-4 sm:mr-2" />
              {/if}
              <span class="hidden sm:inline">{isLoading ? 'Checking...' : 'Check Stats'}</span>
            </Button>
          </div>
          {#if error && !address}
            <p class="text-destructive text-sm mt-2">{error}</p>
          {/if}
        </div>

        <!-- Sample Addresses -->
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <span class="text-xs text-muted-foreground mr-1 self-center">Try:</span>
          {#each sampleAddresses as addr}
            <button
              class="text-xs px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors font-mono"
              onclick={() => { inputAddress = addr; address = addr; fetchLayerZeroData(addr); }}
            >
              {addr.slice(0, 8)}...{addr.slice(-4)}
            </button>
          {/each}
        </div>
      </div>
    </section>

    <!-- Quick Stats (before search) -->
    {#if !address}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          {#each [
            { icon: Layers, label: 'Protocol', value: 'LayerZero V2', color: 'text-cyan-500' },
            { icon: Globe, label: 'Networks', value: '100+ Chains', color: 'text-teal-500' },
            { icon: Activity, label: 'Type', value: 'Omnichain', color: 'text-cyan-500' },
            { icon: ArrowLeftRight, label: 'Focus', value: '2nd Airdrop', color: 'text-teal-500' },
          ] as stat}
            <Card class="glass-card bg-card/60 border-border/40 card-hover-lift">
              <div class="p-4 sm:p-6 text-center">
                <stat.icon class="w-6 h-6 mx-auto mb-2 {stat.color}" />
                <p class="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p class="font-bold text-sm sm:text-base">{stat.value}</p>
              </div>
            </Card>
          {/each}
        </div>
      </section>

      <!-- What You Can Analyze -->
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-16">
        <h2 class="text-2xl font-bold mb-6 text-center">
          <Layers class="w-5 h-5 inline text-cyan-500" />
          What You Can Analyze
        </h2>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {#each [
            { title: 'Total Transactions', desc: 'Count of all LayerZero messages sent after May 1, 2024 cutoff for second airdrop eligibility', emoji: '📊' },
            { title: 'Chain Coverage', desc: 'Unique source and destination chains with per-chain contract interaction breakdowns', emoji: '🌐' },
            { title: 'Contract Interactions', desc: 'All unique contract addresses you have interacted with across every chain', emoji: '📝' },
            { title: 'Protocol Breakdown', desc: 'See which protocols (Stargate, OFT, etc.) you have used and how many times', emoji: '🔗' },
            { title: 'Activity Streaks', desc: 'Unique days, weeks, and months active to measure engagement consistency', emoji: '📅' },
            { title: 'Expandable Details', desc: 'Drill down into each chain to see every contract address you interacted with', emoji: '🔍' },
          ] as feat}
            <Card class="glass-card bg-card/60 border-border/40 p-5">
              <div class="text-2xl mb-2">{feat.emoji}</div>
              <h3 class="font-semibold mb-1">{feat.title}</h3>
              <p class="text-sm text-muted-foreground">{feat.desc}</p>
            </Card>
          {/each}
        </div>
      </section>
    {/if}

    <!-- Loading State -->
    {#if isLoading}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/15 to-teal-500/15 mb-6">
          <Loader2 class="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Analyzing LayerZero Activity</h2>
        <p class="text-muted-foreground">Fetching cross-chain messages for {truncateAddress(address, 6)}...</p>
        <div class="mt-4 flex justify-center gap-1">
          <div class="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style="animation-delay: 0ms;"></div>
          <div class="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style="animation-delay: 150ms;"></div>
          <div class="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style="animation-delay: 300ms;"></div>
        </div>
      </section>
    {/if}

    <!-- Error State -->
    {#if error && address && !isLoading}
      <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
          <AlertCircle class="w-8 h-8 text-destructive" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Failed to Load Data</h2>
        <p class="text-muted-foreground mb-4">{error}</p>
        <Button onclick={handleRetry} class="bg-gradient-to-r from-cyan-500 to-teal-600 text-white">
          <RefreshCw class="w-4 h-4 mr-2" /> Try Again
        </Button>
      </section>
    {/if}

    <!-- Results -->
    {#if address && !isLoading && !error}
      {#if hasResults}
        <!-- Address bar -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-2">
          <div class="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" class="gap-1.5 text-xs font-mono">
              <Layers class="w-3 h-3 text-cyan-500" />
              {truncateAddress(address, 8)}
            </Badge>
            <Badge class="bg-cyan-500/10 text-cyan-500 border-cyan-500/30 text-xs">
              {rawMessages.length} total messages
            </Badge>
            <Badge class="bg-teal-500/10 text-teal-500 border-teal-500/30 text-xs">
              {totalTransactions} after May 1, 2024
            </Badge>
            <div class="ml-auto">
              <Button variant="ghost" size="sm" class="h-7 text-xs gap-1" onclick={handleRetry}>
                <RefreshCw class="w-3 h-3" /> Refresh
              </Button>
            </div>
          </div>
        </section>

        <!-- Main Stats Grid -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <Activity class="w-4 h-4 text-cyan-500" />
            Key Metrics
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card class="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20 card-hover-lift">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <Hash class="w-4 h-4 text-cyan-500" />
                  <p class="text-xs text-muted-foreground">Total Transactions</p>
                </div>
                <p class="font-bold text-2xl count-up">{totalTransactions}</p>
                <p class="text-[10px] text-muted-foreground mt-1">After May 1, 2024</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-500/20 card-hover-lift">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <Globe class="w-4 h-4 text-teal-500" />
                  <p class="text-xs text-muted-foreground">Source Chains</p>
                </div>
                <p class="font-bold text-2xl count-up">{sourceChains}</p>
                <p class="text-[10px] text-muted-foreground mt-1">Unique chains sent from</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 card-hover-lift">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <ArrowLeftRight class="w-4 h-4 text-emerald-500" />
                  <p class="text-xs text-muted-foreground">Dest. Chains</p>
                </div>
                <p class="font-bold text-2xl count-up">{destChains}</p>
                <p class="text-[10px] text-muted-foreground mt-1">Unique chains received on</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20 card-hover-lift">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <FileCode2 class="w-4 h-4 text-violet-500" />
                  <p class="text-xs text-muted-foreground">Contracts Interacted</p>
                </div>
                <p class="font-bold text-2xl count-up">{contractsInteracted()}</p>
                <p class="text-[10px] text-muted-foreground mt-1">Unique contract addresses</p>
              </div>
            </Card>
          </div>
        </section>

        <!-- Protocols Used -->
        {#if protocolsUsed().length > 0}
          <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <Link2 class="w-4 h-4 text-cyan-500" />
              Protocols Used
            </h3>
            <Card class="bg-card/60 border-border/40">
              <div class="p-5">
                <div class="flex flex-wrap gap-2">
                  {#each protocolsUsed() as [protocol, count]}
                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 hover:bg-secondary/80 transition-colors">
                      <div class="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span class="text-sm font-medium">{protocol}</span>
                      <Badge variant="secondary" class="text-[10px]">{count}</Badge>
                    </div>
                  {/each}
                </div>
              </div>
            </Card>
          </section>
        {/if}

        <!-- Activity Stats -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <Calendar class="w-4 h-4 text-cyan-500" />
            Activity Metrics
          </h3>
          <div class="grid grid-cols-3 gap-3">
            <Card class="bg-card/60 border-border/40 card-hover-lift">
              <div class="p-4 text-center">
                <CalendarDays class="w-5 h-5 mx-auto mb-2 text-cyan-500" />
                <p class="text-xs text-muted-foreground mb-1">Unique Days</p>
                <p class="font-bold text-2xl text-cyan-500 count-up">{uniqueDaysActive()}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40 card-hover-lift">
              <div class="p-4 text-center">
                <CalendarRange class="w-5 h-5 mx-auto mb-2 text-teal-500" />
                <p class="text-xs text-muted-foreground mb-1">Unique Weeks</p>
                <p class="font-bold text-2xl text-teal-500 count-up">{uniqueWeeksActive()}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40 card-hover-lift">
              <div class="p-4 text-center">
                <Clock class="w-5 h-5 mx-auto mb-2 text-emerald-500" />
                <p class="text-xs text-muted-foreground mb-1">Unique Months</p>
                <p class="font-bold text-2xl text-emerald-500 count-up">{uniqueMonthsActive()}</p>
              </div>
            </Card>
          </div>
        </section>

        <!-- Source Chains -->
        {#if sourceChainMap().length > 0}
          <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-6">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <Globe class="w-4 h-4 text-teal-500" />
              Source Chains
              <Badge variant="secondary" class="text-[10px]">{sourceChains} chains</Badge>
            </h3>
            <div class="space-y-2">
              {#each sourceChainMap() as chain (chain.chainId)}
                <Card class="bg-card/60 border-border/40 overflow-hidden">
                  <button
                    class="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/10 transition-colors"
                    onclick={() => toggleSrcChain(String(chain.chainId))}
                  >
                    {#if expandedSrcChains.has(String(chain.chainId))}
                      <ChevronDown class="w-4 h-4 text-muted-foreground shrink-0" />
                    {:else}
                      <ChevronRight class="w-4 h-4 text-muted-foreground shrink-0" />
                    {/if}
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500/15 to-teal-600/10 flex items-center justify-center shrink-0">
                      <Globe class="w-4 h-4 text-teal-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm">{chain.chainName}</span>
                        <Badge variant="secondary" class="text-[10px]">{chain.count} txs</Badge>
                      </div>
                      <p class="text-xs text-muted-foreground">{chain.contracts.size} contract{chain.contracts.size !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="shrink-0">
                      <div class="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500"
                          style="width: {totalTransactions > 0 ? (chain.count / totalTransactions * 100) : 0}%"
                        ></div>
                      </div>
                      <p class="text-[10px] text-muted-foreground text-right mt-0.5">
                        {totalTransactions > 0 ? (chain.count / totalTransactions * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </button>
                  {#if expandedSrcChains.has(String(chain.chainId))}
                    <div class="px-4 pb-4 pt-0 border-t border-border/20">
                      <div class="pt-3 space-y-1.5">
                        {#each Array.from(chain.contracts).sort() as contract}
                          <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/40">
                            <FileCode2 class="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span class="text-xs font-mono text-muted-foreground truncate">{contract}</span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </Card>
              {/each}
            </div>
          </section>
        {/if}

        <!-- Destination Chains -->
        {#if destChainMap().length > 0}
          <section class="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <ArrowLeftRight class="w-4 h-4 text-emerald-500" />
              Destination Chains
              <Badge variant="secondary" class="text-[10px]">{destChains} chains</Badge>
            </h3>
            <div class="space-y-2">
              {#each destChainMap() as chain (chain.chainId)}
                <Card class="bg-card/60 border-border/40 overflow-hidden">
                  <button
                    class="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/10 transition-colors"
                    onclick={() => toggleDstChain(String(chain.chainId))}
                  >
                    {#if expandedDstChains.has(String(chain.chainId))}
                      <ChevronDown class="w-4 h-4 text-muted-foreground shrink-0" />
                    {:else}
                      <ChevronRight class="w-4 h-4 text-muted-foreground shrink-0" />
                    {/if}
                    <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/15 to-emerald-600/10 flex items-center justify-center shrink-0">
                      <ArrowLeftRight class="w-4 h-4 text-emerald-500" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-medium text-sm">{chain.chainName}</span>
                        <Badge variant="secondary" class="text-[10px]">{chain.count} txs</Badge>
                      </div>
                      <p class="text-xs text-muted-foreground">{chain.contracts.size} contract{chain.contracts.size !== 1 ? 's' : ''}</p>
                    </div>
                    <div class="shrink-0">
                      <div class="w-24 h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          class="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500"
                          style="width: {totalTransactions > 0 ? (chain.count / totalTransactions * 100) : 0}%"
                        ></div>
                      </div>
                      <p class="text-[10px] text-muted-foreground text-right mt-0.5">
                        {totalTransactions > 0 ? (chain.count / totalTransactions * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </button>
                  {#if expandedDstChains.has(String(chain.chainId))}
                    <div class="px-4 pb-4 pt-0 border-t border-border/20">
                      <div class="pt-3 space-y-1.5">
                        {#each Array.from(chain.contracts).sort() as contract}
                          <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/40">
                            <FileCode2 class="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span class="text-xs font-mono text-muted-foreground truncate">{contract}</span>
                          </div>
                        {/each}
                      </div>
                    </div>
                  {/if}
                </Card>
              {/each}
            </div>
          </section>
        {/if}

      {:else if rawMessages.length === 0}
        <!-- No messages at all -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/60 mb-6">
            <Layers class="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 class="text-2xl font-bold mb-2">No LayerZero Activity Found</h2>
          <p class="text-muted-foreground mb-4">This wallet has no LayerZero messages on record.</p>
          <Button variant="outline" onclick={() => { address = ''; rawMessages = []; }}>
            Check Another Address
          </Button>
        </section>
      {:else}
        <!-- Has messages but none after cutoff -->
        <section class="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-6">
            <AlertCircle class="w-8 h-8 text-amber-500" />
          </div>
          <h2 class="text-2xl font-bold mb-2">No Activity After May 1, 2024</h2>
          <p class="text-muted-foreground mb-1">
            Found {rawMessages.length} LayerZero message{rawMessages.length !== 1 ? 's' : ''}, but none after the cutoff date.
          </p>
          <p class="text-sm text-muted-foreground mb-4">
            Only transactions after May 1, 2024 count toward the second airdrop.
          </p>
          <Button variant="outline" onclick={() => { address = ''; rawMessages = []; }}>
            Check Another Address
          </Button>
        </section>
      {/if}
    {/if}
  </main>

  <Footer />
</div>
