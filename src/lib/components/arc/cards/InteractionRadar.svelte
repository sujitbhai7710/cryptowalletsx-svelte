<script lang="ts">
  import { Radar } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import type { WalletStats } from '$lib/types';

  interface Props { stats: WalletStats; }
  let { stats }: Props = $props();

  let data = $derived([
    { category: 'Transactions', value: Math.min(Math.round(stats.totalTransactions * 1.5), 100) },
    { category: 'Contracts', value: Math.min(Math.round(stats.uniqueContracts * 5), 100) },
    { category: 'NFTs', value: Math.min(Math.round(stats.nftUnique * 8), 100) },
    { category: 'Tokens', value: Math.min(Math.round(stats.tokenDiversity * 10), 100) },
    { category: 'DeFi', value: Math.min(Math.round((stats.stakingActivities + stats.swapActivities + stats.liquidityActivities) * 5), 100) },
    { category: 'Staking', value: Math.min(Math.round(stats.stakingActivities * 10), 100) },
  ]);
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <Radar class="w-4 h-4 text-violet-500" />
      Interaction Diversity
    </h3>

    <!-- Simple radar chart using SVG -->
    <div class="w-full h-[200px] sm:h-[250px] flex items-center justify-center">
      <div class="relative w-40 h-40 sm:w-56 sm:h-56">
        <svg viewBox="0 0 200 200" class="w-full h-full">
          {#each [25, 50, 75, 100] as ring}
            <polygon
              points={Array.from({ length: 6 }, (_, i) => {
                const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
                const r = (ring / 100) * 80;
                return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
              }).join(' ')}
              fill="none"
              stroke="currentColor"
              stroke-opacity="0.1"
            />
          {/each}
          <!-- Axis lines -->
          {#each Array(6) as _, i}
            {@const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2}
            <line x1="100" y1="100" x2={100 + 80 * Math.cos(angle)} y2={100 + 80 * Math.sin(angle)} stroke="currentColor" stroke-opacity="0.1" />
          {/each}
          <!-- Data polygon -->
          <polygon
            points={data.map((d, i) => {
              const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2;
              const r = (d.value / 100) * 80;
              return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
            }).join(' ')}
            fill="#06b6d4"
            fill-opacity="0.15"
            stroke="#06b6d4"
            stroke-width="2"
          />
          <!-- Labels -->
          {#each data as d, i}
            {@const angle = (Math.PI * 2 * i) / 6 - Math.PI / 2}
            {@const labelR = 95}
            <text
              x={100 + labelR * Math.cos(angle)}
              y={100 + labelR * Math.sin(angle)}
              text-anchor="middle"
              dominant-baseline="middle"
              class="text-[8px] fill-muted-foreground"
            >
              {d.category}
            </text>
          {/each}
        </svg>
      </div>
    </div>

    <!-- Category scores -->
    <div class="mt-3 pt-3 border-t border-border/30 grid grid-cols-3 gap-2">
      {#each data as d}
        <div class="text-center">
          <p class="text-[10px] text-muted-foreground">{d.category}</p>
          <p class="text-sm font-bold">{d.value}</p>
        </div>
      {/each}
    </div>
  </CardContent>
</Card>
