<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import { Info, Shield, Zap, Globe, BarChart3, Coins, Users, Rocket } from 'lucide-svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="About CryptoWalletsx"
  description="Learn about CryptoWalletsx - the free multi-chain crypto wallet analytics platform providing wallet scores, DeFi analysis, and bridge tracking across 10+ blockchains."
  canonicalUrl="https://cryptowalletsx.com/about"
/>

<div class="min-h-screen flex flex-col">
  <HomeHeader />
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
        <Info class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold gradient-text">About CryptoWalletsX</h1>
        <p class="text-sm text-muted-foreground">Your Multi-Chain Analytics Powerhouse</p>
      </div>
    </div>

    <div class="space-y-8">
      <section>
        <h2 class="text-2xl font-bold mb-4 text-foreground">Our Mission</h2>
        <p class="text-muted-foreground text-lg leading-relaxed">
          CryptoWalletsX was built with a simple yet powerful mission: to make blockchain analytics accessible, accurate, and visually intuitive for everyone. Whether you're a seasoned DeFi degenerate tracking your testnet activity or a newcomer exploring on-chain data for the first time, our platform provides the tools you need to understand wallet behavior, track scores, and gain deep insights into blockchain networks — all without requiring wallet connections or sharing personal data.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4 text-foreground">What We Offer</h2>
        <div class="grid sm:grid-cols-2 gap-5">
          <div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
            <div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-3">
              <BarChart3 class="w-5 h-5 text-cyan-500" />
            </div>
            <h3 class="font-bold mb-2">Wallet Scoring</h3>
            <p class="text-sm text-muted-foreground">Our logarithmic scoring algorithm evaluates wallet activity across multiple dimensions — transactions, contract interactions, DeFi participation, NFT minting, and more — to produce a comprehensive score that reflects your on-chain footprint.</p>
          </div>

          <div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
            <div class="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-3">
              <Shield class="w-5 h-5 text-teal-500" />
            </div>
            <h3 class="font-bold mb-2">Approval Tracking</h3>
            <p class="text-sm text-muted-foreground">Monitor and manage your token approvals across supported chains. View which contracts have access to your tokens and understand the security implications of your approval history at a glance.</p>
          </div>

          <div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
            <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-3">
              <Coins class="w-5 h-5 text-amber-500" />
            </div>
            <h3 class="font-bold mb-2">Portfolio Analysis</h3>
            <p class="text-sm text-muted-foreground">Get a comprehensive view of your on-chain portfolio including token balances, NFT holdings, DeFi positions, and historical activity patterns. Visualize your blockchain journey with rich charts and metrics.</p>
          </div>

          <div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
            <div class="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center mb-3">
              <Zap class="w-5 h-5 text-rose-500" />
            </div>
            <h3 class="font-bold mb-2">DeFi Insights</h3>
            <p class="text-sm text-muted-foreground">Track your DeFi activities across protocols — from swaps and liquidity provision to staking and bridging. Understand which protocols you interact with most and how your DeFi behavior contributes to your overall score.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4 text-foreground">Supported Networks</h2>
        <p class="text-muted-foreground text-lg leading-relaxed mb-4">
          CryptoWalletsX currently provides analytics for the following blockchain networks, with more chains being added regularly:
        </p>
        <div class="space-y-4">
          <div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
                <Globe class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-bold">Arc Testnet</h3>
                <span class="text-xs font-mono text-muted-foreground">Chain ID: 5042002 • Native: USDC</span>
              </div>
            </div>
            <p class="text-sm text-muted-foreground">Arc is a Circle-powered testnet offering USDC as the native gas token. Track your wallet score, DeFi activity, NFT mints, and transaction patterns on this emerging network.</p>
          </div>

          <div class="p-5 rounded-xl bg-card/60 border border-border/40 glass-card">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                <Globe class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-bold">SimpleChain</h3>
                <span class="text-xs font-mono text-muted-foreground">Chain ID: 1913 • Native: SRW</span>
              </div>
            </div>
            <p class="text-sm text-muted-foreground">SimpleChain is an EVM-compatible blockchain with SRW as its native token. Analyze wallet activity, contract interactions, and network participation on this testnet ecosystem.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4 text-foreground">Our Technology</h2>
        <p class="text-muted-foreground text-lg leading-relaxed">
          CryptoWalletsX is built with modern web technologies for speed, reliability, and a seamless user experience. Our frontend is powered by SvelteKit with Cloudflare Pages for lightning-fast global delivery. We use Blockscout-compatible APIs to fetch real-time on-chain data, and our scoring algorithm uses logarithmic diminishing returns to produce accurate, fair wallet scores that align with industry-standard analytics tools. All data processing happens client-side or through our lightweight API proxy — we never store your personal data or wallet information on our servers.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4 text-foreground">Open Source & Community</h2>
        <p class="text-muted-foreground text-lg leading-relaxed">
          We believe in the power of open source and community-driven development. CryptoWalletsX is continuously improved based on user feedback and community contributions. If you have feature suggestions, bug reports, or want to contribute to the project, we'd love to hear from you. Visit our <a href="/contact" class="text-cyan-500 hover:underline">Contact page</a> to get in touch or join our Discord community for real-time discussions about blockchain analytics and upcoming features.
        </p>
      </section>
    </div>
  </main>
  <Footer />
</div>
