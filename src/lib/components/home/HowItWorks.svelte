<script lang="ts">
  import { Wallet, Search, BarChart3, Trophy } from 'lucide-svelte';

  const steps = [
    {
      icon: Wallet,
      title: 'Connect Your Wallet',
      description: 'Enter any EVM wallet address or connect your wallet to get started. We support MetaMask, Rabby, and all major EVM wallets.',
      gradient: 'from-cyan-500 to-teal-600',
      step: '01'
    },
    {
      icon: Search,
      title: 'Scan On-Chain Activity',
      description: 'Our engine scans transactions, token transfers, DeFi interactions, NFTs, and bridge activity across 12+ blockchains in real-time.',
      gradient: 'from-blue-500 to-indigo-600',
      step: '02'
    },
    {
      icon: BarChart3,
      title: 'Analyze Your Stats',
      description: 'View detailed analytics including wallet scores, transaction patterns, protocol usage, gas spending, and activity streaks.',
      gradient: 'from-purple-500 to-violet-600',
      step: '03'
    },
    {
      icon: Trophy,
      title: 'Track Airdrop Eligibility',
      description: 'Stay ahead of airdrops with cross-chain activity tracking. See your bridge history, unique protocols, and eligibility across networks.',
      gradient: 'from-amber-500 to-orange-600',
      step: '04'
    }
  ];
</script>

<section class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
  <!-- Background -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/3 rounded-full blur-3xl"></div>
  </div>

  <div class="relative">
    <!-- Section Header -->
    <div class="text-center mb-16">
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
        <span class="text-foreground">How It </span>
        <span class="gradient-text">Works</span>
      </h2>
      <p class="text-muted-foreground text-lg max-w-xl mx-auto">
        Get comprehensive wallet insights in four simple steps — no sign-up required.
      </p>
    </div>

    <!-- Steps -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each steps as step, i}
        <div class="relative group">
          <!-- Connector line (hidden on mobile, shown on lg) -->
          {#if i < steps.length - 1}
            <div class="hidden lg:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-px border-t-2 border-dashed border-border/40"></div>
          {/if}

          <div class="glass-card bg-card/60 border border-border/40 rounded-2xl p-6 text-center card-hover-lift h-full">
            <!-- Step Number -->
            <div class="text-xs font-bold text-muted-foreground/50 mb-4 tracking-widest">STEP {step.step}</div>

            <!-- Icon -->
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br {step.gradient} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
              <step.icon class="w-8 h-8 text-white" />
            </div>

            <!-- Content -->
            <h3 class="text-lg font-bold mb-2">{step.title}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
