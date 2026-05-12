<script lang="ts">
  import { RotateCcw, Plus, Lightbulb, HelpCircle, Info, Zap, CheckCircle2, XCircle, Circle, Loader2, ExternalLink, Sparkles, Target, BookOpen, Trophy, Crown } from 'lucide-svelte';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { BinanceWotdSolver } from '$lib/utils/binance-wotd/solver';
  import { STARTERS } from '$lib/utils/binance-wotd/starters';
  import type { WordLength, WordData, GuessResult } from '$lib/utils/binance-wotd/types';

  type TileState = 'absent' | 'present' | 'correct';

  // State
  let wordLength = $state<WordLength>(5);
  let hardMode = $state(false);
  let showAllWords = $state(false);
  let currentInput = $state('');
  let currentTiles = $state<TileState[]>([]);
  let guesses = $state<GuessResult[]>([]);
  let wordData = $state<WordData | null>(null);
  let loadingData = $state(false);
  let loadingSuggestions = $state(false);
  let bestGuesses = $state<{ word: string; score: number; isAnswer: boolean }[]>([]);
  let dailyAnswers = $state<string[]>([]);
  let dailyLoading = $state(false);
  let dailyError = $state('');
  let dataError = $state('');
  let isLoaded = $state(false);
  let showStarterCopied = $state<string | null>(null);

  // Initialize tiles when word length changes
  $effect(() => {
    const len = wordLength;
    currentTiles = Array(len).fill('absent') as TileState[];
    currentInput = '';
    guesses = [];
    bestGuesses = [];
    dataError = '';
  });

  // Load word data when word length changes
  $effect(() => {
    const len = wordLength;
    loadWordData(len);
  });

  // Fetch daily answers on mount
  $effect(() => {
    fetchDailyAnswers();
  });

  // Recompute best guesses when guesses or settings change
  $effect(() => {
    const g = guesses;
    const wd = wordData;
    const hm = hardMode;
    const da = dailyAnswers;
    const sa = showAllWords;

    if (!wd) {
      bestGuesses = [];
      return;
    }

    computeBestGuesses();
  });

  async function loadWordData(length: WordLength) {
    loadingData = true;
    dataError = '';
    try {
      const response = await fetch(`/data/binance-wotd/data-${length}.json`);
      if (!response.ok) throw new Error(`Failed to load word data for ${length}-letter words`);
      wordData = await response.json();
    } catch (err) {
      dataError = err instanceof Error ? err.message : 'Failed to load word data';
      wordData = null;
    } finally {
      loadingData = false;
    }
  }

  async function fetchDailyAnswers() {
    dailyLoading = true;
    dailyError = '';
    try {
      const response = await fetch('https://wodl-scraper.moneydropcrypto.workers.dev/today');
      if (!response.ok) throw new Error('Failed to fetch daily answers');
      const data = await response.json();
      dailyAnswers = Array.isArray(data) ? data.map((w: string) => w.toUpperCase()) : [];
    } catch (err) {
      dailyError = 'Could not load daily hints. You can still use the solver manually.';
      dailyAnswers = [];
    } finally {
      dailyLoading = false;
    }
  }

  function computeBestGuesses() {
    if (!wordData) return;

    const solver = new BinanceWotdSolver(wordData, wordLength, hardMode);

    // Filter possible answers based on guesses
    let possibleAnswers = wordData.answers;
    if (guesses.length > 0) {
      possibleAnswers = BinanceWotdSolver.filterPossibilities(possibleAnswers, guesses);
    }

    // If showing all words, also consider words from all list
    if (!showAllWords && dailyAnswers.length > 0) {
      const dailyMatches = possibleAnswers.filter(w => dailyAnswers.includes(w));
      if (dailyMatches.length > 0) {
        possibleAnswers = dailyMatches;
      }
    }

    if (possibleAnswers.length === 0) {
      bestGuesses = [];
      return;
    }

    loadingSuggestions = true;
    setTimeout(() => {
      const results = solver.getBestGuesses(possibleAnswers, guesses);
      bestGuesses = results;
      loadingSuggestions = false;
    }, 0);
  }

  function cycleTile(index: number) {
    const newTiles = [...currentTiles];
    const current = newTiles[index];
    if (current === 'absent') newTiles[index] = 'present';
    else if (current === 'present') newTiles[index] = 'correct';
    else newTiles[index] = 'absent';
    currentTiles = newTiles;
  }

  function addGuess() {
    const word = currentInput.toUpperCase().trim();
    if (word.length !== wordLength) return;
    if (!wordData) return;

    const solver = new BinanceWotdSolver(wordData, wordLength, hardMode);
    if (!solver.isValidGuess(word)) return;

    const evaluation = [...currentTiles];
    guesses = [...guesses, { word, evaluation }];
    currentInput = '';
    currentTiles = Array(wordLength).fill('absent') as TileState[];
  }

  function resetCurrent() {
    currentInput = '';
    currentTiles = Array(wordLength).fill('absent') as TileState[];
  }

  function clearAll() {
    currentInput = '';
    currentTiles = Array(wordLength).fill('absent') as TileState[];
    guesses = [];
  }

  function useSuggestion(word: string) {
    currentInput = word;
    currentTiles = Array(wordLength).fill('absent') as TileState[];
  }

  function useStarter(word: string) {
    currentInput = word;
    currentTiles = Array(wordLength).fill('absent') as TileState[];
  }

  async function copyWord(word: string) {
    try {
      await navigator.clipboard.writeText(word);
      showStarterCopied = word;
      setTimeout(() => {
        showStarterCopied = null;
      }, 1500);
    } catch {
      // Clipboard not available
    }
  }

  function handleInputKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGuess();
    }
  }

  // Derived values
  let possibleAnswersCount = $derived.by(() => {
    if (!wordData) return 0;
    if (guesses.length === 0) return wordData.answers.length;
    return BinanceWotdSolver.filterPossibilities(wordData.answers, guesses).length;
  });

  let isCurrentWordValid = $derived.by(() => {
    if (!wordData) return false;
    const word = currentInput.toUpperCase().trim();
    if (word.length !== wordLength) return false;
    const solver = new BinanceWotdSolver(wordData, wordLength, hardMode);
    return solver.isValidGuess(word);
  });

  let starters = $derived(
    STARTERS[hardMode ? 'hard' : 'easy'][wordLength] || []
  );

  let tileColorClasses: Record<TileState, string> = {
    absent: 'bg-zinc-700 border-zinc-600 text-zinc-300',
    present: 'bg-yellow-500 border-yellow-400 text-zinc-900',
    correct: 'bg-emerald-500 border-emerald-400 text-white',
  };

  let tileColorSmallClasses: Record<TileState, string> = {
    absent: 'bg-zinc-700 border-zinc-600 text-zinc-300',
    present: 'bg-yellow-500/80 border-yellow-400 text-zinc-900',
    correct: 'bg-emerald-500/80 border-emerald-400 text-white',
  };

  // Entrance animation
  $effect(() => {
    const timer = setTimeout(() => {
      isLoaded = true;
    }, 100);
    return () => clearTimeout(timer);
  });
