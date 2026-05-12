<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/arc/HomeScreen.svelte';
  import WalletScreen from '$lib/components/arc/WalletScreen.svelte';
  import { ARC_CONFIG } from '$lib/utils/constants';
  import SEO from '$lib/components/SEO.svelte';
  import AdUnit from '$lib/components/AdUnit.svelte';
  import type { AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken } from '$lib/types';

  // Data state managed at the route page level
  let isLoading = $state(false);
  let fetchError = $state<string | null>(null);
  let isRefreshing = $state(false);
  let addressDetails = $state<AddressDetails | null>(null);
  let transactions = $state<Transaction[]>([]);
  let tokenTransfers = $state<TokenTransfer[]>([]);
  let tokenBalances = $state<TokenBalance[]>([]);
  let nfts = $state<NFTItem[]>([]);
  let allTokens = $state<AllToken[]>([]);

  async function fetchAllData() {
    if (!walletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(walletStore.address, ARC_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${ARC_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${ARC_CONFIG.name}. Please check the address and try again.`;
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
    if (walletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Arc Testnet Stats Checker"
  description="Analyze Arc Testnet wallet stats, scores, and USDC balance. Check transaction history, DeFi activity, and on-chain metrics on Circle's USDC-native testnet."
  keywords={["arc testnet", "arc wallet checker", "arc testnet stats", "usdc testnet", "circle arc"]}
  canonicalUrl="https://cryptowalletsx.com/blog/arc"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Arc Testnet Wallet Checker',
        url: 'https://cryptowalletsx.com/arc',
        description: 'Analyze Arc Testnet wallet stats, scores, and USDC balance on Circle\'s USDC-native testnet.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Arc Testnet', item: 'https://cryptowalletsx.com/arc' }
        ]
      }
    ]
  }}
/>

{#if walletStore.address}
  <WalletScreen
    address={walletStore.address}
    activeTab={walletStore.activeTab}
    config={ARC_CONFIG}
    onTabChange={(tab) => walletStore.setActiveTab(tab)}
    onReset={() => walletStore.reset()}
    {addressDetails}
    {transactions}
    {tokenTransfers}
    {tokenBalances}
    {nfts}
    {allTokens}
    {isLoading}
    {fetchError}
    onRetry={handleRetry}
    {isRefreshing}
    onRefresh={handleRefresh}
  />
{:else}
  <HomeScreen config={ARC_CONFIG} onAddressSubmit={(addr) => walletStore.setAddress(addr)} />
{/if}

<!-- Ad: Below wallet content -->
<div class="max-w-7xl mx-auto px-4 py-4">
  <AdUnit slot="auto" format="horizontal" style="min-height:90px" />
</div>
