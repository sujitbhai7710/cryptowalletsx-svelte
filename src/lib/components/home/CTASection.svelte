<script lang="ts">
  import { ArrowRight, Zap, Shield, BarChart3 } from 'lucide-svelte';
</script>

<section class="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
  <!-- Main CTA Card -->
  <div class="relative overflow-hidden rounded-3xl border border-border/40">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 mesh-gradient animated-gradient-bg"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-teal-500/10"></div>

    <!-- Floating elements -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-8 left-[10%] w-12 h-12 border border-cyan-500/20 rounded-lg float-animation rotate-45"></div>
      <div class="absolute bottom-12 right-[15%] w-8 h-8 border border-teal-500/20 rounded-full float-slow-animation"></div>
      <div class="absolute top-1/2 right-[30%] w-4 h-4 bg-cyan-500/10 rounded-sm rotate-45 float-animation" style="animation-delay: 2s"></div>
    </div>

    <div class="relative px-6 sm:px-12 lg:px-20 py-12 sm:py-16 lg:py-20 text-center">
      <!-- Badge -->
      <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
        <Zap class="w-4 h-4 text-cyan-500" />
        <span class="text-sm font-medium gradient-text">Free & Open</span>
      </div>

      <h2 class="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-5 max-w-3xl mx-auto">
        <span class="text-foreground">Ready to Analyze Your </span>
        <span class="gradient-text">On-Chain Activity</span>
        <span class="text-foreground">?</span>
      </h2>

      <p class="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto mb-10">
        Enter your wallet address and get instant insights across 12+ blockchains. No sign-up, no API keys, completely free.
      </p>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
        <a href="/arc" class="group inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-bold text-base sm:text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-105 transition-all duration-300">
          Get Started
          <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>
        <a href="/base" class="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-secondary/60 border border-border/40 hover:bg-cyan-500/10 hover:border-cyan-500/30 font-semibold text-base sm:text-lg transition-all duration-300">
          <Shield class="w-5 h-5" />
          Explore Mainnet
        </a>
      </div>

      <!-- Trust indicators -->
      <div class="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-muted-foreground">
        <div class="flex items-center gap-1.5 text-xs sm:text-sm">
          <Shield class="w-4 h-4 text-emerald-500" />
          <span>No Wallet Required</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs sm:text-sm">
          <BarChart3 class="w-4 h-4 text-cyan-500" />
          <span>Real-Time Data</span>
        </div>
        <div class="flex items-center gap-1.5 text-xs sm:text-sm">
          <Zap class="w-4 h-4 text-amber-500" />
          <span>100% Free</span>
        </div>
      </div>
    </div>
  </div>
</section>
