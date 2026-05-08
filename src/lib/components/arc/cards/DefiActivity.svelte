<script lang="ts">
  import { Landmark, ArrowLeftRight, Droplets, HandCoins, Network, Vote } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import type { WalletStats } from '$lib/types';

  interface Props { stats: WalletStats; }
  let { stats }: Props = $props();

  const defiCategories = [
    { label: 'Staking', color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', activities: 'stakingActivities' as const, protocols: 'stakingProtocols' as const },
    { label: 'Swapping', color: 'text-purple-500', bgColor: 'bg-purple-500/10', activities: 'swapActivities' as const, protocols: 'swapProtocols' as const },
    { label: 'Liquidity', color: 'text-violet-500', bgColor: 'bg-violet-500/10', activities: 'liquidityActivities' as const, protocols: 'liquidityProtocols' as const },
    { label: 'Lending', color: 'text-orange-500', bgColor: 'bg-orange-500/10', activities: 'lendingActivities' as const, protocols: 'lendingProtocols' as const },
    { label: 'Bridge', color: 'text-red-500', bgColor: 'bg-red-500/10', activities: 'bridgeActivities' as const, protocols: 'bridgeProtocols' as const },
    { label: 'Governance', color: 'text-blue-500', bgColor: 'bg-blue-500/10', activities: 'governanceActivities' as const, protocols: 'governanceProtocols' as const },
  ];
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardHeader class="pb-3">
    <CardTitle class="text-base flex items-center gap-2">
      <Landmark class="w-4 h-4 text-emerald-500" />
      DeFi Activity
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
      {#each defiCategories as cat}
        <div class="p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
          <div class="flex items-center gap-2 mb-3">
            <div class="w-8 h-8 rounded-lg {cat.bgColor} flex items-center justify-center">
              {#if cat.label === 'Staking'}<Landmark class="w-4 h-4 {cat.color}" />
              {:else if cat.label === 'Swapping'}<ArrowLeftRight class="w-4 h-4 {cat.color}" />
              {:else if cat.label === 'Liquidity'}<Droplets class="w-4 h-4 {cat.color}" />
              {:else if cat.label === 'Lending'}<HandCoins class="w-4 h-4 {cat.color}" />
              {:else if cat.label === 'Bridge'}<Network class="w-4 h-4 {cat.color}" />
              {:else}<Vote class="w-4 h-4 {cat.color}" />
              {/if}
            </div>
            <span class="text-sm font-medium">{cat.label}</span>
          </div>
          <div class="space-y-1">
            <div class="flex justify-between">
              <span class="text-xs text-muted-foreground">Total Activities</span>
              <span class="text-sm font-semibold">{stats[cat.activities]}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-muted-foreground">Last 7 Days</span>
              <Badge variant="secondary" class="text-[10px] h-4">0</Badge>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-muted-foreground">Unique Protocols</span>
              <span class="text-sm font-semibold">{stats[cat.protocols]}</span>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </CardContent>
</Card>
