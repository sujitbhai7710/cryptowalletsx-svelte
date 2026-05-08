<script lang="ts">
  import { Shield, Droplets, GitBranch, UserSearch, Coins, Activity, ArrowRight, ExternalLink, Globe, ArrowLeftRight, BookOpen, Award } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { tools } from '$lib/utils/constants';

  const iconMap: Record<string, any> = { Shield, Droplets, GitBranch, UserSearch, Coins, Activity, Globe, ArrowLeftRight, BookOpen, Award };

  const statusStyles: Record<string, string> = {
    LIVE: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    'COMING SOON': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  };
</script>

<section class="max-w-6xl mx-auto px-4 sm:px-6 py-16">
  <div class="text-center mb-12">
    <h2 class="text-3xl sm:text-4xl font-bold mb-3">
      <span class="gradient-text">Powerful Tools</span>
      <span class="text-foreground"> at Your Fingertips</span>
    </h2>
    <p class="text-muted-foreground text-lg max-w-xl mx-auto">
      Everything you need to analyze, track, and optimize your on-chain activity.
    </p>
  </div>

  <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
    {#each tools as tool}
      {@const IconComponent = iconMap[tool.icon]}
      <a href={tool.path} class="block group">
        <Card class="glass-card bg-card/60 border-border/40 card-hover-lift glow-border h-full">
          <div class="p-6">
            <div class="flex items-start justify-between mb-4">
              <div class="w-12 h-12 rounded-xl bg-gradient-to-br {tool.gradient} flex items-center justify-center shadow-lg">
                {#if IconComponent}
                  <IconComponent class="w-6 h-6 text-white" />
                {/if}
              </div>
              <Badge class="text-[10px] font-bold border {statusStyles[tool.status]}">
                {tool.status}
              </Badge>
            </div>
            <h3 class="text-lg font-bold mb-2 group-hover:text-cyan-500 transition-all">{tool.name}</h3>
            <p class="text-sm text-muted-foreground mb-4 leading-relaxed">
              {#if tool.name === 'Arc Testnet Stats'}
                Comprehensive Arc testnet wallet analytics with real-time data
              {:else if tool.name === 'SimpleChain Stats'}
                SimpleChain testnet wallet analytics with real-time data
              {:else if tool.name === 'Relay Bridge Analytics'}
                Cross-chain bridge and swap analytics across 82+ networks
              {:else if tool.name === 'LitVM Stats'}
                LitVM Arbitrum Nitro L2 wallet analytics with zkLTC
              {:else if tool.name === 'Seismic Stats'}
                Seismic encrypted computation testnet wallet analytics
              {:else if tool.name === 'GenLayer Stats'}
                GenLayer AI consensus testnet wallet analytics
              {:else if tool.name === 'DAC Quantum Chain Stats'}
                DAC Quantum Chain quantum-resistant testnet wallet analytics
              {:else if tool.name === 'Doma Testnet Stats'}
                Doma L2 testnet wallet analytics with cross-chain bridge data
              {:else if tool.name === 'LayerZero Stats'}
                Track your LayerZero cross-chain activity for second airdrop eligibility
              {:else if tool.name === 'Binance WOTD Solver'}
                Instantly solve Binance Word of the Day puzzle with optimal suggestions
              {:else if tool.name === 'Soneium Stats'}
                Soneium mainnet wallet analytics on Sony blockchain with on-chain insights
              {:else if tool.name === 'Soneium Badge Checker'}
                Check OG and 30 ecosystem badges ownership on Soneium network
              {:else if tool.name === 'Airdrop Tracker'}
                Track upcoming and active airdrops across chains
              {:else if tool.name === 'Bridge Analytics'}
                Cross-chain bridge activity and volume tracking
              {:else if tool.name === 'Wallet Profiler'}
                Deep wallet analysis with risk scoring and patterns
              {:else}
                Token metrics, holders, and transfer analysis
              {/if}
            </p>
            <div class="flex items-center gap-1 text-sm font-medium gradient-text opacity-0 group-hover:opacity-100 transition-opacity">
              {tool.status === 'LIVE' ? 'Open Tool' : 'Coming Soon'}
              {#if tool.status === 'LIVE'}
                <ArrowRight class="w-4 h-4" />
              {:else}
                <ExternalLink class="w-3.5 h-3.5" />
              {/if}
            </div>
          </div>
        </Card>
      </a>
    {/each}
  </div>
</section>
