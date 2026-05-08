<script lang="ts">
  import { Search, ArrowLeftRight, Moon, Sun, Globe, Activity, Layers, Home, X, Zap } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Input from '$lib/components/ui/Input.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import { isValidEvmAddress } from '$lib/utils/format';

  interface Props {
    onAddressSubmit: (address: string) => void;
  }

  let { onAddressSubmit }: Props = $props();

  let inputAddress = $state('');
  let error = $state('');
  let mobileMenuOpen = $state(false);

  function handleScan() {
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
    onAddressSubmit(addr);
  }

  const sampleAddresses = [
    '0xA012B32d3568CC93713A5e63DF7a772Af034af9A',
    '0x5739430639B19433Acd98ccb188Ea8582e514768',
  ];
</script>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3 min-w-0">
        <a href="/">
          <Button variant="ghost" size="icon" class="shrink-0">
            <Home class="w-4 h-4" />
          </Button>
        </a>
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center shrink-0">
          <Layers class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-lg gradient-text truncate">LayerZero Stats Checker</span>
        <Badge variant="secondary" class="hidden sm:flex gap-1 text-xs shrink-0">
          <div class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          Cross-Chain
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
    {#if mobileMenuOpen}
      <div class="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl">
        <nav class="max-w-7xl mx-auto px-4 py-3 space-y-1">
          <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60"><Home class="w-4 h-4" /> Home</a>
          <a href="/checker" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cyan-500 bg-cyan-500/10"><Layers class="w-4 h-4" /> All Checkers</a>
        </nav>
      </div>
    {/if}
  </header>

  <!-- Hero Section -->
  <main class="flex-1">
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
              onkeydown={(e) => { if (e.key === 'Enter') handleScan(); }}
              placeholder="Enter Wallet Address (0x...)"
              class="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm sm:text-base"
            />
            <Button
              onclick={handleScan}
              class="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white px-6 rounded-xl shadow-md shadow-cyan-500/25"
            >
              <Search class="w-4 h-4 sm:mr-2" />
              <span class="hidden sm:inline">Analyze</span>
            </Button>
          </div>
          {#if error}
            <p class="text-destructive text-sm mt-2">{error}</p>
          {/if}
        </div>

        <!-- Sample Addresses -->
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <span class="text-xs text-muted-foreground mr-1 self-center">Try:</span>
          {#each sampleAddresses as addr}
            <button
              class="text-xs px-3 py-1.5 rounded-full bg-secondary/80 hover:bg-secondary text-secondary-foreground transition-colors font-mono"
              onclick={() => { inputAddress = addr; onAddressSubmit(addr); }}
            >
              {addr.slice(0, 8)}...{addr.slice(-4)}
            </button>
          {/each}
        </div>
      </div>
    </section>

    <!-- Quick Stats -->
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

    <!-- Features -->
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
  </main>

  <!-- Footer -->
  <footer class="border-t border-border/40 bg-card/30 mt-auto">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
          <Zap class="w-3 h-3 text-white" />
        </div>
        <span class="text-sm font-medium gradient-text">LayerZero Stats Checker</span>
      </div>
      <p class="text-xs text-muted-foreground">Powered by scan.layerzero-api.com</p>
    </div>
  </footer>
</div>
