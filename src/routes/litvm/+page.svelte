<script lang="ts">
  import { litvmWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/litvm/HomeScreen.svelte';
  import WalletScreen from '$lib/components/litvm/WalletScreen.svelte';
  import { LITVM_CONFIG } from '$lib/utils/constants';
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
    if (!litvmWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(litvmWalletStore.address, LITVM_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${LITVM_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${LITVM_CONFIG.name}. Please check the address and try again.`;
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
    if (litvmWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="LitVM Complete Guide"
  description="Check LitVM testnet wallet stats, scores, transaction history, and zkLTC balance analytics. LitVM is an Arbitrum Nitro L2 on Sepolia."
  keywords={["litvm", "zkltc", "arbitrum l2", "litvm wallet"]}
  canonicalUrl="https://cryptowalletsx.com/litvm"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LitVM Wallet Checker',
    url: 'https://cryptowalletsx.com/litvm',
    description: 'Check LitVM testnet wallet stats, scores, transaction history, and zkLTC balance analytics.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  }}
/>

{#if litvmWalletStore.address}
  <WalletScreen
    address={litvmWalletStore.address}
    activeTab={litvmWalletStore.activeTab}
    onTabChange={(tab) => litvmWalletStore.setActiveTab(tab)}
    onReset={() => litvmWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => litvmWalletStore.setAddress(addr)} />
{/if}
