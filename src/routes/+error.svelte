<script lang="ts">
  import { page } from '$app/stores';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import { AlertCircle, Home, ArrowLeft } from 'lucide-svelte';
</script>

<SEO
  title="Page Not Found"
  description="The page you're looking for doesn't exist on CryptoWalletsx."
/>

<div class="min-h-screen flex flex-col">
  <HomeHeader />
  <main class="flex-1 flex items-center justify-center">
    <div class="text-center px-4 py-20">
      <div class="w-20 h-20 rounded-2xl bg-card/60 border border-border/40 flex items-center justify-center mx-auto mb-6">
        <AlertCircle class="w-10 h-10 text-muted-foreground" />
      </div>
      <h1 class="text-6xl font-extrabold gradient-text mb-4">{$page.status}</h1>
      <p class="text-xl font-semibold mb-2">
        {#if $page.status === 404}
          Page Not Found
        {:else}
          Something Went Wrong
        {/if}
      </p>
      <p class="text-muted-foreground mb-8 max-w-md mx-auto">
        {#if $page.status === 404}
          The page you're looking for doesn't exist or has been moved. Check the URL or browse our tools below.
        {:else}
          {$page.error?.message || 'An unexpected error occurred. Please try again later.'}
        {/if}
      </p>
      <div class="flex flex-col sm:flex-row items-center justify-center gap-3">
        <a href="/" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-600 text-white font-medium shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all">
          <Home class="w-4 h-4" />
          Go Home
        </a>
        <a href="/checker" class="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/60 transition-all">
          Browse Tools
        </a>
      </div>
    </div>
  </main>
  <Footer />
</div>
