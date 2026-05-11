<script lang="ts">
  import { ArrowLeftRight, RefreshCw, Copy, Check, ExternalLink, Moon, Sun, Zap, Home, X, ArrowRight, Activity, Wallet, TrendingUp, Globe, BarChart3, ArrowUpDown, Shield, Info, FileText, Mail, BookOpen } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { truncateAddress } from '$lib/utils/format';
  import WalletLoading from '$lib/components/ui/WalletLoading.svelte';
  import type { RelayStats, RelayChainActivity } from '$lib/types';

  interface Props {
    address: string;
    onReset: () => void;
    // Data props (managed by route page)
    isLoading: boolean;
    loadError: string;
    stats: RelayStats | null;
    isRefreshing: boolean;
    onRetry: () => void;
    onRefresh: () => void;
  }

  let { address, onReset, isLoading, loadError, stats, isRefreshing, onRetry, onRefresh }: Props = $props();

  let copied = $state(false);
  let mobileMenuOpen = $state(false);
  let activeSection = $state('overview');
  let showAllChains = $state(false);
  let showAllTokens = $state(false);
  let showAllTxs = $state(false);

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'chains', label: 'Chains' },
    { id: 'tokens', label: 'Tokens' },
    { id: 'history', label: 'History' },
  ];

  // Computed values for charts (avoids @const in non-block elements)
  let topChainsForChart = $derived(stats ? stats.chainActivity.slice(0, 8) : []);
  let maxChainVol = $derived(Math.max(...topChainsForChart.map(c => c.sourceVolume + c.destVolume), 1));
  let topTokensForChart = $derived(stats ? stats.tokenUsage.slice(0, 8) : []);
  let maxTokenVol = $derived(Math.max(...topTokensForChart.map(t => t.volume), 1));
  let displayedChains = $derived(showAllChains && stats ? stats.chainActivity : (stats ? stats.chainActivity.slice(0, 10) : []));
  let displayedTokens = $derived(showAllTokens && stats ? stats.tokenUsage : (stats ? stats.tokenUsage.slice(0, 15) : []));
  let displayedTxs = $derived(showAllTxs && stats ? stats.transactions : (stats ? stats.transactions.slice(0, 25) : []));

  function handleCopy() {
    if (address) {
      navigator.clipboard.writeText(address);
      copied = true;
      setTimeout(() => copied = false, 2000);
    }
  }

  function formatVolume(vol: number): string {
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`;
    if (vol >= 1000) return `$${(vol / 1000).toFixed(2)}K`;
    return `$${vol.toFixed(2)}`;
  }

  function getChainIconUrl(chainId: number): string {
    return `https://assets.relay.link/icons/${chainId}/light.png`;
  }

  function formatDate(dateStr: string): string {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
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
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shrink-0">
            <ArrowLeftRight class="w-4 h-4 text-white" />
          </div>
          <Badge variant="secondary" class="gap-1 text-xs shrink-0">
            <div class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
            Relay
          </Badge>
        </div>
        <div class="flex items-center gap-1">
          <div class="hidden md:flex items-center gap-1">
            <a href="/" class="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">Home</a>
            <a href="/blog" class="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">Blog</a>
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
          <ArrowLeftRight class="w-3.5 h-3.5 text-orange-500 shrink-0" />
          <span class="text-xs sm:text-sm font-mono">{truncateAddress(address, 6)}</span>
          <button class="p-0.5 hover:bg-secondary rounded" onclick={handleCopy}>
            {#if copied}<Check class="w-3 h-3 text-orange-500" />{:else}<Copy class="w-3 h-3" />{/if}
          </button>
        </div>
        <div class="flex items-center gap-0.5 sm:gap-1">
          <a href="https://relay.link" target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="sm" class="h-7 text-xs gap-1">
              <ExternalLink class="w-3 h-3" />
              <span class="hidden sm:inline">Relay</span>
            </Button>
          </a>
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
          <a href="/blog" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"><BookOpen class="w-4 h-4" /> Blog</a>
          <a href="/checker" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cyan-500 bg-cyan-500/10"><ArrowLeftRight class="w-4 h-4" /> All Checkers</a>
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
            class="text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap rounded-lg transition-all shrink-0 {activeSection === section.id ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 font-semibold' : 'text-muted-foreground hover:text-foreground'}"
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
      <WalletLoading chainName="Relay" chainColor="orange" message="Analyzing Relay bridge & swap data" />
    {:else if loadError}
      <div class="text-center py-16">
        <div class="text-4xl mb-4">⚠️</div>
        <h2 class="text-xl font-bold mb-2">Failed to Load Data</h2>
        <p class="text-muted-foreground mb-4">{loadError}</p>
        <Button onclick={onRetry} class="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
          <RefreshCw class="w-4 h-4 mr-2" /> Try Again
        </Button>
      </div>
    {:else if stats}
      {#if stats.totalTransactions === 0}
        <div class="text-center py-16">
          <div class="text-4xl mb-4">🔍</div>
          <h2 class="text-xl font-bold mb-2">No Relay Activity Found</h2>
          <p class="text-muted-foreground">This wallet has no Relay bridge or swap transactions.</p>
        </div>
      {:else if activeSection === 'overview'}
        <!-- ===== OVERVIEW SECTION ===== -->

        <!-- Wallet Activity Overview -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <Activity class="w-4 h-4 text-orange-500" />
            Wallet Activity
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Last Activity</p>
                <p class="font-bold text-sm">{stats.lastActivity}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Wallet Age</p>
                <p class="font-bold text-sm">{stats.walletAge}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Days</p>
                <p class="font-bold text-xl text-orange-500">{stats.daysActive}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Weeks</p>
                <p class="font-bold text-xl text-amber-500">{stats.weeksActive}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Months</p>
                <p class="font-bold text-xl text-orange-400">{stats.monthsActive}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <BarChart3 class="w-4 h-4 text-orange-500" />
            Key Metrics
          </h3>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card class="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
              <div class="p-4">
                <p class="text-xs text-muted-foreground mb-1">Transactions</p>
                <p class="font-bold text-2xl">{stats.totalTransactions}</p>
                <p class="text-[10px] text-muted-foreground mt-1">+{stats.sevenDayBridgeTxs + stats.sevenDaySwapTxs} (7d)</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
              <div class="p-4">
                <p class="text-xs text-muted-foreground mb-1">Volume</p>
                <p class="font-bold text-2xl">{formatVolume(stats.totalVolume)}</p>
                <p class="text-[10px] text-muted-foreground mt-1">Across {stats.networksUsed} chains</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
              <div class="p-4">
                <p class="text-xs text-muted-foreground mb-1">Success Rate</p>
                <p class="font-bold text-2xl text-emerald-500">{stats.successRate.toFixed(1)}%</p>
                <p class="text-[10px] text-muted-foreground mt-1">{stats.successCount} success / {stats.failCount} failed</p>
              </div>
            </Card>
            <Card class="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
              <div class="p-4">
                <p class="text-xs text-muted-foreground mb-1">Networks Used</p>
                <p class="font-bold text-2xl">{stats.networksUsed} <span class="text-sm font-normal text-muted-foreground">/ {stats.totalNetworks}</span></p>
                <p class="text-[10px] text-muted-foreground mt-1">Active chains</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Bridge vs Swap Infographic -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <ArrowUpDown class="w-4 h-4 text-orange-500" />
            Bridge vs Swap
          </h3>
          <div class="grid md:grid-cols-2 gap-4">
            <!-- Bridge Card -->
            <Card class="bg-card/60 border-border/40 overflow-hidden">
              <div class="p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                      <span class="text-lg">🌉</span>
                    </div>
                    <div>
                      <h4 class="font-bold">Bridge Activity</h4>
                      <p class="text-xs text-muted-foreground">Cross-chain transfers</p>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p class="text-xs text-muted-foreground">Transactions</p>
                    <p class="font-bold text-lg">{stats.bridgeTransactions}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Volume</p>
                    <p class="font-bold text-lg">{formatVolume(stats.bridgeVolume)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">7d Activity</p>
                    <p class="font-bold text-lg">{stats.sevenDayBridgeTxs} tx</p>
                  </div>
                </div>
                <!-- Bridge volume bar -->
                <div class="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                    style="width: {stats.totalVolume > 0 ? (stats.bridgeVolume / stats.totalVolume * 100) : 0}%"
                  ></div>
                </div>
                <p class="text-[10px] text-muted-foreground mt-1">
                  {stats.totalVolume > 0 ? (stats.bridgeVolume / stats.totalVolume * 100).toFixed(1) : 0}% of total volume
                </p>
              </div>
            </Card>

            <!-- Swap Card -->
            <Card class="bg-card/60 border-border/40 overflow-hidden">
              <div class="p-5">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-2">
                    <div class="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <span class="text-lg">🔄</span>
                    </div>
                    <div>
                      <h4 class="font-bold">Swap Activity</h4>
                      <p class="text-xs text-muted-foreground">Token swap transactions</p>
                    </div>
                  </div>
                </div>
                <div class="grid grid-cols-3 gap-3 mb-4">
                  <div>
                    <p class="text-xs text-muted-foreground">Transactions</p>
                    <p class="font-bold text-lg">{stats.swapTransactions}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">Volume</p>
                    <p class="font-bold text-lg">{formatVolume(stats.swapVolume)}</p>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground">7d Activity</p>
                    <p class="font-bold text-lg">{stats.sevenDaySwapTxs} tx</p>
                  </div>
                </div>
                <!-- Swap volume bar -->
                <div class="h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    class="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500"
                    style="width: {stats.totalVolume > 0 ? (stats.swapVolume / stats.totalVolume * 100) : 0}%"
                  ></div>
                </div>
                <p class="text-[10px] text-muted-foreground mt-1">
                  {stats.totalVolume > 0 ? (stats.swapVolume / stats.totalVolume * 100).toFixed(1) : 0}% of total volume
                </p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Chain Overview -->
        <div class="mb-6">
          <h3 class="text-lg font-bold mb-3 flex items-center gap-2">
            <Globe class="w-4 h-4 text-orange-500" />
            Chain Overview
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Source Chains</p>
                <p class="font-bold text-xl text-orange-500">{stats.sourceChains}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Dest. Chains</p>
                <p class="font-bold text-xl text-amber-500">{stats.destChains}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Total Active</p>
                <p class="font-bold text-xl">{stats.networksUsed}</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Most Active</p>
                <p class="font-bold text-sm">{stats.mostActiveChain}</p>
                <p class="text-[10px] text-muted-foreground">{stats.mostActiveChainTxs} txs</p>
              </div>
            </Card>
            <Card class="bg-card/60 border-border/40">
              <div class="p-4 text-center">
                <p class="text-xs text-muted-foreground mb-1">Highest Vol.</p>
                <p class="font-bold text-sm">{stats.highestVolumeChain}</p>
                <p class="text-[10px] text-muted-foreground">{formatVolume(stats.highestVolumeAmount)}</p>
              </div>
            </Card>
          </div>
        </div>

        <!-- Bridge vs Swap Donut (Visual) -->
        <div class="mb-6">
          <Card class="bg-card/60 border-border/40">
            <div class="p-5">
              <h4 class="font-bold mb-4">Transaction Distribution</h4>
              <div class="flex flex-col sm:flex-row items-center gap-6">
                <!-- Visual donut representation -->
                <div class="relative w-40 h-40 shrink-0">
                  <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                    {#if stats.totalTransactions > 0}
                      {@const bridgePct = stats.bridgeTransactions / stats.totalTransactions}
                      {@const bridgeAngle = bridgePct * 360}
                      <!-- Bridge arc -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke-width="12"
                        stroke="url(#bridgeGrad)"
                        stroke-dasharray="{bridgePct * 251.3} {251.3 - bridgePct * 251.3}"
                        stroke-linecap="round"
                      />
                      <!-- Swap arc -->
                      <circle cx="50" cy="50" r="40" fill="none" stroke-width="12"
                        stroke="url(#swapGrad)"
                        stroke-dasharray="{(1 - bridgePct) * 251.3} {bridgePct * 251.3}"
                        stroke-dashoffset="-{bridgePct * 251.3}"
                        stroke-linecap="round"
                      />
                    {/if}
                    <defs>
                      <linearGradient id="bridgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#f97316" />
                        <stop offset="100%" style="stop-color:#f59e0b" />
                      </linearGradient>
                      <linearGradient id="swapGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#f59e0b" />
                        <stop offset="100%" style="stop-color:#eab308" />
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
                    <div class="w-3 h-3 rounded-full bg-orange-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Bridge Transactions</span>
                      <span class="font-bold text-sm">{stats.bridgeTransactions} ({stats.totalTransactions > 0 ? (stats.bridgeTransactions / stats.totalTransactions * 100).toFixed(1) : 0}%)</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-amber-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Swap Transactions</span>
                      <span class="font-bold text-sm">{stats.swapTransactions} ({stats.totalTransactions > 0 ? (stats.swapTransactions / stats.totalTransactions * 100).toFixed(1) : 0}%)</span>
                    </div>
                  </div>
                  <hr class="border-border/40" />
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-emerald-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Success</span>
                      <span class="font-bold text-sm text-emerald-500">{stats.successCount}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-3 h-3 rounded-full bg-red-500 shrink-0"></div>
                    <div class="flex-1 flex items-center justify-between">
                      <span class="text-sm">Failed</span>
                      <span class="font-bold text-sm text-red-500">{stats.failCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

      {:else if activeSection === 'chains'}
        <!-- ===== CHAINS SECTION ===== -->
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-1 flex items-center gap-2">
            <Globe class="w-4 h-4 text-orange-500" />
            Chain Activity
          </h3>
          <p class="text-sm text-muted-foreground">{stats.chainActivity.filter(c => c.active).length} Active / {stats.totalNetworks} Total &bull; Chain Usage</p>
        </div>

        <!-- Chain volume chart (horizontal bar) -->
        <Card class="bg-card/60 border-border/40 mb-6">
          <div class="p-5">
            <h4 class="font-semibold mb-4 text-sm">Top Chains by Volume</h4>
            <div class="space-y-3">
              {#each topChainsForChart as chain}
                {@const totalVol = chain.sourceVolume + chain.destVolume}
                {@const pct = (totalVol / maxChainVol * 100)}
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2 w-24 sm:w-32 shrink-0">
                    <img src={getChainIconUrl(chain.chainId)} alt={chain.chainName + ' chain icon'} class="w-5 h-5 rounded-full" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <span class="text-xs font-medium truncate">{chain.chainName}</span>
                  </div>
                  <div class="flex-1 h-5 rounded-full bg-secondary/60 overflow-hidden relative">
                    <div class="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500" style="width: {pct}%"></div>
                    <span class="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium">{formatVolume(totalVol)}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </Card>

        <!-- Chain Activity Table -->
        <Card class="bg-card/60 border-border/40 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border/40 bg-muted/30">
                  <th class="text-left px-4 py-3 font-medium text-muted-foreground">Chain</th>
                  <th class="text-center px-3 py-3 font-medium text-muted-foreground">Status</th>
                  <th class="text-right px-3 py-3 font-medium text-muted-foreground">Source</th>
                  <th class="text-right px-3 py-3 font-medium text-muted-foreground">Dest.</th>
                  <th class="text-right px-3 py-3 font-medium text-muted-foreground hidden sm:table-cell">SRC Vol</th>
                  <th class="text-right px-3 py-3 font-medium text-muted-foreground hidden sm:table-cell">DST Vol</th>
                </tr>
              </thead>
              <tbody>
                {#each displayedChains as chain}
                  <tr class="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <img src={getChainIconUrl(chain.chainId)} alt={chain.chainName + ' chain icon'} class="w-5 h-5 rounded-full" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span class="font-medium">{chain.chainName}</span>
                      </div>
                    </td>
                    <td class="text-center px-3 py-3">
                      <Badge class="text-[10px] {chain.active ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'bg-muted/50 text-muted-foreground border-border/30'}">
                        {chain.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td class="text-right px-3 py-3 font-mono text-xs">{chain.sourceCount}</td>
                    <td class="text-right px-3 py-3 font-mono text-xs">{chain.destCount}</td>
                    <td class="text-right px-3 py-3 font-mono text-xs hidden sm:table-cell">{formatVolume(chain.sourceVolume)}</td>
                    <td class="text-right px-3 py-3 font-mono text-xs hidden sm:table-cell">{formatVolume(chain.destVolume)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          {#if stats.chainActivity.length > 10}
            <div class="p-3 text-center border-t border-border/40">
              <button
                class="text-sm text-orange-500 hover:text-orange-400 font-medium"
                onclick={() => showAllChains = !showAllChains}
              >
                {showAllChains ? 'Show Less' : `Show All Chains (${stats.chainActivity.length - 10} more)`}
              </button>
            </div>
          {/if}
        </Card>

      {:else if activeSection === 'tokens'}
        <!-- ===== TOKENS SECTION ===== -->
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-1 flex items-center gap-2">
            <Wallet class="w-4 h-4 text-orange-500" />
            Token Usage
          </h3>
          <p class="text-sm text-muted-foreground">{stats.tokenUsage.length} Tokens</p>
        </div>

        <!-- Token volume chart -->
        <Card class="bg-card/60 border-border/40 mb-6">
          <div class="p-5">
            <h4 class="font-semibold mb-4 text-sm">Top Tokens by Volume</h4>
            <div class="space-y-3">
              {#each topTokensForChart as token}
                {@const pct = (token.volume / maxTokenVol * 100)}
                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2 w-28 sm:w-36 shrink-0">
                    <span class="text-xs font-medium truncate">{token.symbol}</span>
                    <span class="text-[10px] text-muted-foreground truncate">on {token.chainName}</span>
                  </div>
                  <div class="flex-1 h-5 rounded-full bg-secondary/60 overflow-hidden relative">
                    <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-500" style="width: {pct}%"></div>
                    <span class="absolute inset-0 flex items-center justify-end pr-2 text-[10px] font-medium">{formatVolume(token.volume)}</span>
                  </div>
                </div>
              {/each}
            </div>
          </div>
        </Card>

        <!-- Token Usage Table -->
        <Card class="bg-card/60 border-border/40 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border/40 bg-muted/30">
                  <th class="text-left px-4 py-3 font-medium text-muted-foreground">Token</th>
                  <th class="text-left px-3 py-3 font-medium text-muted-foreground hidden sm:table-cell">Chain</th>
                  <th class="text-right px-3 py-3 font-medium text-muted-foreground">Transactions</th>
                  <th class="text-right px-3 py-3 font-medium text-muted-foreground">Volume</th>
                </tr>
              </thead>
              <tbody>
                {#each displayedTokens as token}
                  <tr class="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <span class="font-medium">{token.symbol}</span>
                        <span class="text-xs text-muted-foreground">{token.name}</span>
                      </div>
                    </td>
                    <td class="px-3 py-3 hidden sm:table-cell">
                      <div class="flex items-center gap-2">
                        <img src={getChainIconUrl(token.chainId)} alt={token.chainName + ' chain icon'} class="w-4 h-4 rounded-full" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span class="text-xs">{token.chainName}</span>
                      </div>
                    </td>
                    <td class="text-right px-3 py-3 font-mono text-xs">{token.transactions}</td>
                    <td class="text-right px-3 py-3 font-mono text-xs">{formatVolume(token.volume)}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          {#if stats.tokenUsage.length > 15}
            <div class="p-3 text-center border-t border-border/40">
              <button
                class="text-sm text-orange-500 hover:text-orange-400 font-medium"
                onclick={() => showAllTokens = !showAllTokens}
              >
                {showAllTokens ? 'Show Less' : `Show All Tokens (${stats.tokenUsage.length - 15} more)`}
              </button>
            </div>
          {/if}
        </Card>

      {:else if activeSection === 'history'}
        <!-- ===== HISTORY SECTION ===== -->
        <div class="mb-4">
          <h3 class="text-lg font-bold mb-1 flex items-center gap-2">
            <Activity class="w-4 h-4 text-orange-500" />
            Transaction History
          </h3>
          <p class="text-sm text-muted-foreground">{stats.totalTransactions} Transactions &bull; Recent activity</p>
        </div>

        <Card class="bg-card/60 border-border/40 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-border/40 bg-muted/30">
                  <th class="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                  <th class="text-left px-3 py-3 font-medium text-muted-foreground">Type</th>
                  <th class="text-left px-3 py-3 font-medium text-muted-foreground hidden md:table-cell">Source</th>
                  <th class="text-left px-3 py-3 font-medium text-muted-foreground hidden md:table-cell">Destination</th>
                  <th class="text-right px-3 py-3 font-medium text-muted-foreground">Amount</th>
                  <th class="text-center px-3 py-3 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {#each displayedTxs as tx}
                  <tr class="border-b border-border/20 hover:bg-muted/20 transition-colors">
                    <td class="px-3 py-2.5 sm:px-4 sm:py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDate(tx.date)}</td>
                    <td class="px-2 py-2.5 sm:px-3 sm:py-3">
                      <Badge class="text-[9px] sm:text-[10px] {tx.type === 'Bridge' ? 'bg-orange-500/15 text-orange-500 border-orange-500/30' : 'bg-amber-500/15 text-amber-500 border-amber-500/30'}">
                        {tx.type}
                      </Badge>
                    </td>
                    <td class="px-3 py-2.5 hidden md:table-cell">
                      <div class="flex items-center gap-1.5">
                        <img src={getChainIconUrl(tx.sourceChain)} alt={tx.sourceChainName + ' chain icon'} class="w-4 h-4 rounded-full" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span class="text-xs">{tx.sourceChainName}</span>
                        <span class="text-xs text-muted-foreground">{tx.sourceToken}</span>
                      </div>
                    </td>
                    <td class="px-3 py-2.5 hidden md:table-cell">
                      <div class="flex items-center gap-1.5">
                        <ArrowRight class="w-3 h-3 text-muted-foreground" />
                        <img src={getChainIconUrl(tx.destChain)} alt={tx.destChainName + ' chain icon'} class="w-4 h-4 rounded-full" onerror={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                        <span class="text-xs">{tx.destChainName}</span>
                        <span class="text-xs text-muted-foreground">{tx.destToken}</span>
                      </div>
                    </td>
                    <!-- Mobile: compact source→dest shown below type -->
                    <td class="px-2 py-2.5 md:hidden">
                      <div class="text-[10px] text-muted-foreground">
                        {tx.sourceToken} → {tx.destToken}
                      </div>
                      <div class="text-[9px] text-muted-foreground">
                        {tx.sourceChainName} → {tx.destChainName}
                      </div>
                    </td>
                    <td class="text-right px-2 py-2.5 sm:px-3 sm:py-3">
                      <div class="text-xs font-medium">${tx.amountUsd}</div>
                      <div class="text-[10px] text-muted-foreground">{tx.amount}</div>
                    </td>
                    <td class="text-center px-3 py-3">
                      <Badge class="text-[10px] {tx.status === 'Success' ? 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30' : 'bg-red-500/15 text-red-500 border-red-500/30'}">
                        {tx.status}
                      </Badge>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          {#if stats.transactions.length > 25}
            <div class="p-3 text-center border-t border-border/40">
              <button
                class="text-sm text-orange-500 hover:text-orange-400 font-medium"
                onclick={() => showAllTxs = !showAllTxs}
              >
                {showAllTxs ? 'Show Less' : `Show All Transactions (${stats.transactions.length - 25} more)`}
              </button>
            </div>
          {/if}
        </Card>
      {/if}
    {/if}
  </main>

  <!-- Footer -->
  <footer class="border-t border-border/40 bg-card/30 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-md bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
          <Zap class="w-2.5 h-2.5 text-white" />
        </div>
        <span class="text-xs gradient-text font-medium">CryptoWalletsX</span>
      </div>
      <p class="text-xs text-muted-foreground">Powered by api.relay.link</p>
    </div>
  </footer>
</div>
