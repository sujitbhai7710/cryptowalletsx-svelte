<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import { Mail, MessageCircle, Globe, Zap } from 'lucide-svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Contact Us - CryptoWalletsx"
  description="Get in touch with the CryptoWalletsx team. Reach us via email, Discord, or Twitter."
  canonicalUrl="https://cryptowalletsx.com/contact"
/>

<div class="min-h-screen flex flex-col">
  <HomeHeader />
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
        <Mail class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold gradient-text">Contact Us</h1>
        <p class="text-sm text-muted-foreground">We'd love to hear from you</p>
      </div>
    </div>

    <div class="space-y-8">
      <p class="text-muted-foreground text-lg leading-relaxed">
        Whether you have a question about our platform, need technical support, want to report a bug, or have suggestions for new features — our team is here to help. We value every piece of feedback as it helps us improve CryptoWalletsX for the entire community.
      </p>

      <div class="grid sm:grid-cols-2 gap-6">
        <div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card card-hover-lift">
          <div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
            <Mail class="w-5 h-5 text-cyan-500" />
          </div>
          <h3 class="font-bold text-lg mb-2">Email</h3>
          <p class="text-sm text-muted-foreground mb-3">For general inquiries, partnerships, and business-related questions.</p>
          <a href="mailto:contact@cryptowalletsx.com" class="text-cyan-500 hover:underline text-sm font-medium">
            contact@cryptowalletsx.com
          </a>
        </div>

        <div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card card-hover-lift">
          <div class="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mb-4">
            <MessageCircle class="w-5 h-5 text-teal-500" />
          </div>
          <h3 class="font-bold text-lg mb-2">Discord</h3>
          <p class="text-sm text-muted-foreground mb-3">Join our community for real-time support, discussions, and updates.</p>
          <a href="https://discord.gg/cryptowalletsx" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline text-sm font-medium">
            Join our Discord Server
          </a>
        </div>

        <div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card card-hover-lift">
          <div class="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
            <svg class="w-5 h-5 text-cyan-500" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
          </div>
          <h3 class="font-bold text-lg mb-2">Twitter / X</h3>
          <p class="text-sm text-muted-foreground mb-3">Follow us for the latest updates, feature announcements, and crypto insights.</p>
          <a href="https://twitter.com/cryptowalletsx" target="_blank" rel="noopener noreferrer" class="text-cyan-500 hover:underline text-sm font-medium">
            @cryptowalletsx
          </a>
        </div>

        <div class="p-6 rounded-xl bg-card/60 border border-border/40 glass-card card-hover-lift">
          <div class="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4">
            <Zap class="w-5 h-5 text-amber-500" />
          </div>
          <h3 class="font-bold text-lg mb-2">Bug Reports</h3>
          <p class="text-sm text-muted-foreground mb-3">Found a bug? Let us know with details so we can fix it quickly.</p>
          <a href="mailto:bugs@cryptowalletsx.com" class="text-cyan-500 hover:underline text-sm font-medium">
            bugs@cryptowalletsx.com
          </a>
        </div>
      </div>

      <div class="p-6 rounded-xl bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/20">
        <h3 class="font-bold text-lg mb-3">Frequently Asked Questions</h3>
        <div class="space-y-4">
          <div>
            <h4 class="font-semibold text-sm text-foreground mb-1">Is CryptoWalletsX free to use?</h4>
            <p class="text-sm text-muted-foreground">Yes, CryptoWalletsX is completely free. We provide blockchain analytics for supported testnets at no cost to users.</p>
          </div>
          <div>
            <h4 class="font-semibold text-sm text-foreground mb-1">Do I need to connect my wallet?</h4>
            <p class="text-sm text-muted-foreground">No. Simply enter any public wallet address to view analytics. We never request wallet connections that could access your funds.</p>
          </div>
          <div>
            <h4 class="font-semibold text-sm text-foreground mb-1">How accurate is the score calculation?</h4>
            <p class="text-sm text-muted-foreground">Our scoring algorithm uses logarithmic diminishing returns to calculate wallet activity scores, designed to match industry-standard analytics platforms within 1 point accuracy.</p>
          </div>
          <div>
            <h4 class="font-semibold text-sm text-foreground mb-1">Which chains are supported?</h4>
            <p class="text-sm text-muted-foreground">Currently, we support Arc Testnet and SimpleChain. We are actively working on adding support for more testnets and mainnet chains.</p>
          </div>
        </div>
      </div>
    </div>
  </main>
  <Footer />
</div>
