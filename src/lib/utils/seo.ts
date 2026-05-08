export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: string;
}

export function getSEO(seo: SEOData): SEOData {
  const baseUrl = 'https://cryptowalletsx.com';
  return {
    ...seo,
    canonicalUrl: seo.canonicalUrl || `${baseUrl}`,
    ogImage: seo.ogImage || `${baseUrl}/og-image.png`,
    ogType: seo.ogType || 'website',
  };
}

export const SITE_SEO = {
  siteName: 'CryptoWalletsx',
  titleTemplate: '%s | CryptoWalletsx - Multi-Chain Wallet Analytics',
};
