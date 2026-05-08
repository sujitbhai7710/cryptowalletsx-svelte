<script lang="ts">
  import {
    Wallet, Search, Activity, Fuel, Clock, Calendar, Hash,
    Layers, ChevronDown, ChevronUp, ExternalLink, Share2,
    Flame, Coins, Image, FileCode, Users, ArrowRight,
    Loader2, AlertCircle, RefreshCw, Copy, Check
  } from 'lucide-svelte';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';

  const BLOCKSCOUT_BASE = 'https://soneium.blockscout.com/api/v2';
  const ALCHEMY_RPC = 'https://soneium.g.alchemy.com/v2/FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO';

  // State
  let address = $state('');
  let inputAddress = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isRefreshing = $state(false);
  let copiedAddress = $state(false);
  let isLoaded = $state(false);

  // Data
  let balance = $state<string>('0');
  let ethPrice = $state<number>(0);
  let totalTransactions = $state(0);
  let tokenTransfersCount = $state(0);
  let gasUsedEth = $state('0');
  let gasUsedGwei = $state('0');
  let walletAge = $state(0);
  let uniqueDaysActive = $state(0);
  let uniqueWeeksActive = $state(0);
  let uniqueMonthsActive = $state(0);
  let contractsCreated = $state<{ hash: string; verified: boolean }[]>([]);
  let contractsInteracted = $state<{ address: string; count: number; name?: string }[]>([]);
  let tokenHoldings = $state<any[]>([]);
  let nftHoldings = $state<any[]>([]);
  let allTransactions = $state<any[]>([]);
  let firstTxDate = $state<Date | null>(null);

  // Collapsible sections
  let sections = $state<Record<string, boolean>>({
    overview: true,
    activity: true,
    contracts: false,
    tokens: false,
    nfts: false,
  });

  function toggleSection(key: string) {
    sections[key] = !sections[key];
  }

  // Derived
  let balanceUsd = $derived(() => {
    const bal = parseFloat(balance);
    return (bal * ethPrice).toFixed(2);
  });

  let shareText = $derived(() => {
    if (!address) return '';
    return `🟣 Soneium Wallet Stats\n\n💰 Balance: ${parseFloat(balance).toFixed(4)} ETH ($${balanceUsd()})\n📊 Transactions: ${totalTransactions}\n🔥 Gas Used: ${parseFloat(gasUsedEth).toFixed(6)} ETH\n📅 Wallet Age: ${walletAge} days\n🎯 Active Days: ${uniqueDaysActive} | Weeks: ${uniqueWeeksActive} | Months: ${uniqueMonthsActive}\n\nCheck yours at cryptowalletsx.com/soneium`;
  });

  // Helpers
  function formatEth(wei: string): string {
    const val = BigInt(wei || '0');
    const eth = Number(val) / 1e18;
    return eth.toFixed(6);
  }

  function formatTokenBalance(value: string, decimals: number): string {
    const val = BigInt(value || '0');
    const formatted = Number(val) / Math.pow(10, decimals);
    if (formatted >= 1) return formatted.toFixed(2);
    if (formatted >= 0.001) return formatted.toFixed(4);
    return formatted.toFixed(8);
  }

  function truncateAddress(addr: string): string {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function getWeekKey(date: Date): string {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    const oneWeek = 604800000;
    const weekNum = Math.ceil((diff / oneWeek) + 1);
    return `${d.getFullYear()}-W${weekNum}`;
  }

  function getMonthKey(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // Fetch functions
  async function fetchEthPrice(): Promise<number> {
    try {
      const res = await fetch(`${BLOCKSCOUT_BASE}/stats`);
      const data = await res.json();
      const prices = data?.market_data?.current_price;
      return prices?.usd || 0;
    } catch {
      return 0;
    }
  }

  async function fetchAddressInfo(addr: string) {
    const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}`);
    if (!res.ok) throw new Error('Failed to fetch address info');
    return res.json();
  }

  async function fetchCounters(addr: string) {
    const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}/counters`);
    if (!res.ok) throw new Error('Failed to fetch counters');
    return res.json();
  }

  async function fetchAllTransactions(addr: string): Promise<any[]> {
    const allTx: any[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const res = await fetch(
          `${BLOCKSCOUT_BASE}/addresses/${addr}/transactions?filter=to%7Cfrom&page=${page}&items_count=50`
        );
        const data = await res.json();
        const items = data?.items || [];
        allTx.push(...items);
        if (items.length < 50 || !data?.next_page_params) {
          hasMore = false;
        } else {
          page++;
        }
      } catch {
        hasMore = false;
      }
    }
    return allTx;
  }

  async function fetchTokens(addr: string) {
    try {
      const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}/tokens`);
      const data = await res.json();
      return data?.items || [];
    } catch {
      return [];
    }
  }

  async function fetchNFTs(addr: string) {
    try {
      const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}/nft`);
      const data = await res.json();
      return data?.items || [];
    } catch {
      return [];
    }
  }

  // Main fetch
  async function fetchAllData() {
    if (!address) return;
    const refreshFlag = isRefreshing;
    if (!refreshFlag) isLoading = true;
    error = null;

    try {
      const [addrInfo, counters, price, txns, tokens, nfts] = await Promise.all([
        fetchAddressInfo(address),
        fetchCounters(address),
        fetchEthPrice(),
        fetchAllTransactions(address),
        fetchTokens(address),
        fetchNFTs(address),
      ]);

      // Balance
      const coinBalance = addrInfo?.coin_balance || '0';
      balance = formatEth(coinBalance);
      ethPrice = price;

      // Counters
      totalTransactions = parseInt(counters?.transactions_count || '0');
      tokenTransfersCount = parseInt(counters?.token_transfers_count || '0');

      // Gas calculation
      let totalGasWei = BigInt(0);
      for (const tx of txns) {
        if (tx?.fee?.value) {
          try {
            totalGasWei += BigInt(tx.fee.value);
          } catch { /* skip */ }
        }
      }
      const gasEth = Number(totalGasWei) / 1e18;
      gasUsedEth = gasEth.toFixed(6);
      gasUsedGwei = (Number(totalGasWei) / 1e9).toFixed(2);

      // Compute stats from transactions
      allTransactions = txns;
      const uniqueDays = new Set<string>();
      const uniqueWeeks = new Set<string>();
      const uniqueMonths = new Set<string>();
      const contractsCreatedList: { hash: string; verified: boolean }[] = [];
      const contractsInteractedMap = new Map<string, number>();

      let earliestDate: Date | null = null;

      for (const tx of txns) {
        // Date tracking
        const ts = tx?.timestamp || tx?.first_seen;
        if (ts) {
          const date = new Date(ts);
          if (isNaN(date.getTime())) continue;
          const dayKey = date.toISOString().slice(0, 10);
          uniqueDays.add(dayKey);
          uniqueWeeks.add(getWeekKey(date));
          uniqueMonths.add(getMonthKey(date));

          if (!earliestDate || date < earliestDate) {
            earliestDate = date;
          }
        }

        // Contract creation (to == null)
        if (!tx?.to?.hash) {
          contractsCreatedList.push({
            hash: tx?.hash || '',
            verified: tx?.to?.is_verified ?? false,
          });
        }

        // Contract interaction tracking
        const fromAddr = (tx?.from?.hash || '').toLowerCase();
        const toAddr = (tx?.to?.hash || '').toLowerCase();
        const myAddr = address.toLowerCase();

        if (fromAddr === myAddr && toAddr && toAddr !== myAddr) {
          contractsInteractedMap.set(toAddr, (contractsInteractedMap.get(toAddr) || 0) + 1);
        } else if (toAddr === myAddr && fromAddr && fromAddr !== myAddr) {
          contractsInteractedMap.set(fromAddr, (contractsInteractedMap.get(fromAddr) || 0) + 1);
        }
      }

      uniqueDaysActive = uniqueDays.size;
      uniqueWeeksActive = uniqueWeeks.size;
      uniqueMonthsActive = uniqueMonths.size;

      firstTxDate = earliestDate;
      if (earliestDate) {
        const now = new Date();
        const diffMs = now.getTime() - earliestDate.getTime();
        walletAge = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

      contractsCreated = contractsCreatedList;

      const interactedList = Array.from(contractsInteractedMap.entries())
        .map(([addr, count]) => ({
          address: addr,
          count,
          name: txns.find(
            (t: any) =>
              (t?.from?.hash || '').toLowerCase() === addr ||
              (t?.to?.hash || '').toLowerCase() === addr
          )?.to?.name || undefined,
        }))
        .sort((a, b) => b.count - a.count);
      contractsInteracted = interactedList;

      tokenHoldings = tokens;
      nftHoldings = nfts;

      isLoaded = true;
    } catch (err: any) {
      error = err?.message || 'Failed to fetch wallet data. Please try again.';
    } finally {
      isLoading = false;
      isRefreshing = false;
    }
  }

  function handleSubmit() {
    const addr = inputAddress.trim();
    if (!addr) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      error = 'Please enter a valid Ethereum address (0x...)';
      return;
    }
    address = addr;
    fetchAllData();
  }

  function handleRefresh() {
    isRefreshing = true;
    fetchAllData();
  }

  function copyAddr() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    copiedAddress = true;
    setTimeout(() => { copiedAddress = false; }, 2000);
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(shareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }


