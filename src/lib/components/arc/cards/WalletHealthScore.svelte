<script lang="ts">
  import { Heart } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import type { WalletStats } from '$lib/types';

  interface Props { stats: WalletStats; }
  let { stats }: Props = $props();

  function getHealthColor(score: number): string {
    if (score >= 60) return '#06b6d4';
    if (score >= 30) return '#f59e0b';
    return '#f43f5e';
  }

  function getHealthLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Moderate';
    if (score >= 20) return 'Needs Work';
    return 'New Wallet';
  }

  let activityScore = $derived(Math.min(Math.round(Math.log10(1 + stats.totalTransactions) * 10), 35));
  let diversityScore = $derived(Math.min(Math.round(
    Math.log10(1 + stats.uniqueContracts) * 8 +
    Math.log10(1 + stats.tokenDiversity) * 5 +
    Math.log10(1 + stats.nftUnique) * 4
  ), 35));
  let consistencyScore = $derived(Math.min(Math.round(
    Math.log10(1 + stats.bestStreak) * 6 +
    Math.log10(1 + stats.daysActive) * 4 +
    (stats.walletAge > 0 ? Math.log10(1 + stats.walletAge) * 5 : 0)
  ), 30));

  let healthScore = $derived(Math.min(activityScore + diversityScore + consistencyScore, 100));
  let color = $derived(getHealthColor(healthScore));
  let circumference = $derived(2 * Math.PI * 52);
  let strokeDashoffset = $derived(circumference - (healthScore / 100) * circumference);

  let subScores = $derived([
    { label: 'Activity', score: activityScore, max: 35, weight: '35%' },
    { label: 'Diversity', score: diversityScore, max: 35, weight: '35%' },
    { label: 'Consistency', score: consistencyScore, max: 30, weight: '30%' },
  ]);
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <h3 class="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2">
      <Heart class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-500" />
      Wallet Health Score
    </h3>
    <div class="flex items-center gap-3 sm:gap-6">
      <div class="relative w-20 h-20 sm:w-32 sm:h-32 shrink-0">
        <svg class="w-20 h-20 sm:w-32 sm:h-32 -rotate-90" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f43f5e" />
              <stop offset="40%" stop-color="#f59e0b" />
              <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" stroke-width="8" class="text-muted/30" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke="url(#healthGradient)"
            stroke-width="8"
            stroke-linecap="round"
            stroke-dasharray={circumference}
            stroke-dashoffset={strokeDashoffset}
            class="score-circle-animated"
            style="filter: drop-shadow(0 0 8px {color}60)"
          />
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-xl sm:text-3xl font-bold count-up" style="color: {color}">{healthScore}</span>
          <span class="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">Health</span>
        </div>
      </div>

      <div class="flex-1 space-y-2 sm:space-y-3 min-w-0">
        <div class="mb-1 sm:mb-2">
          <span class="text-xs sm:text-sm font-bold" style="color: {color}">{getHealthLabel(healthScore)}</span>
        </div>
        {#each subScores as sub}
          <div>
            <div class="flex items-center justify-between text-[10px] sm:text-xs mb-1">
              <span class="text-muted-foreground truncate">{sub.label} <span class="text-muted-foreground/60">({sub.weight})</span></span>
              <span class="font-semibold shrink-0 ml-1">{sub.score}/{sub.max}</span>
            </div>
            <div class="h-1.5 sm:h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-1000"
                style="width: {Math.min((sub.score / sub.max) * 100, 100)}%; background: linear-gradient(90deg, {color}, {color}88)"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </CardContent>
</Card>
