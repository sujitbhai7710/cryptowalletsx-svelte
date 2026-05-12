import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
        const host = event.request.headers.get('host') ?? '';

        // Redirect cryptowalletsx.pages.dev → cryptowalletsx.com (permanent 301)
        if (host === 'cryptowalletsx.pages.dev' || host === 'www.cryptowalletsx.pages.dev') {
                const url = new URL(event.request.url);
                url.hostname = 'cryptowalletsx.com';
                url.port = ''; // clear port for HTTPS
                return new Response(null, {
                        status: 301,
                        headers: {
                                location: url.toString()
                        }
                });
        }

        // Redirect www.cryptowalletsx.com → cryptowalletsx.com (permanent 301)
        if (host === 'www.cryptowalletsx.com') {
                const url = new URL(event.request.url);
                url.hostname = 'cryptowalletsx.com';
                url.port = '';
                return new Response(null, {
                        status: 301,
                        headers: {
                                location: url.toString()
                        }
                });
        }

        // Strip trailing slashes for SEO consistency
        if (event.url.pathname !== '/' && event.url.pathname.endsWith('/')) {
                const url = new URL(event.request.url);
                url.pathname = url.pathname.slice(0, -1);
                return new Response(null, {
                        status: 301,
                        headers: {
                                location: url.toString()
                        }
                });
        }

        const response = await resolve(event);

        // Add security and SEO headers
        const headers = new Headers(response.headers);
        headers.set('X-Content-Type-Options', 'nosniff');
        headers.set('X-Frame-Options', 'SAMEORIGIN');
        headers.set('X-XSS-Protection', '1; mode=block');
        headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://www.google.com https://www.googleadservices.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-src https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com; object-src 'none'; base-uri 'self'; form-action 'self';");

        return new Response(response.body, {
                status: response.status,
                statusText: response.statusText,
                headers
        });
};
