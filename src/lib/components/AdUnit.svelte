<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  interface Props {
    slot: string;
    format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle';
    responsive?: boolean;
    style?: string;
    class?: string;
  }

  let { slot, format = 'auto', responsive = true, style = '', class: className = '' }: Props = $props();

  let adContainer: HTMLElement;

  onMount(() => {
    pushAd();
  });

  // Re-push ad on client-side navigation (SPA route change)
  $effect(() => {
    // Subscribe to page changes to re-trigger ads
    const currentPath = $page.url.pathname;
    if (currentPath) {
      // Small delay to ensure DOM is ready after navigation
      setTimeout(() => pushAd(), 300);
    }
  });

  function pushAd() {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense not loaded yet
    }
  }
</script>

<div class="ad-unit-wrapper {className}" style={style}>
  <ins
    class="adsbygoogle"
    bind:this={adContainer}
    style="display:block"
    data-ad-client="ca-pub-8421191784631095"
    data-ad-slot={slot}
    data-ad-format={format}
    data-full-width-responsive={responsive ? 'true' : 'false'}
  ></ins>
</div>

<style>
  .ad-unit-wrapper {
    width: 100%;
    min-height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0.75rem 0;
    overflow: hidden;
  }
</style>