</script>

<SEO
  title="Soneium Chain Stats"
  description="Check Soneium wallet stats, balance, transaction history, gas usage, NFT holdings, and token portfolio analytics. Soneium is an Ethereum L2 by Sony Block Solutions Labs."
  keywords={["soneium", "soneium chain", "soneium wallet", "soneium stats", "sony blockchain", "ethereum l2", "wallet analytics"]}
  canonicalUrl="https://cryptowalletsx.com/soneium"
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <main class="flex-1">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-violet-500/5"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-500/8 via-indigo-500/5 to-violet-500/8 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-16 left-[10%] w-12 h-12 border border-purple-500/15 rounded-lg float-animation rotate-45"></div>
        <div class="absolute top-28 right-[15%] w-8 h-8 border border-indigo-500/15 rounded-full float-slow-animation"></div>
        <div class="absolute bottom-16 left-[30%] w-5 h-5 bg-violet-500/8 rounded-md float-animation" style="animation-delay:2s"></div>
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <Wallet class="w-4 h-4 text-purple-400" />
          <span class="text-sm font-medium bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Soneium Chain</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Soneium Wallet Stats</span>
        </h1>
        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Comprehensive on-chain analytics for Soneium — Ethereum L2 by Sony Block Solutions Labs. Track balance, transactions, gas, NFTs, and more.
        </p>

        <!-- Address Input -->
        <div class="max-w-2xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                bind:value={inputAddress}
                onkeydown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="Enter wallet address (0x...)"
                class="w-full pl-11 pr-4 h-12 bg-card/60 border border-border/40 backdrop-blur-xl rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
            <button
              onclick={handleSubmit}
              disabled={isLoading}
              class="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {#if isLoading}
                <Loader2 class="w-4 h-4 animate-spin" />
                Loading...
              {:else}
                <Search class="w-4 h-4" />
                Analyze
              {/if}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Results -->
    {#if error && !isLoading}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <AlertCircle class="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p class="text-sm text-red-400">{error}</p>
          <button
            onclick={() => { error = null; }}
            class="mt-3 text-sm text-red-400 underline hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    {/if}

    {#if isLoading && !isRefreshing}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 animate-pulse">
            <Loader2 class="w-8 h-8 text-white animate-spin" />
          </div>
          <p class="text-lg font-semibold mb-2">Analyzing Wallet...</p>
          <p class="text-sm text-muted-foreground">Fetching data from Blockscout & Alchemy APIs</p>
        </div>
      </div>
    {/if}

    {#if isLoaded && !isLoading}
      <!-- Wallet Header Bar -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Wallet class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Soneium Address</p>
              <div class="flex items-center gap-2">
                <p class="text-sm font-mono font-medium">{truncateAddress(address)}</p>
                <button onclick={copyAddr} class="text-muted-foreground hover:text-foreground transition-colors">
                  {#if copiedAddress}
                    <Check class="w-3.5 h-3.5 text-emerald-500" />
                  {:else}
                    <Copy class="w-3.5 h-3.5" />
                  {/if}
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              onclick={handleRefresh}
              disabled={isRefreshing}
              class="h-9 px-4 rounded-lg bg-secondary/60 border border-border/40 text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw class="w-3.5 h-3.5 {isRefreshing ? 'animate-spin' : ''}" />
              Refresh
            </button>
            <button
              onclick={shareOnTwitter}
              class="h-9 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <Share2 class="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      <!-- Overview Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('overview')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Activity class="w-4 h-4 text-purple-400" />
            </div>
            <h2 class="text-lg font-bold">Overview</h2>
          </div>
          {#if sections.overview}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.overview}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <!-- Balance -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Coins class="w-4 h-4 text-purple-400" />
                  <span class="text-xs text-muted-foreground font-medium">Balance</span>
                </div>
                <p class="text-lg font-bold">{parseFloat(balance).toFixed(4)} ETH</p>
                {#if ethPrice > 0}
                  <p class="text-xs text-muted-foreground">${balanceUsd()}</p>
                {/if}
              </div>
              <!-- Wallet Age -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Clock class="w-4 h-4 text-indigo-400" />
                  <span class="text-xs text-muted-foreground font-medium">Wallet Age</span>
                </div>
                <p class="text-lg font-bold">{walletAge}</p>
                <p class="text-xs text-muted-foreground">days</p>
              </div>
              <!-- Total Tx -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Hash class="w-4 h-4 text-violet-400" />
                  <span class="text-xs text-muted-foreground font-medium">Transactions</span>
                </div>
                <p class="text-lg font-bold">{totalTransactions.toLocaleString()}</p>
                <p class="text-xs text-muted-foreground">total</p>
              </div>
              <!-- Token Transfers -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <ArrowRight class="w-4 h-4 text-pink-400" />
                  <span class="text-xs text-muted-foreground font-medium">Token Transfers</span>
                </div>
                <p class="text-lg font-bold">{tokenTransfersCount.toLocaleString()}</p>
                <p class="text-xs text-muted-foreground">transfers</p>
              </div>
              <!-- Gas Used ETH -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Fuel class="w-4 h-4 text-amber-400" />
                  <span class="text-xs text-muted-foreground font-medium">Gas Used</span>
                </div>
                <p class="text-lg font-bold">{parseFloat(gasUsedEth).toFixed(4)}</p>
                <p class="text-xs text-muted-foreground">ETH</p>
              </div>
              <!-- Gas Used GWEI -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Flame class="w-4 h-4 text-orange-400" />
                  <span class="text-xs text-muted-foreground font-medium">Gas (GWEI)</span>
                </div>
                <p class="text-lg font-bold">{parseFloat(gasUsedGwei).toLocaleString()}</p>
                <p class="text-xs text-muted-foreground">GWEI</p>
              </div>
              <!-- Contracts Created -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <FileCode class="w-4 h-4 text-emerald-400" />
                  <span class="text-xs text-muted-foreground font-medium">Contracts Created</span>
                </div>
                <p class="text-lg font-bold">{contractsCreated.length}</p>
                <p class="text-xs text-muted-foreground">deployed</p>
              </div>
              <!-- Contracts Interacted -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Users class="w-4 h-4 text-blue-400" />
                  <span class="text-xs text-muted-foreground font-medium">Contracts Interacted</span>
                </div>
                <p class="text-lg font-bold">{contractsInteracted.length}</p>
                <p class="text-xs text-muted-foreground">unique</p>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Activity Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('activity')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Calendar class="w-4 h-4 text-indigo-400" />
            </div>
            <h2 class="text-lg font-bold">Activity Breakdown</h2>
          </div>
          {#if sections.activity}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.activity}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div class="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 text-center">
                <p class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">{uniqueDaysActive}</p>
                <p class="text-xs text-muted-foreground mt-1">Unique Days</p>
              </div>
              <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 text-center">
                <p class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">{uniqueWeeksActive}</p>
                <p class="text-xs text-muted-foreground mt-1">Unique Weeks</p>
              </div>
              <div class="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 text-center">
                <p class="text-2xl font-bold bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">{uniqueMonthsActive}</p>
                <p class="text-xs text-muted-foreground mt-1">Unique Months</p>
              </div>
            </div>
            {#if firstTxDate}
              <div class="p-3 rounded-xl bg-background/50 border border-border/30 flex items-center gap-3">
                <Clock class="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p class="text-sm font-medium">First Transaction</p>
                  <p class="text-xs text-muted-foreground">{firstTxDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Contracts Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('contracts')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <FileCode class="w-4 h-4 text-emerald-400" />
            </div>
            <h2 class="text-lg font-bold">Contracts</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{contractsCreated.length + contractsInteracted.length}</span>
          </div>
          {#if sections.contracts}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.contracts}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            {#if contractsCreated.length > 0}
              <h3 class="text-sm font-semibold text-emerald-400 mb-3">Created Contracts ({contractsCreated.length})</h3>
              <div class="space-y-2 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                {#each contractsCreated as contract}
                  <div class="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                    <a
                      href={`https://soneium.blockscout.com/tx/${contract.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      {truncateAddress(contract.hash)}
                      <ExternalLink class="w-3 h-3" />
                    </a>
                    <span class="text-xs px-2 py-0.5 rounded-full {contract.verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                      {contract.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if contractsInteracted.length > 0}
              <h3 class="text-sm font-semibold text-blue-400 mb-3">Interacted Contracts ({contractsInteracted.length})</h3>
              <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {#each contractsInteracted.slice(0, 50) as contract}
                  <div class="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                    <a
                      href={`https://soneium.blockscout.com/address/${contract.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      {contract.name || truncateAddress(contract.address)}
                      <ExternalLink class="w-3 h-3" />
                    </a>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {contract.count}x
                    </span>
                  </div>
                {/each}
                {#if contractsInteracted.length > 50}
                  <p class="text-xs text-muted-foreground text-center py-2">Showing top 50 of {contractsInteracted.length} contracts</p>
                {/if}
              </div>
            {/if}

            {#if contractsCreated.length === 0 && contractsInteracted.length === 0}
              <p class="text-sm text-muted-foreground text-center py-6">No contract interactions found</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Token Holdings Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('tokens')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Coins class="w-4 h-4 text-amber-400" />
            </div>
            <h2 class="text-lg font-bold">Token Holdings</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{tokenHoldings.length}</span>
          </div>
          {#if sections.tokens}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.tokens}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            {#if tokenHoldings.length > 0}
              <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {#each tokenHoldings as token}
                  {@const decimals = parseInt(token.token?.decimals || '18')}
                  {@const symbol = token.token?.symbol || '???'}
                  {@const name = token.token?.name || 'Unknown'}
                  {@const bal = formatTokenBalance(token.value || '0', decimals)}
                  {@const holders = token.token?.holders_count || '-'}
                  {@const totalSupply = token.token?.total_supply || '0'}
                  {@const pctSupply = totalSupply !== '0' ? ((BigInt(token.value || '0') * BigInt(10000)) / BigInt(totalSupply)).toString() : '0'}
                  <div class="p-3 rounded-lg bg-background/50 border border-border/30">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        {#if token.token?.icon_url}
                          <img src={token.token.icon_url} alt={symbol} class="w-5 h-5 rounded-full" />
                        {:else}
                          <div class="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Coins class="w-3 h-3 text-purple-400" />
                          </div>
                        {/if}
                        <span class="text-sm font-semibold">{name}</span>
                        <span class="text-xs text-muted-foreground">{symbol}</span>
                      </div>
                      <span class="text-sm font-bold">{bal} {symbol}</span>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{holders !== '-' ? `${holders} holders` : ''}</span>
                      {#if pctSupply !== '0'}
                        <span>{(parseInt(pctSupply) / 100).toFixed(2)}% of supply</span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-sm text-muted-foreground text-center py-6">No token holdings found</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- NFT Holdings Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <button
          onclick={() => toggleSection('nfts')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center">
              <Image class="w-4 h-4 text-pink-400" />
            </div>
            <h2 class="text-lg font-bold">NFT Holdings</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">{nftHoldings.length}</span>
          </div>
          {#if sections.nfts}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.nfts}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            {#if nftHoldings.length > 0}
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                {#each nftHoldings as nft}
                  <div class="rounded-xl bg-background/50 border border-border/30 overflow-hidden group">
                    <div class="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                      {#if nft.token?.image_url}
                        <img
                          src={nft.token.image_url}
                          alt={nft.token?.name || 'NFT'}
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      {:else}
                        <Image class="w-8 h-8 text-muted-foreground/30" />
                      {/if}
                    </div>
                    <div class="p-2">
                      <p class="text-xs font-medium truncate">{nft.token?.name || `#${nft.token?.id || '?'}`}</p>
                      <p class="text-[10px] text-muted-foreground truncate">{nft.token?.collection?.name || ''}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-sm text-muted-foreground text-center py-6">No NFT holdings found</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Share Section -->
      {#if isLoaded}
        <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-violet-500/5 border border-purple-500/20 text-center">
            <h3 class="text-lg font-bold mb-2">Share Your Stats</h3>
            <p class="text-sm text-muted-foreground mb-4">Let others know about your Soneium activity</p>
            <button
              onclick={shareOnTwitter}
              class="h-10 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all mx-auto"
            >
              <Share2 class="w-4 h-4" />
              Share on Twitter
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </main>

  <Footer />
</div>
