<script lang="ts">
  import { relayWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchWithTimeout } from '$lib/utils/api';
  import HomeScreen from '$lib/components/relay/HomeScreen.svelte';
  import WalletScreen from '$lib/components/relay/WalletScreen.svelte';
  import { processRelayData } from '$lib/utils/relay-stats';
  import SEO from '$lib/components/SEO.svelte';
  import type { RelayTx, RelayChain, RelayStats } from '$lib/types';

  // Data state managed at the route page level
  let isLoading = $state(false);
  let loadError = $state('');
  let isRefreshing = $state(false);
  let stats = $state<RelayStats | null>(null);

  async function fetchAllData() {
    if (!relayWalletStore.address) return;
    isLoading = true;
    loadError = '';
    try {
      // Fetch all relay transactions (paginated)
      const allTxs: RelayTx[] = [];
      let continuation: string | null = null;
      let pageCount = 0;
      do {
        const params = new URLSearchParams({ user: relayWalletStore.address });
        if (continuation) params.set('continuation', continuation);
        try {
          const res = await fetchWithTimeout(`https://api.relay.link/requests?${params}`);
          if (res.ok) {
            const data = await res.json();
            if (data.requests) allTxs.push(...data.requests);
            continuation = data.continuation || null;
          } else {
            loadError = `Failed to fetch transactions: ${res.status}`;
            break;
          }
        } catch {
          if (allTxs.length === 0) {
            loadError = 'Request timed out. The Relay API is taking too long. Please try again.';
          }
          break;
        }
        pageCount++;
      } while (continuation && pageCount < 10);

      // Fetch chain data
      let chains: RelayChain[] = [];
      try {
        const chainRes = await fetchWithTimeout('https://api.relay.link/destinations');
        if (chainRes.ok) {
          const chainData = await chainRes.json();
          chains = chainData.chains || [];
        }
      } catch { /* Non-critical, continue without chain data */ }

      if (!loadError) {
        stats = processRelayData(allTxs, chains);
      }
    } catch (err) {
      console.error('Failed to fetch Relay data:', err);
      loadError = 'Failed to load Relay data. Please try again.';
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
    if (relayWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Relay Bridge Stats Checker"
  description="Check Relay bridge and swap analytics across 80+ networks. Track cross-chain transactions, volumes, and protocol usage."
  keywords={["relay link", "relay bridge", "cross-chain bridge", "relay wallet", "bridge analytics"]}
  canonicalUrl="https://cryptowalletsx.com/relay"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Relay Bridge Analytics',
        url: 'https://cryptowalletsx.com/relay',
        description: 'Check Relay bridge and swap analytics across 80+ networks.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Relay Bridge', item: 'https://cryptowalletsx.com/relay' }
        ]
      }
    ]
  }}
/>

{#if relayWalletStore.address}
  <WalletScreen
    address={relayWalletStore.address}
    onReset={() => relayWalletStore.reset()}
    {isLoading}
    {loadError}
    {stats}
    {isRefreshing}
    onRetry={handleRetry}
    onRefresh={handleRefresh}
  />
{:else}
  <HomeScreen onAddressSubmit={(addr) => relayWalletStore.setAddress(addr)} />
{/if}

