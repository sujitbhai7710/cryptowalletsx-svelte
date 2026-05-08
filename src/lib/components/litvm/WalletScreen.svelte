<script lang="ts">
  import WalletScreen from '$lib/components/arc/WalletScreen.svelte';
  import { LITVM_CONFIG } from '$lib/utils/constants';
  import type { WalletTab, AddressDetails, Transaction, TokenTransfer, TokenBalance, NFTItem, AllToken } from '$lib/types';

  interface Props {
    address: string;
    activeTab: WalletTab;
    onTabChange: (tab: WalletTab) => void;
    onReset: () => void;
    addressDetails: AddressDetails | null;
    transactions: Transaction[];
    tokenTransfers: TokenTransfer[];
    tokenBalances: TokenBalance[];
    nfts: NFTItem[];
    allTokens: AllToken[];
    isLoading: boolean;
    fetchError: string | null;
    onRetry: () => void;
    isRefreshing: boolean;
    onRefresh: () => void;
  }

  let { address, activeTab, onTabChange, onReset, addressDetails, transactions, tokenTransfers, tokenBalances, nfts, allTokens, isLoading, fetchError, onRetry, isRefreshing, onRefresh }: Props = $props();
</script>

<WalletScreen {address} {activeTab} config={LITVM_CONFIG} {onTabChange} {onReset} {addressDetails} {transactions} {tokenTransfers} {tokenBalances} {nfts} {allTokens} {isLoading} {fetchError} {onRetry} {isRefreshing} {onRefresh} />
