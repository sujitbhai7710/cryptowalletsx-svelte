<script lang="ts">
  import { robinhoodWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/arc/HomeScreen.svelte';
  import WalletScreen from '$lib/components/arc/WalletScreen.svelte';
  import { ROBINHOOD_CONFIG } from '$lib/utils/constants';
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
    if (!robinhoodWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(robinhoodWalletStore.address, ROBINHOOD_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${ROBINHOOD_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${ROBINHOOD_CONFIG.name}. Please check the address and try again.`;
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
    if (robinhoodWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Robinhood Testnet Complete Guide"
  description="Check Robinhood Chain testnet wallet stats, transaction history, and ETH balance analytics. Robinhood Chain is an Arbitrum Orbit L2."
  keywords={["robinhood chain", "robinhood testnet", "robinhood wallet", "arbitrum orbit"]}
  canonicalUrl="https://cryptowalletsx.com/robinhood"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Robinhood Testnet Wallet Checker',
    url: 'https://cryptowalletsx.com/robinhood',
    description: 'Check Robinhood Chain testnet wallet stats, transaction history, and ETH balance analytics.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  }}
/>

{#if robinhoodWalletStore.address}
  <WalletScreen
    address={robinhoodWalletStore.address}
    activeTab={robinhoodWalletStore.activeTab}
    config={ROBINHOOD_CONFIG}
    onTabChange={(tab) => robinhoodWalletStore.setActiveTab(tab)}
    onReset={() => robinhoodWalletStore.reset()}
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
  <HomeScreen config={ROBINHOOD_CONFIG} onAddressSubmit={(addr) => robinhoodWalletStore.setAddress(addr)} />
{/if}