</script>

<SEO
  title="Binance WOTD Solver"
  description="Free Binance Word of the Day (WOTD) solver. Get instant word suggestions, filter by letter count, and solve the daily WODL puzzle with smart recommendations."
  keywords={["binance wotd", "binance word of the day", "wodl solver", "binance wodl", "word game solver", "crypto word game"]}
  canonicalUrl="https://cryptowalletsx.com/binance-wotd-solver"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Binance WOTD Solver',
        url: 'https://cryptowalletsx.com/binance-wotd-solver',
        description: 'Free Binance Word of the Day (WOTD) solver. Get instant word suggestions and solve the daily WODL puzzle.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Binance WOTD Solver', item: 'https://cryptowalletsx.com/binance-wotd-solver' }
        ]
      }
    ]
  }}
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <main class="flex-1">
    <!-- Premium Hero Section - Binance Yellow/Amber Theme -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 binance-hero-gradient animated-gradient-bg"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-r from-yellow-500/10 via-amber-500/8 to-yellow-500/10 rounded-full blur-3xl"></div>

      <!-- Floating shapes - Binance themed -->
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-16 left-[8%] w-14 h-14 border border-yellow-500/20 rounded-lg float-animation rotate-45"></div>
        <div class="absolute top-32 right-[12%] w-10 h-10 border border-amber-500/20 rounded-full float-slow-animation"></div>
        <div class="absolute bottom-20 left-[25%] w-6 h-6 bg-yellow-500/10 rounded-md float-animation" style="animation-delay: 2s"></div>
        <div class="absolute top-48 left-[55%] w-8 h-8 border border-amber-400/15 rounded-full float-slow-animation" style="animation-delay: 1s"></div>
        <div class="absolute bottom-32 right-[18%] w-5 h-5 bg-amber-500/8 rounded-sm float-animation" style="animation-delay: 3s"></div>
        <!-- Sparkle dots -->
        <div class="absolute top-20 left-[45%] w-2 h-2 bg-yellow-400/30 rounded-full float-animation" style="animation-delay: 0.5s"></div>
        <div class="absolute top-40 left-[78%] w-1.5 h-1.5 bg-amber-400/25 rounded-full float-slow-animation" style="animation-delay: 2s"></div>
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div
          class="transition-all duration-700 ease-out"
          class:opacity-0={!isLoaded}
          class:translate-y-6={!isLoaded}
          class:opacity-100={isLoaded}
          class:translate-y-0={isLoaded}
        >
          <!-- Binance-style badge -->
          <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-500/10 border border-yellow-500/25 mb-8 backdrop-blur-sm">
            <Trophy class="w-4 h-4 text-yellow-500" />
            <span class="text-sm font-bold bg-gradient-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">Word Solver</span>
          </div>

          <!-- Main heading - Binance yellow gradient -->
          <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span class="bg-gradient-to-r from-yellow-400 via-amber-400 to-yellow-500 bg-clip-text text-transparent">Binance WOTD Solver</span>
          </h1>
          <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Instantly solve the Binance Word of the Day puzzle. Get smart word suggestions based on your guesses and filter by letter count.
          </p>

          <!-- Binance-style diamond decoration -->
          <div class="flex items-center justify-center gap-3 mb-6">
            <div class="w-8 h-[1px] bg-gradient-to-r from-transparent to-yellow-500/40"></div>
            <div class="w-2 h-2 rotate-45 bg-yellow-500/40"></div>
            <div class="w-8 h-[1px] bg-gradient-to-l from-transparent to-yellow-500/40"></div>
          </div>

          <!-- Daily answers indicator -->
          <div class="flex flex-wrap justify-center gap-3">
            {#if dailyLoading}
              <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-card/80 border border-yellow-500/20 backdrop-blur-sm">
                <Loader2 class="w-3.5 h-3.5 text-yellow-500 animate-spin" />
                <span class="text-sm text-muted-foreground">Loading daily hints...</span>
              </div>
            {:else if dailyAnswers.length > 0}
              <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                <CheckCircle2 class="w-3.5 h-3.5 text-yellow-500" />
                <span class="text-sm font-semibold text-yellow-400">{dailyAnswers.length} daily hints available</span>
              </div>
            {:else if dailyError}
              <div class="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-sm">
                <XCircle class="w-3.5 h-3.5 text-amber-500" />
                <span class="text-sm text-amber-400">Daily hints unavailable</span>
              </div>
            {/if}
          </div>
        </div>
      </div>
    </section>

    <!-- Solver Tool Section -->
    <section class="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
      <div
        class="transition-all duration-700 ease-out delay-200"
        class:opacity-0={!isLoaded}
        class:translate-y-6={!isLoaded}
        class:opacity-100={isLoaded}
        class:translate-y-0={isLoaded}
      >
        <!-- Main Solver Card - Premium Gold Border -->
        <div class="relative p-[1px] rounded-2xl bg-gradient-to-r from-yellow-500/30 via-amber-500/20 to-yellow-500/30">
          <div class="rounded-2xl border border-yellow-500/15 bg-card/80 backdrop-blur-xl overflow-hidden">
            <div class="p-5 sm:p-8 space-y-6">

              <!-- Word Length Selector - Gold Highlight -->
              <div>
                <span class="text-sm font-bold text-muted-foreground mb-3 block flex items-center gap-2">
                  <Target class="w-4 h-4 text-yellow-500" />
                  Word Length
                </span>
                <div class="flex flex-wrap gap-2">
                  {#each [3, 4, 5, 6, 7, 8] as len}
                    <button
                      onclick={() => { wordLength = len as WordLength; }}
                      class="px-6 py-3 rounded-xl text-sm font-black transition-all duration-200 {
                        wordLength === len
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-zinc-900 shadow-lg shadow-yellow-500/30 scale-105 ring-2 ring-yellow-400/30'
                          : 'bg-card/80 border border-border/40 text-muted-foreground hover:text-foreground hover:border-yellow-500/30 hover:bg-yellow-500/5'
                      }"
                    >
                      {len}
                    </button>
                  {/each}
                </div>
              </div>

              <!-- Mode Toggles - Amber theme -->
              <div class="flex flex-wrap gap-4">
                <!-- Hard Mode -->
                <button
                  onclick={() => { hardMode = !hardMode; }}
                  class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border {
                    hardMode
                      ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                      : 'bg-card/60 border-border/40 text-muted-foreground hover:text-foreground'
                  }"
                >
                  <Crown class="w-4 h-4" />
                  Hard Mode
                  {#if hardMode}
                    <CheckCircle2 class="w-3.5 h-3.5 text-yellow-500" />
                  {:else}
                    <Circle class="w-3.5 h-3.5" />
                  {/if}
                </button>

                <!-- All Words -->
                <button
                  onclick={() => { showAllWords = !showAllWords; }}
                  class="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border {
                    showAllWords
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      : 'bg-card/60 border-border/40 text-muted-foreground hover:text-foreground'
                  }"
                >
                  <BookOpen class="w-4 h-4" />
                  All Words
                  {#if showAllWords}
                    <CheckCircle2 class="w-3.5 h-3.5 text-amber-500" />
                  {:else}
                    <Circle class="w-3.5 h-3.5" />
                  {/if}
                </button>
              </div>

              <!-- Loading indicator for word data -->
              {#if loadingData}
                <div class="flex items-center justify-center gap-3 py-8">
                  <Loader2 class="w-5 h-5 text-yellow-500 animate-spin" />
                  <span class="text-muted-foreground">Loading {wordLength}-letter word data...</span>
                </div>
              {:else if dataError}
                <div class="rounded-xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
                  {dataError}
                </div>
              {:else if wordData}
                <!-- Input Row -->
                <div class="flex gap-3 items-center">
                  <button
                    onclick={resetCurrent}
                    class="shrink-0 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium bg-card/80 border border-border/40 text-muted-foreground hover:text-foreground hover:border-yellow-500/30 transition-all"
                    title="Reset current input"
                    aria-label="Reset current input"
                  >
                    <RotateCcw class="w-4 h-4" />
                  </button>
                  <div class="flex-1 relative">
                    <input
                      type="text"
                      value={currentInput}
                      oninput={(e) => {
                        const val = (e.target as HTMLInputElement).value.toUpperCase().replace(/[^A-Z]/g, '');
                        currentInput = val.slice(0, wordLength);
                      }}
                      onkeydown={handleInputKeydown}
                      placeholder={`Enter a ${wordLength}-letter word...`}
                      maxlength={wordLength}
                      aria-label="Enter a word guess"
                      class="w-full px-4 py-2.5 rounded-xl bg-card/80 border border-yellow-500/20 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/25 transition-all text-sm sm:text-base font-mono uppercase tracking-wider"
                    />
                    <span class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                      {currentInput.length}/{wordLength}
                    </span>
                  </div>
                  <button
                    onclick={clearAll}
                    class="shrink-0 px-3 py-2.5 rounded-xl text-sm font-medium bg-card/80 border border-border/40 text-muted-foreground hover:text-foreground hover:border-destructive/30 transition-all"
                    title="Clear all guesses"
                    aria-label="Clear all guesses"
                  >
                    <XCircle class="w-4 h-4" />
                  </button>
                </div>

                <!-- Color Tiles - Yellow/Amber/Green -->
                {#if currentInput.length > 0}
                  <div>
                    <span class="text-xs font-semibold text-muted-foreground mb-2 block">Click tiles to set color (Grey → Yellow → Green)</span>
                    <div class="flex justify-center gap-2">
                      {#each currentInput.split('') as letter, i}
                        <button
                          onclick={() => cycleTile(i)}
                          class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-2 font-bold text-lg flex items-center justify-center transition-all duration-150 hover:scale-110 {tileColorClasses[currentTiles[i] || 'absent']}"
                          title="{currentTiles[i] === 'absent' ? 'Absent' : currentTiles[i] === 'present' ? 'Present (wrong position)' : 'Correct position'} — click to change"
                        >
                          {letter}
                        </button>
                      {/each}
                    </div>
                    <div class="flex justify-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-zinc-700 border border-zinc-600 inline-block"></span> Absent</span>
                      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-yellow-500 border border-yellow-400 inline-block"></span> Present</span>
                      <span class="flex items-center gap-1"><span class="w-3 h-3 rounded bg-emerald-500 border border-emerald-400 inline-block"></span> Correct</span>
                    </div>
                  </div>
                {/if}

                <!-- Add Guess Button - Gold gradient -->
                <button
                  onclick={addGuess}
                  disabled={!isCurrentWordValid || currentInput.length !== wordLength}
                  class="w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-200 {
                    isCurrentWordValid && currentInput.length === wordLength
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-zinc-900 shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40 hover:scale-[1.01]'
                      : 'bg-card/60 border border-border/40 text-muted-foreground cursor-not-allowed opacity-50'
                  }"
                >
                  <span class="flex items-center justify-center gap-2">
                    <Plus class="w-4 h-4" />
                    {currentInput.length !== wordLength ? `Enter ${wordLength} letters` : isCurrentWordValid ? 'Add Guess' : 'Not in word list'}
                  </span>
                </button>

                <!-- Guess History -->
                {#if guesses.length > 0}
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <h3 class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                        <BookOpen class="w-4 h-4 text-yellow-500" />
                        Guess History
                        <span class="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold">{guesses.length}</span>
                      </h3>
                      <span class="text-xs font-semibold text-amber-400">{possibleAnswersCount} possible answers remaining</span>
                    </div>
                    <div class="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                      {#each guesses as guess, gi}
                        <div class="flex items-center gap-3">
                          <span class="text-xs text-muted-foreground w-5 shrink-0 text-right font-bold">{gi + 1}</span>
                          <div class="flex gap-1">
                            {#each guess.word.split('') as letter, li}
                              <div
                                class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg border font-bold text-sm flex items-center justify-center {tileColorSmallClasses[guess.evaluation[li]]}"
                              >
                                {letter}
                              </div>
                            {/each}
                          </div>
                          <button
                            onclick={() => { guesses = guesses.filter((_, idx) => idx !== gi); }}
                            class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Remove guess"
                          >
                            <XCircle class="w-3.5 h-3.5" />
                          </button>
                        </div>
                      {/each}
                    </div>
                  </div>
                {/if}

                <!-- Best Guesses Section - Premium ranked display -->
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-sm font-bold text-muted-foreground flex items-center gap-2">
                      <Sparkles class="w-4 h-4 text-yellow-500" />
                      Best Guesses
                    </h3>
                    {#if loadingSuggestions}
                      <Loader2 class="w-4 h-4 text-yellow-500 animate-spin" />
                    {/if}
                  </div>

                  {#if bestGuesses.length === 0 && !loadingSuggestions}
                    <div class="rounded-xl bg-card/40 border border-yellow-500/10 p-8 text-center">
                      <Lightbulb class="w-8 h-8 text-yellow-500/20 mx-auto mb-3" />
                      <p class="text-sm text-muted-foreground font-medium">Add guesses to see recommended words</p>
                    </div>
                  {:else if bestGuesses.length > 0}
                    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-80 overflow-y-auto custom-scrollbar">
                      {#each bestGuesses as guess, i}
                        <button
                          onclick={() => useSuggestion(guess.word)}
                          class="group relative flex items-center justify-between gap-1 px-3 py-3 rounded-xl border text-left transition-all duration-200 {
                            guess.isAnswer
                              ? 'bg-yellow-500/10 border-yellow-500/30 hover:border-yellow-500/50 shadow-sm shadow-yellow-500/10'
                              : 'bg-card/60 border-border/30 hover:border-yellow-500/30 hover:bg-yellow-500/5'
                          }"
                        >
                          <div class="flex items-center gap-2.5">
                            <!-- Ranking number -->
                            <span class="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black {
                              i < 3 ? 'bg-yellow-500/20 text-yellow-400' : 'bg-secondary/50 text-muted-foreground/60'
                            }">{i + 1}</span>
                            <span class="font-mono font-bold text-sm tracking-wider {guess.isAnswer ? 'text-yellow-400' : 'text-foreground'}">
                              {guess.word}
                            </span>
                          </div>
                          {#if guess.isAnswer}
                            <CheckCircle2 class="w-3 h-3 text-yellow-500" />
                          {/if}
                        </button>
                      {/each}
                    </div>
                  {/if}
                </div>

                <!-- Starter Words Section - Amber/Yellow badges -->
                {#if guesses.length === 0 && starters.length > 0}
                  <div>
                    <div class="flex items-center gap-2 mb-3">
                      <Zap class="w-4 h-4 text-yellow-500" />
                      <h3 class="text-sm font-bold text-muted-foreground">Recommended Starters</h3>
                    </div>
                    <div class="flex flex-wrap gap-2">
                      {#each starters.slice(0, 10) as starter}
                        <button
                          onclick={() => useStarter(starter)}
                          class="group relative flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 text-sm font-mono font-bold tracking-wider text-yellow-300 hover:border-yellow-500/40 hover:from-yellow-500/15 hover:to-amber-500/15 transition-all"
                        >
                          {starter}
                          {#if showStarterCopied === starter}
                            <CheckCircle2 class="w-3 h-3 text-emerald-500" />
                          {:else}
                            <span
                              class="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              onclick={(e) => { e.stopPropagation(); copyWord(starter); }}
                              onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); copyWord(starter); } }}
                              role="button"
                              tabindex="0"
                            >
                              <ExternalLink class="w-3 h-3 text-muted-foreground" />
                            </span>
                          {/if}
                        </button>
                      {/each}
                    </div>
                  </div>
                {/if}
              {/if}
            </div>
          </div>
        </div>

        <!-- How to Use Section - Amber theme -->
        <div class="mt-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
              <HelpCircle class="w-5 h-5 text-yellow-500" />
            </div>
            How to Use
          </h2>
          <div class="rounded-2xl border border-yellow-500/15 bg-card/60 backdrop-blur-xl p-6 sm:p-8">
            <div class="space-y-6">
              <!-- Step 1 -->
              <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center shrink-0 text-sm font-black text-zinc-900">1</div>
                <div>
                  <h3 class="font-semibold mb-1">Select Word Length & Enter Your Guess</h3>
                  <p class="text-sm text-muted-foreground">Choose the word length (3-8 letters) that matches today's Binance WOTD puzzle. Type in your first guess or pick from the recommended starter words.</p>
                </div>
              </div>

              <!-- Step 2 -->
              <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center shrink-0 text-sm font-black text-zinc-900">2</div>
                <div>
                  <h3 class="font-semibold mb-1">Set Tile Colors</h3>
                  <p class="text-sm text-muted-foreground">Click each letter tile to cycle its color: <span class="text-zinc-400 font-medium">Grey</span> (letter not in word), <span class="text-yellow-400 font-medium">Yellow</span> (letter in word, wrong position), <span class="text-emerald-400 font-medium">Green</span> (letter in correct position). Match the colors from your Binance game.</p>
                </div>
              </div>

              <!-- Step 3 -->
              <div class="flex gap-4 items-start">
                <div class="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 flex items-center justify-center shrink-0 text-sm font-black text-zinc-900">3</div>
                <div>
                  <h3 class="font-semibold mb-1">Add Guess & Get Suggestions</h3>
                  <p class="text-sm text-muted-foreground">Click "Add Guess" to save your entry. The solver will instantly show you the best words to try next, ranked by how effectively they narrow down the remaining possibilities.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- What is Binance WOTD Section - Amber theme -->
        <div class="mt-12">
          <h2 class="text-2xl sm:text-3xl font-bold mb-6 flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Info class="w-5 h-5 text-amber-500" />
            </div>
            What is Binance WOTD?
          </h2>
          <div class="rounded-2xl border border-amber-500/15 bg-card/60 backdrop-blur-xl p-6 sm:p-8 space-y-4">
            <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Binance Word of the Day (WOTD) is a daily word-guessing game available on the Binance app and website. Similar to Wordle, you have a limited number of attempts to guess a crypto-related word. The game uses color-coded feedback — green for correct letters in the right position, yellow for correct letters in the wrong position, and grey for letters not in the word.
            </p>
            <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">
              Each day features a new word related to cryptocurrency, blockchain, DeFi, or trading terminology. Players who correctly guess the word earn rewards including points, vouchers, and sometimes Binance merch. The word length varies between 3 and 8 letters, making some puzzles significantly harder than others.
            </p>
            <p class="text-muted-foreground leading-relaxed text-sm sm:text-base">
              This solver uses an information-theoretic approach to recommend the most efficient guesses. It analyzes how each potential guess partitions the remaining possible answers and recommends words that maximize information gain, helping you solve the puzzle in fewer attempts. The "Hard Mode" toggle restricts suggestions to words that are consistent with your previous clues, matching Binance's hard mode rules.
            </p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <Footer />
</div>

<style>
  .binance-hero-gradient {
    background:
      radial-gradient(at 20% 20%, rgba(234, 179, 8, 0.1) 0%, transparent 50%),
      radial-gradient(at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%),
      radial-gradient(at 50% 80%, rgba(202, 138, 4, 0.1) 0%, transparent 50%);
  }
</style>
