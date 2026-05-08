<script lang="ts">
  import {
    Layers, RefreshCw, Copy, Check, Moon, Sun, Zap, Home, X,
    Activity, Globe, ArrowLeftRight, Hash, FileCode2, Link2,
    Calendar, CalendarDays, CalendarRange, Clock, ChevronDown,
    ChevronRight, Share2, AlertCircle,
  } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { truncateAddress } from '$lib/utils/format';
  import WalletLoading from '$lib/components/ui/WalletLoading.svelte';

  interface ChainEntry {
    chainId: number;
    chainName: string;
    contracts: Set<string>;
    count: number;
  }

  interface LayerZeroStats {
    totalTransactions: number;
    totalMessages: number;
    sourceChains: number;
    destChains: number;
    contractsInteracted: number;
    sourceChainMap: ChainEntry[];
    destChainMap: ChainEntry[];
    protocolsUsed: [string, number][];
    uniqueDaysActive: number;
    uniqueWeeksActive: number;
    uniqueMonthsActive: number;
  }

  interface Props {
    address: string;
    onReset: () => void;
    isLoading: boolean;
    loadError: string;
    stats: LayerZeroStats | null;
    isRefreshing: boolean;
    onRetry: () => void;
    onRefresh: () => void;
  }

  let { address, onReset, isLoading, loadError, stats, isRefreshing, onRetry, onRefresh }: Props = $props();

  let copied = $state(false);
  let mobileMenuOpen = $state(false);
  let activeSection = $state('overview');
  let expandedSrcChains = $state<Set<string>>(new Set());
  let expandedDstChains = $state<Set<string>>(new Set());

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'chains', label: 'Chains' },
  ];

  function handleCopy() {
    if (address) {
      navigator.clipboard.writeText(address);
      copied = true;
      setTimeout(() => copied = false, 2000);
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

  function handleShareTwitter() {
    if (!stats) return;
    const text = `🚀 My LayerZero Stats:\n\n` +
      `📊 ${stats.totalTransactions} transactions (after May 1, 2024)\n` +
      `🌐 ${stats.sourceChains} source chains → ${stats.destChains} dest chains\n` +
      `📝 ${stats.contractsInteracted} contracts interacted\n` +
      `📅 ${stats.uniqueDaysActive} unique days active\n\n` +
      `Check yours at https://cryptowalletsx.com/layerzero-stats`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6">
      <div class="h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a href="/">
            <Button variant="ghost" size="icon" class="shrink-0" title="Back to Home">
              <Home class="w-4 h-4" />
            </Button>
          </a>
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
            <Layers class="w-4 h-4 text-white" />
          </div>
          <Badge variant="secondary" class="gap-1 text-xs shrink-0">
            <div class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
            LayerZero
          </Badge>
        </div>
        <div class="flex items-center gap-1">
          <div class="hidden md:flex items-center gap-1">
            <a href="/" class="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">Home</a>
            <a href="/checker" class="text-xs text-cyan-500 font-medium px-2 py-1 rounded-lg bg-cyan-500/10">Checkers</a>
          </div>
          <Button variant="ghost" size="icon" onclick={() => themeStore.toggle()} class="rounded-full h-9 w-9">
            {#if themeStore.isDark}<Sun class="w-4 h-4" />{:else}<Moon class="w-4 h-4" />{/if}
          </Button>
          <Button variant="ghost" size="icon" onclick={() => mobileMenuOpen = !mobileMenuOpen} class="rounded-full h-9 w-9 md:hidden">
            {#if mobileMenuOpen}<X class="w-5 h-5" />{:else}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-foreground"><circle cx="10" cy="4" r="1.8" /><circle cx="10" cy="10" r="1.8" /><circle cx="10" cy="16" r="1.8" /></svg>
            {/if}
          </Button>
        </div>
      </div>

      <!-- Wallet Address Bar -->
      <div class="pb-2 flex flex-wrap items-center gap-1.5 sm:gap-2 wallet-bar">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/80">
          <Layers class="w-3.5 h-3.5 text-cyan-500 shrink-0" />
          <span class="text-xs sm:text-sm font-mono">{truncateAddress(address, 6)}</span>
          <button class="p-0.5 hover:bg-secondary rounded" onclick={handleCopy}>
            {#if copied}<Check class="w-3 h-3 text-cyan-500" />{:else}<Copy class="w-3 h-3" />{/if}
          </button>
        </div>
        {#if stats}
          <Badge class="bg-cyan-500/10 text-cyan-500 border-cyan-500/30 text-[10px]">
            {stats.totalMessages} total
          </Badge>
          <Badge class="bg-teal-500/10 text-teal-500 border-teal-500/30 text-[10px]">
            {stats.totalTransactions} after May 1
          </Badge>
        {/if}
        <div class="flex items-center gap-0.5 sm:gap-1 ml-auto">
          <Button variant="ghost" size="sm" class="h-7 text-xs gap-1" onclick={handleShareTwitter}>
            <Share2 class="w-3 h-3" />
            <span class="hidden sm:inline">Share</span>
          </Button>
          <Button variant="ghost" size="sm" class="h-7 text-xs gap-1" onclick={onRefresh} disabled={isRefreshing}>
            <RefreshCw class="w-3 h-3 {isRefreshing ? 'animate-spin' : ''}" />
            <span class="hidden sm:inline">Refresh</span>
          </Button>
        </div>
      </div>
    </div>
    <!-- Mobile dropdown -->
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
        <nav class="max-w-7xl mx-auto px-4 py-3 space-y-1">
          <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Home class="w-4 h-4" /> Home</a>
          <a href="/checker" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cyan-500 bg-cyan-500/10"><Layers class="w-4 h-4" /> All Checkers</a>
        </nav>
      </div>
    {/if}
  </header>

  <!-- Section Navigation -->
  <div class="sticky top-[60px] sm:top-[64px] z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
    <div class="max-w-7xl mx-auto px-2 sm:px-6">
      <div class="w-full flex h-auto p-1 bg-transparent gap-0.5 overflow-x-auto tab-scroll-container" style="-webkit-overflow-scrolling: touch; scrollbar-width: none;">
        {#each SECTIONS as section}
          <button
            class="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap rounded-lg transition-all shrink-0 {activeSection === section.id ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-semibold' : 'text-muted-foreground hover:text-foreground'}"
            onclick={() => activeSection = section.id}
          >
            {section.label}
          </button>
        {/each}
      </div>
    </div>
  </div>

  <!-- Content -->
  <main class="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
    {#if isLoading}
      <WalletLoading chainName="LayerZero" chainColor="cyan" message="Analyzing LayerZero cross-chain data" />
    {:else if loadError}
      <div class="text-center py-16">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-destructive/10 mb-6">
          <AlertCircle class="w-8 h-8 text-destructive" />
        </div>
        <h2 class="text-2xl font-bold mb-2">Failed to Load Data</h2>
        <p class="text-muted-foreground mb-4">{loadError}</p>
        <Button onclick={onRetry} class="bg-gradient-to-r from-cyan-500 to-teal-600 text-white">
          <RefreshCw class="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    {:else if stats}
      {#if stats.totalMessages === 0}
        <!-- No messages at all -->
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-secondary/60 mb-6">
            <Layers class="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 class="text-2xl font-bold mb-2">No LayerZero Activity Found</h2>
          <p class="text-muted-foreground mb-4">This wallet has no LayerZero messages on record.</p>
          <Button variant="outline" onclick={onReset}>Check Another Address</Button>
        </div>
      {:else if stats.totalTransactions === 0}
        <!-- Has messages but none after cutoff -->
        <div class="text-center py-16">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-6">
            <AlertCircle class="w-8 h-8 text-amber-500" />
          </div>
          <h2 class="text-2xl font-bold mb-2">No Activity After May 1, 2024</h2>
          <p class="text-muted-foreground mb-1">
            Found {stats.totalMessages} LayerZero message{stats.totalMessages !== 1 ? 's' : ''}, but none after the cutoff date.
          </p>
          <p class="text-sm text-muted-foreground mb-4">
            Only transactions after May 1, 2024 count toward the second airdrop.
          </p>
          <Button variant="outline" onclick={onReset}>Check Another Address</Button>
        </div>
      {:else if activeSection === 'overview'}
        <!-- ===== OVERVIEW SECTION ===== -->

        <!-- Activity Metrics -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <Calendar class="w-4 h-4 text-cyan-500" />
            Activity Metrics
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <CalendarDays class="w-5 h-5 mx-auto mb-2 text-cyan-500" />
                <p class="text-xs text-muted-foreground mb-1">Unique Days</p>
                <p class="font-bold text-xl text-cyan-500">{stats.uniqueDaysActive}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <CalendarRange class="w-5 h-5 mx-auto mb-2 text-teal-500" />
                <p class="text-xs text-muted-foreground mb-1">Unique Weeks</p>
                <p class="font-bold text-xl text-teal-500">{stats.uniqueWeeksActive}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <Clock class="w-5 h-5 mx-auto mb-2 text-emerald-500" />
                <p class="text-xs text-muted-foreground mb-1">Unique Months</p>
                <p class="font-bold text-xl text-emerald-500">{stats.uniqueMonthsActive}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <Globe class="w-5 h-5 mx-auto mb-2 text-cyan-500" />
                <p class="text-xs text-muted-foreground mb-1">Source Chains</p>
                <p class="font-bold text-xl text-cyan-500">{stats.sourceChains}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <ArrowLeftRight class="w-5 h-5 mx-auto mb-2 text-teal-500" />
                <p class="text-xs text-muted-foreground mb-1">Dest. Chains</p>
                <p class="font-bold text-xl text-teal-500">{stats.destChains}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <Activity class="w-4 h-4 text-cyan-500" />
            Key Metrics
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card class="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <Hash class="w-4 h-4 text-cyan-500" />
                  <p class="text-xs text-muted-foreground">Total Transactions</p>
                </div>
                <p class="font-bold text-2xl">{stats.totalTransactions}</p>
                <p class="text-[10px] text-muted-foreground mt-1">After May 1, 2024</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-teal-500/10 to-teal-600/5 border-teal-500/20">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <Globe class="w-4 h-4 text-teal-500" />
                  <p class="text-xs text-muted-foreground">Source Chains</p>
                </div>
                <p class="font-bold text-2xl">{stats.sourceChains}</p>
                <p class="text-[10px] text-muted-foreground mt-1">Unique chains sent from</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <ArrowLeftRight class="w-4 h-4 text-emerald-500" />
                  <p class="text-xs text-muted-foreground">Dest. Chains</p>
                </div>
                <p class="font-bold text-2xl">{stats.destChains}</p>
                <p class="text-[10px] text-muted-foreground mt-1">Unique chains received on</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
              <div class="p-4">
                <div class="flex items-center gap-2 mb-2">
                  <FileCode2 class="w-4 h-4 text-violet-500" />
                  <p class="text-xs text-muted-foreground">Contracts Interacted</p>
                </div>
                <p class="font-bold text-2xl">{stats.contractsInteracted}</p>
                <p class="text-[10px] text-muted-foreground mt-1">Unique contract addresses</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Protocols Used -->
        {#if stats.protocolsUsed.length > 0}
          <div class="mb-6">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <Link2 class="w-4 h-4 text-cyan-500" />
              Protocols Used
            </h3>
            <Card class="bg-card/60 border-border/40">
              <div class="p-5">
                <div class="flex flex-wrap gap-2">
                  {#each stats.protocolsUsed as [protocol, count]}
                    <div class="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/60 hover:bg-secondary/80 transition-colors">
                      <div class="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span class="text-sm font-medium">{protocol}</span>
                      <Badge variant="secondary" class="text-[10px]">{count}</Badge>
                    </div>
                  {/each}
                </div>
              </div>
            </Card>
          </div>
        {/if}

        <!-- Chain Overview -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <Globe class="w-4 h-4 text-cyan-500" />
            Chain Overview
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Source Chains</p>
                <p class="font-bold text-xl text-cyan-500">{stats.sourceChains}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Dest. Chains</p>
                <p class="font-bold text-xl text-teal-500">{stats.destChains}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Total Active</p>
                <p class="font-bold text-xl">{new Set([...stats.sourceChainMap.map(c => c.chainId), ...stats.destChainMap.map(c => c.chainId)]).size}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Most Active Src</p>
                <p class="font-bold text-sm">{stats.sourceChainMap.length > 0 ? stats.sourceChainMap[0].chainName : 'N/A'}</p>
                {#if stats.sourceChainMap.length > 0}
                  <p class="text-[10px] text-muted-foreground">{stats.sourceChainMap[0].count} txs</p>
                {/if}
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Most Active Dst</p>
                <p class="font-bold text-sm">{stats.destChainMap.length > 0 ? stats.destChainMap[0].chainName : 'N/A'}</p>
                {#if stats.destChainMap.length > 0}
                  <p class="text-[10px] text-muted-foreground">{stats.destChainMap[0].count} txs</p>
                {/if}
              </div>
            </Card>
          </div>
        </div>

        <!-- Transaction Distribution Visual -->
        <div class="mb-6">
          <Card class="bg-card/60 border-border/40">
            <div class="p-5">
              <h4 class="font-bold mb-4">Transaction Distribution</h4>
              <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Visual donut -->
                <div class="relative w-40 h-40 shrink-0">
                  <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                    {#if stats.totalTransactions > 0}
                      {@const srcPct = stats.sourceChainMap.length > 0 ? stats.sourceChainMap[0].count / stats.totalTransactions : 0}
                      {@const srcAngle = srcPct * 360}
                      <!-- Top source chain arc -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke-width="12"
                        stroke="url(#srcGrad)"
                        stroke-dasharray="{srcPct * 251.3} {251.3 - srcPct * 251.3}"
                        stroke-linecap="round"
                      />
                      <!-- Remaining arc -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke-width="12"
                        stroke="url(#dstGrad)"
                        stroke-dasharray="{(1 - srcPct) * 251.3} {srcPct * 251.3}"
                        stroke-dashoffset="-{srcPct * 251.3}"
                        stroke-linecap="round"
                      />
                    {/if}
                    <defs>
                      <linearGradient id="srcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#06b6d4" />
                        <stop offset="100%" style="stop-color:#14b8a6" />
                      </linearGradient>
                      <linearGradient id="dstGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#14b8a6" />
                        <stop offset="100%" style="stop-color:#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div class="absolute inset-0 flex items-center justify-center">
                    <div class="text-center">
                      <p class="font-bold text-lg">{stats.totalTransactions}</p>
                      <p class="text-[10px] text-muted-foreground">Total</p>
                    </div>
                  </div>
                </div>
                <!-- Legend -->
                <div class="flex-1 space-y-3 w-full">
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Source Chains</span>
                      <span class="font-bold text-sm">{stats.sourceChains} chains</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-teal-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Dest. Chains</span>
                      <span class="font-bold text-sm">{stats.destChains} chains</span>
                    </div>
                  </div>
                  <hr class="border-border/40" />
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-violet-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Contracts Interacted</span>
                      <span class="font-bold text-sm text-violet-500">{stats.contractsInteracted}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-cyan-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Protocols Used</span>
                      <span class="font-bold text-sm text-cyan-500">{stats.protocolsUsed.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <!-- Quick Source Chain Preview (top 5) -->
        {#if stats.sourceChainMap.length > 0}
          <div class="mb-6">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <Globe class="w-4 h-4 text-teal-500" />
              Top Source Chains
              <Badge variant="secondary" class="text-[10px]">{stats.sourceChains} total</Badge>
            </h3>
            <Card class="bg-card/60 border-border/40">
              <div class="p-5 space-y-3">
                {#each stats.sourceChainMap.slice(0, 5) as chain}
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 w-28 sm:w-36 shrink-0">
                      <div class="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/15 to-teal-600/10 flex items-center justify-center shrink-0">
                        <Globe class="w-3 h-3 text-cyan-500" />
                      </div>
                      <span class="text-xs font-medium truncate">{chain.chainName}</span>
                    </div>
                    <div class="flex-1 h-5 rounded-full bg-secondary/60 overflow-hidden relative">
                      <div class="h-full rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500" style="width: {stats.totalTransactions > 0 ? (chain.count / stats.totalTransactions * 100) : 0}%"></div>
                      <span class="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium">{chain.count} txs</span>
                    </div>
                  </div>
                {/each}
              </div>
            </Card>
          </div>
        {/if}

        <!-- Quick Dest Chain Preview (top 5) -->
        {#if stats.destChainMap.length > 0}
          <div class="mb-6">
            <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
              <ArrowLeftRight class="w-4 h-4 text-emerald-500" />
              Top Destination Chains
              <Badge variant="secondary" class="text-[10px]">{stats.destChains} total</Badge>
            </h3>
            <Card class="bg-card/60 border-border/40">
              <div class="p-5 space-y-3">
                {#each stats.destChainMap.slice(0, 5) as chain}
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2 w-28 sm:w-36 shrink-0">
                      <div class="w-6 h-6 rounded-md bg-gradient-to-br from-teal-500/15 to-emerald-600/10 flex items-center justify-center shrink-0">
                        <ArrowLeftRight class="w-3 h-3 text-teal-500" />
                      </div>
                      <span class="text-xs font-medium truncate">{chain.chainName}</span>
                    </div>
                    <div class="flex-1 h-5 rounded-full bg-secondary/60 overflow-hidden relative">
                      <div class="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-500" style="width: {stats.totalTransactions > 0 ? (chain.count / stats.totalTransactions * 100) : 0}%"></div>
                      <span class="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium">{chain.count} txs</span>
                    </div>
                  </div>
                {/each}
              </div>
            </Card>
          </div>
        {/if}

      {:else if activeSection === 'chains'}
        <!-- ===== CHAINS SECTION ===== -->
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-1 flex items-center gap-2">
            <Globe class="w-4 h-4 text-cyan-500" />
            Chain Activity
          </h3>
          <p class="text-sm text-muted-foreground">{stats.sourceChains} Source &bull; {stats.destChains} Destination &bull; Expandable contract lists</p>
        </div>

        <!-- Source Chains -->
        {#if stats.sourceChainMap.length > 0}
          <div class="mb-6">
            <h4 class="text-base font-bold mb-3 flex items-center gap-2">
              <Globe class="w-4 h-4 text-teal-500" />
              Source Chains
              <Badge variant="secondary" class="text-[10px]">{stats.sourceChains} chains</Badge>
            </h4>
            <div class="space-y-2">
              {#each stats.sourceChainMap as chain (chain.chainId)}
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
                          style="width: {stats.totalTransactions > 0 ? (chain.count / stats.totalTransactions * 100) : 0}%"
                        ></div>
                      </div>
                      <p class="text-[10px] text-muted-foreground text-right mt-0.5">
                        {stats.totalTransactions > 0 ? (chain.count / stats.totalTransactions * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </button>
                  {#if expandedSrcChains.has(String(chain.chainId))}
                    <div class="px-4 pb-4 pt-0 border-t border-border/20">
                      <div class="pt-3 space-y-1.5 max-h-64 overflow-y-auto">
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
          </div>
        {/if}

        <!-- Destination Chains -->
        {#if stats.destChainMap.length > 0}
          <div class="mb-6">
            <h4 class="text-base font-bold mb-3 flex items-center gap-2">
              <ArrowLeftRight class="w-4 h-4 text-emerald-500" />
              Destination Chains
              <Badge variant="secondary" class="text-[10px]">{stats.destChains} chains</Badge>
            </h4>
            <div class="space-y-2">
              {#each stats.destChainMap as chain (chain.chainId)}
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
                          style="width: {stats.totalTransactions > 0 ? (chain.count / stats.totalTransactions * 100) : 0}%"
                        ></div>
                      </div>
                      <p class="text-[10px] text-muted-foreground text-right mt-0.5">
                        {stats.totalTransactions > 0 ? (chain.count / stats.totalTransactions * 100).toFixed(1) : 0}%
                      </p>
                    </div>
                  </button>
                  {#if expandedDstChains.has(String(chain.chainId))}
                    <div class="px-4 pb-4 pt-0 border-t border-border/20">
                      <div class="pt-3 space-y-1.5 max-h-64 overflow-y-auto">
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
          </div>
        {/if}
      {/if}
    {/if}
  </main>

  <!-- Footer -->
  <footer class="border-t border-border/40 bg-card/30 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
          <Zap class="w-2.5 h-2.5 text-white" />
        </div>
        <span class="text-xs gradient-text font-medium">CryptoWalletsX</span>
      </div>
      <p class="text-xs text-muted-foreground">Powered by scan.layerzero-api.com</p>
    </div>
  </footer>
</div>
