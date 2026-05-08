<script lang="ts">
  import { ArrowLeftRight } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import { weiToNative } from '$lib/utils/format';
  import type { Transaction, ChainConfig } from '$lib/types';

  interface Props { transactions: Transaction[]; address: string; config: ChainConfig; }
  let { transactions, address, config }: Props = $props();

  let flowData = $derived.by(() => {
    const addr = address.toLowerCase();
    let inCount = 0; let outCount = 0;
    let inVolume = BigInt(0); let outVolume = BigInt(0);

    transactions.forEach((tx) => {
      const from = tx.from?.hash?.toLowerCase();
      const to = tx.to?.hash?.toLowerCase();
      const value = BigInt(String(tx.value || '0'));
      if (to === addr) { inCount++; inVolume += value; }
      else if (from === addr) { outCount++; outVolume += value; }
    });

    const total = inCount + outCount || 1;
    const inPct = Math.round((inCount / total) * 100);
    const outPct = 100 - inPct;
    return {
      inCount, outCount,
      inVolume: weiToNative(inVolume.toString(), config.nativeDecimals),
      outVolume: weiToNative(outVolume.toString(), config.nativeDecimals),
      inPct, outPct,
    };
  });
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <h3 class="text-sm font-semibold mb-4 sm:mb-5 flex items-center gap-2">
      <ArrowLeftRight class="w-4 h-4 text-cyan-500" />
      Transaction Flow
    </h3>

    <!-- Mobile: Stacked layout, Desktop: Side-by-side -->
    <div class="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
      <!-- IN side -->
      <div class="w-full sm:flex-1 sm:text-right">
        <div class="flex sm:justify-end items-center gap-2 sm:flex-col sm:gap-0 mb-2">
          <span class="text-xs text-muted-foreground">Received (IN)</span>
          <p class="text-xl sm:text-2xl font-bold text-cyan-500 count-up">{flowData.inCount}</p>
        </div>
        <div class="flex sm:justify-end">
          <div
            class="h-7 sm:h-8 w-full sm:rounded-l-lg rounded-lg bg-gradient-to-r from-cyan-500/20 to-cyan-500/60 transition-all duration-700 flex items-center justify-end pr-2"
            style="width: 100%"
          >
            <span class="text-[9px] sm:text-[10px] font-mono text-cyan-300">{flowData.inPct}%</span>
          </div>
        </div>
        <p class="text-[10px] sm:text-xs text-muted-foreground mt-1 font-mono truncate">{flowData.inVolume} {config.nativeCurrency}</p>
      </div>

      <!-- Center - Wallet -->
      <div class="flex sm:flex-col items-center shrink-0 gap-2 sm:gap-0">
        <div class="w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border-2 border-cyan-500/40 flex items-center justify-center">
          <div class="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
            <span class="text-[7px] sm:text-[10px] font-bold text-white">YOU</span>
          </div>
        </div>
        <div class="flex sm:flex-col items-center gap-1 sm:gap-0 sm:mt-1">
          <span class="text-[8px] sm:text-[9px] text-cyan-500">OUT ↗</span>
          <span class="text-[8px] sm:text-[9px] text-teal-500">IN ↙</span>
        </div>
      </div>

      <!-- OUT side -->
      <div class="w-full sm:flex-1">
        <div class="flex items-center gap-2 sm:flex-col sm:gap-0 mb-2">
          <span class="text-xs text-muted-foreground">Sent (OUT)</span>
          <p class="text-xl sm:text-2xl font-bold text-teal-500 count-up">{flowData.outCount}</p>
        </div>
        <div
          class="h-7 sm:h-8 w-full sm:rounded-r-lg rounded-lg bg-gradient-to-r from-teal-500/60 to-teal-500/20 transition-all duration-700 flex items-center pl-2"
          style="width: 100%"
        >
          <span class="text-[9px] sm:text-[10px] font-mono text-teal-300">{flowData.outPct}%</span>
        </div>
        <p class="text-[10px] sm:text-xs text-muted-foreground mt-1 font-mono truncate">{flowData.outVolume} {config.nativeCurrency}</p>
      </div>
    </div>

    <!-- Flow summary -->
    <div class="mt-4 pt-3 border-t border-border/30 grid grid-cols-3 gap-2 text-center">
      <div>
        <p class="text-[10px] text-muted-foreground">Net Flow</p>
        <p class="text-xs sm:text-sm font-bold {(parseFloat(flowData.inVolume) - parseFloat(flowData.outVolume)) >= 0 ? 'text-cyan-500' : 'text-rose-500'}">
          {(parseFloat(flowData.inVolume) - parseFloat(flowData.outVolume)).toFixed(2)} {config.nativeCurrency}
        </p>
      </div>
      <div>
        <p class="text-[10px] text-muted-foreground">Total Txns</p>
        <p class="text-xs sm:text-sm font-bold">{transactions.length}</p>
      </div>
      <div>
        <p class="text-[10px] text-muted-foreground">Ratio</p>
        <p class="text-xs sm:text-sm font-bold">{flowData.inCount}:{flowData.outCount}</p>
      </div>
    </div>
  </CardContent>
</Card>
