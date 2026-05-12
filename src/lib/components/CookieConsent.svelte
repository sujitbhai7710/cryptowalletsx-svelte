<script lang="ts">
  let visible = $state(false);
  let preferencesOpen = $state(false);
  let analytics = $state(false);
  let marketing = $state(false);

  const CONSENT_KEY = 'cookie_consent';
  const CONSENT_VERSION = 'v1';

  function checkConsent() {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version === CONSENT_VERSION) {
          // Already consented — apply stored preferences
          applyConsent(parsed.analytics, parsed.marketing);
          return;
        }
      }
    } catch (e) {
      // Invalid stored data — show banner
    }
    visible = true;
  }

  function acceptAll() {
    analytics = true;
    marketing = true;
    saveConsent(true, true);
    visible = false;
    preferencesOpen = false;
  }

  function rejectAll() {
    analytics = false;
    marketing = false;
    saveConsent(false, false);
    visible = false;
    preferencesOpen = false;
  }

  function saveCustom() {
    saveConsent(analytics, marketing);
    visible = false;
    preferencesOpen = false;
  }

  function saveConsent(analyticsGranted: boolean, marketingGranted: boolean) {
    const consent = {
      version: CONSENT_VERSION,
      timestamp: new Date().toISOString(),
      essential: true,
      analytics: analyticsGranted,
      marketing: marketingGranted,
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
    } catch (e) {
      // localStorage unavailable
    }
    applyConsent(analyticsGranted, marketingGranted);
  }

  function applyConsent(analyticsGranted: boolean, marketingGranted: boolean) {
    // Signal Google AdSense consent via gtag consent API
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied',
        ad_storage: marketingGranted ? 'granted' : 'denied',
        ad_user_data: marketingGranted ? 'granted' : 'denied',
        ad_personalization: marketingGranted ? 'granted' : 'denied',
      });
    }
  }

  $effect(() => {
    checkConsent();
  });
</script>

