<script lang="ts">
  import {
    Search, Shield, Award, Check, X, Loader2, AlertCircle,
    Share2, Info, ChevronDown, ChevronUp, Copy as CopyIcon, CheckCircle2, XCircle
  } from 'lucide-svelte';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';

  const ALCHEMY_BASE = 'https://soneium-mainnet.g.alchemy.com/nft/v3/FBKOVxVYW0yobV1ntzs7u5qM0E6_xRwO';

  const OG_BADGE_CONTRACT = '0x2A21B17E366836e5FFB19bd47edB03b4b551C89d';

  const OG_BADGES = [
    { name: 'OG Badge', tokenId: '0', contract: OG_BADGE_CONTRACT, type: 'ERC1155' as const, description: 'Original Soneium OG Badge' },
    { name: 'Premium OG Badge', tokenId: '1', contract: OG_BADGE_CONTRACT, type: 'ERC1155' as const, description: 'Premium Soneium OG Badge' },
  ];

  const ECOSYSTEM_BADGES: { name: string; contract: string; type: 'ERC721' }[] = [
    { name: '2P2E', contract: '0x8918531fC73f2c9047f0163eA126EeD1B8EA2c63', type: 'ERC721' },
    { name: 'Arkada', contract: '0x391Dece93d18Fca922bF337C25Ee38BeA74Db63E', type: 'ERC721' },
    { name: 'Biru', contract: '0x44EEfAC1D5Db283B2dD99e226B864da271D82952', type: 'ERC721' },
    { name: 'CONFT', contract: '0x7A475a650a4867577cf488E94ec023E593997fd6', type: 'ERC721' },
    { name: 'CoPump', contract: '0x39C5DfF4e39779492C3AE3898c8d5a0579fE684e', type: 'ERC721' },
    { name: 'HandsNFT AI', contract: '0x670113b4AE5416E1368669bE1cdcc918871827eA', type: 'ERC721' },
    { name: 'NFTs2Me', contract: '0x4591D540B692CBeD60Db7781B7683910f7a3BF8C', type: 'ERC721' },
    { name: 'Quickswap', contract: '0x5C0221a8c3eB5956b70cDC572fA0F6C952274f1A', type: 'ERC721' },
    { name: 'Sake', contract: '0x3a634e6f8C2bf2C5894722B908d99e3cF9C62eD3', type: 'ERC721' },
    { name: 'SoneFi', contract: '0x6DD843fe15dbFD41F001d448cb246ac8b65a6027', type: 'ERC721' },
    { name: 'Sonova', contract: '0x4A33e2E308E5d9C0188d209F1bF443Ff7CfB4A31', type: 'ERC721' },
    { name: 'Sonus', contract: '0x066ABA7c3520e300113C0515FF41c084eE0c95Ea', type: 'ERC721' },
    { name: 'SuperVol', contract: '0x55E906C6Fb98894f05E1a7A533d77732B79a5414', type: 'ERC721' },
    { name: 'SynStation', contract: '0x0DEc30Af3551161606282a6bc1243526b6a3D1E9', type: 'ERC721' },
    { name: 'UntitledBank', contract: '0xcf87B2d5Ab008D41159f6737E2a5b6a3Bc40b753', type: 'ERC721' },
    { name: 'Velodrome', contract: '0x2DCD9B33F0721000Dc1F8f84B804d4CFA23d7713', type: 'ERC721' },
    { name: 'waveX', contract: '0x4a3b67b339c272fAb639B0CAF3Ce7852B2Aa0833', type: 'ERC721' },
    { name: 'Layer3', contract: '0x83A0C5D831E7869f4c710658CBD1b455Ba92ad00', type: 'ERC721' },
    { name: 'Moon Medal', contract: '0xeAF42993E44be62c9113161c0016821C6A540B92', type: 'ERC721' },
    { name: 'KYO FINANCE', contract: '0x11B2876C58cFb7501Db60d0112AF8A8EfEB0A81D', type: 'ERC721' },
    { name: 'SONEX GOAT', contract: '0xAa6c38A85e5781bCc410693B52F64EfF1aFcd3c6', type: 'ERC721' },
    { name: 'Owlto X Soneium', contract: '0x1eC6AACC79f3c4817d7fea2268e1c54C6b2662Fb', type: 'ERC721' },
    { name: 'Orbiter x Soneium', contract: '0xc59f0D1B1b614d8446dDe1760fc3e6ae57bF9501', type: 'ERC721' },
    { name: 'Fractal Visions', contract: '0x1833e394D879D9b493cdb0fe754F304f2E9F23bf', type: 'ERC721' },
    { name: 'Mithraeum', contract: '0x9d83A657581A966aDf1c346dAfEe3EBe258EC26D', type: 'ERC721' },
    { name: 'Omnihub', contract: '0x7e058E9eeb81758F80049d0F2c1C1A7b47919697', type: 'ERC721' },
    { name: 'XSTAR', contract: '0x690B97980877b5d7915E89E6D0Cb9748A8bdAB8d', type: 'ERC721' },
    { name: 'Posse', contract: '0x890a19A1Dd75AAEcc4eDFce4685bb59C8ABEe78A', type: 'ERC721' },
    { name: 'Unemeta', contract: '0xCA707D22E248740aDaA9C63580F7A35201B18d30', type: 'ERC721' },
    { name: 'Arcas Games', contract: '0x9a4cC369A91AE5e8cBd99163a2eAC5b7957879dB', type: 'ERC721' },
  ];

  type FilterTab = 'All' | 'Owned' | 'Not Owned';

  // State
  let inputAddress = $state('');
  let address = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let activeFilter = $state<FilterTab>('All');
  let searchQuery = $state('');
  let isLoaded = $state(false);
  let copiedAddress = $state(false);
  let infoExpanded = $state(false);

  // Badge ownership data
  let ownedOGBadges = $state<{ name: string; tokenId: string; image?: string; owned: boolean }[]>([]);
  let notOwnedOGBadges = $state<{ name: string; tokenId: string; image?: string; owned: boolean }[]>([]);
  let ownedEcosystemBadges = $state<{ name: string; contract: string; image?: string; tokenId?: string; owned: boolean }[]>([]);
  let notOwnedEcosystemBadges = $state<{ name: string; contract: string; image?: string; tokenId?: string; owned: boolean }[]>([]);

  // Derived
  let ogOwnedCount = $derived(ownedOGBadges.length);
  let ogTotalCount = $derived(OG_BADGES.length);
  let ecoOwnedCount = $derived(ownedEcosystemBadges.length);
  let ecoTotalCount = $derived(ECOSYSTEM_BADGES.length);
  let totalOwned = $derived(ogOwnedCount + ecoOwnedCount);
  let totalBadges = $derived(ogTotalCount + ecoTotalCount);
  let ownershipPercent = $derived(totalBadges > 0 ? Math.round((totalOwned / totalBadges) * 100) : 0);

  let filteredEcosystemBadges = $derived.by(() => {
    let badges = [...ownedEcosystemBadges, ...notOwnedEcosystemBadges];

    if (activeFilter === 'Owned') {
      badges = badges.filter(b => b.owned);
    } else if (activeFilter === 'Not Owned') {
      badges = badges.filter(b => !b.owned);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      badges = badges.filter(b => b.name.toLowerCase().includes(q));
    }

    // Sort: owned first
    return badges.sort((a, b) => (b.owned ? 1 : 0) - (a.owned ? 1 : 0));
  });

  let filteredOGBadges = $derived.by(() => {
    let badges = [...ownedOGBadges, ...notOwnedOGBadges];

    if (activeFilter === 'Owned') {
      badges = badges.filter(b => b.owned);
    } else if (activeFilter === 'Not Owned') {
      badges = badges.filter(b => !b.owned);
    }

    return badges;
  });

  let shareText = $derived(() => {
    if (!address) return '';
    return `🟣 Soneium Badge Checker\n\n🏆 Badges Owned: ${totalOwned}/${totalBadges} (${ownershipPercent}%)\n🎖️ OG Badges: ${ogOwnedCount}/${ogTotalCount}\n🌟 Ecosystem Badges: ${ecoOwnedCount}/${ecoTotalCount}\n\nCheck yours at cryptowalletsx.com/soneium-badge-checker`;
  });

  // Fetch
  async function fetchBadges(addr: string) {
    isLoading = true;
    error = null;
    isLoaded = false;

    try {
      // Build Alchemy URL with all contract addresses
      const allContracts = [OG_BADGE_CONTRACT, ...ECOSYSTEM_BADGES.map(b => b.contract)];
      const contractParams = allContracts.map(c => `contractAddresses[]=${c}`).join('&');
      const url = `${ALCHEMY_BASE}/getNFTsForOwner?owner=${addr}&withMetadata=true&${contractParams}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data = await res.json();
      const ownedNfts: any[] = data?.ownedNfts || [];

      // Group by contract address
      const byContract = new Map<string, any[]>();
      for (const nft of ownedNfts) {
        const contractAddr = (nft?.contract?.address || '').toLowerCase();
        if (!byContract.has(contractAddr)) {
          byContract.set(contractAddr, []);
        }
        byContract.get(contractAddr)!.push(nft);
      }

      // Process OG Badges (ERC1155)
      const ownedOG: typeof ownedOGBadges = [];
      const notOwnedOG: typeof notOwnedOGBadges = [];

      const ogNfts = byContract.get(OG_BADGE_CONTRACT.toLowerCase()) || [];
      const ownedTokenIds = new Set<string>();

      for (const nft of ogNfts) {
        const tokenId = nft?.id?.tokenId || nft?.tokenId || '';
        const balance = parseInt(nft?.balance || '1');
        if (balance > 0) {
          ownedTokenIds.add(tokenId);
        }
      }

      for (const badge of OG_BADGES) {
        const isOwned = ownedTokenIds.has(badge.tokenId);
        const nftData = ogNfts.find((n: any) => {
          const tid = n?.id?.tokenId || n?.tokenId || '';
          return tid === badge.tokenId;
        });
        const image = nftData?.image?.cachedUrl || nftData?.image?.thumbnailUrl || nftData?.image?.pngUrl || nftData?.image?.originalUrl || nftData?.media?.[0]?.gateway || undefined;

        if (isOwned) {
          ownedOG.push({ name: badge.name, tokenId: badge.tokenId, image, owned: true });
        } else {
          notOwnedOG.push({ name: badge.name, tokenId: badge.tokenId, image, owned: false });
        }
      }

      ownedOGBadges = ownedOG;
      notOwnedOGBadges = notOwnedOG;

      // Process Ecosystem Badges (ERC721)
      const ownedEco: typeof ownedEcosystemBadges = [];
      const notOwnedEco: typeof notOwnedEcosystemBadges = [];

      for (const badge of ECOSYSTEM_BADGES) {
        const nfts = byContract.get(badge.contract.toLowerCase()) || [];
        const isOwned = nfts.length > 0 && nfts.some((n: any) => parseInt(n?.balance || '1') > 0);

        if (isOwned) {
          const nftData = nfts[0];
          const image = nftData?.image?.cachedUrl || nftData?.image?.thumbnailUrl || nftData?.image?.pngUrl || nftData?.image?.originalUrl || nftData?.media?.[0]?.gateway || undefined;
          const tokenId = nftData?.id?.tokenId || nftData?.tokenId || undefined;
          ownedEco.push({ name: badge.name, contract: badge.contract, image, tokenId, owned: true });
        } else {
          notOwnedEco.push({ name: badge.name, contract: badge.contract, owned: false });
        }
      }

      ownedEcosystemBadges = ownedEco;
      notOwnedEcosystemBadges = notOwnedEco;
      isLoaded = true;
    } catch (err: any) {
      error = err?.message || 'Failed to fetch badge data. Please try again.';
    } finally {
      isLoading = false;
    }
  }

  function handleSubmit() {
    const addr = inputAddress.trim();
    if (!addr) return;
    if (!/^0x[a-fA-F0-9]{40}$/.test(addr)) {
      error = 'Please enter a valid Ethereum address (0x...)';
      return;
    }
    address = addr;
    fetchBadges(addr);
  }

  function copyAddr() {
    if (!address) return;
    navigator.clipboard.writeText(address);
    copiedAddress = true;
    setTimeout(() => { copiedAddress = false; }, 2000);
  }

  function shareOnTwitter() {
    const text = encodeURIComponent(shareText());
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  }

  function truncateAddress(addr: string): string {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function getBlockscoutUrl(contract: string, tokenId?: string): string {
    if (tokenId) {
      return `https://soneium.blockscout.com/token/${contract}/instance/${tokenId}`;
    }
    return `https://soneium.blockscout.com/token/${contract}`;
  }
