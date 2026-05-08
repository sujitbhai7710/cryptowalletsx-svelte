<script lang="ts">
  import { baseWalletStore } from '$lib/stores/wallet.svelte';
  import { fetchBlockscoutData } from '$lib/utils/api';
  import HomeScreen from '$lib/components/base/HomeScreen.svelte';
  import WalletScreen from '$lib/components/base/WalletScreen.svelte';
  import { BASE_CONFIG } from '$lib/utils/constants';
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
    if (!baseWalletStore.address) return;
    isLoading = true;
    fetchError = null;
    try {
      const result = await fetchBlockscoutData(baseWalletStore.address, BASE_CONFIG);
      addressDetails = result.addressDetails;
      transactions = result.transactions;
      tokenTransfers = result.tokenTransfers;
      tokenBalances = result.tokenBalances;
      nfts = result.nfts;
      allTokens = result.allTokens;
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        fetchError = `Request timed out. The ${BASE_CONFIG.name} API is taking too long to respond. Please try again.`;
      } else {
        fetchError = err?.message || `Failed to load wallet data from ${BASE_CONFIG.name}. Please check the address and try again.`;
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
    if (baseWalletStore.address) {
      fetchAllData();
    }
  });
</script>

<SEO
  title="Base Complete Guide"
  description="Check Base mainnet wallet stats, scores, transaction history, DeFi activity, and ETH balance analytics. Base is an Ethereum L2 built by Coinbase."
  keywords={["base chain", "base wallet", "coinbase base", "base stats", "l2 analytics"]}
  canonicalUrl="https://cryptowalletsx.com/base"
/>

{#if baseWalletStore.address}
  <WalletScreen
    address={baseWalletStore.address}
    activeTab={baseWalletStore.activeTab}
    onTabChange={(tab) => baseWalletStore.setActiveTab(tab)}
    onReset={() => baseWalletStore.reset()}
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
  <HomeScreen onAddressSubmit={(addr) => baseWalletStore.setAddress(addr)} />
{/if}
