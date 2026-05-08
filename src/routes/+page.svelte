<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import HeroSection from '$lib/components/home/HeroSection.svelte';
  import ToolsGrid from '$lib/components/home/ToolsGrid.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="CryptoWalletsx - Multi-Chain Crypto Wallet Analytics & Stats Checker"
  description="Free multi-chain crypto wallet analytics platform. Check wallet scores, transaction history, DeFi activity, and bridge analytics across 10+ blockchains including Arc, Base, Ink, Relay, and Jumper."
  keywords={["crypto wallet analytics", "blockchain stats checker", "wallet score", "multi-chain", "DeFi analytics", "bridge tracker"]}
  canonicalUrl="https://cryptowalletsx.com"
/>

<div class="min-h-screen flex flex-col dot-grid">
  <HomeHeader />
  <main class="flex-1">
    <HeroSection />
    <ToolsGrid />
  </main>
  <Footer />
</div>
