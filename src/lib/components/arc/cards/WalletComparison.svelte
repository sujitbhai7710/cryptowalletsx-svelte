<script lang="ts">
  import { GitCompareArrows } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import type { WalletStats } from '$lib/types';
  import { formatUSD } from '$lib/utils/format';

  interface Props { stats: WalletStats; }
  let { stats }: Props = $props();

  const averages = { transactions: 25, contracts: 8, balance: 50, nfts: 3, fees: 0.5 };

  let comparisons = $derived.by(() => {
    const balanceNum = parseFloat(stats.balanceUSD.replace(/[$,]/g, '')) || 0;
    const feesNum = parseFloat(stats.feesUSD.replace(/[$,]/g, '')) || 0;
    return [
      { label: 'Transactions', yours: stats.totalTransactions, avg: averages.transactions, max: Math.max(stats.totalTransactions, averages.transactions) * 1.2, color: 'from-cyan-500 to-cyan-400' },
      { label: 'Contracts', yours: stats.uniqueContracts, avg: averages.contracts, max: Math.max(stats.uniqueContracts, averages.contracts) * 1.2, color: 'from-teal-500 to-teal-400' },
      { label: 'Balance', yours: balanceNum, avg: averages.balance, max: Math.max(balanceNum, averages.balance) * 1.2, color: 'from-emerald-500 to-emerald-400', format: (v: number) => formatUSD(v) },
      { label: 'NFTs', yours: stats.nftUnique, avg: averages.nfts, max: Math.max(stats.nftUnique, averages.nfts) * 1.2, color: 'from-violet-500 to-violet-400' },
      { label: 'Fees', yours: feesNum, avg: averages.fees, max: Math.max(feesNum, averages.fees) * 1.2, color: 'from-amber-500 to-amber-400', format: (v: number) => formatUSD(v) },
    ];
  });
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <GitCompareArrows class="w-4 h-4 text-rose-500" />
      Wallet vs Average User
    </h3>

    <div class="space-y-4">
      {#each comparisons as comp}
        {@const max = comp.max || 1}
        {@const yourPct = Math.min((comp.yours / max) * 100, 100)}
        {@const avgPct = Math.min((comp.avg / max) * 100, 100)}
        {@const format = comp.format || ((v: number) => Math.round(v).toString())}
        {@const isAbove = comp.yours >= comp.avg}
        <div>
          <div class="flex items-center justify-between text-xs mb-1.5 gap-1">
            <span class="text-muted-foreground shrink-0">{comp.label}</span>
            <div class="flex items-center gap-1 sm:gap-2 min-w-0">
              <span class="font-semibold {isAbove ? 'text-cyan-500' : 'text-rose-500'} truncate">You: {format(comp.yours)}</span>
              <span class="text-muted-foreground shrink-0">|</span>
              <span class="text-muted-foreground truncate">Avg: {format(comp.avg)}</span>
            </div>
          </div>
          <div class="h-3 rounded-full bg-muted/30 overflow-hidden mb-1 relative">
            <div class="h-full rounded-full bg-gradient-to-r {comp.color} transition-all duration-700" style="width: {yourPct}%"></div>
            <div class="absolute top-0 h-full w-0.5 bg-foreground/50" style="left: {avgPct}%"></div>
          </div>
        </div>
      {/each}
    </div>

    <div class="mt-4 pt-3 border-t border-border/30 flex items-center gap-4 text-[10px] text-muted-foreground">
      <div class="flex items-center gap-1.5">
        <div class="w-3 h-2 rounded-sm bg-gradient-to-r from-cyan-500 to-cyan-400"></div>
        <span>Your wallet</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-0.5 h-2 bg-foreground/50"></div>
        <span>Avg user</span>
      </div>
    </div>
  </CardContent>
</Card>
