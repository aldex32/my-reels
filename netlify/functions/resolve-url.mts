export default async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const target = searchParams.get('url');

  if (!target || !target.includes('facebook.com/share/')) {
    return new Response(JSON.stringify({ error: 'Invalid URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Follow redirects with a HEAD request to get the canonical URL
    const res = await fetch(target, { method: 'HEAD', redirect: 'follow' });
    const resolved = res.url;

    return new Response(JSON.stringify({ resolved }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Failed to resolve URL' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
