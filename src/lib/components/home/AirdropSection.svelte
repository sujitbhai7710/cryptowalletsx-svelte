<script lang="ts">
  import { Droplets, ArrowRight, Sparkles, Clock, CheckCircle2, ExternalLink } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { airdrops } from '$lib/utils/constants';

  const statusStyles: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    CONCLUDED: 'bg-slate-500/15 text-slate-400 border-slate-400/30',
  };

  const chainStyles: Record<string, string> = {
    SOL: 'bg-purple-500/10 text-purple-500',
    EVM: 'bg-cyan-500/10 text-cyan-500',
    OP: 'bg-red-500/10 text-red-500',
    Multi: 'bg-indigo-500/10 text-indigo-500',
  };

  let activeAirdrops = $derived(airdrops.filter(a => a.status === 'ACTIVE'));
  let concludedAirdrops = $derived(airdrops.filter(a => a.status === 'CONCLUDED'));
</script>

<section class="relative max-w-7xl mx-auto px-4 sm:px-6 py-20">
  <!-- Background -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-0 right-1/4 w-80 h-80 bg-rose-500/4 rounded-full blur-3xl"></div>
    <div class="absolute bottom-0 left-1/4 w-72 h-72 bg-amber-500/4 rounded-full blur-3xl"></div>
  </div>

  <div class="relative">
    <!-- Section Header -->
    <div class="text-center mb-14">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 mb-4">
        <Droplets class="w-3.5 h-3.5 text-rose-500" />
        <span class="text-xs font-semibold text-rose-500">Airdrops</span>
      </div>
      <h2 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-4">
        <span class="gradient-text-rose">Airdrop</span>
        <span class="text-foreground"> Tracker</span>
      </h2>
      <p class="text-muted-foreground text-lg max-w-2xl mx-auto">
        Stay on top of airdrop opportunities. Track eligibility and claim status across multiple chains.
      </p>
    </div>

    <!-- Active Airdrops -->
    {#if activeAirdrops.length > 0}
      <div class="mb-10">
        <div class="flex items-center gap-2 mb-5">
          <Sparkles class="w-4 h-4 text-emerald-500" />
          <h3 class="text-sm font-bold text-emerald-500 uppercase tracking-wider">Active — Still Claimable</h3>
        </div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {#each activeAirdrops as airdrop}
            <div class="glass-card bg-card/60 border border-emerald-500/20 rounded-2xl p-6 card-hover-lift group relative overflow-hidden">
              <div class="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-8 translate-x-8"></div>
              <div class="relative">
                <div class="flex items-center justify-between mb-4">
                  <div class="flex items-center gap-3">
                    <div class="w-11 h-11 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                      <Sparkles class="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <h3 class="font-bold">{airdrop.name}</h3>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span class="text-[10px] font-medium px-1.5 py-0.5 rounded {chainStyles[airdrop.chain] || 'bg-cyan-500/10 text-cyan-500'}">{airdrop.chain}</span>
                        <span class="text-xs font-mono text-muted-foreground">{airdrop.token}</span>
                      </div>
                    </div>
                  </div>
                  <Badge class="text-[10px] font-bold border {statusStyles[airdrop.status]}">
                    {airdrop.status}
                  </Badge>
                </div>
                <p class="text-sm text-muted-foreground mb-4">{airdrop.description}</p>
                <div class="flex items-center gap-1.5 text-sm font-medium text-emerald-500 group-hover:text-emerald-400 transition-colors">
                  Check Eligibility
                  <ArrowRight class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    <!-- Concluded Airdrops -->
    <div>
      <div class="flex items-center gap-2 mb-5">
        <CheckCircle2 class="w-4 h-4 text-slate-400" />
        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider">Concluded — Claim Period Ended</h3>
      </div>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {#each concludedAirdrops as airdrop}
          <div class="glass-card bg-card/30 border border-border/20 rounded-2xl p-6 group opacity-60 hover:opacity-90 transition-opacity relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 bg-slate-500/5 rounded-full -translate-y-6 translate-x-6"></div>
            <div class="relative">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-full bg-gradient-to-br from-slate-500/10 to-slate-400/10 flex items-center justify-center">
                    <CheckCircle2 class="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h3 class="font-bold">{airdrop.name}</h3>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-[10px] font-medium px-1.5 py-0.5 rounded {chainStyles[airdrop.chain] || 'bg-cyan-500/10 text-cyan-500'}">{airdrop.chain}</span>
                      <span class="text-xs font-mono text-muted-foreground">{airdrop.token}</span>
                    </div>
                  </div>
                </div>
                <Badge class="text-[10px] font-bold border {statusStyles[airdrop.status]}">
                  {airdrop.status}
                </Badge>
              </div>
              <p class="text-sm text-muted-foreground mb-4">{airdrop.description}</p>
              <div class="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock class="w-4 h-4" />
                <span>Claim period ended</span>
              </div>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</section>
