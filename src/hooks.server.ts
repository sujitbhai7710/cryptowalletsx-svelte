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

	return resolve(event);
};
