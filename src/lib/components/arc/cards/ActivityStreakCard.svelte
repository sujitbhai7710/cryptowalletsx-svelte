<script lang="ts">
  import { Flame, Clock, Calendar, CalendarDays, CalendarRange } from 'lucide-svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import CardContent from '$lib/components/ui/CardContent.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import type { WalletStats } from '$lib/types';

  interface Props { stats: WalletStats; }
  let { stats }: Props = $props();
</script>

<Card class="glass-card bg-card/60 border-border/40">
  <CardContent class="p-4 sm:p-6">
    <h3 class="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2">
      <Flame class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500" />
      Activity Streak
    </h3>
    <div class="grid grid-cols-2 gap-2 sm:gap-3">
      <div class="flex items-center gap-1.5 sm:gap-2">
        <Badge class="bg-cyan-500/15 text-cyan-500 border-cyan-500/30 text-[10px] sm:text-xs">
          <Flame class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {stats.currentStreak}
        </Badge>
        <span class="text-[10px] sm:text-xs text-muted-foreground">Current</span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <Badge class="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] sm:text-xs">
          <Flame class="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {stats.bestStreak}
        </Badge>
        <span class="text-[10px] sm:text-xs text-muted-foreground">Best</span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <Clock class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
        <span class="text-xs sm:text-sm font-medium">{stats.lastActivity}</span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <Calendar class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
        <span class="text-xs sm:text-sm font-medium">{stats.walletAge}d</span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <CalendarDays class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
        <span class="text-xs sm:text-sm">{stats.daysActive}d</span>
      </div>
      <div class="flex items-center gap-1.5 sm:gap-2">
        <CalendarRange class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-muted-foreground" />
        <span class="text-xs sm:text-sm">{stats.weeksActive}w</span>
      </div>
    </div>
  </CardContent>
</Card>
