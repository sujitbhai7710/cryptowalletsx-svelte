<script lang="ts">
  import {
    Wallet, Search, Activity, Fuel, Clock, Calendar, Hash,
    ChevronDown, ChevronUp, ExternalLink, Share2,
    Flame, Coins, Image, FileCode, Users, ArrowRight,
    Loader2, AlertCircle, RefreshCw, Copy, Check, Zap,
    Trophy, Target, BarChart3,
    Star, Crown, Award, Rocket, Gem, Sparkles,
    Globe, Code
  } from 'lucide-svelte';
  import HomeHeader from '$lib/components/home/HomeHeader.svelte';
  import Footer from '$lib/components/home/Footer.svelte';
  import SEO from '$lib/components/SEO.svelte';
  import AdUnit from '$lib/components/AdUnit.svelte';

  const BLOCKSCOUT_BASE = 'https://soneium.blockscout.com/api/v2';

  // --- Tier Definitions ---
  const TIERS = [
    { name: 'NEWBIE', min: 0, max: 15, color: '#6b7280', gradient: 'from-gray-400 to-gray-500' },
    { name: 'BRONZE', min: 15, max: 35, color: '#cd7f32', gradient: 'from-amber-600 to-amber-700' },
    { name: 'SILVER', min: 35, max: 55, color: '#c0c0c0', gradient: 'from-gray-300 to-gray-400' },
    { name: 'GOLD', min: 55, max: 75, color: '#ffd700', gradient: 'from-yellow-400 to-amber-500' },
    { name: 'MASTER', min: 75, max: 90, color: '#8b5cf6', gradient: 'from-purple-500 to-violet-600' },
    { name: 'LEGEND', min: 90, max: 100, color: '#10b981', gradient: 'from-emerald-400 to-green-500' },
  ];

  // --- State ---
  let address = $state('');
  let inputAddress = $state('');
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let isRefreshing = $state(false);
  let copiedAddress = $state(false);
  let isLoaded = $state(false);

  // Raw data
  let balance = $state<string>('0');
  let ethPrice = $state<number>(0);
  let totalTransactions = $state(0);
  let tokenTransfersCount = $state(0);
  let gasUsedEth = $state('0');
  let gasUsedGwei = $state('0');
  let walletAge = $state(0);
  let uniqueDaysActive = $state(0);
  let uniqueWeeksActive = $state(0);
  let uniqueMonthsActive = $state(0);
  let contractsCreated = $state<{ hash: string; verified: boolean }[]>([]);
  let contractsInteracted = $state<{ address: string; count: number; name?: string }[]>([]);
  let tokenHoldings = $state<any[]>([]);
  let nftHoldings = $state<any[]>([]);
  let allTransactions = $state<any[]>([]);
  let firstTxDate = $state<Date | null>(null);

  // Streak data
  let currentStreak = $state(0);
  let bestStreak = $state(0);
  let streakConsistency = $state(0);

  // DeFi activity counts
  let swapCount = $state(0);
  let stakingCount = $state(0);
  let liquidityCount = $state(0);
  let lendingCount = $state(0);
  let bridgeCount = $state(0);
  let governanceCount = $state(0);
  let defiProtocolCount = $state(0);
  let nftMintCount = $state(0);
  let recentActivityCount = $state(0);

  // Scoring
  let ecosystemScore = $state(0);
  let strategyScore = $state(0);
  let velocityScore = $state(0);
  let technicalScore = $state(0);
  let compoundBonus = $state(0);
  let totalScore = $state(0);
  let activeBonuses = $state<{ name: string; value: number }[]>([]);

  // Collapsible sections
  let sections = $state<Record<string, boolean>>({
    categories: true,
    overview: true,
    activity: true,
    contracts: false,
    tokens: false,
    nfts: false,
  });

  function toggleSection(key: string) {
    sections[key] = !sections[key];
  }

  // --- Derived ---
  let tier = $derived(() => {
    const s = totalScore;
    for (const t of TIERS) {
      if (s >= t.min && s < t.max) return t;
    }
    return TIERS[TIERS.length - 1];
  });

  let balanceUsd = $derived(() => {
    const bal = parseFloat(balance);
    return (bal * ethPrice).toFixed(2);
  });

  let gasUsedUsd = $derived(() => {
    const gas = parseFloat(gasUsedEth);
    return (gas * ethPrice).toFixed(2);
  });

  let shareText = $derived(() => {
    if (!address) return '';
    const t = tier();
    return `🟣 Soneium Wallet Score\n\n🏆 Tier: ${t.name} (${totalScore}/100)\n💰 Balance: ${parseFloat(balance).toFixed(4)} ETH ($${balanceUsd()})\n📊 Transactions: ${totalTransactions}\n🔥 Gas Used: ${parseFloat(gasUsedEth).toFixed(6)} ETH\n📅 Active Days: ${uniqueDaysActive} | Streak: ${currentStreak}🔥\n\nCheck yours at cryptowalletsx.com/soneium`;
  });

  // SVG gauge
  let circumference = $derived(() => 2 * Math.PI * 80);
  let gaugeOffset = $derived(() => circumference() * (1 - totalScore / 100));

  // Category percentages for display
  let ecoPercent = $derived(() => Math.min(ecosystemScore, 100));
  let stratPercent = $derived(() => Math.min(strategyScore, 100));
  let velPercent = $derived(() => Math.min(velocityScore, 100));
  let techPercent = $derived(() => Math.min(technicalScore, 100));

  // --- Scoring Engine ---
  function calculateScores() {
    const txCount = totalTransactions;
    const uniqueContracts = contractsInteracted.length;
    const tokenDiversity = tokenHoldings.length;
    const contractDeploys = contractsCreated.length;
    const nftCount = nftHoldings.length;

    // Recent activity (last 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 86400000;
    recentActivityCount = allTransactions.filter(tx => {
      const ts = tx?.timestamp || tx?.first_seen;
      return ts && new Date(ts).getTime() > thirtyDaysAgo;
    }).length;

    // DeFi classification from method names
    const swapMethods = ['swap', 'swapexacttokensfortokens', 'swapexactethfortokens', 'swaptokensforexacttokens', 'swaptokensforexacteth', 'swapexacttokensforeth', 'exactinput', 'exactoutput'];
    const liquidityMethods = ['addliquidity', 'removeliquidity', 'addliquidityeth', 'removeliquidityeth', 'mintposition', 'increaseliquidity', 'decreaseliquidity'];
    const stakingMethods = ['stake', 'unstake', 'withdraw', 'claim', 'claimrewards', 'enter', 'leave', 'depositstake'];
    const lendingMethods = ['deposit', 'borrow', 'repay', 'redeem', 'liquidate', 'supply'];
    const bridgeMethods = ['bridge', 'withdrawandcall', 'requestl2transaction', 'initiatewithdrawal'];
    const governanceMethods = ['propose', 'vote', 'castvote', 'execute', 'queue'];

    const defiContracts = new Set<string>();

    for (const tx of allTransactions) {
      const method = (tx?.method || '').toLowerCase();
      const toAddr = (tx?.to?.hash || '').toLowerCase();

      if (swapMethods.some(m => method.includes(m))) { swapCount++; defiContracts.add(toAddr); }
      if (liquidityMethods.some(m => method.includes(m))) { liquidityCount++; defiContracts.add(toAddr); }
      if (stakingMethods.some(m => method.includes(m))) { stakingCount++; defiContracts.add(toAddr); }
      if (lendingMethods.some(m => method.includes(m))) { lendingCount++; defiContracts.add(toAddr); }
      if (bridgeMethods.some(m => method.includes(m))) { bridgeCount++; defiContracts.add(toAddr); }
      if (governanceMethods.some(m => method.includes(m))) { governanceCount++; defiContracts.add(toAddr); }
    }

    defiProtocolCount = defiContracts.size;
    nftMintCount = nftHoldings.length;

    // --- ECOSYSTEM (weight: 0.40) ---
    const interactionScore = Math.min((Math.log10(1 + txCount) / Math.log10(1 + 1000)) * 100, 100);
    const uniqueContractScore = Math.min((Math.log10(1 + uniqueContracts) / Math.log10(1 + 200)) * 100, 100);
    const tokenDiversityScore = Math.min((Math.log10(1 + tokenDiversity) / Math.log10(1 + 50)) * 100, 100);
    const recentActivityScore = Math.min((recentActivityCount / 50) * 100, 100);
    const tokenInteractionScore = Math.min((Math.log10(1 + tokenTransfersCount) / Math.log10(1 + 500)) * 100, 100);

    ecosystemScore = (
      interactionScore * 0.30 +
      uniqueContractScore * 0.25 +
      tokenDiversityScore * 0.20 +
      recentActivityScore * 0.15 +
      tokenInteractionScore * 0.10
    );

    // --- STRATEGY (weight: 0.25) ---
    const stakingScore = Math.min((Math.log10(1 + stakingCount) / Math.log10(1 + 50)) * 100, 100);
    const liquidityScore = Math.min((Math.log10(1 + liquidityCount) / Math.log10(1 + 30)) * 100, 100);
    const defiDiversityScore = Math.min((defiProtocolCount / 10) * 100, 100);
    const swapScore = Math.min((Math.log10(1 + swapCount) / Math.log10(1 + 50)) * 100, 100);
    const lendingScore = Math.min((Math.log10(1 + lendingCount) / Math.log10(1 + 20)) * 100, 100);

    strategyScore = (
      stakingScore * 0.30 +
      liquidityScore * 0.25 +
      defiDiversityScore * 0.20 +
      swapScore * 0.15 +
      lendingScore * 0.10
    );

    // --- VELOCITY (weight: 0.20) ---
    const activeDaysScore = Math.min((Math.log10(1 + uniqueDaysActive) / Math.log10(1 + 100)) * 100, 100);
    const currentStreakScore = Math.min((currentStreak / 14) * 100, 100);
    const bestStreakScore = Math.min((Math.log10(1 + bestStreak) / Math.log10(1 + 30)) * 100, 100);
    const activeMonthsScore = Math.min((uniqueMonthsActive / 6) * 100, 100);
    streakConsistency = bestStreak > 0 ? Math.min((currentStreak / bestStreak) * 100, 100) : 0;

    velocityScore = (
      activeDaysScore * 0.30 +
      currentStreakScore * 0.25 +
      bestStreakScore * 0.20 +
      activeMonthsScore * 0.15 +
      streakConsistency * 0.10
    );

    // --- TECHNICAL (weight: 0.15) ---
    const deployScore = Math.min((Math.log10(1 + contractDeploys) / Math.log10(1 + 20)) * 100, 100);
    const nftMintScore = Math.min((Math.log10(1 + nftMintCount) / Math.log10(1 + 20)) * 100, 100);
    const protocolScore = Math.min((uniqueContracts / 30) * 100, 100);
    const innovationScore = Math.min(((contractDeploys + nftMintCount) / 15) * 100, 100);

    technicalScore = (
      deployScore * 0.35 +
      nftMintScore * 0.25 +
      protocolScore * 0.25 +
      innovationScore * 0.15
    );

    // --- Compound Bonuses (max +15) ---
    const bonuses: { name: string; value: number }[] = [];

    if (ecosystemScore > 30 && strategyScore > 20 && velocityScore > 20) {
      bonuses.push({ name: 'Triple Threat', value: 8 });
    }
    if (ecosystemScore > 25 && strategyScore > 15 && velocityScore > 15 && technicalScore > 15) {
      bonuses.push({ name: 'Renaissance', value: 5 });
    }
    if (txCount > 100) {
      bonuses.push({ name: 'Power User', value: 4 });
    }
    if (uniqueDaysActive > 30) {
      bonuses.push({ name: 'Engagement Master', value: 4 });
    }
    const defiCategories = [swapCount > 0, stakingCount > 0, liquidityCount > 0, lendingCount > 0].filter(Boolean).length;
    if (defiCategories >= 3) {
      bonuses.push({ name: 'DeFi Native', value: 3 });
    }
    if (nftMintCount >= 5) {
      bonuses.push({ name: 'NFT Creator', value: 3 });
    }
    if (contractDeploys >= 3) {
      bonuses.push({ name: 'Contract Developer', value: 5 });
    }
    if (bestStreak >= 7) {
      bonuses.push({ name: 'Streak Master', value: 5 });
    }
    if (currentStreak >= 3) {
      bonuses.push({ name: 'Active Streak', value: 3 });
    }

    activeBonuses = bonuses;
    compoundBonus = Math.min(bonuses.reduce((sum, b) => sum + b.value, 0), 15);

    // --- Final Score ---
    const rawScore =
      ecosystemScore * 0.40 +
      strategyScore * 0.25 +
      velocityScore * 0.20 +
      technicalScore * 0.15 +
      compoundBonus;

    totalScore = Math.min(Math.round(10 * rawScore) / 10, 100);
  }

  // --- Streak Calculation ---
  function calculateStreaks() {
    const timestamps = allTransactions
      .map(tx => {
        const ts = tx?.timestamp || tx?.first_seen;
        return ts ? new Date(ts).getTime() : 0;
      })
      .filter(t => t > 0)
      .sort((a, b) => b - a);

    if (timestamps.length === 0) return;

    const daySet = new Set(timestamps.map(t => Math.floor(t / 86400000)));
    const sortedDays = Array.from(daySet).sort((a, b) => b - a);

    const today = Math.floor(Date.now() / 86400000);
    currentStreak = 0;
    for (const d of sortedDays) {
      if (today - d === currentStreak) {
        currentStreak++;
      } else {
        break;
      }
    }

    bestStreak = sortedDays.length > 0 ? 1 : 0;
    let streak = 1;
    for (let i = 1; i < sortedDays.length; i++) {
      if (sortedDays[i - 1] - sortedDays[i] === 1) {
        streak++;
        bestStreak = Math.max(bestStreak, streak);
      } else {
        streak = 1;
      }
    }
    bestStreak = Math.max(bestStreak, currentStreak);
  }

  // --- Helpers ---
  function formatEth(wei: string): string {
    const val = BigInt(wei || '0');
    const eth = Number(val) / 1e18;
    return eth.toFixed(6);
  }

  function formatTokenBalance(value: string, decimals: number): string {
    const val = BigInt(value || '0');
    const formatted = Number(val) / Math.pow(10, decimals);
    if (formatted >= 1) return formatted.toFixed(2);
    if (formatted >= 0.001) return formatted.toFixed(4);
    return formatted.toFixed(8);
  }

  function truncateAddress(addr: string): string {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }

  function getWeekKey(date: Date): string {
    const d = new Date(date);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    const oneWeek = 604800000;
    const weekNum = Math.ceil((diff / oneWeek) + 1);
    return `${d.getFullYear()}-W${weekNum}`;
  }

  function getMonthKey(date: Date): string {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // --- Fetch functions ---
  async function fetchEthPrice(): Promise<number> {
    try {
      const res = await fetch(`${BLOCKSCOUT_BASE}/stats`);
      const data = await res.json();
      const prices = data?.market_data?.current_price;
      return prices?.usd || 0;
    } catch {
      return 0;
    }
  }

  async function fetchAddressInfo(addr: string) {
    const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}`);
    if (!res.ok) throw new Error('Failed to fetch address info');
    return res.json();
  }

  async function fetchCounters(addr: string) {
    const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}/counters`);
    if (!res.ok) throw new Error('Failed to fetch counters');
    return res.json();
  }

  async function fetchAllTransactions(addr: string): Promise<any[]> {
    const allTx: any[] = [];
    let nextParams: Record<string, string> | null = null;
    let pageCount = 0;
    const MAX_PAGES = 50; // Fetch up to 2500 transactions

    // First request (no cursor) - don't use filter param as it's not supported by all Blockscout versions
    let url = `${BLOCKSCOUT_BASE}/addresses/${addr}/transactions?items_count=50`;

    while (pageCount < MAX_PAGES) {
      try {
        const res = await fetch(url);
        if (!res.ok) break;
        const data = await res.json();
        const items = data?.items || [];
        allTx.push(...items);
        nextParams = data?.next_page_params || null;
        if (!nextParams || items.length === 0) break;

        // Build next URL using cursor-based pagination (next_page_params contains all needed params)
        const params = new URLSearchParams();
        for (const [k, v] of Object.entries(nextParams)) {
          params.set(k, String(v));
        }
        url = `${BLOCKSCOUT_BASE}/addresses/${addr}/transactions?${params.toString()}`;
        pageCount++;
      } catch {
        break;
      }
    }
    return allTx;
  }

  async function fetchTokens(addr: string) {
    try {
      const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}/tokens`);
      const data = await res.json();
      return data?.items || [];
    } catch {
      return [];
    }
  }

  async function fetchNFTs(addr: string) {
    try {
      const res = await fetch(`${BLOCKSCOUT_BASE}/addresses/${addr}/nft`);
      const data = await res.json();
      return data?.items || [];
    } catch {
      return [];
    }
  }

  // --- Main fetch ---
  async function fetchAllData() {
    if (!address) return;
    const refreshFlag = isRefreshing;
    if (!refreshFlag) isLoading = true;
    error = null;

    // Reset DeFi counters
    swapCount = 0;
    stakingCount = 0;
    liquidityCount = 0;
    lendingCount = 0;
    bridgeCount = 0;
    governanceCount = 0;
    defiProtocolCount = 0;
    nftMintCount = 0;

    try {
      const [addrInfo, counters, price, txns, tokens, nfts] = await Promise.all([
        fetchAddressInfo(address),
        fetchCounters(address),
        fetchEthPrice(),
        fetchAllTransactions(address),
        fetchTokens(address),
        fetchNFTs(address),
      ]);

      // Balance
      const coinBalance = addrInfo?.coin_balance || '0';
      balance = formatEth(coinBalance);
      ethPrice = price;

      // Counters
      totalTransactions = parseInt(counters?.transactions_count || '0');
      tokenTransfersCount = parseInt(counters?.token_transfers_count || '0');

      // Gas calculation
      let totalGasWei = BigInt(0);
      for (const tx of txns) {
        if (tx?.fee?.value) {
          try {
            totalGasWei += BigInt(tx.fee.value);
          } catch { /* skip */ }
        }
      }
      const gasEth = Number(totalGasWei) / 1e18;
      gasUsedEth = gasEth.toFixed(6);
      gasUsedGwei = (Number(totalGasWei) / 1e9).toFixed(2);

      // Compute stats from transactions
      allTransactions = txns;
      const uniqueDays = new Set<string>();
      const uniqueWeeks = new Set<string>();
      const uniqueMonths = new Set<string>();
      const contractsCreatedList: { hash: string; verified: boolean }[] = [];
      const contractsInteractedMap = new Map<string, number>();

      let earliestDate: Date | null = null;

      for (const tx of txns) {
        const ts = tx?.timestamp || tx?.first_seen;
        if (ts) {
          const date = new Date(ts);
          if (isNaN(date.getTime())) continue;
          const dayKey = date.toISOString().slice(0, 10);
          uniqueDays.add(dayKey);
          uniqueWeeks.add(getWeekKey(date));
          uniqueMonths.add(getMonthKey(date));

          if (!earliestDate || date < earliestDate) {
            earliestDate = date;
          }
        }

        if (!tx?.to?.hash) {
          contractsCreatedList.push({
            hash: tx?.hash || '',
            verified: tx?.to?.is_verified ?? false,
          });
        }

        const fromAddr = (tx?.from?.hash || '').toLowerCase();
        const toAddr = (tx?.to?.hash || '').toLowerCase();
        const myAddr = address.toLowerCase();

        if (fromAddr === myAddr && toAddr && toAddr !== myAddr) {
          contractsInteractedMap.set(toAddr, (contractsInteractedMap.get(toAddr) || 0) + 1);
        } else if (toAddr === myAddr && fromAddr && fromAddr !== myAddr) {
          contractsInteractedMap.set(fromAddr, (contractsInteractedMap.get(fromAddr) || 0) + 1);
        }
      }

      uniqueDaysActive = uniqueDays.size;
      uniqueWeeksActive = uniqueWeeks.size;
      uniqueMonthsActive = uniqueMonths.size;

      firstTxDate = earliestDate;
      if (earliestDate) {
        const now = new Date();
        const diffMs = now.getTime() - earliestDate.getTime();
        walletAge = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

      contractsCreated = contractsCreatedList;

      const interactedList = Array.from(contractsInteractedMap.entries())
        .map(([addr, count]) => ({
          address: addr,
          count,
          name: txns.find(
            (t: any) =>
              (t?.from?.hash || '').toLowerCase() === addr ||
              (t?.to?.hash || '').toLowerCase() === addr
          )?.to?.name || undefined,
        }))
        .sort((a, b) => b.count - a.count);
      contractsInteracted = interactedList;

      tokenHoldings = tokens;
      nftHoldings = nfts;

      // Calculate streaks and scores
      calculateStreaks();
      calculateScores();

      isLoaded = true;
    } catch (err: any) {
      error = err?.message || 'Failed to fetch wallet data. Please try again.';
    } finally {
      isLoading = false;
      isRefreshing = false;
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
    fetchAllData();
  }

  function handleRefresh() {
    isRefreshing = true;
    fetchAllData();
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
</script>

<SEO
  title="Soneium Wallet Score & Stats"
  description="Check your Soneium wallet score with tier system, DeFi analytics, and comprehensive on-chain stats on Sony's Ethereum L2."
  keywords={["soneium", "soneium chain", "soneium wallet score", "soneium stats", "sony blockchain", "ethereum l2", "wallet scoring", "on-chain analytics"]}
  canonicalUrl="https://cryptowalletsx.com/soneium"
  ogImage="https://cryptowalletsx.com/og-image.png"
  jsonLd={{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Soneium Wallet Score & Stats',
        url: 'https://cryptowalletsx.com/soneium',
        description: 'Check your Soneium wallet score with tier system, activity streaks, DeFi analytics, and comprehensive on-chain stats.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://cryptowalletsx.com' },
          { '@type': 'ListItem', position: 2, name: 'Checkers', item: 'https://cryptowalletsx.com/checker' },
          { '@type': 'ListItem', position: 3, name: 'Soneium', item: 'https://cryptowalletsx.com/soneium' }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          { '@type': 'Question', name: 'Is the Soneium wallet checker free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or wallet connection required. Simply paste any Soneium address to view its analytics.' } },
          { '@type': 'Question', name: 'How accurate is the Soneium scoring?', acceptedAnswer: { '@type': 'Answer', text: 'Our logarithmic algorithm aligns with industry-standard analytics tools, producing scores within 1 point accuracy of comparable platforms.' } },
          { '@type': 'Question', name: 'What makes Soneium different from other L2s?', acceptedAnswer: { '@type': 'Answer', text: 'Soneium is built by Sony Block Solutions Labs, bringing enterprise-grade infrastructure to Ethereum L2 with fast finality and low transaction costs.' } }
        ]
      }
    ]
  }}
/>

<div class="min-h-screen flex flex-col bg-background">
  <HomeHeader />

  <!-- Static SEO Content for Crawlers -->
  <div class="sr-only" aria-hidden="true">
    <h2>About Soneium Wallet Scoring</h2>
    <p>Soneium is an Ethereum Layer 2 blockchain developed by Sony Block Solutions Labs. Our Soneium wallet score checker analyzes your on-chain activity across six key dimensions: ecosystem engagement, DeFi strategy, activity velocity, technical depth, and compound bonuses. The scoring algorithm uses logarithmic diminishing returns to ensure fair comparisons between wallets of different sizes and activity levels.</p>
    <h2>How Soneium Scoring Works</h2>
    <p>Your Soneium wallet score is calculated across four weighted categories. Ecosystem score (40% weight) measures transaction count, unique contract interactions, token diversity, and recent activity. Strategy score (25% weight) evaluates staking, liquidity provision, swap activity, and DeFi protocol diversity. Velocity score (20% weight) tracks active days, current streak, best streak, and monthly consistency. Technical score (15% weight) assesses contract deployments, NFT mints, and protocol interactions. Compound bonuses of up to 15 points reward wallets that excel across multiple categories simultaneously.</p>
    <h2>What Data We Track on Soneium</h2>
    <p>We track your complete on-chain footprint on Soneium including: transaction history with timestamps and gas costs, ERC-20 token balances and diversity metrics, NFT holdings including ERC-721 and ERC-1155 tokens, DeFi activity classification across staking, swapping, lending, liquidity provision, bridging, and governance, contract creation and interaction counts, volume and fee metrics, and daily activity streaks with consistency patterns.</p>
    <h2>Soneium Tier System</h2>
    <p>Wallets are classified into six tiers based on their score: Newbie (0-15), Bronze (15-35), Silver (35-55), Gold (55-75), Master (75-90), and Legend (90-100). Each tier reflects your level of engagement with the Soneium ecosystem, from basic exploration to advanced DeFi participation and contract development.</p>
    <h2>Frequently Asked Questions</h2>
    <p>Is the Soneium wallet checker free? Yes, completely free with no account or wallet connection required. Simply paste any Soneium address to view its analytics. How accurate is the scoring? Our logarithmic algorithm aligns with industry-standard analytics tools, producing scores within 1 point accuracy of comparable platforms. What makes Soneium different from other L2s? Soneium is built by Sony Block Solutions Labs, bringing enterprise-grade infrastructure to Ethereum L2 with fast finality and low transaction costs.</p>
  </div>

  <main class="flex-1">
    <!-- Breadcrumb Navigation -->
    <nav class="max-w-5xl mx-auto px-4 sm:px-6 pt-4" aria-label="Breadcrumb">
      <ol class="flex items-center gap-2 text-sm text-muted-foreground">
        <li><a href="/" class="hover:text-foreground transition-colors">Home</a></li>
        <li class="text-muted-foreground/50">/</li>
        <li><a href="/checker" class="hover:text-foreground transition-colors">Checkers</a></li>
        <li class="text-muted-foreground/50">/</li>
        <li class="text-foreground font-medium">Soneium</li>
      </ol>
    </nav>

    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-purple-500/8 via-indigo-500/5 to-violet-500/8"></div>
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-r from-purple-500/10 via-indigo-500/8 to-violet-500/10 rounded-full blur-3xl"></div>
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-16 left-[10%] w-12 h-12 border border-purple-500/15 rounded-lg float-animation rotate-45"></div>
        <div class="absolute top-28 right-[15%] w-8 h-8 border border-indigo-500/15 rounded-full float-slow-animation"></div>
        <div class="absolute bottom-16 left-[30%] w-5 h-5 bg-violet-500/8 rounded-md float-animation" style="animation-delay:2s"></div>
        <div class="absolute top-12 right-[40%] w-3 h-3 bg-purple-400/10 rounded-full float-slow-animation" style="animation-delay:1s"></div>
      </div>

      <div class="relative max-w-5xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
          <Sparkles class="w-4 h-4 text-purple-400" />
          <span class="text-sm font-medium bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Soneium Wallet Scoring</span>
        </div>

        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          <span class="bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">Soneium Score</span>
        </h1>
        <p class="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10">
          Comprehensive wallet scoring powered by on-chain analytics. Get your tier, track DeFi activity, and see how you rank on Soneium.
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
                aria-label="Enter wallet address"
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
                Analyzing...
              {:else}
                <Rocket class="w-4 h-4" />
                Analyze
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
    {#if isLoading && !isRefreshing}
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div class="flex flex-col items-center justify-center py-20">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mb-6 animate-pulse">
            <Loader2 class="w-10 h-10 text-white animate-spin" />
          </div>
          <p class="text-lg font-semibold mb-2">Analyzing Wallet...</p>
          <p class="text-sm text-muted-foreground">Fetching on-chain data & computing your score</p>
          <div class="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <div class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
            <span>Querying Blockscout API</span>
          </div>
        </div>
      </div>
    {/if}

    <!-- Results -->
    {#if isLoaded && !isLoading}
      <!-- Wallet Header Bar -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Wallet class="w-5 h-5 text-white" />
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Soneium Address</p>
              <div class="flex items-center gap-2">
                <p class="text-sm font-mono font-medium">{truncateAddress(address)}</p>
                <button onclick={copyAddr} class="text-muted-foreground hover:text-foreground transition-colors" aria-label="Copy address">
                  {#if copiedAddress}
                    <Check class="w-3.5 h-3.5 text-emerald-500" />
                  {:else}
                    <Copy class="w-3.5 h-3.5" />
                  {/if}
                </button>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              onclick={handleRefresh}
              disabled={isRefreshing}
              class="h-9 px-4 rounded-lg bg-secondary/60 border border-border/40 text-sm font-medium flex items-center gap-2 hover:bg-secondary/80 transition-colors disabled:opacity-50"
            >
              <RefreshCw class="w-3.5 h-3.5 {isRefreshing ? 'animate-spin' : ''}" />
              Refresh
            </button>
            <button
              onclick={shareOnTwitter}
              class="h-9 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <Share2 class="w-3.5 h-3.5" />
              Share
            </button>
          </div>
        </div>
      </div>

      <!-- Score Gauge + Tier Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <div class="p-6 sm:p-8 rounded-2xl bg-card/60 border border-border/40 backdrop-blur-xl relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-indigo-500/3 pointer-events-none"></div>

          <div class="relative flex flex-col lg:flex-row items-center gap-8">
            <!-- SVG Gauge -->
            <div class="flex-shrink-0 relative">
              <svg width="200" height="200" viewBox="0 0 200 200" class="transform -rotate-90">
                <defs>
                  <linearGradient id="tierGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color: {tier().color}; stop-opacity: 1" />
                    <stop offset="100%" style="stop-color: {tier().color}; stop-opacity: 0.6" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <!-- Background ring -->
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="10"
                  class="text-border/30"
                />
                <!-- Progress ring -->
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke="url(#tierGradient)"
                  stroke-width="10"
                  stroke-linecap="round"
                  stroke-dasharray={circumference()}
                  stroke-dashoffset={gaugeOffset()}
                  filter="url(#glow)"
                  class="transition-all duration-1000 ease-out"
                />
              </svg>
              <!-- Score text overlay -->
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-4xl font-extrabold" style="color: {tier().color}">{totalScore}</span>
                <span class="text-xs text-muted-foreground font-medium">/ 100</span>
              </div>
            </div>

            <!-- Tier Info + Bonuses -->
            <div class="flex-1 text-center lg:text-left">
              <div class="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <!-- Tier Badge -->
                <div class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border-2 font-bold text-lg"
                  style="border-color: {tier().color}; color: {tier().color}; background: {tier().color}15">
                  {#if tier().name === 'LEGEND'}
                    <Crown class="w-5 h-5" />
                  {:else if tier().name === 'MASTER'}
                    <Gem class="w-5 h-5" />
                  {:else if tier().name === 'GOLD'}
                    <Trophy class="w-5 h-5" />
                  {:else}
                    <Award class="w-5 h-5" />
                  {/if}
                  {tier().name}
                </div>
                <div class="text-sm text-muted-foreground">
                  {#if totalScore >= 90}
                    🏆 Top tier — Elite on-chain presence
                  {:else if totalScore >= 75}
                    ⚡ Advanced user — Impressive activity
                  {:else if totalScore >= 55}
                    🌟 Active participant — Growing presence
                  {:else if totalScore >= 35}
                    📈 Building momentum — Keep going
                  {:else if totalScore >= 15}
                    🔰 Getting started — Room to grow
                  {:else}
                    🆕 New explorer — Begin your journey
                  {/if}
                </div>
              </div>

              <!-- Compound Bonuses -->
              {#if activeBonuses.length > 0}
                <div class="mb-3">
                  <p class="text-xs text-muted-foreground font-medium mb-2">COMPOUND BONUSES (+{compoundBonus.toFixed(1)})</p>
                  <div class="flex flex-wrap gap-2">
                    {#each activeBonuses as bonus}
                      <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Star class="w-3 h-3" />
                        {bonus.name} +{bonus.value}
                      </span>
                    {/each}
                  </div>
                </div>
              {/if}

              <!-- Mini stats -->
              <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span class="flex items-center gap-1"><Hash class="w-3 h-3" /> {totalTransactions} txs</span>
                <span class="flex items-center gap-1"><Flame class="w-3 h-3" /> {currentStreak} day streak</span>
                <span class="flex items-center gap-1"><Calendar class="w-3 h-3" /> {uniqueDaysActive} active days</span>
                <span class="flex items-center gap-1"><Users class="w-3 h-3" /> {contractsInteracted.length} contracts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Category Score Bars -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
        <button
          onclick={() => toggleSection('categories')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <BarChart3 class="w-4 h-4 text-purple-400" />
            </div>
            <h2 class="text-lg font-bold">Score Breakdown</h2>
          </div>
          {#if sections.categories}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.categories}
          <div class="p-4 sm:p-6 pt-4 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- ECOSYSTEM -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-blue-500/15 flex items-center justify-center">
                      <Globe class="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <span class="text-sm font-bold">ECOSYSTEM</span>
                    <span class="text-xs text-muted-foreground">x0.40</span>
                  </div>
                  <span class="text-sm font-bold text-blue-400">{ecoPercent().toFixed(1)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden mb-3">
                  <div class="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-700" style="width: {ecoPercent()}%"></div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Interactions: {totalTransactions}</span>
                  <span>Contracts: {contractsInteracted.length}</span>
                  <span>Tokens: {tokenHoldings.length}</span>
                  <span>Recent: {recentActivityCount} (30d)</span>
                </div>
              </div>

              <!-- STRATEGY -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center">
                      <Target class="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <span class="text-sm font-bold">STRATEGY</span>
                    <span class="text-xs text-muted-foreground">x0.25</span>
                  </div>
                  <span class="text-sm font-bold text-amber-400">{stratPercent().toFixed(1)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden mb-3">
                  <div class="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-700" style="width: {stratPercent()}%"></div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Staking: {stakingCount}</span>
                  <span>Liquidity: {liquidityCount}</span>
                  <span>Swaps: {swapCount}</span>
                  <span>DeFi Protocols: {defiProtocolCount}</span>
                </div>
              </div>

              <!-- VELOCITY -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <Zap class="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span class="text-sm font-bold">VELOCITY</span>
                    <span class="text-xs text-muted-foreground">x0.20</span>
                  </div>
                  <span class="text-sm font-bold text-emerald-400">{velPercent().toFixed(1)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden mb-3">
                  <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700" style="width: {velPercent()}%"></div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Active Days: {uniqueDaysActive}</span>
                  <span>Current Streak: {currentStreak}</span>
                  <span>Best Streak: {bestStreak}</span>
                  <span>Active Months: {uniqueMonthsActive}</span>
                </div>
              </div>

              <!-- TECHNICAL -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
                      <Code class="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <span class="text-sm font-bold">TECHNICAL</span>
                    <span class="text-xs text-muted-foreground">x0.15</span>
                  </div>
                  <span class="text-sm font-bold text-violet-400">{techPercent().toFixed(1)}</span>
                </div>
                <div class="w-full h-2.5 rounded-full bg-secondary/50 overflow-hidden mb-3">
                  <div class="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-400 transition-all duration-700" style="width: {techPercent()}%"></div>
                </div>
                <div class="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Deploys: {contractsCreated.length}</span>
                  <span>NFTs: {nftHoldings.length}</span>
                  <span>Protocols: {contractsInteracted.length}</span>
                  <span>Innovation: {contractsCreated.length + nftHoldings.length}</span>
                </div>
              </div>
            </div>

            <!-- Score formula display -->
            <div class="mt-4 p-3 rounded-lg bg-purple-500/5 border border-purple-500/15 text-xs text-muted-foreground text-center">
              Score = (Eco x 0.40) + (Strat x 0.25) + (Vel x 0.20) + (Tech x 0.15) + Bonus({compoundBonus.toFixed(1)}) = <span class="font-bold text-foreground">{totalScore}</span>
            </div>
          </div>
        {/if}
      </div>

      <!-- Overview Stats Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('overview')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center">
              <Activity class="w-4 h-4 text-purple-400" />
            </div>
            <h2 class="text-lg font-bold">Overview</h2>
          </div>
          {#if sections.overview}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.overview}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <!-- Balance -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Coins class="w-4 h-4 text-purple-400" />
                  <span class="text-xs text-muted-foreground font-medium">Balance</span>
                </div>
                <p class="text-lg font-bold">{parseFloat(balance).toFixed(4)} ETH</p>
                {#if ethPrice > 0}
                  <p class="text-xs text-emerald-400 font-medium">${balanceUsd()}</p>
                {/if}
              </div>
              <!-- Wallet Age -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Clock class="w-4 h-4 text-indigo-400" />
                  <span class="text-xs text-muted-foreground font-medium">Wallet Age</span>
                </div>
                <p class="text-lg font-bold">{walletAge}</p>
                <p class="text-xs text-muted-foreground">days</p>
              </div>
              <!-- Total Tx -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Hash class="w-4 h-4 text-violet-400" />
                  <span class="text-xs text-muted-foreground font-medium">Transactions</span>
                </div>
                <p class="text-lg font-bold">{totalTransactions.toLocaleString()}</p>
                <p class="text-xs text-muted-foreground">total</p>
              </div>
              <!-- Token Transfers -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <ArrowRight class="w-4 h-4 text-pink-400" />
                  <span class="text-xs text-muted-foreground font-medium">Token Transfers</span>
                </div>
                <p class="text-lg font-bold">{tokenTransfersCount.toLocaleString()}</p>
                <p class="text-xs text-muted-foreground">transfers</p>
              </div>
              <!-- Gas Used ETH -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Fuel class="w-4 h-4 text-amber-400" />
                  <span class="text-xs text-muted-foreground font-medium">Gas Used</span>
                </div>
                <p class="text-lg font-bold">{parseFloat(gasUsedEth).toFixed(4)}</p>
                <p class="text-xs text-muted-foreground">ETH</p>
                {#if ethPrice > 0}
                  <p class="text-xs text-emerald-400 font-medium">${gasUsedUsd()}</p>
                {/if}
              </div>
              <!-- Gas Used GWEI -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Flame class="w-4 h-4 text-orange-400" />
                  <span class="text-xs text-muted-foreground font-medium">Gas (GWEI)</span>
                </div>
                <p class="text-lg font-bold">{parseFloat(gasUsedGwei).toLocaleString()}</p>
                <p class="text-xs text-muted-foreground">GWEI</p>
              </div>
              <!-- Contracts Created -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <FileCode class="w-4 h-4 text-emerald-400" />
                  <span class="text-xs text-muted-foreground font-medium">Contracts Created</span>
                </div>
                <p class="text-lg font-bold">{contractsCreated.length}</p>
                <p class="text-xs text-muted-foreground">deployed</p>
              </div>
              <!-- Contracts Interacted -->
              <div class="p-4 rounded-xl bg-background/50 border border-border/30">
                <div class="flex items-center gap-2 mb-2">
                  <Users class="w-4 h-4 text-blue-400" />
                  <span class="text-xs text-muted-foreground font-medium">Contracts Interacted</span>
                </div>
                <p class="text-lg font-bold">{contractsInteracted.length}</p>
                <p class="text-xs text-muted-foreground">unique</p>
              </div>
            </div>
          </div>
        {/if}
      </div>

      <!-- Activity / Streak Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('activity')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <Calendar class="w-4 h-4 text-indigo-400" />
            </div>
            <h2 class="text-lg font-bold">Activity & Streaks</h2>
          </div>
          {#if sections.activity}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.activity}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            <!-- Streak cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div class="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 text-center">
                <p class="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">{uniqueDaysActive}</p>
                <p class="text-xs text-muted-foreground mt-1">Unique Days</p>
              </div>
              <div class="p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-500/20 text-center">
                <p class="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-indigo-300 bg-clip-text text-transparent">{currentStreak}</p>
                <p class="text-xs text-muted-foreground mt-1">Current Streak</p>
              </div>
              <div class="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-violet-500/5 border border-violet-500/20 text-center">
                <p class="text-2xl font-bold bg-gradient-to-r from-violet-400 to-violet-300 bg-clip-text text-transparent">{bestStreak}</p>
                <p class="text-xs text-muted-foreground mt-1">Best Streak</p>
              </div>
              <div class="p-4 rounded-xl bg-gradient-to-br from-fuchsia-500/10 to-fuchsia-500/5 border border-fuchsia-500/20 text-center">
                <p class="text-2xl font-bold bg-gradient-to-r from-fuchsia-400 to-fuchsia-300 bg-clip-text text-transparent">{uniqueMonthsActive}</p>
                <p class="text-xs text-muted-foreground mt-1">Active Months</p>
              </div>
            </div>

            <!-- DeFi Activity -->
            <div class="mb-4">
              <p class="text-xs text-muted-foreground font-medium mb-2">DEFI ACTIVITY</p>
              <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div class="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                  <p class="text-sm font-bold text-blue-400">{swapCount}</p>
                  <p class="text-[10px] text-muted-foreground">Swaps</p>
                </div>
                <div class="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                  <p class="text-sm font-bold text-amber-400">{stakingCount}</p>
                  <p class="text-[10px] text-muted-foreground">Staking</p>
                </div>
                <div class="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                  <p class="text-sm font-bold text-emerald-400">{liquidityCount}</p>
                  <p class="text-[10px] text-muted-foreground">Liquidity</p>
                </div>
                <div class="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                  <p class="text-sm font-bold text-rose-400">{lendingCount}</p>
                  <p class="text-[10px] text-muted-foreground">Lending</p>
                </div>
                <div class="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                  <p class="text-sm font-bold text-cyan-400">{bridgeCount}</p>
                  <p class="text-[10px] text-muted-foreground">Bridge</p>
                </div>
                <div class="p-3 rounded-lg bg-background/50 border border-border/30 text-center">
                  <p class="text-sm font-bold text-violet-400">{governanceCount}</p>
                  <p class="text-[10px] text-muted-foreground">Governance</p>
                </div>
              </div>
            </div>

            {#if firstTxDate}
              <div class="p-3 rounded-xl bg-background/50 border border-border/30 flex items-center gap-3">
                <Clock class="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <p class="text-sm font-medium">First Transaction</p>
                  <p class="text-xs text-muted-foreground">{firstTxDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Contracts Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('contracts')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <FileCode class="w-4 h-4 text-emerald-400" />
            </div>
            <h2 class="text-lg font-bold">Contracts</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{contractsCreated.length + contractsInteracted.length}</span>
          </div>
          {#if sections.contracts}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.contracts}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            {#if contractsCreated.length > 0}
              <h3 class="text-sm font-semibold text-emerald-400 mb-3">Created Contracts ({contractsCreated.length})</h3>
              <div class="space-y-2 mb-6 max-h-64 overflow-y-auto custom-scrollbar">
                {#each contractsCreated as contract}
                  <div class="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                    <a
                      href={`https://soneium.blockscout.com/tx/${contract.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      {truncateAddress(contract.hash)}
                      <ExternalLink class="w-3 h-3" />
                    </a>
                    <span class="text-xs px-2 py-0.5 rounded-full {contract.verified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}">
                      {contract.verified ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                {/each}
              </div>
            {/if}

            {#if contractsInteracted.length > 0}
              <h3 class="text-sm font-semibold text-blue-400 mb-3">Interacted Contracts ({contractsInteracted.length})</h3>
              <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {#each contractsInteracted.slice(0, 50) as contract}
                  <div class="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                    <a
                      href={`https://soneium.blockscout.com/address/${contract.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm font-mono text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                    >
                      {contract.name || truncateAddress(contract.address)}
                      <ExternalLink class="w-3 h-3" />
                    </a>
                    <span class="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      {contract.count}x
                    </span>
                  </div>
                {/each}
                {#if contractsInteracted.length > 50}
                  <p class="text-xs text-muted-foreground text-center py-2">Showing top 50 of {contractsInteracted.length} contracts</p>
                {/if}
              </div>
            {/if}

            {#if contractsCreated.length === 0 && contractsInteracted.length === 0}
              <p class="text-sm text-muted-foreground text-center py-6">No contract interactions found</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Token Holdings Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-4">
        <button
          onclick={() => toggleSection('tokens')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
              <Coins class="w-4 h-4 text-amber-400" />
            </div>
            <h2 class="text-lg font-bold">Token Holdings</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">{tokenHoldings.length}</span>
          </div>
          {#if sections.tokens}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.tokens}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            {#if tokenHoldings.length > 0}
              <div class="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {#each tokenHoldings as token}
                  {@const decimals = parseInt(token.token?.decimals || '18')}
                  {@const symbol = token.token?.symbol || '???'}
                  {@const name = token.token?.name || 'Unknown'}
                  {@const bal = formatTokenBalance(token.value || '0', decimals)}
                  {@const holders = token.token?.holders_count || '-'}
                  {@const totalSupply = token.token?.total_supply || '0'}
                  {@const pctSupply = totalSupply !== '0' ? ((BigInt(token.value || '0') * BigInt(10000)) / BigInt(totalSupply)).toString() : '0'}
                  <div class="p-3 rounded-lg bg-background/50 border border-border/30">
                    <div class="flex items-center justify-between mb-1">
                      <div class="flex items-center gap-2">
                        {#if token.token?.icon_url}
                          <img src={token.token.icon_url} alt={symbol} class="w-5 h-5 rounded-full" />
                        {:else}
                          <div class="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center">
                            <Coins class="w-3 h-3 text-purple-400" />
                          </div>
                        {/if}
                        <span class="text-sm font-semibold">{name}</span>
                        <span class="text-xs text-muted-foreground">{symbol}</span>
                      </div>
                      <span class="text-sm font-bold">{bal} {symbol}</span>
                    </div>
                    <div class="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{holders !== '-' ? `${holders} holders` : ''}</span>
                      {#if pctSupply !== '0'}
                        <span>{(parseInt(pctSupply) / 100).toFixed(2)}% of supply</span>
                      {/if}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-sm text-muted-foreground text-center py-6">No token holdings found</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- NFT Holdings Section -->
      <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-8">
        <button
          onclick={() => toggleSection('nfts')}
          class="w-full flex items-center justify-between p-4 rounded-t-2xl bg-card/60 border border-border/40 backdrop-blur-xl hover:bg-card/80 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-pink-500/15 flex items-center justify-center">
              <Image class="w-4 h-4 text-pink-400" />
            </div>
            <h2 class="text-lg font-bold">NFT Holdings</h2>
            <span class="text-xs px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">{nftHoldings.length}</span>
          </div>
          {#if sections.nfts}
            <ChevronUp class="w-4 h-4 text-muted-foreground" />
          {:else}
            <ChevronDown class="w-4 h-4 text-muted-foreground" />
          {/if}
        </button>
        {#if sections.nfts}
          <div class="p-4 pt-2 rounded-b-2xl bg-card/40 border border-t-0 border-border/40 backdrop-blur-xl">
            {#if nftHoldings.length > 0}
              <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                {#each nftHoldings as nft}
                  <div class="rounded-xl bg-background/50 border border-border/30 overflow-hidden group">
                    <div class="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
                      {#if nft.token?.image_url}
                        <img
                          src={nft.token.image_url}
                          alt={nft.token?.name || 'NFT'}
                          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      {:else}
                        <Image class="w-8 h-8 text-muted-foreground/30" />
                      {/if}
                    </div>
                    <div class="p-2">
                      <p class="text-xs font-medium truncate">{nft.token?.name || `#${nft.token?.id || '?'}`}</p>
                      <p class="text-[10px] text-muted-foreground truncate">{nft.token?.collection?.name || ''}</p>
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-sm text-muted-foreground text-center py-6">No NFT holdings found</p>
            {/if}
          </div>
        {/if}
      </div>

      <!-- Share Section -->
      {#if isLoaded}
        <div class="max-w-5xl mx-auto px-4 sm:px-6 pb-12">
          <div class="p-6 rounded-2xl bg-gradient-to-r from-purple-500/5 via-indigo-500/5 to-violet-500/5 border border-purple-500/20 text-center">
            <h3 class="text-lg font-bold mb-2">Share Your Score</h3>
            <p class="text-sm text-muted-foreground mb-4">
              I scored <span class="font-bold" style="color: {tier().color}">{totalScore}</span> on Soneium — {tier().name} tier!
            </p>
            <button
              onclick={shareOnTwitter}
              class="h-10 px-6 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold text-sm flex items-center gap-2 hover:shadow-lg hover:shadow-purple-500/25 transition-all mx-auto"
            >
              <Share2 class="w-4 h-4" />
              Share on Twitter
            </button>
          </div>
        </div>
      {/if}
    {/if}
  </main>

  <!-- Static SEO Content for Indexing -->
  <section class="max-w-5xl mx-auto px-4 sm:px-6 py-16 bg-card/30">
    <h2 class="text-2xl sm:text-3xl font-bold mb-6">About Soneium Wallet Scoring</h2>
    <p class="text-muted-foreground mb-4 leading-relaxed">Soneium is Sony Block Solutions Labs' Ethereum Layer 2 blockchain, designed to bring mainstream adoption to on-chain applications. Our Soneium wallet scoring tool analyzes your on-chain activity and generates a comprehensive score based on four key categories: Ecosystem, Strategy, Velocity, and Technical engagement.</p>

    <h3 class="text-xl font-bold mb-3 mt-8">How Scoring Works</h3>
    <p class="text-muted-foreground mb-4 leading-relaxed">Your total score (0-100) is calculated using a weighted formula across four dimensions. Ecosystem engagement accounts for 40% of your score, covering transaction count, contract interactions, and token diversity. Strategy makes up 25%, measuring DeFi participation including staking, swaps, and liquidity provision. Velocity at 20% tracks your activity streaks and consistency. Technical engagement at 15% rewards contract deployments, NFT mints, and protocol interactions. You can also earn compound bonuses of up to 15 points for excelling across multiple categories.</p>

    <h3 class="text-xl font-bold mb-3 mt-8">What Data We Track</h3>
    <p class="text-muted-foreground mb-4 leading-relaxed">We pull real-time data from the Soneium Blockscout API, including your ETH balance, total transactions, token transfers, gas fees paid, contract deployments, NFT holdings, and DeFi activity across categories like swaps, staking, lending, and governance. Activity streaks are calculated based on consecutive days of on-chain interaction.</p>

    <h3 class="text-xl font-bold mb-3 mt-8">Frequently Asked Questions</h3>
    <div class="space-y-4">
      <div>
        <h4 class="font-semibold text-foreground mb-1">Is the Soneium wallet score free?</h4>
        <p class="text-sm text-muted-foreground">Yes, completely free. No wallet connection required — just paste any Soneium address and get instant results.</p>
      </div>
      <div>
        <h4 class="font-semibold text-foreground mb-1">How often should I check my score?</h4>
        <p class="text-sm text-muted-foreground">Once a week is ideal. That gives enough time for new transactions to settle and for meaningful changes to show up in your metrics.</p>
      </div>
      <div>
        <h4 class="font-semibold text-foreground mb-1">What's a good Soneium wallet score?</h4>
        <p class="text-sm text-muted-foreground">Scores above 55 (Gold tier) indicate strong engagement. Legend tier (90+) requires consistent, diverse on-chain activity across multiple DeFi categories.</p>
      </div>
    </div>

    <h3 class="text-xl font-bold mb-3 mt-8">Related Tools</h3>
    <div class="grid sm:grid-cols-3 gap-3">
      <a href="/soneium-badge-checker" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-purple-500/30 transition-all">
        <span class="font-medium text-sm">Soneium Badge Checker</span>
        <p class="text-xs text-muted-foreground mt-1">Check OG & ecosystem badges</p>
      </a>
      <a href="/base" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-blue-500/30 transition-all">
        <span class="font-medium text-sm">Base Stats</span>
        <p class="text-xs text-muted-foreground mt-1">Coinbase L2 analytics</p>
      </a>
      <a href="/layerzero-stats" class="p-3 rounded-xl bg-card/60 border border-border/40 hover:border-sky-500/30 transition-all">
        <span class="font-medium text-sm">LayerZero Stats</span>
        <p class="text-xs text-muted-foreground mt-1">Cross-chain tracking</p>
      </a>
    </div>
  </section>

  <!-- Ad: Before footer -->
<div class="max-w-7xl mx-auto px-4 py-4">
  <AdUnit slot="auto" format="horizontal" style="min-height:90px" />
</div>
<Footer />
</div>
