<script lang="ts">
  import { SITE_SEO } from '$lib/utils/seo';

  interface Props {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: string;
    jsonLd?: Record<string, unknown> | string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
  }

  let { title, description, keywords = [], canonicalUrl, ogImage, ogType = 'website', jsonLd, author, publishedTime, modifiedTime, section }: Props = $props();

  let fullTitle = $derived(title.includes('CryptoWalletsx') ? title : `${title} | ${SITE_SEO.siteName}`);
</script>

<svelte:head>
  <title>{fullTitle}</title>
  <meta name="description" content={description} />
  {#if keywords.length > 0}
    <meta name="keywords" content={keywords.join(', ')} />
  {/if}
  {#if canonicalUrl}
    <link rel="canonical" href={canonicalUrl} />
  {/if}

  <!-- Open Graph -->
  <meta property="og:title" content={fullTitle} />
  <meta property="og:description" content={description} />
  <meta property="og:locale" content="en_US" />
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
  {/if}
  <meta property="og:type" content={ogType} />
  {#if canonicalUrl}
    <meta property="og:url" content={canonicalUrl} />
  {/if}
  <meta property="og:site_name" content={SITE_SEO.siteName} />
  {#if publishedTime}
    <meta property="article:published_time" content={publishedTime} />
  {/if}
  {#if modifiedTime}
    <meta property="article:modified_time" content={modifiedTime} />
  {/if}
  {#if section}
    <meta property="article:section" content={section} />
  {/if}

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:site" content="@cryptowalletsx" />
  <meta name="twitter:title" content={fullTitle} />
  <meta name="twitter:description" content={description} />
  {#if ogImage}
    <meta name="twitter:image" content={ogImage} />
  {/if}

  <!-- E-E-A-T & Crawling -->
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
  {#if author}
    <meta name="author" content={author} />
  {/if}

  <!-- JSON-LD Structured Data -->
  {#if jsonLd}
    {@html `<script type="application/ld+json">${typeof jsonLd === 'string' ? jsonLd : JSON.stringify(jsonLd)}</script>`}
  {/if}
</svelte:head>
