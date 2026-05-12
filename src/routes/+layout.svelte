<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import SEO from '$lib/components/SEO.svelte';
  import CookieConsent from '$lib/components/CookieConsent.svelte';
  import AdSenseRefresh from '$lib/components/AdSenseRefresh.svelte';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" crossorigin />
</svelte:head>

<SEO
  title="CryptoWalletsx"
  description="Free multi-chain crypto wallet analytics."
  jsonLd={{
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
  }}
/>

{@render children()}

<CookieConsent />
<AdSenseRefresh />
