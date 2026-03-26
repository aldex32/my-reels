export interface OGMeta {
  title: string | null;
  image: string | null;
  description: string | null;
}

// Titles that indicate a login/auth wall — discard these entirely
const AUTH_WALL_PATTERNS = [
  /log\s*in\s+or\s+sign\s*up/i,
  /log\s+into\s+facebook/i,
  /log\s+in\s+to\s+instagram/i,
  /create\s+an\s+account/i,
  /sign\s+up\s+to\s+see/i,
  /you\s+must\s+be\s+logged/i,
  /^(facebook|instagram|tiktok)\s*[–—-]?\s*$/i,
];

function isAuthWall(title: string): boolean {
  return AUTH_WALL_PATTERNS.some((p) => p.test(title));
}

/**
 * Parses an OG meta tag value from HTML.
 * Iterates over all <meta> tags and checks attributes regardless of order or whitespace.
 */
function parseOGTag(html: string, property: string): string | null {
  // Match entire <meta ...> or <meta ... /> tags, including multiline
  const metaRe = /<meta\s([\s\S]*?)\/?>(?=\s|<)/gi;
  let m: RegExpExecArray | null;

  while ((m = metaRe.exec(html)) !== null) {
    const attrs = m[1];
    // Check both og:property and name=property
    const isMatch =
      new RegExp(`\\bproperty=["']og:${property}["']`, 'i').test(attrs) ||
      new RegExp(`\\bname=["']og:${property}["']`, 'i').test(attrs);
    if (!isMatch) continue;

    const contentMatch = attrs.match(/\bcontent=["']([\s\S]*?)["']/i);
    if (contentMatch?.[1]) {
      return contentMatch[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
    }
  }
  return null;
}

async function tryProxy(proxyUrl: string, signal: AbortSignal): Promise<string | null> {
  try {
    const res = await fetch(proxyUrl, { signal });
    if (!res.ok) return null;
    const data = await res.json();
    // allorigins returns { contents: "..." }, corsproxy returns raw text
    return typeof data === 'object' ? (data.contents ?? null) : data;
  } catch {
    return null;
  }
}

/**
 * Fetches Open Graph metadata via two CORS proxies in sequence.
 * Returns null if both fail or if the page is an auth wall.
 */
export async function fetchOGMeta(url: string): Promise<OGMeta | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  try {
    // Try allorigins first, then corsproxy.io as fallback
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
    ];

    let html: string | null = null;
    for (const proxy of proxies) {
      html = await tryProxy(proxy, controller.signal);
      if (html) break;
    }

    if (!html) return null;

    const title = parseOGTag(html, 'title');
    if (title && isAuthWall(title)) return null; // Got a login page — treat as failure

    return {
      title,
      image: parseOGTag(html, 'image'),
      description: parseOGTag(html, 'description'),
    };
  } finally {
    clearTimeout(timer);
  }
}
