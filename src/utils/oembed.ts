export interface OEmbedResult {
  title: string;
  author: string;
  thumbnailUrl: string | null;
}

export async function fetchOEmbed(url: string, platform: string): Promise<OEmbedResult | null> {
  try {
    let endpoint: string;

    if (platform === 'youtube') {
      endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
    } else if (platform === 'tiktok') {
      endpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
    } else {
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const data = await response.json();
    return {
      title: data.title || '',
      author: data.author_name || '',
      thumbnailUrl: data.thumbnail_url || null,
    };
  } catch {
    return null;
  }
}