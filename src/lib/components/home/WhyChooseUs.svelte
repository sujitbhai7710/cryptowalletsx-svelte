<script lang="ts">
  import { Zap, Shield, BarChart3, Globe, Clock, Eye, Layers, Fingerprint } from 'lucide-svelte';

  const features = [
    {
      icon: Zap,
      title: 'Real-Time Data',
      description: 'Live on-chain data powered by Blockscout, SocialScan, and Li.Fi APIs. No stale caches — every query fetches fresh blockchain state.',
      gradient: 'from-cyan-500 to-teal-600',
      glow: 'cyan'
    },
    {
      icon: Shield,
      title: 'Wallet Scoring',
      description: 'Proprietary scoring algorithm evaluates transaction history, DeFi engagement, protocol diversity, and consistency to rank your wallet from Bronze to Diamond.',
      gradient: 'from-blue-500 to-indigo-600',
      glow: 'blue'
    },
    {
      icon: BarChart3,
      title: 'Deep Analytics',
      description: 'Go beyond basic stats. View transaction flows, gas fee timelines, interaction radars, protocol tables, and activity streaks with beautiful visualizations.',
      gradient: 'from-purple-500 to-violet-600',
      glow: 'purple'
    },
    {
      icon: Globe,
      title: '12+ Chains',
      description: 'Track wallets across Arc, Base, Ink, Soneium, Seismic, GenLayer, DAC, Doma, Robinhood, LitVM, and more — all from a single dashboard.',
      gradient: 'from-emerald-500 to-green-600',
      glow: 'emerald'
    },
    {
      icon: Clock,
      title: 'Activity Streaks',
      description: 'GitHub-style heatmap shows your daily on-chain activity. Track consecutive days of transactions and maintain your engagement streaks.',
      gradient: 'from-amber-500 to-orange-600',
      glow: 'amber'
    },
    {
      icon: Eye,
      title: 'Airdrop Tracking',
      description: 'Monitor past and active airdrops. Check eligibility for LayerZero, Linea, and more with cross-chain bridge activity analysis.',
      gradient: 'from-rose-500 to-pink-600',
      glow: 'rose'
    },
    {
      icon: Layers,
      title: 'Bridge Analytics',
      description: 'Cross-chain bridge tracking via Relay and Jumper integrations. See your total transfers, volumes, and chains connected at a glance.',
      gradient: 'from-orange-500 to-red-600',
      glow: 'orange'
    },
    {
      icon: Fingerprint,
      title: 'NFT & Token Analysis',
      description: 'Full ERC-20 token portfolio, NFT collection breakdown, token transfer history, and approval tracking for every connected wallet.',
      gradient: 'from-indigo-500 to-blue-600',
      glow: 'indigo'
    }
  ];
</script>

<section class="relative max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 overflow-hidden">
  <!-- Background -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-1/3 left-0 w-[min(500px,100vw)] h-[500px] bg-teal-500/3 rounded-full blur-3xl"></div>
    <div class="absolute bottom-1/3 right-0 w-[min(500px,100vw)] h-[500px] bg-purple-500/3 rounded-full blur-3xl"></div>
  </div>

  <div class="relative">
    <!-- Section Header -->
    <div class="text-center mb-14">
      <h2 class="text-2xl sm:text-3xl lg:text-5xl font-extrabold mb-4">
        <span class="text-foreground">Why </span>
        <span class="gradient-text">CryptoWalletsX</span>
        <span class="text-foreground">?</span>
      </h2>
      <p class="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
        Not just another block explorer. Purpose-built analytics to maximize your on-chain potential.
      </p>
    </div>

    <!-- Features Grid -->
    <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {#each features as feature, i}
        <div class="group glass-card bg-card/60 border border-border/40 rounded-2xl p-6 card-hover-lift h-full">
          <!-- Icon -->
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br {feature.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
            <feature.icon class="w-6 h-6 text-white" />
          </div>
          <!-- Content -->
          <h3 class="text-base font-bold mb-2 group-hover:text-cyan-500 transition-colors">{feature.title}</h3>
          <p class="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
        </div>
      {/each}
    </div>
  </div>
</section>
