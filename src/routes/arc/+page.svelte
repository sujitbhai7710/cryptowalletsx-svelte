<script lang="ts">
  import { walletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/arc/HomeScreen.svelte';
  import WalletScreen from '$lib/components/arc/WalletScreen.svelte';
  import { ARC_CONFIG } from '$lib/utils/constants';
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
  title="Arc Testnet Complete Guide"
  description="Check Arc Testnet wallet stats, scores, transaction history, DeFi activity, and USDC balance analytics. Arc is a USDC-native testnet powered by Circle."
  keywords={["arc testnet", "arc wallet checker", "arc testnet stats", "usdc testnet", "circle arc"]}
  canonicalUrl="https://cryptowalletsx.com/arc"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Arc Testnet Wallet Checker',
    url: 'https://cryptowalletsx.com/arc',
    description: 'Check Arc Testnet wallet stats, scores, transaction history, DeFi activity, and USDC balance analytics.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
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
