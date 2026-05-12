<script lang="ts">
  import { genlayerWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/genlayer/HomeScreen.svelte';
  import WalletScreen from '$lib/components/genlayer/WalletScreen.svelte';
  import { GENLAYER_CONFIG } from '$lib/utils/constants';
  import SEO from '$lib/components/SEO.svelte';
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
    if (!genlayerWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(genlayerWalletStore.address, GENLAYER_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${GENLAYER_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${GENLAYER_CONFIG.name}. Please check the address and try again.`;
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
    if (genlayerWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="GenLayer Stats Checker"
  description="Analyze GenLayer Bradbury wallet stats, scores, and GEN token activity. Check transaction history and on-chain metrics on the AI-powered consensus chain."
  keywords={["genlayer", "ai blockchain", "intelligent contracts", "genlayer wallet"]}
  canonicalUrl="https://cryptowalletsx.com/blog/genlayer"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'GenLayer Wallet Checker',
        url: 'https://cryptowalletsx.com/genlayer',
        description: 'Analyze GenLayer Bradbury wallet stats and GEN token activity on the AI-powered consensus chain.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'GenLayer', item: 'https://cryptowalletsx.com/genlayer' }
        ]
      }
    ]
  }}
/>

{#if genlayerWalletStore.address}
  <WalletScreen
    address={genlayerWalletStore.address}
    activeTab={genlayerWalletStore.activeTab}
    onTabChange={(tab) => genlayerWalletStore.setActiveTab(tab)}
    onReset={() => genlayerWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => genlayerWalletStore.setAddress(addr)} />
{/if}

