<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  /**
   * AdSenseRefresh component for SPA (Single Page Application) compatibility.
   *
   * Google AdSense was designed for traditional page loads. In SvelteKit's SPA mode,
   * client-side navigation doesn't trigger a full page reload, so AdSense Auto Ads
   * don't re-initialize on route changes. This component:
   *
   * 1. Detects route changes via SvelteKit's $page store
   * 2. Removes stale auto-placed ad units from the DOM
   * 3. Re-invokes the AdSense script to scan and place new ads
   *
   * This ensures ads appear correctly on every navigated page, not just the initial load.
   */
  onMount(() => {
    // Set default consent mode on first load (required by Google for EU users)
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'default', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        wait_for_update: 500,
      });
    }
  });

  let isFirstRun = true;

  $effect(() => {
    const currentPath = $page.url.pathname;

    // Skip the first run (initial page load — AdSense handles that automatically)
    if (isFirstRun) {
      isFirstRun = false;
      return;
    }

    // On subsequent route changes, clean up and refresh ads
    if (typeof window === 'undefined') return;

    // Wait for the new page content to render
    setTimeout(() => {
      try {
        // Remove stale auto-placed ad containers from previous page
        const staleAds = document.querySelectorAll('.google-auto-placed');
        staleAds.forEach(ad => ad.remove());

        // Remove anchor ad (bottom overlay from previous page)
        const anchorAds = document.querySelectorAll('#google_anchor_ad');
        anchorAds.forEach(ad => ad.remove());

        // Re-push to trigger AdSense to scan the new page content
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({ google_ad_client: 'ca-pub-8421191784631095' });
      } catch (e) {
        // Silently fail — AdSense may not be loaded
      }
    }, 500);
  });
</script>

<!-- This component has no visual output — it only runs side effects -->
