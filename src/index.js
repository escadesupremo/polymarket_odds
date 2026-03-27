export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api') {
      try {
        const res = await fetch(
          'https://gamma-api.polymarket.com/events?slug=next-prime-minister-of-hungary',
          { headers: { 'Accept': 'application/json' } }
        );

        if (!res.ok) {
          return new Response(JSON.stringify({ error: `Upstream ${res.status}` }), {
            status: 502,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const data = await res.text();
        return new Response(data, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
          },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // For all other requests, serve static assets
    return env.ASSETS.fetch(request);
  },
};
