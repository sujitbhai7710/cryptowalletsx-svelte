<script lang="ts">
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import { Shield } from 'lucide-svelte';
  import SEO from '$lib/components/SEO.svelte';
</script>

<SEO
  title="Privacy Policy - CryptoWalletsx"
  description="Privacy policy for CryptoWalletsx multi-chain crypto wallet analytics platform."
  canonicalUrl="https://cryptowalletsx.com/privacy"
/>

<div class="min-h-screen flex flex-col">
  <HomeHeader />
  <main class="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12">
    <div class="flex items-center gap-3 mb-8">
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center">
        <Shield class="w-6 h-6 text-white" />
      </div>
      <div>
        <h1 class="text-3xl sm:text-4xl font-bold gradient-text">Privacy Policy</h1>
        <p class="text-sm text-muted-foreground">Last updated: May 2026</p>
      </div>
    </div>

    <div class="prose prose-slate dark:prose-invert max-w-none space-y-8">
      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">1. Introduction</h2>
        <p class="text-muted-foreground leading-relaxed">
          CryptoWalletsX ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard information when you use our website at cryptowalletsx.com (the "Service"). By accessing or using our Service, you agree to the collection and use of information in accordance with this policy. We believe in transparency and minimal data collection — our platform is designed to provide blockchain analytics without compromising your personal information.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">2. Information We Collect</h2>
        <p class="text-muted-foreground leading-relaxed mb-4">
          CryptoWalletsX operates as a blockchain analytics tool that fetches publicly available on-chain data. We adhere to a minimal data collection philosophy:
        </p>
        <div class="space-y-4">
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Wallet Addresses You Enter</h3>
            <p class="text-sm text-muted-foreground">When you input a wallet address for analysis, it is processed client-side and used to fetch publicly available blockchain data from third-party APIs (Blockscout). We do not store wallet addresses on our servers unless you explicitly save them in your browser's local storage.</p>
          </div>
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Automatically Collected Data</h3>
            <p class="text-sm text-muted-foreground">We may collect basic analytics data such as page views, browser type, device type, and general geographic region. This data is aggregated and anonymized — it cannot be used to identify you personally. We use this solely to improve the user experience and optimize performance of our platform.</p>
          </div>
          <div class="p-4 rounded-xl bg-card/60 border border-border/40">
            <h3 class="font-semibold text-foreground mb-2">Data We Do NOT Collect</h3>
            <p class="text-sm text-muted-foreground">We do not collect private keys, seed phrases, passwords, or any sensitive cryptographic material. We never ask you to connect your wallet in a way that grants us access to your funds. Our analytics are read-only and do not require wallet connection or authentication.</p>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">3. How We Use Information</h2>
        <p class="text-muted-foreground leading-relaxed">
          The limited information we collect is used exclusively for the following purposes: providing and maintaining our blockchain analytics services, improving the functionality and user experience of our platform, displaying relevant on-chain data and statistics, ensuring the security and stability of our services, and complying with applicable legal requirements. We do not sell, rent, or trade any user data to third parties under any circumstances. Your blockchain queries remain private and are not shared with advertisers or data brokers.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">4. Third-Party Services</h2>
        <p class="text-muted-foreground leading-relaxed">
          Our Service relies on third-party blockchain APIs to fetch on-chain data. These include Blockscout APIs for Arc Testnet and SimpleChain data. When you query a wallet address, your browser makes direct requests to these APIs. Please note that these third-party services have their own privacy policies, and we encourage you to review them. We are not responsible for the privacy practices of these external services, though we carefully select partners who share our commitment to user privacy.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">5. Cookies and Local Storage</h2>
        <p class="text-muted-foreground leading-relaxed">
          CryptoWalletsX uses minimal local storage to save your preferences such as theme selection (dark/light mode). We do not use tracking cookies or advertising cookies. Any data stored locally on your device can be cleared at any time through your browser settings. We respect your browser's Do Not Track settings and do not engage in cross-site tracking or behavioral profiling.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">6. Data Security</h2>
        <p class="text-muted-foreground leading-relaxed">
          We implement industry-standard security measures to protect the information transmitted through our Service. All communications between your browser and our servers are encrypted using HTTPS/TLS protocols. Since we collect minimal personal data, the risk of data exposure is significantly reduced. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security of any information transmitted to or through our platform.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">7. Your Rights</h2>
        <p class="text-muted-foreground leading-relaxed">
          You have the right to access, correct, or delete any personal information we hold about you. Since we collect minimal data, most actions you take on our platform are not tied to personal identifiers. You can clear any locally stored preferences at any time through your browser settings. If you have questions about your data or wish to exercise your rights under applicable data protection laws (including GDPR or CCPA), please contact us through our Contact page.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">8. Changes to This Policy</h2>
        <p class="text-muted-foreground leading-relaxed">
          We may update this Privacy Policy from time to time to reflect changes in our practices or for legal, operational, or regulatory reasons. We will post the updated policy on this page with a revised "Last updated" date. Your continued use of the Service after any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this page periodically for the latest information on our privacy practices.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-bold mb-3 text-foreground">9. Contact Us</h2>
        <p class="text-muted-foreground leading-relaxed">
          If you have any questions about this Privacy Policy or our data practices, please reach out to us through our <a href="/contact" class="text-cyan-500 hover:underline">Contact page</a>. We aim to respond to all privacy-related inquiries within 48 hours.
        </p>
      </section>
    </div>
  </main>
  <Footer />
</div>