</script>

<SEO
  title="Soneium Badge Checker"
  description="Check your Soneium OG badges and ecosystem badges. Verify which Soneium NFT badges you own including OG, Premium OG, and 30+ ecosystem partner badges."
  keywords={["soneium badge", "soneium og badge", "soneium ecosystem", "soneium nft", "badge checker", "soneium airdrop"]}
  canonicalUrl="https://cryptowalletsx.com/soneium-badge-checker"
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <main class="flex-1">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-indigo-500/5 to-violet-500/5"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-purple-500/8 via-indigo-500/5 to-violet-500/8 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-16 left-[10%] w-12 h-12 border border-purple-500/15 rounded-lg float-animation rotate-45"></div>
        <div class="absolute top-28 right-[15%] w-8 h-8 border border-indigo-500/15 rounded-full float-slow-animation"></div>
        <div class="absolute bottom-16 left-[30%] w-5 h-5 bg-violet-500/8 rounded-md float-animation" style="animation-delay:2s"></div>
        <div class="absolute top-48 left-[60%] w-6 h-6 bg-purple-500/6 rounded-full float-slow-animation" style="animation-delay:1s"></div>
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <Award class="w-4 h-4 text-purple-400" />
          <span class="text-sm font-medium bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Badge Checker</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Soneium Badge Checker</span>
        </h1>
        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Check which Soneium OG badges and ecosystem badges your wallet holds. Verify your on-chain achievements.
        </p>

        <!-- Address Input -->
        <div class="max-w-2xl mx-auto">
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                bind:value={inputAddress}
                onkeydown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="Enter wallet address (0x...)"
                class="w-full pl-11 pr-4 h-12 bg-card/60 border border-border/40 backdrop-blur-xl rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
              />
            </div>
            <button
              onclick={handleSubmit}
              disabled={isLoading}
              class="h-12 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {#if isLoading}
                <Loader2 class="w-4 h-4 animate-spin" />
                Checking...
              {:else}
                <Shield class="w-4 h-4" />
                Check Badges
              {/if}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Error -->
    {#if error && !isLoading}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <div class="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <AlertCircle class="w-8 h-8 text-red-500 mx-auto mb-3" />
          <p class="text-sm text-red-400">{error}</p>
          <button
            onclick={() => { error = null; }}
            class="mt-3 text-sm text-red-400 underline hover:text-red-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    {/if}

    <!-- Loading -->
    {#if isLoading}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-4 animate-pulse">
            <Loader2 class="w-8 h-8 text-white animate-spin" />
          </div>
          <p class="text-lg font-semibold mb-2">Checking Badges...</p>
          <p class="text-sm text-muted-foreground">Querying Alchemy NFT API for {ECOSYSTEM_BADGES.length + OG_BADGES.length} badges</p>
        </div>
      </div>
    {/if}

    <!-- Results -->
    {#if isLoaded && !isLoading}
      <!-- Address Bar -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Shield class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Soneium Address</p>
              <div class="flex items-center gap-2">
                <p class="text-sm font-mono font-medium">{truncateAddress(address)}</p>
                <button onclick={copyAddr} class="text-muted-foreground hover:text-foreground transition-colors">
                  {#if copiedAddress}
                    <Check class="w-3.5 h-3.5 text-emerald-500" />
                  {:else}
                    <CopyIcon class="w-3.5 h-3.5" />
                  {/if}
                </button>
              </div>
            </div>
          </div>
          <button
            onclick={shareOnTwitter}
            class="h-9 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
          >
            <Share2 class="w-3.5 h-3.5" />
            Share on Twitter
          </button>
        </div>
      </div>

      <!-- Badge Collection Summary -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-violet-500/5 border border-purple-500/20">
          <h2 class="text-lg font-bold mb-4 text-center">Badge Collection Summary</h2>
          <div class="grid grid-cols-3 gap-4 mb-4">
            <!-- Total -->
            <div class="p-4 rounded-xl bg-background/50 border border-purple-500/20 text-center">
              <p class="text-3xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">{totalOwned}</p>
              <p class="text-xs text-muted-foreground mt-1">of {totalBadges} Owned</p>
              <div class="mt-2 h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-700" style="width: {ownershipPercent}%"></div>
              </div>
              <p class="text-xs text-muted-foreground mt-1">{ownershipPercent}%</p>
            </div>
            <!-- OG -->
            <div class="p-4 rounded-xl bg-background/50 border border-amber-500/20 text-center">
              <p class="text-3xl font-bold text-amber-400">{ogOwnedCount}</p>
              <p class="text-xs text-muted-foreground mt-1">of {ogTotalCount} OG Badges</p>
              <div class="mt-2 h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all duration-700" style="width: {ogTotalCount > 0 ? (ogOwnedCount / ogTotalCount * 100) : 0}%"></div>
              </div>
            </div>
            <!-- Ecosystem -->
            <div class="p-4 rounded-xl bg-background/50 border border-emerald-500/20 text-center">
              <p class="text-3xl font-bold text-emerald-400">{ecoOwnedCount}</p>
              <p class="text-xs text-muted-foreground mt-1">of {ecoTotalCount} Eco Badges</p>
              <div class="mt-2 h-2 rounded-full bg-secondary/60 overflow-hidden">
                <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-700" style="width: {ecoTotalCount > 0 ? (ecoOwnedCount / ecoTotalCount * 100) : 0}%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filter Tabs + Search -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <!-- Tabs -->
          <div class="flex gap-2">
            {#each ['All', 'Owned', 'Not Owned'] as tab}
              {@const isActive = activeFilter === tab}
              {@const count = tab === 'All' ? totalBadges : tab === 'Owned' ? totalOwned : totalBadges - totalOwned}
              <button
                onclick={() => activeFilter = tab as FilterTab}
                class="px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 {
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/25'
                    : 'bg-card/60 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-card/80 backdrop-blur-sm'
                }"
              >
                {tab}
                <span class="ml-1 text-xs {isActive ? 'text-white/70' : 'text-muted-foreground'}">({count})</span>
              </button>
            {/each}
          </div>

          <!-- Search -->
          <div class="relative w-full sm:w-64">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search badges..."
              class="w-full pl-9 pr-3 h-9 bg-card/60 border border-border/40 backdrop-blur-xl rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      <!-- OG Badges Section (Amber Theme) -->
      {#if filteredOGBadges.length > 0}
        <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
          <div class="rounded-2xl border border-amber-500/20 bg-card/40 backdrop-blur-xl overflow-hidden">
            <div class="px-5 py-4 border-b border-amber-500/15 bg-gradient-to-r from-amber-500/5 to-yellow-500/5">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                  <Award class="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 class="text-base font-bold text-amber-300">OG Badges</h2>
                  <p class="text-xs text-muted-foreground">ERC-1155 · Original Soneium achievements</p>
                </div>
                <span class="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                  {ogOwnedCount}/{ogTotalCount}
                </span>
              </div>
            </div>
            <div class="p-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {#each filteredOGBadges as badge}
                  <div class="flex items-center gap-4 p-4 rounded-xl bg-background/50 border {badge.owned ? 'border-amber-500/30 bg-amber-500/5' : 'border-border/30'}">
                    <!-- Badge Image -->
                    <div class="w-14 h-14 rounded-xl bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
                      {#if badge.image}
                        <img src={badge.image} alt={badge.name} class="w-full h-full object-cover" loading="lazy" />
                      {:else}
                        <Award class="w-7 h-7 text-amber-400/40" />
                      {/if}
                    </div>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold">{badge.name}</p>
                      <p class="text-xs text-muted-foreground">Token ID: {badge.tokenId}</p>
                    </div>
                    <!-- Status -->
                    <div class="shrink-0">
                      {#if badge.owned}
                        <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 class="w-3.5 h-3.5" />
                          <span class="text-xs font-semibold">Owned</span>
                        </div>
                      {:else}
                        <div class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                          <XCircle class="w-3.5 h-3.5" />
                          <span class="text-xs font-semibold">Missing</span>
                        </div>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Ecosystem Badges Section (Green Theme) -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="rounded-2xl border border-emerald-500/20 bg-card/40 backdrop-blur-xl overflow-hidden">
          <div class="px-5 py-4 border-b border-emerald-500/15 bg-gradient-to-r from-emerald-500/5 to-green-500/5">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                <Shield class="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 class="text-base font-bold text-emerald-300">Ecosystem Badges</h2>
                <p class="text-xs text-muted-foreground">ERC-721 · Soneium partner achievements</p>
              </div>
              <span class="ml-auto text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                {ecoOwnedCount}/{ecoTotalCount}
              </span>
            </div>
          </div>
          <div class="p-4">
            {#if filteredEcosystemBadges.length > 0}
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
                {#each filteredEcosystemBadges as badge}
                  <a
                    href={getBlockscoutUrl(badge.contract, badge.tokenId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    class="block group"
                  >
                    <div class="flex items-start gap-3 p-3 rounded-xl bg-background/50 border {badge.owned ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-border/30'} transition-all duration-200 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-emerald-500/10">
                      <!-- Badge Image -->
                      <div class="w-12 h-12 rounded-lg bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
                        {#if badge.image}
                          <img src={badge.image} alt={badge.name} class="w-full h-full object-cover" loading="lazy" />
                        {:else}
                          <Shield class="w-6 h-6 text-emerald-400/40" />
                        {/if}
                      </div>
                      <!-- Info -->
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-semibold truncate">{badge.name}</p>
                        <p class="text-[10px] text-muted-foreground font-mono truncate">{truncateAddress(badge.contract)}</p>
                      </div>
                      <!-- Status -->
                      <div class="shrink-0 mt-0.5">
                        {#if badge.owned}
                          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 class="w-3 h-3" />
                            <span class="text-[10px] font-semibold">Owned</span>
                          </div>
                        {:else}
                          <div class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                            <XCircle class="w-3 h-3" />
                            <span class="text-[10px] font-semibold">Missing</span>
                          </div>
                        {/if}
                      </div>
                    </div>
                  </a>
                {/each}
              </div>
            {:else}
              <div class="text-center py-8">
                <Shield class="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p class="text-sm text-muted-foreground">No badges match your filters</p>
              </div>
            {/if}
          </div>
        </div>
      </div>

      <!-- Share Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-violet-500/5 border border-purple-500/20 text-center">
          <h3 class="text-lg font-bold mb-2">Share Your Badges</h3>
          <p class="text-sm text-muted-foreground mb-4">Show off your Soneium badge collection</p>
          <button
            onclick={shareOnTwitter}
            class="h-10 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all mx-auto"
          >
            <Share2 class="w-4 h-4" />
            Share on Twitter
          </button>
        </div>
      </div>

      <!-- Info Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
        <div class="rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl overflow-hidden">
          <button
            onclick={() => infoExpanded = !infoExpanded}
            class="w-full flex items-center justify-between p-5 hover:bg-card/60 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                <Info class="w-4 h-4 text-indigo-400" />
              </div>
              <h3 class="text-base font-bold">What Are Soneium Ecosystem Badges?</h3>
            </div>
            {#if infoExpanded}
              <ChevronUp class="w-4 h-4 text-muted-foreground shrink-0" />
            {:else}
              <ChevronDown class="w-4 h-4 text-muted-foreground shrink-0" />
            {/if}
          </button>
          {#if infoExpanded}
            <div class="px-5 pb-5 pt-0">
              <div class="prose prose-sm prose-invert max-w-none text-muted-foreground space-y-3">
                <p>
                  Soneium ecosystem badges are NFT-based achievements on the Soneium blockchain (Ethereum L2 by Sony Block Solutions Labs). They represent your participation and engagement across various protocols and platforms in the Soneium ecosystem.
                </p>
                <div class="grid sm:grid-cols-2 gap-4 not-prose">
                  <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                    <h4 class="text-sm font-bold text-amber-300 mb-2">OG Badges (ERC-1155)</h4>
                    <p class="text-xs text-muted-foreground">
                      The OG Badge and Premium OG Badge are ERC-1155 tokens from the official Soneium contract. They were awarded to early adopters and active community members during the Soneium launch period.
                    </p>
                  </div>
                  <div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <h4 class="text-sm font-bold text-emerald-300 mb-2">Ecosystem Badges (ERC-721)</h4>
                    <p class="text-xs text-muted-foreground">
                      Each ecosystem badge is an ERC-721 NFT from a different Soneium partner protocol. These include DeFi platforms, NFT marketplaces, bridges, and other dApps. Holding these badges may qualify you for future airdrops or rewards.
                    </p>
                  </div>
                </div>
                <p class="text-xs">
                  Badge data is fetched from the Alchemy NFT API. Results reflect on-chain ownership at the time of checking. This tool is for informational purposes only and is not financial advice.
                </p>
              </div>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </main>

  <Footer />
</div>
