<script lang="ts">
  import { Rocket, Info, Star, Gift, TrendingUp, ArrowLeftRight, Activity, Building2, Calendar, Wallet, CheckCircle2, XCircle } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Progress from '$lib/components/ui/Progress.svelte';
  import type { Transaction, TokenTransfer, AddressDetails } from '$lib/types';
  import { weiToNative } from '$lib/utils/format';

  interface Props {
    transactions: Transaction[];
    tokenTransfers: TokenTransfer[];
    addressDetails: AddressDetails | null;
  }

  let { transactions, tokenTransfers, addressDetails }: Props = $props();

  const networks = ['Arbitrum', 'Starknet', 'Celestia', 'Optimism'];

  let selectedNetwork = $state('Arbitrum');

  interface CriterionResult {
    label: string;
    passed: boolean;
    detail: string;
    icon: typeof Star;
    color: string;
    bgColor: string;
  }

  interface SimulationResult {
    criteria: CriterionResult[];
    score: number;
    maxScore: number;
    estimatedReward: string;
    maxReward: string;
  }

  function simulateArbitrum(txs: Transaction[], _tfs: TokenTransfer[]): SimulationResult {
    const months = new Set(txs.map(tx => {
      const d = new Date(tx.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    const distinctMonths = months.size;

    const hasBridge = txs.some(tx =>
      tx.method?.toLowerCase().includes('bridge') ||
      tx.method?.toLowerCase().includes('deposit') ||
      tx.method?.toLowerCase().includes('withdrawandcall')
    );

    const totalVolumeWei = txs.reduce((sum, tx) => sum + BigInt(String(tx.value || '0')), BigInt(0));
    const volumeNative = parseFloat(weiToNative(totalVolumeWei.toString(), 18));

    const uniqueContracts = new Set(txs.filter(tx => tx.to?.is_contract).map(tx => tx.to?.hash?.toLowerCase())).size;
    const totalInteractions = txs.length;

    const criteria: CriterionResult[] = [];
    let score = 0;
    const maxScore = 14;

    // Distinct Months (3 tiers: 2, 6, 9)
    criteria.push({ label: 'Distinct Months >= 2', passed: distinctMonths >= 2, detail: `${distinctMonths} months active`, icon: Calendar, color: 'text-amber-500', bgColor: 'bg-amber-500/10' });
    if (distinctMonths >= 2) score++;
    criteria.push({ label: 'Distinct Months >= 6', passed: distinctMonths >= 6, detail: `${distinctMonths} months active`, icon: Calendar, color: 'text-amber-500', bgColor: 'bg-amber-500/10' });
    if (distinctMonths >= 6) score++;
    criteria.push({ label: 'Distinct Months >= 9', passed: distinctMonths >= 9, detail: `${distinctMonths} months active`, icon: Calendar, color: 'text-amber-500', bgColor: 'bg-amber-500/10' });
    if (distinctMonths >= 9) score++;

    // Bridge (4 tiers: used, >$10K, >$50K, >$250K)
    criteria.push({ label: 'Used Native Bridge', passed: hasBridge, detail: hasBridge ? 'Bridge used' : 'No bridge tx found', icon: ArrowLeftRight, color: 'text-red-500', bgColor: 'bg-red-500/10' });
    if (hasBridge) score++;
    criteria.push({ label: 'Bridge Volume > $10K', passed: volumeNative > 10000, detail: `$${volumeNative.toFixed(2)} volume`, icon: ArrowLeftRight, color: 'text-red-500', bgColor: 'bg-red-500/10' });
    if (volumeNative > 10000) score++;
    criteria.push({ label: 'Bridge Volume > $50K', passed: volumeNative > 50000, detail: `$${volumeNative.toFixed(2)} volume`, icon: ArrowLeftRight, color: 'text-red-500', bgColor: 'bg-red-500/10' });
    if (volumeNative > 50000) score++;
    criteria.push({ label: 'Bridge Volume > $250K', passed: volumeNative > 250000, detail: `$${volumeNative.toFixed(2)} volume`, icon: ArrowLeftRight, color: 'text-red-500', bgColor: 'bg-red-500/10' });
    if (volumeNative > 250000) score++;

    // Volume (3 tiers: >$10K, >$50K, >$250K)
    criteria.push({ label: 'Volume > $10K', passed: volumeNative > 10000, detail: `$${volumeNative.toFixed(2)} total`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 10000) score++;
    criteria.push({ label: 'Volume > $50K', passed: volumeNative > 50000, detail: `$${volumeNative.toFixed(2)} total`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 50000) score++;
    criteria.push({ label: 'Volume > $250K', passed: volumeNative > 250000, detail: `$${volumeNative.toFixed(2)} total`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 250000) score++;

    // Interactions & Contracts (4 tiers)
    criteria.push({ label: '>4 Contracts & >4 Txns', passed: uniqueContracts >= 4 && totalInteractions >= 4, detail: `${uniqueContracts} contracts, ${totalInteractions} txns`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 4 && totalInteractions >= 4) score++;
    criteria.push({ label: '>10 Contracts & >10 Txns', passed: uniqueContracts >= 10 && totalInteractions >= 10, detail: `${uniqueContracts} contracts, ${totalInteractions} txns`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 10 && totalInteractions >= 10) score++;
    criteria.push({ label: '>25 Contracts & >25 Txns', passed: uniqueContracts >= 25 && totalInteractions >= 25, detail: `${uniqueContracts} contracts, ${totalInteractions} txns`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 25 && totalInteractions >= 25) score++;
    criteria.push({ label: '>100 Contracts & >100 Txns', passed: uniqueContracts >= 100 && totalInteractions >= 100, detail: `${uniqueContracts} contracts, ${totalInteractions} txns`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 100 && totalInteractions >= 100) score++;

    let estimatedReward = '0';
    const ratio = score / maxScore;
    if (ratio >= 0.8) estimatedReward = '5,000-10,250';
    else if (ratio >= 0.6) estimatedReward = '2,000-5,000';
    else if (ratio >= 0.4) estimatedReward = '500-2,000';
    else if (ratio >= 0.2) estimatedReward = '50-500';
    else if (score > 0) estimatedReward = '1-50';

    return { criteria, score, maxScore, estimatedReward, maxReward: '10,250' };
  }

  function simulateStarknet(txs: Transaction[], _tfs: TokenTransfer[]): SimulationResult {
    const months = new Set(txs.map(tx => {
      const d = new Date(tx.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    const distinctMonths = months.size;

    const uniqueContracts = new Set(txs.filter(tx => tx.to?.is_contract).map(tx => tx.to?.hash?.toLowerCase())).size;
    const totalInteractions = txs.length;
    const totalVolumeWei = txs.reduce((sum, tx) => sum + BigInt(String(tx.value || '0')), BigInt(0));
    const volumeNative = parseFloat(weiToNative(totalVolumeWei.toString(), 18));

    const hasBridge = txs.some(tx =>
      tx.method?.toLowerCase().includes('bridge') ||
      tx.method?.toLowerCase().includes('deposit')
    );

    const defiMethods = ['swap', 'addliquidity', 'stake', 'lend', 'borrow'];
    const hasDeFi = txs.some(tx => defiMethods.some(m => tx.method?.toLowerCase().includes(m)));

    const criteria: CriterionResult[] = [];
    let score = 0;
    const maxScore = 10;

    criteria.push({ label: 'Active >= 2 months', passed: distinctMonths >= 2, detail: `${distinctMonths} months`, icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-500/10' });
    if (distinctMonths >= 2) score++;
    criteria.push({ label: 'Active >= 6 months', passed: distinctMonths >= 6, detail: `${distinctMonths} months`, icon: Calendar, color: 'text-blue-500', bgColor: 'bg-blue-500/10' });
    if (distinctMonths >= 6) score++;
    criteria.push({ label: 'Used Bridge', passed: hasBridge, detail: hasBridge ? 'Yes' : 'No', icon: ArrowLeftRight, color: 'text-violet-500', bgColor: 'bg-violet-500/10' });
    if (hasBridge) score++;
    criteria.push({ label: 'Volume > $1K', passed: volumeNative > 1000, detail: `$${volumeNative.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 1000) score++;
    criteria.push({ label: 'Volume > $10K', passed: volumeNative > 10000, detail: `$${volumeNative.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 10000) score++;
    criteria.push({ label: '>5 Transactions', passed: totalInteractions >= 5, detail: `${totalInteractions} txns`, icon: Activity, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' });
    if (totalInteractions >= 5) score++;
    criteria.push({ label: '>20 Transactions', passed: totalInteractions >= 20, detail: `${totalInteractions} txns`, icon: Activity, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' });
    if (totalInteractions >= 20) score++;
    criteria.push({ label: '>3 Unique Contracts', passed: uniqueContracts >= 3, detail: `${uniqueContracts} contracts`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 3) score++;
    criteria.push({ label: '>10 Unique Contracts', passed: uniqueContracts >= 10, detail: `${uniqueContracts} contracts`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 10) score++;
    criteria.push({ label: 'Used DeFi Protocols', passed: hasDeFi, detail: hasDeFi ? 'Yes' : 'No', icon: Wallet, color: 'text-amber-500', bgColor: 'bg-amber-500/10' });
    if (hasDeFi) score++;

    let estimatedReward = '0';
    const ratio = score / maxScore;
    if (ratio >= 0.8) estimatedReward = '3,000-8,000';
    else if (ratio >= 0.6) estimatedReward = '1,000-3,000';
    else if (ratio >= 0.4) estimatedReward = '200-1,000';
    else if (ratio >= 0.2) estimatedReward = '20-200';
    else if (score > 0) estimatedReward = '1-20';

    return { criteria, score, maxScore, estimatedReward, maxReward: '8,000' };
  }

  function simulateCelestia(txs: Transaction[], _tfs: TokenTransfer[]): SimulationResult {
    const months = new Set(txs.map(tx => {
      const d = new Date(tx.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    const distinctMonths = months.size;

    const totalInteractions = txs.length;
    const uniqueContracts = new Set(txs.filter(tx => tx.to?.is_contract).map(tx => tx.to?.hash?.toLowerCase())).size;
    const totalVolumeWei = txs.reduce((sum, tx) => sum + BigInt(String(tx.value || '0')), BigInt(0));
    const volumeNative = parseFloat(weiToNative(totalVolumeWei.toString(), 18));

    const hasBridge = txs.some(tx => tx.method?.toLowerCase().includes('bridge'));

    const stakingMethods = ['stake', 'delegate', 'claim', 'undelegate'];
    const hasStaking = txs.some(tx => stakingMethods.some(m => tx.method?.toLowerCase().includes(m)));

    const criteria: CriterionResult[] = [];
    let score = 0;
    const maxScore = 9;

    criteria.push({ label: 'Active >= 3 months', passed: distinctMonths >= 3, detail: `${distinctMonths} months`, icon: Calendar, color: 'text-teal-500', bgColor: 'bg-teal-500/10' });
    if (distinctMonths >= 3) score++;
    criteria.push({ label: 'Active >= 6 months', passed: distinctMonths >= 6, detail: `${distinctMonths} months`, icon: Calendar, color: 'text-teal-500', bgColor: 'bg-teal-500/10' });
    if (distinctMonths >= 6) score++;
    criteria.push({ label: 'Used Bridge', passed: hasBridge, detail: hasBridge ? 'Yes' : 'No', icon: ArrowLeftRight, color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' });
    if (hasBridge) score++;
    criteria.push({ label: 'Volume > $5K', passed: volumeNative > 5000, detail: `$${volumeNative.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 5000) score++;
    criteria.push({ label: 'Volume > $50K', passed: volumeNative > 50000, detail: `$${volumeNative.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 50000) score++;
    criteria.push({ label: '>10 Transactions', passed: totalInteractions >= 10, detail: `${totalInteractions} txns`, icon: Activity, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' });
    if (totalInteractions >= 10) score++;
    criteria.push({ label: '>5 Unique Contracts', passed: uniqueContracts >= 5, detail: `${uniqueContracts} contracts`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 5) score++;
    criteria.push({ label: '>20 Unique Contracts', passed: uniqueContracts >= 20, detail: `${uniqueContracts} contracts`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 20) score++;
    criteria.push({ label: 'Staking Activity', passed: hasStaking, detail: hasStaking ? 'Yes' : 'No', icon: Star, color: 'text-amber-500', bgColor: 'bg-amber-500/10' });
    if (hasStaking) score++;

    let estimatedReward = '0';
    const ratio = score / maxScore;
    if (ratio >= 0.8) estimatedReward = '4,000-10,000';
    else if (ratio >= 0.6) estimatedReward = '1,500-4,000';
    else if (ratio >= 0.4) estimatedReward = '300-1,500';
    else if (ratio >= 0.2) estimatedReward = '30-300';
    else if (score > 0) estimatedReward = '1-30';

    return { criteria, score, maxScore, estimatedReward, maxReward: '10,000' };
  }

  function simulateOptimism(txs: Transaction[], _tfs: TokenTransfer[]): SimulationResult {
    const months = new Set(txs.map(tx => {
      const d = new Date(tx.timestamp);
      return `${d.getFullYear()}-${d.getMonth()}`;
    }));
    const distinctMonths = months.size;

    const totalInteractions = txs.length;
    const uniqueContracts = new Set(txs.filter(tx => tx.to?.is_contract).map(tx => tx.to?.hash?.toLowerCase())).size;
    const totalVolumeWei = txs.reduce((sum, tx) => sum + BigInt(String(tx.value || '0')), BigInt(0));
    const volumeNative = parseFloat(weiToNative(totalVolumeWei.toString(), 18));

    const hasBridge = txs.some(tx =>
      tx.method?.toLowerCase().includes('bridge') ||
      tx.method?.toLowerCase().includes('deposit')
    );

    const defiMethods = ['swap', 'addliquidity', 'stake', 'vote', 'propose'];
    const hasDeFi = txs.some(tx => defiMethods.some(m => tx.method?.toLowerCase().includes(m)));

    const deployTx = txs.filter(tx => tx.to === null);

    const criteria: CriterionResult[] = [];
    let score = 0;
    const maxScore = 10;

    criteria.push({ label: 'Active >= 2 months', passed: distinctMonths >= 2, detail: `${distinctMonths} months`, icon: Calendar, color: 'text-red-500', bgColor: 'bg-red-500/10' });
    if (distinctMonths >= 2) score++;
    criteria.push({ label: 'Active >= 6 months', passed: distinctMonths >= 6, detail: `${distinctMonths} months`, icon: Calendar, color: 'text-red-500', bgColor: 'bg-red-500/10' });
    if (distinctMonths >= 6) score++;
    criteria.push({ label: 'Used Bridge', passed: hasBridge, detail: hasBridge ? 'Yes' : 'No', icon: ArrowLeftRight, color: 'text-blue-500', bgColor: 'bg-blue-500/10' });
    if (hasBridge) score++;
    criteria.push({ label: 'Volume > $10K', passed: volumeNative > 10000, detail: `$${volumeNative.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 10000) score++;
    criteria.push({ label: 'Volume > $100K', passed: volumeNative > 100000, detail: `$${volumeNative.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10' });
    if (volumeNative > 100000) score++;
    criteria.push({ label: '>10 Transactions', passed: totalInteractions >= 10, detail: `${totalInteractions} txns`, icon: Activity, color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' });
    if (totalInteractions >= 10) score++;
    criteria.push({ label: '>5 Unique Contracts', passed: uniqueContracts >= 5, detail: `${uniqueContracts} contracts`, icon: Building2, color: 'text-purple-500', bgColor: 'bg-purple-500/10' });
    if (uniqueContracts >= 5) score++;
    criteria.push({ label: 'Used DeFi', passed: hasDeFi, detail: hasDeFi ? 'Yes' : 'No', icon: Wallet, color: 'text-amber-500', bgColor: 'bg-amber-500/10' });
    if (hasDeFi) score++;
    criteria.push({ label: 'Deployed Contract', passed: deployTx.length > 0, detail: `${deployTx.length} deploys`, icon: Building2, color: 'text-orange-500', bgColor: 'bg-orange-500/10' });
    if (deployTx.length > 0) score++;
    criteria.push({ label: 'Superchain Activity', passed: totalInteractions >= 3 && distinctMonths >= 2, detail: `${totalInteractions} txns across ${distinctMonths} months`, icon: Star, color: 'text-rose-500', bgColor: 'bg-rose-500/10' });
    if (totalInteractions >= 3 && distinctMonths >= 2) score++;

    let estimatedReward = '0';
    const ratio = score / maxScore;
    if (ratio >= 0.8) estimatedReward = '3,000-7,000';
    else if (ratio >= 0.6) estimatedReward = '1,000-3,000';
    else if (ratio >= 0.4) estimatedReward = '200-1,000';
    else if (ratio >= 0.2) estimatedReward = '20-200';
    else if (score > 0) estimatedReward = '1-20';

    return { criteria, score, maxScore, estimatedReward, maxReward: '7,000' };
  }

  let simResult = $derived(
    selectedNetwork === 'Starknet' ? simulateStarknet(transactions, tokenTransfers)
    : selectedNetwork === 'Celestia' ? simulateCelestia(transactions, tokenTransfers)
    : selectedNetwork === 'Optimism' ? simulateOptimism(transactions, tokenTransfers)
    : simulateArbitrum(transactions, tokenTransfers)
  );

  let percentage = $derived(Math.min((simResult.score / simResult.maxScore) * 100, 100));
</script>

<div class="space-y-6">
  <!-- Disclaimer -->
  <div class="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
    <Info class="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
    <div>
      <p class="text-sm font-medium text-amber-600 dark:text-amber-400">Entertainment Only</p>
      <p class="text-xs text-amber-600/80 dark:text-amber-400/80 mt-1">
        These are fun simulations based on past airdrop patterns from other networks.
        They're just for entertainment — don't use them for real investment decisions!
      </p>
    </div>
  </div>

  <!-- Network Selector -->
  <div class="flex flex-wrap gap-1">
    {#each networks as net}
      <Button
        variant={selectedNetwork === net ? 'secondary' : 'ghost'}
        size="sm"
        class="text-xs {selectedNetwork === net ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : ''}"
        onclick={() => selectedNetwork = net}
      >
        {net}
      </Button>
    {/each}
  </div>

  <!-- Score Card -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardContent class="p-6 text-center">
      <Rocket class="w-10 h-10 mx-auto mb-3 text-emerald-500" />
      <h3 class="text-2xl font-bold gradient-text">{simResult.score} / {simResult.maxScore}</h3>
      <p class="text-sm text-muted-foreground mt-1">Airdrop Score ({selectedNetwork} pattern)</p>
      <div class="mt-3 w-full max-w-xs mx-auto">
        <Progress value={percentage} class="h-3" />
      </div>
      <div class="mt-4 flex items-center justify-center gap-2">
        <Gift class="w-4 h-4 text-emerald-500" />
        <span class="text-lg font-semibold">Estimated: {simResult.estimatedReward} $TOKEN</span>
      </div>
      <p class="text-xs text-muted-foreground mt-1">MAX {simResult.maxReward}</p>
    </CardContent>
  </Card>

  <!-- Criteria Breakdown -->
  <Card class="glass-card bg-card/60 border-border/40">
    <CardHeader class="pb-3">
      <CardTitle class="text-base flex items-center gap-2">
        <Activity class="w-4 h-4 text-emerald-500" />
        {selectedNetwork} Criteria Breakdown
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="space-y-3">
        {#each simResult.criteria as criterion, i}
          <div class="flex items-center gap-3 p-3 rounded-lg {criterion.passed ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-secondary/30 border border-transparent'}">
            <div class="w-7 h-7 rounded-lg {criterion.bgColor} flex items-center justify-center shrink-0">
              <criterion.icon class="w-3.5 h-3.5 {criterion.color}" />
            </div>
            <div class="flex-1 min-w-0">
              <span class="text-sm font-medium">{criterion.label}</span>
              <span class="text-xs text-muted-foreground ml-2">({criterion.detail})</span>
            </div>
            {#if criterion.passed}
              <CheckCircle2 class="w-5 h-5 text-emerald-500 shrink-0" />
            {:else}
              <XCircle class="w-5 h-5 text-muted-foreground/40 shrink-0" />
            {/if}
          </div>
        {/each}
      </div>
    </CardContent>
  </Card>
</div>
