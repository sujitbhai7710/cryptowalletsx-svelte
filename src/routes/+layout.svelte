<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import CookieConsent from '$lib/components/CookieConsent.svelte';
  import AdSenseRefresh from '$lib/components/AdSenseRefresh.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();

  // Global Organization schema — rendered once in layout since it applies site-wide
  // Individual pages render their own specific schema (WebSite, Article, FAQPage, etc.)
  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://cryptowalletsx.com/#organization',
    name: 'CryptoWalletsX',
    url: 'https://cryptowalletsx.com',
    logo: 'https://cryptowalletsx.com/favicon.png',
    sameAs: [
      'https://twitter.com/cryptowalletsx',
      'https://github.com/Sujhavsingh/cryptowalletsx-svelte'
    ]
  };
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" crossorigin />

  <!-- Organization JSON-LD: global schema rendered in layout to avoid duplication with per-page SEO components -->
  {@html `<script type="application/ld+json">${JSON.stringify(orgJsonLd)}</script>`}
</svelte:head>

{@render children()}

<CookieConsent />
<AdSenseRefresh />
