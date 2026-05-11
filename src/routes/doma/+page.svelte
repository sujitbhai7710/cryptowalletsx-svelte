<script lang="ts">
  import { domaWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/doma/HomeScreen.svelte';
  import WalletScreen from '$lib/components/doma/WalletScreen.svelte';
  import { DOMA_CONFIG } from '$lib/utils/constants';
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
    if (!domaWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(domaWalletStore.address, DOMA_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${DOMA_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${DOMA_CONFIG.name}. Please check the address and try again.`;
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
    if (domaWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Doma Testnet Complete Guide"
  description="Check Doma testnet wallet stats, scores, transaction history, and ETH balance analytics. Doma is an L2 blockchain with cross-chain bridge capabilities."
  keywords={["doma", "doma testnet", "doma wallet checker", "l2 bridge", "testnet"]}
  canonicalUrl="https://cryptowalletsx.com/doma"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Doma Wallet Checker',
    url: 'https://cryptowalletsx.com/doma',
    description: 'Check Doma testnet wallet stats, scores, transaction history, and ETH balance analytics.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  }}
/>

{#if domaWalletStore.address}
  <WalletScreen
    address={domaWalletStore.address}
    activeTab={domaWalletStore.activeTab}
    onTabChange={(tab) => domaWalletStore.setActiveTab(tab)}
    onReset={() => domaWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => domaWalletStore.setAddress(addr)} />
{/if}
