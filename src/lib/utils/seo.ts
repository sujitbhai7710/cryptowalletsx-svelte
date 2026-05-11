export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
}

export const BASE_URL = 'https://cryptowalletsx.com';

export function getSEO(seo: SEOData): SEOData {
  return {
    ...seo,
    canonicalUrl: seo.canonicalUrl || `${BASE_URL}`,
    ogImage: seo.ogImage || `${BASE_URL}/og-image.png`,
    ogType: seo.ogType || 'website',
  };
}

export const SITE_SEO = {
  siteName: 'CryptoWalletsx',
  titleTemplate: '%s | CryptoWalletsx - Multi-Chain Wallet Analytics',
};

/**
 * Generate breadcrumb schema markup
 */
export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate FAQ schema markup
 */
export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  };
}

/**
 * Generate HowTo schema markup
 */
export function howToSchema(name: string, description: string, steps: { name: string; text: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    totalTime: 'PT2M',
    step: steps.map((step, i) => ({
      '@type': 'HowToStep',
      name: step.name,
      text: step.text,
      position: i + 1,
    })),
  };
}
