<script lang="ts">
  import { BarChart3, Calendar } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import CardHeader from '$lib/components/ui/CardHeader.svelte';
  import CardTitle from '$lib/components/ui/CardTitle.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import type { Transaction, ChartType } from '$lib/types';
  import { getTransactionCalendarData } from '$lib/utils/score';

  interface Props { transactions: Transaction[]; }
  let { transactions }: Props = $props();

  let chartType = $state<ChartType>('heatmap');

  const chartTypes: { value: ChartType; label: string }[] = [
    { value: 'bar', label: 'Bar' },
    { value: 'line', label: 'Line' },
    { value: 'area', label: 'Area' },
    { value: 'pie', label: 'Pie' },
    { value: 'network', label: 'Network' },
    { value: 'heatmap', label: 'Heatmap' },
  ];

  let monthlyData = $derived.by(() => {
    const months: Record<string, number> = {};
    transactions.forEach(tx => {
      const date = new Date(tx.timestamp);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  });

  let methodData = $derived.by(() => {
    const methods: Record<string, number> = {};
    transactions.forEach(tx => {
      const method = tx.method || 'Unknown';
      methods[method] = (methods[method] || 0) + 1;
    });
    return Object.entries(methods)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([method, count]) => ({ method, count }));
  });

  let calendarData = $derived(getTransactionCalendarData(transactions));

  let yearlyStats = $derived.by(() => {
    const year = new Date().getFullYear();
    const yearTxs = transactions.filter(tx => new Date(tx.timestamp).getFullYear() === year);
    const days = new Map<string, number>();
    yearTxs.forEach(tx => {
      const date = new Date(tx.timestamp);
      const key = `${date.getMonth() + 1}-${date.getDate()}`;
      days.set(key, (days.get(key) || 0) + 1);
    });
    let mostActiveDay = '';
    let mostActiveCount = 0;
    days.forEach((count, day) => {
      if (count > mostActiveCount) {
        mostActiveCount = count;
        mostActiveDay = day;
      }
    });
    return { total: yearTxs.length, activeDays: days.size, mostActiveDay, mostActiveCount };
  });

  const COLORS = ['#34d399', '#2dd4bf', '#22d3ee', '#38bdf8', '#818cf8', '#a78bfa', '#c084fc', '#e879f9'];

  // Heatmap data
  let heatmapWeeks = $derived.by(() => {
    const year = new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);
    const weeks: { day: number; date: string; count: number }[][] = [];
    let currentWeek: { day: number; date: string; count: number }[] = [];

    const d = new Date(startDate);
    while (d.getDay() !== 0) d.setDate(d.getDate() - 1);

    while (d <= endDate) {
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      currentWeek.push({ day: d.getDay(), date: dateStr, count: calendarData.get(dateStr) || 0 });
      if (d.getDay() === 6) { weeks.push(currentWeek); currentWeek = []; }
      d.setDate(d.getDate() + 1);
    }
    if (currentWeek.length > 0) weeks.push(currentWeek);

    return { weeks, maxCount: Math.max(...Array.from(calendarData.values()), 1) };
  });

  function getColor(count: number, maxCount: number): string {
    if (count === 0) return 'bg-muted/50';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return 'bg-emerald-500/25';
    if (intensity <= 0.5) return 'bg-emerald-500/50';
    if (intensity <= 0.75) return 'bg-emerald-500/75';
    return 'bg-emerald-500';
  }

  // Network data
  let networkNodes = $derived.by(() => {
    const nodes = new Map<string, { label: string; type: string; x: number; y: number }>();
    const edges: { from: string; to: string; count: number }[] = [];
    const edgeMap = new Map<string, number>();
    const address = transactions[0]?.from?.hash?.toLowerCase() || '';

    transactions.slice(0, 50).forEach(tx => {
      const from = tx.from?.hash?.toLowerCase() || '';
      const to = tx.to?.hash?.toLowerCase() || '';
      if (!nodes.has(from)) nodes.set(from, { label: from === address ? 'You' : `${from.slice(0, 6)}...`, type: from === address ? 'self' : tx.from?.is_contract ? 'contract' : 'wallet', x: 150 + Math.random() * 300, y: 50 + Math.random() * 200 });
      if (to && !nodes.has(to)) nodes.set(to, { label: to === address ? 'You' : `${to.slice(0, 6)}...`, type: to === address ? 'self' : tx.to?.is_contract ? 'contract' : 'wallet', x: 150 + Math.random() * 300, y: 50 + Math.random() * 200 });
      if (to) { const key = `${from}-${to}`; edgeMap.set(key, (edgeMap.get(key) || 0) + 1); }
    });

    edgeMap.forEach((count, key) => { const [from, to] = key.split('-'); edges.push({ from, to, count }); });

    return { nodes, edges };
  });

  const nodeColors: Record<string, string> = { self: '#34d399', contract: '#818cf8', wallet: '#fbbf24' };
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardHeader class="pb-3">
    <div class="flex items-start justify-between flex-wrap gap-3">
      <div>
        <CardTitle class="text-base flex items-center gap-2">
          <BarChart3 class="w-4 h-4 text-purple-500" />
          Transaction Visualizer
        </CardTitle>
        <p class="text-xs text-muted-foreground mt-1">Interactive charts and network analysis</p>
      </div>
      <div class="flex flex-wrap gap-1">
        {#each chartTypes as ct}
          <Button
            variant={chartType === ct.value ? 'secondary' : 'ghost'}
            size="sm"
            class="h-7 text-xs {chartType === ct.value ? 'bg-cyan-500/15 text-cyan-600 dark:text-cyan-400' : ''}"
            onclick={() => chartType = ct.value}
          >
            {ct.label}
          </Button>
        {/each}
      </div>
    </div>
  </CardHeader>
  <CardContent>
    <!-- Heatmap -->
    {#if chartType === 'heatmap'}
      <div class="w-full overflow-x-auto custom-scrollbar">
        <div class="min-w-[700px]">
          <div class="flex gap-1 mb-1 pl-8">
            {#each ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as m}
              <span class="text-[9px] text-muted-foreground" style="width: {100 / 12}%">{m}</span>
            {/each}
          </div>
          <div class="flex gap-[3px]">
            <div class="flex flex-col gap-[3px] mr-1 shrink-0">
              {#each ['', 'Mon', '', 'Wed', '', 'Fri', ''] as day}
                <span class="text-[9px] text-muted-foreground h-[11px] leading-[11px]">{day}</span>
              {/each}
            </div>
            {#each heatmapWeeks.weeks as week, wi}
              <div class="flex flex-col gap-[3px]">
                {#each Array(7) as _, di}
                  {@const cell = week.find(c => c.day === di)}
                  {@const count = cell?.count || 0}
                  <div
                    class="w-[11px] h-[11px] rounded-[2px] heatmap-cell {getColor(count, heatmapWeeks.maxCount)}"
                    title={cell ? `${cell.date}: ${count} transactions` : ''}
                  ></div>
                {/each}
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else if chartType === 'network'}
      <div class="w-full h-[250px] relative bg-muted/20 rounded-lg overflow-hidden">
        <svg width="100%" height="100%" viewBox="0 0 600 250">
          {#each networkNodes.edges as edge, i}
            {@const fromNode = networkNodes.nodes.get(edge.from)}
            {@const toNode = networkNodes.nodes.get(edge.to)}
            {#if fromNode && toNode}
              <line x1={fromNode.x} y1={fromNode.y} x2={toNode.x} y2={toNode.y} stroke="currentColor" stroke-opacity="0.15" stroke-width={Math.min(edge.count * 0.5, 3)} />
            {/if}
          {/each}
          {#each Array.from(networkNodes.nodes.entries()) as [hash, node], i}
            <g>
              <circle cx={node.x} cy={node.y} r={node.type === 'self' ? 12 : 8} fill={nodeColors[node.type]} fill-opacity="0.8" />
              <text x={node.x} y={node.y + 20} text-anchor="middle" class="text-[8px] fill-muted-foreground">{node.label}</text>
            </g>
          {/each}
        </svg>
      </div>
    {:else if chartType === 'bar'}
      <div class="w-full h-[250px] flex items-end gap-2 px-2">
        {#each monthlyData as d}
          <div class="flex-1 flex flex-col items-center gap-1">
            <div class="w-full bg-emerald-500/60 rounded-t-sm transition-all" style="height: {(d.count / Math.max(...monthlyData.map(m => m.count), 1)) * 200}px; min-height: 4px"></div>
            <span class="text-[9px] text-muted-foreground">{d.month.slice(5)}</span>
          </div>
        {/each}
      </div>
    {:else if chartType === 'line'}
      <div class="w-full h-[250px] relative">
        <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="#34d399"
            stroke-width="2"
            points={monthlyData.map((d, i) => `${(i / Math.max(monthlyData.length - 1, 1)) * 380 + 10},${250 - (d.count / Math.max(...monthlyData.map(m => m.count), 1)) * 220 - 10}`).join(' ')}
          />
        </svg>
      </div>
    {:else if chartType === 'area'}
      <div class="w-full h-[250px] relative">
        <svg width="100%" height="100%" viewBox="0 0 400 250" preserveAspectRatio="none">
          <polygon
            fill="#34d399"
            fill-opacity="0.2"
            stroke="#34d399"
            stroke-width="2"
            points={monthlyData.length > 0 ? `10,240 ${monthlyData.map((d, i) => `${(i / Math.max(monthlyData.length - 1, 1)) * 380 + 10},${250 - (d.count / Math.max(...monthlyData.map(m => m.count), 1)) * 220 - 10}`).join(' ')} 390,240` : '10,240 390,240'}
          />
        </svg>
      </div>
    {:else if chartType === 'pie'}
      <div class="w-full h-[250px] flex items-center justify-center">
        <div class="relative w-48 h-48">
          <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
            {#each methodData as d, i}
              {@const pct = 100 / methodData.length}
              <circle cx="50" cy="50" r="40" fill="none" stroke={COLORS[i % COLORS.length]} stroke-width="20" stroke-dasharray={`${pct} ${100 - pct}`} stroke-dashoffset={-i * pct} opacity="0.7" />
            {/each}
          </svg>
        </div>
      </div>
    {/if}

    <div class="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-border/30">
      <div class="text-center">
        <p class="text-xs text-muted-foreground">This Year's Transactions</p>
        <p class="text-lg font-bold">{yearlyStats.total}</p>
      </div>
      <div class="text-center">
        <p class="text-xs text-muted-foreground">Active Days</p>
        <p class="text-lg font-bold">{yearlyStats.activeDays}</p>
      </div>
      <div class="text-center">
        <p class="text-xs text-muted-foreground">Most Active</p>
        <p class="text-lg font-bold">{yearlyStats.mostActiveCount} txns</p>
      </div>
    </div>
  </CardContent>
</Card>
