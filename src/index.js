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

    if (url.pathname === '/api/history') {
      const tokens = {
        'Péter Magyar': '94192784911459194325909253314484842244405314804074606736702592885535642919725',
        'Viktor Orbán': '16894424691858208925745474726543713759924126381815674402361002638388880101929',
        'László Toroczkai': '62276312834902257904558594246531967377131544314278449037472956208145787396192',
      };

      try {
        const results = {};
        const fetches = Object.entries(tokens).map(async ([name, tokenId]) => {
          const res = await fetch(
            `https://clob.polymarket.com/prices-history?market=${tokenId}&interval=max&fidelity=1000`,
            { headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            results[name] = data.history || [];
          }
        });
        await Promise.all(fetches);

        return new Response(JSON.stringify(results), {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=3600',
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
