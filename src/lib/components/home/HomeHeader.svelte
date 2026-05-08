<script lang="ts">
  import { Zap, Moon, Sun, Menu, X, Home, Shield, FileText, Mail, Info, ArrowLeftRight, BookOpen } from 'lucide-svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';

  let mobileMenuOpen = $state(false);

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<header class="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
    <!-- Logo -->
    <a href="/" class="flex items-center gap-3 group">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/25 transition-shadow">
        <Zap class="w-4 h-4 text-white" />
      </div>
      <span class="font-bold text-lg gradient-text">CryptoWalletsX</span>
      <Badge variant="secondary" class="hidden sm:flex gap-1 text-xs">
        <div class="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
        Multi-Chain
      </Badge>
    </a>

    <!-- Desktop Nav -->
    <div class="hidden md:flex items-center gap-2">
      <a
        href="/"
        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/60"
      >
        Home
      </a>
      <a
        href="/checker"
        class="text-sm font-medium text-cyan-500 transition-colors px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/15"
      >
        Checkers
      </a>
      <a
        href="/blog"
        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/60"
      >
        Blog
      </a>
      <a
        href="/about"
        class="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-secondary/60"
      >
        About
      </a>
      <Button variant="ghost" size="icon" onclick={() => themeStore.toggle()} class="rounded-full">
        {#if themeStore.isDark}
          <Sun class="w-4 h-4" />
        {:else}
          <Moon class="w-4 h-4" />
        {/if}
      </Button>
    </div>

    <!-- Mobile: Theme toggle + 3-dot menu button -->
    <div class="flex md:hidden items-center gap-1">
      <Button variant="ghost" size="icon" onclick={() => themeStore.toggle()} class="rounded-full h-9 w-9">
        {#if themeStore.isDark}
          <Sun class="w-4 h-4" />
        {:else}
          <Moon class="w-4 h-4" />
        {/if}
      </Button>
      <Button variant="ghost" size="icon" onclick={toggleMobileMenu} class="rounded-full h-9 w-9 relative">
        <!-- 3-dot vertical icon -->
        {#if mobileMenuOpen}
          <X class="w-5 h-5" />
        {:else}
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" class="text-foreground">
            <circle cx="10" cy="4" r="1.8" />
            <circle cx="10" cy="10" r="1.8" />
            <circle cx="10" cy="16" r="1.8" />
          </svg>
        {/if}
      </Button>
    </div>
  </div>

  <!-- Mobile Menu Dropdown -->
  {#if mobileMenuOpen}
    <div class="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200">
      <nav class="max-w-6xl mx-auto px-4 py-3 space-y-1">
        <a
          href="/"
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <Home class="w-4 h-4" />
          Home
        </a>
        <a
          href="/checker"
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-cyan-500 bg-cyan-500/10 transition-colors"
        >
          <Shield class="w-4 h-4" />
          All Checkers
        </a>
        <a
          href="/blog"
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <BookOpen class="w-4 h-4" />
          Blog
        </a>
        <a
          href="/about"
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <Info class="w-4 h-4" />
          About
        </a>
        <a
          href="/privacy"
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <FileText class="w-4 h-4" />
          Privacy Policy
        </a>
        <a
          href="/contact"
          onclick={closeMobileMenu}
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <Mail class="w-4 h-4" />
          Contact
        </a>
      </nav>
    </div>
  {/if}
</header>
