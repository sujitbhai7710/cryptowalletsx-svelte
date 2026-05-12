<script lang="ts">
  import { AlertTriangle, ArrowLeft, Calendar, ExternalLink, Home, Moon, Sun, Shield } from 'lucide-svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import SEO from '$lib/components/SEO.svelte';

  interface Props {
    projectName: string;
    description?: string;
    canonicalPath: string;
  }

  let { projectName, description = '', canonicalPath }: Props = $props();
  let mobileMenuOpen = $state(false);

  let seoTitle = $derived(`${projectName} Airdrop — Concluded | CryptoWalletsx`);
  let seoDescription = $derived(`The ${projectName} airdrop has been fully distributed and is now concluded. Thank you to all participants. Explore other live tools on CryptoWalletsx.`);
  let seoKeywords = $derived([projectName.toLowerCase(), 'airdrop', 'concluded', 'ended', 'distributed', 'crypto']);
  let seoCanonical = $derived(`https://cryptowalletsx.com${canonicalPath}`);
</script>

<SEO
  title={seoTitle}
  description={seoDescription}
  keywords={seoKeywords}
  canonicalUrl={seoCanonical}
/>

<div class="min-h-screen flex flex-col">
  <!-- Header -->
  <header class="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3 min-w-0">
        <a href="/">
          <Button variant="ghost" size="icon" class="shrink-0">
            <ArrowLeft class="w-4 h-4" />
          </Button>
        </a>
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
          <Shield class="w-4 h-4 text-white" />
        </div>
        <span class="font-bold text-lg gradient-text truncate">{projectName}</span>
      </div>
      <div class="flex items-center gap-1">
        <div class="hidden md:flex items-center gap-1">
          <a href="/" class="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-secondary/60 transition-colors">Home</a>
          <a href="/checker" class="text-xs text-cyan-500 font-medium px-2 py-1 rounded-lg bg-cyan-500/10">Checkers</a>
        </div>
        <Button variant="ghost" size="icon" onclick={() => themeStore.toggle()} class="rounded-full h-9 w-9" aria-label="Toggle theme">
          {#if themeStore.isDark}
            <Sun class="w-4 h-4" />
          {:else}
            <Moon class="w-4 h-4" />
          {/if}
        </Button>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="flex-1 flex items-center justify-center">
    <div class="max-w-lg mx-auto px-4 sm:px-6 py-16 text-center">
      <!-- Icon -->
      <div class="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-8">
        <AlertTriangle class="w-10 h-10 text-amber-500" />
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl font-bold mb-4">
        <span class="text-amber-500">{projectName}</span> Airdrop Concluded
      </h1>

      <!-- Description -->
      <p class="text-muted-foreground text-lg mb-8 leading-relaxed">
        The {projectName} airdrop has been fully distributed and is now concluded. Thank you to all participants who were part of this journey.
      </p>

      <!-- Status Badge -->
      <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-8">
        <Calendar class="w-4 h-4 text-amber-500" />
        <span class="text-sm font-semibold text-amber-500">Airdrop Ended & Distributed</span>
      </div>

      <!-- Info Box -->
      <div class="bg-card/60 border border-border/40 rounded-2xl p-6 mb-8 text-left">
        <h3 class="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">What This Means</h3>
        <ul class="space-y-3 text-sm">
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
            <span>All eligible participants have received their token allocations</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
            <span>No further claims or distributions are pending</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
            <span>This page is no longer actively maintained for airdrop tracking</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></span>
            <span>Check the project's official channels for any future announcements</span>
          </li>
        </ul>
      </div>

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="/checker">
          <Button class="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white px-6 shadow-lg shadow-cyan-500/25">
            <Shield class="w-4 h-4 mr-2" />
            Explore Live Checkers
          </Button>
        </a>
        <a href="/">
          <Button variant="outline" class="px-6">
            <Home class="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </a>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-border/40 bg-card/30">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-md bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
          <Shield class="w-2.5 h-2.5 text-white" />
        </div>
        <span class="text-xs gradient-text font-medium">CryptoWalletsX</span>
      </div>
      <p class="text-xs text-muted-foreground">Airdrop Concluded</p>
    </div>
  </footer>
</div>
