<script lang="ts">
  import { Globe, Radio } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { testnets } from '$lib/utils/constants';

  const statusStyles: Record<string, string> = {
    LIVE: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    'COMING SOON': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  };
</script>

<section class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
  <div class="flex items-center gap-3 mb-8">
    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
      <Globe class="w-5 h-5 text-white" />
    </div>
    <div>
      <h2 class="text-2xl font-bold">Supported Testnets</h2>
      <p class="text-sm text-muted-foreground">Growing network coverage across testnet ecosystems</p>
    </div>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
    {#each testnets as testnet}
      <div class="flex items-center gap-3 p-4 rounded-xl bg-card/60 border border-border/40 glass-card card-hover-lift">
        <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
          <Radio class="w-4 h-4 text-cyan-500" />
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold truncate">{testnet.name}</p>
          <div class="flex items-center gap-2">
            <span class="text-[10px] font-mono text-muted-foreground">ID: {testnet.chainId}</span>
            <Badge class="text-[8px] font-bold border px-1 py-0 {statusStyles[testnet.status]}">
              {testnet.status}
            </Badge>
          </div>
        </div>
      </div>
    {/each}
  </div>
</section>
