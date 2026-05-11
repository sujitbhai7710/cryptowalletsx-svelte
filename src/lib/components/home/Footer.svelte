<script lang="ts">
  import { Zap, Globe, ExternalLink, MessageCircle } from 'lucide-svelte';
</script>

<footer class="border-t border-border/40 bg-card/30 mt-auto">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 py-8">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <!-- Brand -->
      <div class="flex flex-col items-center md:items-start gap-2">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
            <Zap class="w-4 h-4 text-white" />
          </div>
          <span class="font-bold text-lg gradient-text">CryptoWalletsX</span>
        </div>
        <p class="text-xs text-muted-foreground">
          Powered by Blockscout &amp; Etherscan APIs
        </p>
      </div>

      <!-- Quick Links -->
      <div class="flex flex-wrap items-center justify-center gap-4 text-sm">
        <a href="/about" class="text-muted-foreground hover:text-foreground transition-colors">About</a>
        <a href="/contact" class="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        <a href="/privacy" class="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a>
        <a href="/arc" class="text-muted-foreground hover:text-foreground transition-colors">Arc Testnet</a>
        <a href="/simplechain" class="text-muted-foreground hover:text-foreground transition-colors">SimpleChain</a>
      </div>

      <!-- Social links -->
      <div class="flex items-center gap-3">
        <a
          href="https://twitter.com/cryptowalletsx"
          target="_blank"
          rel="noopener noreferrer"
          class="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-cyan-500/15 hover:text-cyan-500 flex items-center justify-center transition-colors"
          title="Twitter / X"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
        </a>
        <a
          href="https://github.com/Sujhavsingh/cryptowalletsx-svelte"
          target="_blank"
          rel="noopener noreferrer"
          class="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-cyan-500/15 hover:text-cyan-500 flex items-center justify-center transition-colors"
          title="GitHub"
        >
          <ExternalLink class="w-4 h-4" />
        </a>
        <a
          href="https://discord.gg/cryptowalletsx"
          target="_blank"
          rel="noopener noreferrer"
          class="w-9 h-9 rounded-lg bg-secondary/60 hover:bg-cyan-500/15 hover:text-cyan-500 flex items-center justify-center transition-colors"
          title="Discord"
        >
          <MessageCircle class="w-4 h-4" />
        </a>
      </div>
    </div>

    <div class="mt-6 pt-4 border-t border-border/20 text-center">
      <p class="text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()} CryptoWalletsX. All rights reserved. Not financial advice.
      </p>
    </div>
  </div>
</footer>