{#if visible}
  <div class="cookie-consent-overlay" role="dialog" aria-label="Cookie consent" aria-modal="true">
    {#if !preferencesOpen}
      <!-- Main consent banner -->
      <div class="cookie-consent-banner">
        <div class="cookie-consent-content">
          <div class="cookie-consent-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
              <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/>
            </svg>
          </div>
          <div class="cookie-consent-text">
            <h3>We value your privacy</h3>
            <p>
              We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic.
              By clicking "Accept All", you consent to our use of cookies. Read our <a href="/privacy">Privacy Policy</a>.
            </p>
          </div>
        </div>
        <div class="cookie-consent-actions">
          <button class="cookie-btn cookie-btn-reject" onclick={rejectAll}>Reject All</button>
          <button class="cookie-btn cookie-btn-custom" onclick={() => preferencesOpen = true}>Customize</button>
          <button class="cookie-btn cookie-btn-accept" onclick={acceptAll}>Accept All</button>
        </div>
      </div>
    {:else}
      <!-- Preferences panel -->
      <div class="cookie-consent-banner cookie-preferences">
        <div class="cookie-consent-content">
          <div class="cookie-consent-text">
            <h3>Cookie Preferences</h3>
            <p>Manage your cookie settings. Essential cookies cannot be disabled as they are necessary for the site to function.</p>
          </div>
          <div class="cookie-options">
            <div class="cookie-option">
              <div class="cookie-option-info">
                <span class="cookie-option-label">Essential</span>
                <span class="cookie-option-desc">Required for the website to function properly. Cannot be disabled.</span>
              </div>
              <div class="cookie-toggle cookie-toggle-active cookie-toggle-locked">
                <span>Always Active</span>
              </div>
            </div>
            <div class="cookie-option">
              <div class="cookie-option-info">
                <span class="cookie-option-label">Analytics</span>
                <span class="cookie-option-desc">Help us understand how visitors interact with our website. Used by Google Analytics.</span>
              </div>
              <label class="cookie-toggle">
                <input type="checkbox" bind:checked={analytics} />
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
            <div class="cookie-option">
              <div class="cookie-option-info">
                <span class="cookie-option-label">Marketing / Advertising</span>
                <span class="cookie-option-desc">Used by Google AdSense to serve personalized ads. Disabling may limit ad relevance.</span>
              </div>
              <label class="cookie-toggle">
                <input type="checkbox" bind:checked={marketing} />
                <span class="cookie-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
        <div class="cookie-consent-actions">
          <button class="cookie-btn cookie-btn-reject" onclick={rejectAll}>Reject All</button>
          <button class="cookie-btn cookie-btn-accept" onclick={saveCustom}>Save Preferences</button>
          <button class="cookie-btn cookie-btn-accept" onclick={acceptAll}>Accept All</button>
        </div>
      </div>
    {/if}
  </div>
{/if}

<style>
  .cookie-consent-overlay {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    padding: 0 1rem 1rem;
    animation: slideUp 0.3s ease-out;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }

  .cookie-consent-banner {
    max-width: 64rem;
    margin: 0 auto;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(6, 182, 212, 0.2);
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.3);
  }

  .cookie-consent-content {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .cookie-consent-icon {
    flex-shrink: 0;
    width: 2.5rem;
    height: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(6, 182, 212, 0.1);
    border-radius: 0.5rem;
    color: #06b6d4;
  }

  .cookie-consent-text h3 {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.375rem;
    color: #f1f5f9;
  }

  .cookie-consent-text p {
    font-size: 0.8125rem;
    line-height: 1.5;
    color: #94a3b8;
    margin: 0;
  }

  .cookie-consent-text a {
    color: #06b6d4;
    text-decoration: underline;
  }

  .cookie-consent-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  .cookie-btn {
    padding: 0.5rem 1.25rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.15s ease;
  }

  .cookie-btn-reject {
    background: transparent;
    border: 1px solid rgba(148, 163, 184, 0.3);
    color: #94a3b8;
  }
  .cookie-btn-reject:hover { background: rgba(148, 163, 184, 0.1); }

  .cookie-btn-custom {
    background: rgba(6, 182, 212, 0.1);
    border: 1px solid rgba(6, 182, 212, 0.3);
    color: #06b6d4;
  }
  .cookie-btn-custom:hover { background: rgba(6, 182, 212, 0.2); }

  .cookie-btn-accept {
    background: linear-gradient(135deg, #06b6d4, #0d9488);
    color: white;
  }
  .cookie-btn-accept:hover { opacity: 0.9; }

  .cookie-options {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1rem;
  }

  .cookie-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem;
    border-radius: 0.5rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba(148, 163, 184, 0.1);
  }

  .cookie-option-info {
    flex: 1;
  }

  .cookie-option-label {
    display: block;
    font-weight: 600;
    font-size: 0.875rem;
    color: #f1f5f9;
    margin-bottom: 0.125rem;
  }

  .cookie-option-desc {
    display: block;
    font-size: 0.75rem;
    color: #94a3b8;
    line-height: 1.4;
  }

  .cookie-toggle {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  .cookie-toggle input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .cookie-toggle-slider {
    width: 2.5rem;
    height: 1.375rem;
    background: #475569;
    border-radius: 1rem;
    transition: background 0.2s;
    position: relative;
  }

  .cookie-toggle-slider::after {
    content: '';
    position: absolute;
    top: 0.1875rem;
    left: 0.1875rem;
    width: 1rem;
    height: 1rem;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
  }

  .cookie-toggle input:checked + .cookie-toggle-slider {
    background: #06b6d4;
  }

  .cookie-toggle input:checked + .cookie-toggle-slider::after {
    transform: translateX(1.125rem);
  }

  .cookie-toggle-active {
    background: #06b6d4;
    padding: 0.375rem 0.75rem;
    border-radius: 1rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .cookie-toggle-locked {
    cursor: default;
  }

  @media (max-width: 640px) {
    .cookie-consent-content {
      flex-direction: column;
    }
    .cookie-consent-actions {
      flex-direction: column;
    }
    .cookie-btn {
      width: 100%;
      text-align: center;
    }
  }
</style>
