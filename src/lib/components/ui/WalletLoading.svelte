<script lang="ts">
  import { Zap } from 'lucide-svelte';

  interface Props {
    chainName?: string;
    chainColor?: string;
    message?: string;
  }

  let { chainName = 'Chain', chainColor = 'cyan', message = 'Analyzing wallet data' }: Props = $props();

  const colorMap: Record<string, { from: string; to: string; text: string; glow: string; ring: string }> = {
    cyan: { from: 'from-cyan-500', to: 'to-teal-600', text: 'text-cyan-500', glow: 'shadow-cyan-500/30', ring: 'ring-cyan-500/30' },
    orange: { from: 'from-orange-500', to: 'to-amber-600', text: 'text-orange-500', glow: 'shadow-orange-500/30', ring: 'ring-orange-500/30' },
    blue: { from: 'from-blue-500', to: 'to-indigo-600', text: 'text-blue-500', glow: 'shadow-blue-500/30', ring: 'ring-blue-500/30' },
    purple: { from: 'from-purple-500', to: 'to-violet-600', text: 'text-purple-500', glow: 'shadow-purple-500/30', ring: 'ring-purple-500/30' },
    pink: { from: 'from-pink-500', to: 'to-rose-600', text: 'text-pink-500', glow: 'shadow-pink-500/30', ring: 'ring-pink-500/30' },
    emerald: { from: 'from-emerald-500', to: 'to-green-600', text: 'text-emerald-500', glow: 'shadow-emerald-500/30', ring: 'ring-emerald-500/30' },
    yellow: { from: 'from-yellow-500', to: 'to-orange-600', text: 'text-yellow-500', glow: 'shadow-yellow-500/30', ring: 'ring-yellow-500/30' },
    red: { from: 'from-red-500', to: 'to-rose-600', text: 'text-red-500', glow: 'shadow-red-500/30', ring: 'ring-red-500/30' },
  };

  let colors = $derived(colorMap[chainColor] || colorMap.cyan);

  const steps = [
    'Fetching wallet details',
    'Scanning transactions',
    'Analyzing token transfers',
    'Computing wallet score',
    'Building analytics',
  ];

  let currentStep = $state(0);

  $effect(() => {
    const interval = setInterval(() => {
      currentStep = (currentStep + 1) % steps.length;
    }, 1200);
    return () => clearInterval(interval);
  });
</script>

<div class="flex flex-col items-center justify-center py-20 px-4">
  <!-- Main animated orb -->
  <div class="relative mb-8">
    <!-- Outer ring pulse -->
    <div class="absolute inset-0 -m-6 rounded-full {colors.ring} ring-4 animate-ping opacity-20"></div>
    <div class="absolute inset-0 -m-4 rounded-full {colors.ring} ring-2 animate-pulse opacity-30"></div>

    <!-- Spinning ring -->
    <div class="absolute inset-0 -m-2 rounded-full">
      <svg class="w-[calc(100%+16px)] h-[calc(100%+16px)] animate-spin" style="animation-duration: 3s;" viewBox="0 0 100 100">
        <defs>
          <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color: transparent;" />
            <stop offset="50%" style="stop-color: currentColor;" />
            <stop offset="100%" style="stop-color: transparent;" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="46" fill="none" stroke="url(#spinGrad)" stroke-width="1.5"
          stroke-dasharray="72 217" stroke-linecap="round"
          class="{colors.text} opacity-40" />
      </svg>
    </div>

    <!-- Core orb -->
    <div class="w-24 h-24 rounded-full bg-gradient-to-br {colors.from} {colors.to} flex items-center justify-center shadow-2xl {colors.glow} relative overflow-hidden">
      <!-- Shimmer effect -->
      <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
      <Zap class="w-10 h-10 text-white relative z-10 animate-pulse" />
    </div>
  </div>

  <!-- Chain name badge -->
  <div class="mb-4">
    <span class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/80 text-sm font-medium">
      <span class="w-2 h-2 rounded-full {colors.from.replace('from-', 'bg-')} animate-pulse"></span>
      {chainName}
    </span>
  </div>

  <!-- Loading message with typewriter effect -->
  <div class="text-center mb-6">
    <h3 class="text-lg font-bold mb-2">{message}...</h3>
    <p class="text-sm text-muted-foreground animate-pulse">{steps[currentStep]}</p>
  </div>

  <!-- Progress dots -->
  <div class="flex items-center gap-2 mb-8">
    {#each steps as _, i}
      <div
        class="w-2 h-2 rounded-full transition-all duration-500 {i === currentStep
          ? 'bg-foreground w-6'
          : i < currentStep
            ? 'bg-foreground/50'
            : 'bg-foreground/20'}"
      ></div>
    {/each}
  </div>

  <!-- Skeleton preview cards -->
  <div class="w-full max-w-3xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
    {#each Array(4) as _, i}
      <div
        class="h-24 rounded-xl bg-muted/40 border border-border/20 overflow-hidden relative"
        style="animation: skeletonFade 1.5s ease-in-out infinite; animation-delay: {i * 150}ms;"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer"></div>
      </div>
    {/each}
  </div>
  <div class="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-3">
    {#each Array(2) as _, i}
      <div
        class="h-36 rounded-xl bg-muted/40 border border-border/20 overflow-hidden relative"
        style="animation: skeletonFade 1.5s ease-in-out infinite; animation-delay: {600 + i * 150}ms;"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-muted/30 to-transparent animate-shimmer"></div>
      </div>
    {/each}
  </div>
</div>

<style>
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes skeletonFade {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }

  .animate-shimmer {
    animation: shimmer 2s ease-in-out infinite;
  }
</style>
