<script lang="ts">
  import { Search, Shield, Globe, ArrowRight, FlaskConical, Sparkles, Radio, TrendingUp } from 'lucide-svelte';
  import { CHAIN_CONFIGS, tools } from '$lib/utils/constants';
  import { goto } from '$app/navigation';

  // ── Types ──
  type SuggestionType = 'chain' | 'tool' | 'trending';

  interface Suggestion {
    id: string;
    name: string;
    description: string;
    path: string;
    type: SuggestionType;
    gradient: string;
    icon: typeof Shield;
    keywords: string[];
    category?: string;
    status?: string;
  }

  // ── State ──
  let searchQuery = $state('');
  let selectedIndex = $state(-1);
  let isDropdownOpen = $state(false);
  let inputFocused = $state(false);

  // ── Chain data ──
  const chainList = Object.values(CHAIN_CONFIGS);

  // ── Build suggestions list ──
  const allSuggestions: Suggestion[] = [
    // Chain/tool suggestions
    ...chainList.map(chain => ({
      id: `chain-${chain.id}`,
      name: chain.name,
      description: chain.description || `${chain.name} wallet analytics`,
      path: `/${chain.id}`,
      type: 'chain' as SuggestionType,
      gradient: getChainGradient(chain.id),
      icon: (chain.apiType === 'relay-dapp' || chain.apiType === 'jumper-dapp') ? Globe : Shield,
      keywords: [chain.id, chain.name.toLowerCase(), chain.nativeCurrency.toLowerCase(), ...(chain.isTestnet ? ['testnet'] : ['mainnet']), 'checker', 'stats', 'analytics', 'guide'],
      category: chain.isTestnet ? 'Testnet' : (chain.apiType === 'relay-dapp' || chain.apiType === 'jumper-dapp') ? 'DApp' : 'Mainnet',
      status: 'LIVE',
    })),
    // Coming soon tools
    ...tools.filter(t => t.status === 'COMING SOON').map(tool => ({
      id: `tool-${tool.name}`,
      name: tool.name,
      description: `Coming soon - ${tool.name.toLowerCase()}`,
      path: tool.path,
      type: 'tool' as SuggestionType,
      gradient: tool.gradient,
      icon: Globe,
      keywords: tool.keywords,
      status: 'COMING SOON',
    })),
    // Extra tool pages (not in CHAIN_CONFIGS)
    {
      id: 'tool-layerzero-stats',
      name: 'LayerZero Stats',
      description: 'Track LayerZero cross-chain activity for second airdrop eligibility',
      path: '/layerzero-stats',
      type: 'tool' as SuggestionType,
      gradient: 'from-sky-500 to-blue-600',
      icon: Globe,
      keywords: ['layerzero', 'lz', 'bridge', 'cross-chain', 'airdrop', 'stats', 'zro', 'relayer'],
      category: 'DApp',
      status: 'LIVE',
    },
    {
      id: 'tool-binance-wotd-solver',
      name: 'Binance WOTD Solver',
      description: 'Solve the Binance Word of the Day puzzle instantly',
      path: '/binance-wotd-solver',
      type: 'tool' as SuggestionType,
      gradient: 'from-emerald-500 to-green-600',
      icon: Globe,
      keywords: ['binance', 'wotd', 'word', 'solver', 'puzzle', 'wordle', 'answer', 'daily'],
      category: 'DApp',
      status: 'LIVE',
    },
    {
      id: 'tool-soneium',
      name: 'Soneium Stats',
      description: 'Soneium mainnet wallet analytics — Sony blockchain',
      path: '/soneium',
      type: 'tool' as SuggestionType,
      gradient: 'from-purple-500 to-indigo-600',
      icon: Globe,
      keywords: ['soneium', 'sony', 'mainnet', 'wallet', 'stats', 'analytics', 'eth'],
      category: 'Mainnet',
      status: 'LIVE',
    },
    {
      id: 'tool-soneium-badge-checker',
      name: 'Soneium Badge Checker',
      description: 'Check Soneium OG and ecosystem badges ownership',
      path: '/soneium-badge-checker',
      type: 'tool' as SuggestionType,
      gradient: 'from-violet-500 to-purple-600',
      icon: Globe,
      keywords: ['soneium', 'badge', 'og', 'ecosystem', 'nft', 'checker', 'soulbound'],
      category: 'DApp',
      status: 'LIVE',
    },
  ];

  // ── Filtered suggestions ──
  let filteredSuggestions = $derived.by(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();

    let results = allSuggestions.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.keywords.some(k => k.includes(q)) ||
      s.description.toLowerCase().includes(q)
    );

    // Score results
    results = results.map(s => {
      let score = 0;
      if (s.name.toLowerCase().startsWith(q)) score += 10;
      else if (s.name.toLowerCase().includes(q)) score += 5;
      if (s.keywords.some(k => k === q)) score += 8;
      else if (s.keywords.some(k => k.startsWith(q))) score += 4;
      if (s.status === 'LIVE') score += 3;
      return { ...s, _score: score };
    }).sort((a, b) => b._score - a._score);

    // Remove duplicates
    const seen = new Set<string>();
    results = results.filter(r => {
      if (seen.has(r.id)) return false;
      seen.add(r.id);
      return true;
    });

    return results.slice(0, 8);
  });

  // Popular tools shown when focused with no query
  let defaultSuggestions = $derived.by(() => {
    return allSuggestions.filter(s => s.type === 'chain' && s.status === 'LIVE').slice(0, 6);
  });

  let visibleSuggestions = $derived(
    searchQuery.trim() ? filteredSuggestions : (inputFocused ? defaultSuggestions : [])
  );

  // ── Helpers ──
  function getChainGradient(id: string): string {
    const map: Record<string, string> = {
      arc: 'from-cyan-500 to-teal-600',
      simplechain: 'from-cyan-500 to-teal-600',
      base: 'from-blue-500 to-indigo-600',
      ink: 'from-purple-500 to-violet-600',
      relay: 'from-orange-500 to-amber-600',
      litvm: 'from-pink-500 to-rose-600',
      seismic: 'from-emerald-500 to-green-600',
      genlayer: 'from-yellow-500 to-orange-600',
      jumper: 'from-indigo-500 to-purple-600',
      dachain: 'from-red-500 to-rose-600',
      doma: 'from-amber-500 to-yellow-600',
      robinhood: 'from-green-500 to-emerald-600',
      'layerzero-stats': 'from-sky-500 to-blue-600',
      'binance-wotd-solver': 'from-emerald-500 to-green-600',
      soneium: 'from-purple-500 to-indigo-600',
      'soneium-badge-checker': 'from-violet-500 to-purple-600',
    };
    return map[id] || 'from-cyan-500 to-teal-600';
  }

  function getChainIcon(id: string) {
    const config = CHAIN_CONFIGS[id];
    if (config?.apiType === 'relay-dapp' || config?.apiType === 'jumper-dapp') return Globe;
    return Shield;
  }

  // ── Actions ──
  function handleSelect(suggestion: Suggestion) {
    if (suggestion.path === '#') return;
    goto(suggestion.path);
    searchQuery = '';
    isDropdownOpen = false;
    selectedIndex = -1;
  }

  function handleSearch() {
    if (filteredSuggestions.length > 0) {
      handleSelect(filteredSuggestions[0]);
    }
  }

  function handleKeyDown(e: KeyboardEvent) {
    const items = visibleSuggestions;
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && items[selectedIndex]) {
        handleSelect(items[selectedIndex]);
      } else if (searchQuery.trim() && filteredSuggestions.length > 0) {
        handleSearch();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, -1);
    } else if (e.key === 'Escape') {
      searchQuery = '';
      isDropdownOpen = false;
      selectedIndex = -1;
    }
  }

  function handleInputFocus() {
    inputFocused = true;
    isDropdownOpen = true;
  }

  function handleInputBlur() {
    setTimeout(() => {
      inputFocused = false;
      isDropdownOpen = false;
      selectedIndex = -1;
    }, 200);
  }

  // ── Highlight matching text ──
  function highlightMatch(text: string, query: string): string {
    if (!query.trim()) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return text.slice(0, idx) + '<mark class="bg-cyan-500/20 text-foreground rounded px-0.5">' + text.slice(idx, idx + query.length) + '</mark>' + text.slice(idx + query.length);
  }
