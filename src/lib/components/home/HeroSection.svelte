<script lang="ts">
  import { Zap } from 'lucide-svelte';
  import HeroSearch from './HeroSearch.svelte';
</script>

<section class="relative overflow-hidden">
  <!-- Animated gradient background -->
  <div class="absolute inset-0 mesh-gradient animated-gradient-bg"></div>
  <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[min(900px,100vw)] h-[700px] bg-gradient-to-r from-cyan-500/8 to-teal-500/8 rounded-full blur-3xl"></div>

  <!-- Floating geometric shapes -->
  <div class="absolute inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-20 left-[10%] w-16 h-16 border border-cyan-500/20 rounded-lg float-animation rotate-45"></div>
    <div class="absolute top-40 right-[15%] w-12 h-12 border border-teal-500/20 rounded-full float-slow-animation"></div>
    <div class="absolute bottom-32 left-[20%] w-8 h-8 bg-cyan-500/10 rounded-md float-animation" style="animation-delay: 2s"></div>
    <div class="absolute top-60 left-[60%] w-10 h-10 border border-rose-500/15 rounded-full float-slow-animation" style="animation-delay: 1s"></div>
    <div class="absolute bottom-48 right-[25%] w-6 h-6 bg-teal-500/10 rounded-sm rotate-45 float-animation" style="animation-delay: 3s"></div>
    <div class="absolute top-32 left-[40%] w-4 h-4 bg-cyan-500/15 rounded-full float-slow-animation" style="animation-delay: 4s"></div>
  </div>

  <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 sm:pt-28 pb-16 text-center">
    <!-- Brand badge -->
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
      <Zap class="w-4 h-4 text-cyan-500" />
      <span class="text-sm font-medium gradient-text">CryptoWalletsX</span>
    </div>

    <!-- Main heading -->
    <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6">
      <span class="gradient-text">Your Multi-Chain</span>
      <br />
      <span class="text-foreground">Analytics Powerhouse</span>
    </h1>

    <p class="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-12">
      Deep wallet analytics, airdrop tracking, and cross-chain insights — all in one place.
    </p>

    <!-- Enhanced search bar with auto-suggestions -->
    <HeroSearch />

    <!-- Quick stats row -->
    <div class="mt-10 flex flex-wrap justify-center gap-6 sm:gap-10">
      {#each [
        { value: '12+', label: 'Chains' },
        { value: '12', label: 'Live Tools' },
        { value: 'Real-time', label: 'Data' },
      ] as stat}
        <div class="text-center">
          <p class="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
          <p class="text-sm text-muted-foreground">{stat.label}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
