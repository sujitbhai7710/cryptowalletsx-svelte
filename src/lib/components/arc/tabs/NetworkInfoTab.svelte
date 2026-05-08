<script lang="ts">
  import { Copy, Check, ExternalLink, Globe, Shield, Coins, Link2, Server, Wrench, Droplets } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import type { ChainConfig } from '$lib/types';

  interface Props {
    config: ChainConfig;
  }

  let { config }: Props = $props();

  let copied = $state('');

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    copied = text;
    setTimeout(() => copied = '', 2000);
  }
</script>

<div class="space-y-6">
  <!-- Network Details -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardHeader class="pb-3">
      <CardTitle class="text-base flex items-center gap-2">
        <Globe class="w-4 h-4 text-emerald-500" />
        Network Details
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        {#each [
          { icon: Shield, label: 'Chain ID', value: config.chainId, color: 'text-emerald-500' },
          { icon: Globe, label: 'Network Name', value: config.name, color: 'text-teal-500' },
          { icon: Coins, label: 'Native Currency', value: config.nativeCurrency, color: 'text-amber-500' },
          { icon: Link2, label: 'Wallet Type', value: config.walletType, color: 'text-blue-500' },
        ] as item}
          <div class="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <div class="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <item.icon class="w-4 h-4 {item.color}" />
            </div>
            <div class="flex-1">
              <p class="text-xs text-muted-foreground">{item.label}</p>
              <p class="text-sm font-semibold">{item.value}</p>
            </div>
            <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" onclick={() => handleCopy(item.value)}>
              {#if copied === item.value}
                <Check class="w-3 h-3 text-emerald-500" />
              {:else}
                <Copy class="w-3 h-3" />
              {/if}
            </Button>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- RPC Endpoints -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardHeader class="pb-3">
      <CardTitle class="text-base flex items-center gap-2">
        <Server class="w-4 h-4 text-cyan-500" />
        RPC Endpoints
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        {#each config.rpcEndpoints as rpc, i}
          <div class="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
            <div class="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <span class="text-xs font-bold text-cyan-500">{i + 1}</span>
            </div>
            <code class="text-xs flex-1 font-mono break-all text-muted-foreground">{rpc}</code>
            <Button variant="ghost" size="icon" class="h-7 w-7 shrink-0" onclick={() => handleCopy(rpc)}>
              {#if copied === rpc}
                <Check class="w-3 h-3 text-emerald-500" />
              {:else}
                <Copy class="w-3 h-3" />
              {/if}
            </Button>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Quick Links -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardHeader class="pb-3">
      <CardTitle class="text-base flex items-center gap-2">
        <ExternalLink class="w-4 h-4 text-purple-500" />
        Quick Links
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-2">
        <a
          href={config.blockExplorer}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors group"
        >
          <div class="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <ExternalLink class="w-4 h-4 text-purple-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium">Block Explorer</p>
            <p class="text-xs text-muted-foreground">{config.blockExplorer}</p>
          </div>
          <ExternalLink class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </a>
      </div>
    </CardContent>
  </Card>

  <!-- Available Features -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardHeader class="pb-3">
      <CardTitle class="text-base flex items-center gap-2">
        <Wrench class="w-4 h-4 text-orange-500" />
        Available Features
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {#each config.features as feature}
          <div class="p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors text-center">
            <div class="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center mx-auto mb-2">
              <Wrench class="w-4 h-4 text-orange-500" />
            </div>
            <p class="text-sm font-medium">{feature.name}</p>
            <p class="text-[10px] text-muted-foreground mt-0.5">{feature.description}</p>
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>

  <!-- Testnet Faucets -->
  {#if config.faucet}
    <Card class="glass-card bg-card/60 border-border/40">
      <CardHeader class="pb-3">
        <CardTitle class="text-base flex items-center gap-2">
          <Droplets class="w-4 h-4 text-blue-500" />
          Testnet Faucets
        </CardTitle>
      </CardHeader>
      <CardContent>
        <a
          href={config.faucet}
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-3 p-4 rounded-lg bg-secondary/30 hover:bg-secondary/60 transition-colors group"
        >
          <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Droplets class="w-5 h-5 text-blue-500" />
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium">Faucet</p>
            <p class="text-xs text-muted-foreground">{config.faucet}</p>
          </div>
          <ExternalLink class="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </a>
      </CardContent>
    </Card>
  {/if}
</div>
