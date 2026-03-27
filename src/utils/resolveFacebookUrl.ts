/**
 * Resolves a Facebook share URL (e.g. /share/r/CODE) to the canonical reel URL
 * using a Netlify serverless function that follows the redirect server-side.
 * Returns the resolved URL or null if it can't be resolved.
 */
export async function resolveFacebookUrl(shareUrl: string): Promise<string | null> {
  try {
    const res = await fetch(
      `/.netlify/functions/resolve-url?url=${encodeURIComponent(shareUrl)}`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const resolved: string | undefined = data.resolved;
    if (resolved && /facebook\.com\/reel\/\d+/.test(resolved)) {
      // Strip tracking params, keep just the clean reel URL
      const match = resolved.match(/(https:\/\/www\.facebook\.com\/reel\/\d+)/);
      return match ? match[1] : resolved;
    }
    return null;
  } catch {
    return null;
  }
}
