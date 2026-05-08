<script lang="ts">
  import { Fuel } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import { weiToNative, formatUSD } from '$lib/utils/format';
  import type { Transaction, ChainConfig } from '$lib/types';

  interface Props { transactions: Transaction[]; config: ChainConfig; }
  let { transactions, config }: Props = $props();

  let gasData = $derived.by(() => {
    const dayMap = new Map<string, { date: string; fees: number; count: number }>();
    transactions.forEach((tx) => {
      const feeWei = tx.fee?.value || '0';
      const feeNative = parseFloat(weiToNative(feeWei, config.nativeDecimals));
      const date = new Date(tx.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      const existing = dayMap.get(key);
      if (existing) { existing.fees += feeNative; existing.count += 1; }
      else { dayMap.set(key, { date: key, fees: feeNative, count: 1 }); }
    });

    const chartData = Array.from(dayMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ date: d.date.slice(5), fees: parseFloat(d.fees.toFixed(6)), count: d.count }));

    const allFees = transactions.map((tx) => parseFloat(weiToNative(tx.fee?.value || '0', config.nativeDecimals)));
    const totalFees = allFees.reduce((sum, f) => sum + f, 0);
    const avgFee = allFees.length > 0 ? totalFees / allFees.length : 0;
    const peakFee = allFees.length > 0 ? Math.max(...allFees) : 0;

    return { chartData, totalFees, avgFee, peakFee };
  });
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <Fuel class="w-4 h-4 text-amber-500" />
      Gas Fee Timeline
    </h3>

    {#if gasData.chartData.length > 0}
      <!-- Scrollable container for mobile -->
      <div class="w-full overflow-x-auto -mx-1 px-1" style="scrollbar-width: thin;">
        <div class="h-[160px] sm:h-[200px] flex items-end gap-[2px] sm:gap-1" style="min-width: max({gasData.chartData.length * 14}px, 100%);">
          {#each gasData.chartData as d}
            <div class="flex-1 flex flex-col items-center gap-0.5" style="min-width: 10px;">
              <div class="w-full bg-amber-500/40 rounded-t-sm transition-all hover:bg-amber-500/60" style="height: {(d.fees / Math.max(...gasData.chartData.map(m => m.fees), 0.001)) * 130}px; min-height: 2px"></div>
              <span class="text-[5px] sm:text-[8px] text-muted-foreground whitespace-nowrap leading-tight">{d.date}</span>
            </div>
          {/each}
        </div>
      </div>
    {:else}
      <div class="h-[180px] sm:h-[200px] flex items-center justify-center text-muted-foreground text-sm">
        No transaction data available
      </div>
    {/if}

    <div class="mt-4 pt-3 border-t border-border/30 grid grid-cols-3 gap-2 sm:gap-3 text-center">
      <div>
        <p class="text-[10px] text-muted-foreground">Total Fees</p>
        <p class="text-xs sm:text-sm font-bold text-amber-500">{formatUSD(gasData.totalFees)}</p>
      </div>
      <div>
        <p class="text-[10px] text-muted-foreground">Avg Fee</p>
        <p class="text-xs sm:text-sm font-bold">{formatUSD(gasData.avgFee)}</p>
      </div>
      <div>
        <p class="text-[10px] text-muted-foreground">Peak Fee</p>
        <p class="text-xs sm:text-sm font-bold">{formatUSD(gasData.peakFee)}</p>
      </div>
    </div>
  </CardContent>
</Card>
