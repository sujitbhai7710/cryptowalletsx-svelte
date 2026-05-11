<script lang="ts">
  import { dachainWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/dachain/HomeScreen.svelte';
  import WalletScreen from '$lib/components/dachain/WalletScreen.svelte';
  import { DACHAIN_CONFIG } from '$lib/utils/constants';
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
    if (!dachainWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(dachainWalletStore.address, DACHAIN_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${DACHAIN_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${DACHAIN_CONFIG.name}. Please check the address and try again.`;
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
    if (dachainWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="DAC Quantum Chain Complete Guide"
  description="Check DAC Quantum Chain testnet wallet stats, scores, transaction history, and DAC balance analytics. DAC is a quantum-resistant blockchain with post-quantum cryptographic resilience."
  keywords={["dachain", "dac quantum chain", "dac wallet checker", "quantum resistant", "testnet"]}
  canonicalUrl="https://cryptowalletsx.com/dachain"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'DAC Quantum Chain Wallet Checker',
    url: 'https://cryptowalletsx.com/dachain',
    description: 'Check DAC Quantum Chain testnet wallet stats, scores, transaction history, and DAC balance analytics.',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
  }}
/>

{#if dachainWalletStore.address}
  <WalletScreen
    address={dachainWalletStore.address}
    activeTab={dachainWalletStore.activeTab}
    onTabChange={(tab) => dachainWalletStore.setActiveTab(tab)}
    onReset={() => dachainWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => dachainWalletStore.setAddress(addr)} />
{/if}