</script>

<div class="w-full max-w-2xl mx-auto">
  <div class="relative">
    <!-- Search bar -->
    <div class="flex items-center bg-card/80 border border-border/50 rounded-2xl shadow-lg shadow-cyan-500/5 backdrop-blur-xl overflow-hidden transition-all duration-200 {inputFocused ? 'border-cyan-500/40 shadow-cyan-500/10' : ''}">
      <!-- Search icon -->
      <div class="pl-4 shrink-0">
        <Search class="w-5 h-5 text-muted-foreground" />
      </div>

      <!-- Search input -->
      <div class="flex-1">
        <input
          type="text"
          value={searchQuery}
          oninput={(e) => { searchQuery = (e.target as HTMLInputElement).value; selectedIndex = -1; isDropdownOpen = true; }}
          onkeydown={handleKeyDown}
          onfocus={handleInputFocus}
          onblur={handleInputBlur}
          placeholder="Search tools & chains..."
          class="w-full h-12 sm:h-14 px-3 bg-transparent text-sm sm:text-base focus:outline-none placeholder:text-muted-foreground/60"
        />
      </div>

      <!-- Search button -->
      <div class="pr-2 shrink-0">
        <button
          onclick={handleSearch}
          class="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white px-4 sm:px-6 h-10 sm:h-12 rounded-xl shadow-md shadow-cyan-500/25 transition-all duration-200 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center gap-2 font-semibold text-sm"
        >
          <Search class="w-4 h-4" />
          <span class="hidden sm:inline">Search</span>
        </button>
      </div>
    </div>

    <!-- Auto-suggestions dropdown -->
    {#if isDropdownOpen && visibleSuggestions.length > 0}
      <div class="absolute top-full left-0 right-0 mt-2 bg-card border border-border/50 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50">
        <!-- Header -->
        <div class="px-4 py-2 border-b border-border/20">
          <span class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            {#if searchQuery.trim()}
              Suggestions
            {:else}
              <TrendingUp class="w-3 h-3" /> Popular Tools
            {/if}
          </span>
        </div>

        <!-- Suggestion items -->
        {#each visibleSuggestions as suggestion, idx}
          <button
            class="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2.5 sm:gap-3 transition-colors {idx === selectedIndex ? 'bg-cyan-500/8' : 'hover:bg-secondary/30'}"
            onclick={() => handleSelect(suggestion)}
            onmouseenter={() => selectedIndex = idx}
          >
            <!-- Icon -->
            <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br {suggestion.gradient} flex items-center justify-center shrink-0 shadow-sm">
              <suggestion.icon class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>

            <!-- Text -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <span class="text-sm font-medium truncate">
                  {@html highlightMatch(suggestion.name, searchQuery)}
                </span>
                {#if suggestion.status === 'COMING SOON'}
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 shrink-0">SOON</span>
                {:else if suggestion.status === 'LIVE'}
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 shrink-0">LIVE</span>
                {/if}
              </div>
              <p class="text-xs text-muted-foreground truncate mt-0.5">{suggestion.description}</p>
            </div>

            <!-- Category badge (desktop only) -->
            {#if suggestion.category}
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-secondary/50 text-muted-foreground border border-border/30 shrink-0 hidden sm:inline">
                {suggestion.category}
              </span>
            {/if}

            <!-- Arrow -->
            <ArrowRight class="w-3.5 h-3.5 text-muted-foreground/50 shrink-0 hidden sm:block" />
          </button>
        {/each}

        <!-- Footer hint -->
        <div class="px-4 py-2 border-t border-border/20 flex items-center justify-between">
          <span class="text-[10px] text-muted-foreground">
            Select a tool to open its checker
          </span>
          <div class="hidden sm:flex items-center gap-3">
            <span class="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded bg-secondary/60 border border-border/30 text-[9px]">&#8593;&#8595;</kbd> Navigate
            </span>
            <span class="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded bg-secondary/60 border border-border/30 text-[9px]">&#8629;</kbd> Select
            </span>
            <span class="text-[10px] text-muted-foreground flex items-center gap-1">
              <kbd class="px-1 py-0.5 rounded bg-secondary/60 border border-border/30 text-[9px]">Esc</kbd> Close
            </span>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
