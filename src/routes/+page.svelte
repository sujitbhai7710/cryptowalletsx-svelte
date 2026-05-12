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
  import AdUnit from '$lib/components/AdUnit.svelte';
</script>

<SEO
  title="CryptoWalletsx - Multi-Chain Wallet Analytics & Stats Checker"
  description="Free multi-chain crypto wallet analytics. Check wallet scores, DeFi activity, and bridge stats across 10+ blockchains including Arc, Base, and Ink."
  keywords={["crypto wallet analytics", "blockchain stats checker", "wallet score", "multi-chain", "DeFi analytics", "bridge tracker"]}
  canonicalUrl="https://cryptowalletsx.com/"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://cryptowalletsx.com/#organization',
        name: 'CryptoWalletsX',
        url: 'https://cryptowalletsx.com',
        logo: 'https://cryptowalletsx.com/favicon.png',
        sameAs: [
          'https://twitter.com/cryptowalletsx',
          'https://github.com/Sujhavsingh/cryptowalletsx-svelte'
        ]
      },
      {
        '@type': 'WebSite',
        '@id': 'https://cryptowalletsx.com/#website',
        url: 'https://cryptowalletsx.com',
        name: 'CryptoWalletsX',
        description: 'Multi-Chain Blockchain Analytics Platform',
        publisher: { '@id': 'https://cryptowalletsx.com/#organization' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://cryptowalletsx.com/checker?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }
    ]
  }}
/>

<div class="min-h-screen flex flex-col dot-grid overflow-x-hidden">
  <HomeHeader />
  <main class="flex-1">
    <HeroSection />
    <!-- Ad: Below Hero / Above Tools -->
    <div class="max-w-7xl mx-auto px-4">
      <AdUnit slot="auto" format="horizontal" style="min-height:90px" />
    </div>
    <ToolsGrid />
    <HowItWorks />
    <!-- Ad: Middle of Page -->
    <div class="max-w-7xl mx-auto px-4">
      <AdUnit slot="auto" format="horizontal" style="min-height:90px" />
    </div>
    <SupportedNetworks />
    <WhyChooseUs />
    <AirdropSection />
    <!-- Ad: Above CTA / Before Footer -->
    <div class="max-w-7xl mx-auto px-4">
      <AdUnit slot="auto" format="horizontal" style="min-height:90px" />
    </div>
    <CTASection />
  </main>
  <Footer />
</div>
