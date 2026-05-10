<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import HeroSection from '$lib/components/home/HeroSection.svelte';
  import ToolsGrid from '$lib/components/home/ToolsGrid.svelte';
  import HowItWorks from '$lib/components/home/HowItWorks.svelte';
  import SupportedNetworks from '$lib/components/home/SupportedNetworks.svelte';
  import WhyChooseUs from '$lib/components/home/WhyChooseUs.svelte';
  import AirdropSection from '$lib/components/home/AirdropSection.svelte';
  import CTASection from '$lib/components/home/CTASection.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="CryptoWalletsx - Multi-Chain Crypto Wallet Analytics & Stats Checker"
  description="Free multi-chain crypto wallet analytics platform. Check wallet scores, transaction history, DeFi activity, and bridge analytics across 10+ blockchains including Arc, Base, Ink, Relay, and Jumper."
  keywords={["crypto wallet analytics", "blockchain stats checker", "wallet score", "multi-chain", "DeFi analytics", "bridge tracker"]}
  canonicalUrl="https://cryptowalletsx.com"
/>

<div class="min-h-screen flex flex-col dot-grid overflow-x-hidden">
  <HomeHeader />
  <main class="flex-1">
    <HeroSection />
    <ToolsGrid />
    <HowItWorks />
    <SupportedNetworks />
    <WhyChooseUs />
    <AirdropSection />
    <CTASection />
  </main>
  <Footer />
</div>
