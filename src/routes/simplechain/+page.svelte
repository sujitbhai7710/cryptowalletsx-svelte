<script lang="ts">
  import { simplechainWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/simplechain/HomeScreen.svelte';
  import WalletScreen from '$lib/components/simplechain/WalletScreen.svelte';
  import { SIMPLECHAIN_CONFIG } from '$lib/utils/constants';
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
    if (!simplechainWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(simplechainWalletStore.address, SIMPLECHAIN_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${SIMPLECHAIN_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${SIMPLECHAIN_CONFIG.name}. Please check the address and try again.`;
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
    if (simplechainWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="SimpleChain Stats Checker"
  description="Check SimpleChain testnet wallet stats and SRW token analytics. Track transactions, scores, and DeFi activity."
  keywords={["simplechain", "srw token", "simplechain wallet"]}
  canonicalUrl="https://cryptowalletsx.com/blog/simplechain"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'SimpleChain Wallet Checker',
        url: 'https://cryptowalletsx.com/simplechain',
        description: 'Check SimpleChain testnet wallet stats and SRW token analytics.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'SimpleChain', item: 'https://cryptowalletsx.com/simplechain' }
        ]
      }
    ]
  }}
/>

{#if simplechainWalletStore.address}
  <WalletScreen
    address={simplechainWalletStore.address}
    activeTab={simplechainWalletStore.activeTab}
    onTabChange={(tab) => simplechainWalletStore.setActiveTab(tab)}
    onReset={() => simplechainWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => simplechainWalletStore.setAddress(addr)} />
{/if}

<!-- Ad: Below wallet content -->
<div class="max-w-7xl mx-auto px-4 py-4">
  <AdUnit slot="auto" format="horizontal" style="min-height:90px" />
</div>
