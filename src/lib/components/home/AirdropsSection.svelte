<script lang="ts">
  import { Droplets, ArrowRight, Sparkles, Clock, CheckCircle2 } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import { airdrops } from '$lib/utils/constants';

  const statusStyles: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    CONCLUDED: 'bg-slate-500/15 text-slate-400 border-slate-400/30',
  };

  let activeAirdrops = $derived(airdrops.filter(a => a.status === 'ACTIVE'));
  let concludedAirdrops = $derived(airdrops.filter(a => a.status === 'CONCLUDED'));
</script>

<section class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
  <div class="flex items-center gap-3 mb-8">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
      <Droplets class="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 class="text-2xl font-bold">Airdrop Tracker</h2>
      <p class="text-sm text-muted-foreground">Check eligibility for past and current airdrops</p>
    </div>
  </div>

  <!-- Active Airdrops -->
  {#if activeAirdrops.length > 0}
    <div class="mb-8">
      <h3 class="text-sm font-semibold text-emerald-500 mb-4 flex items-center gap-2">
        <Sparkles class="w-3.5 h-3.5" />
        Active — Still Claimable
      </h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {#each activeAirdrops as airdrop}
          <Card class="glass-card bg-card/60 border-border/40 card-hover-lift border-emerald-500/20 group">
            <div class="p-5">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <Sparkles class="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 class="font-bold text-sm">{airdrop.name}</h3>
                    <p class="text-xs text-muted-foreground">{airdrop.chain} • {airdrop.token}</p>
                  </div>
                </div>
                <Badge class="text-[10px] font-bold border {statusStyles[airdrop.status]}">
                  {airdrop.status}
                </Badge>
              </div>
              <p class="text-xs text-muted-foreground mb-3">{airdrop.description}</p>
              <div class="flex items-center gap-1 text-xs text-emerald-500 group-hover:text-emerald-400 transition-colors">
                <span>Check eligibility</span>
                <ArrowRight class="w-3 h-3" />
              </div>
            </div>
          </Card>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Concluded Airdrops -->
  <div>
    <h3 class="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2">
      <CheckCircle2 class="w-3.5 h-3.5" />
      Concluded — Claim Period Ended
    </h3>
    <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each concludedAirdrops as airdrop}
        <Card class="glass-card bg-card/40 border-border/30 card-hover-lift opacity-75 hover:opacity-100 transition-opacity group">
          <div class="p-5">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-slate-500/10 to-slate-400/10 flex items-center justify-center">
                  <CheckCircle2 class="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 class="font-bold text-sm">{airdrop.name}</h3>
                  <p class="text-xs text-muted-foreground">{airdrop.chain} • {airdrop.token}</p>
                </div>
              </div>
              <Badge class="text-[10px] font-bold border {statusStyles[airdrop.status]}">
                {airdrop.status}
              </Badge>
            </div>
            <p class="text-xs text-muted-foreground mb-3">{airdrop.description}</p>
            <div class="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock class="w-3 h-3" />
              <span>Claim period ended</span>
            </div>
          </div>
        </Card>
      {/each}
    </div>
  </div>
</section>
