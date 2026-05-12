<script lang="ts">
  import { jumperWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchWithTimeout } from '$lib/utils/api';
  import HomeScreen from '$lib/components/jumper/HomeScreen.svelte';
  import WalletScreen from '$lib/components/jumper/WalletScreen.svelte';
  import { processJumperData } from '$lib/utils/jumper-stats';
  import SEO from '$lib/components/SEO.svelte';
  import type { JumperTransfer, JumperStats } from '$lib/types';

  // Data state managed at the route page level
  let isLoading = $state(false);
  let loadError = $state('');
  let isRefreshing = $state(false);
  let stats = $state<JumperStats | null>(null);

  async function fetchAllData() {
    if (!jumperWalletStore.address) return;
    isLoading = true;
    loadError = '';
    try {
      // Fetch transfers and chains in parallel
      const [transferRes, chainRes] = await Promise.all([
        fetchWithTimeout(`https://li.quest/v1/analytics/transfers?fromAddress=${jumperWalletStore.address}`).catch(() => null),
        fetchWithTimeout('https://li.quest/v1/chains').catch(() => null),
      ]);

      let transfers: JumperTransfer[] = [];
      if (transferRes && transferRes.ok) {
        const transferData = await transferRes.json();
        transfers = transferData.transfers || [];
      } else if (transferRes === null) {
        loadError = 'Request timed out. The Jumper API is taking too long. Please try again.';
      } else {
        loadError = `Failed to fetch transfers: ${transferRes.status}`;
      }

      let chainLogos: Record<string, string> = {};
      let chainNames: Record<string, string> = {};
      let totalNetworks = 0;
      if (chainRes && chainRes.ok) {
        const chainData = await chainRes.json();
        const chains = chainData.chains || [];
        totalNetworks = chains.length;
        for (const chain of chains) {
          const idKey = String(chain.id || '');
          const nameKey = chain.name || '';
          if (idKey && chain.logoURI) {
            chainLogos[idKey] = chain.logoURI;
          }
          if (idKey && nameKey) {
            chainNames[idKey] = nameKey;
          }
        }
      }

      // Process data
      if (transfers.length > 0 || !loadError) {
        stats = processJumperData(transfers, chainLogos, chainNames);
        if (totalNetworks > 0) {
          stats.totalNetworks = totalNetworks;
        }
      }
    } catch (err: any) {
      console.error('Failed to fetch Jumper data:', err);
      if (err?.name === 'AbortError') {
        loadError = 'Request timed out. The Jumper API is taking too long. Please try again.';
      } else {
        loadError = 'Failed to load Jumper data. Please try again.';
      }
    } finally {
      isLoading = false;
    }
  }

  async function handleRetry() {
    await fetchAllData();
  }

  async function handleRefresh() {
    isRefreshing = true;
    await fetchAllData();
    isRefreshing = false;
  }

  $effect(() => {
    if (jumperWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Jumper Bridge Stats Checker"
  description="Analyze Jumper/Li.Fi cross-chain activity. Track bridge transfers, token swaps, and multi-chain wallet analytics."
  keywords={["jumper exchange", "li.fi", "lifi bridge", "jumper analytics", "cross-chain swap"]}
  canonicalUrl="https://cryptowalletsx.com/blog/jumper"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Jumper Bridge Analytics',
        url: 'https://cryptowalletsx.com/jumper',
        description: 'Analyze Jumper/Li.Fi cross-chain bridge and swap activity.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Jumper Bridge', item: 'https://cryptowalletsx.com/jumper' }
        ]
      }
    ]
  }}
/>

{#if jumperWalletStore.address}
  <WalletScreen
    address={jumperWalletStore.address}
    onReset={() => jumperWalletStore.reset()}
    {isLoading}
    {loadError}
    {stats}
    {isRefreshing}
    onRetry={handleRetry}
    onRefresh={handleRefresh}
  />
{:else}
  <HomeScreen onAddressSubmit={(addr) => jumperWalletStore.setAddress(addr)} />
{/if}

