import { ParsedUrl } from '../types';

function normalizeTag(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_@.-]/g, '').slice(0, 32);
}

function uniqueTags(tags: string[]): string[] {
  return [...new Set(tags.map(normalizeTag).filter(Boolean))];
}

export function parseReelUrl(rawUrl: string): ParsedUrl | null {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^(www\.|m\.)/, '');

  if (host === 'youtube.com' || host === 'youtu.be') {
    return parseYouTube(url, host);
  }
  if (host === 'tiktok.com' || host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    return parseTikTok(url, host);
  }
  if (host === 'instagram.com') {
    return parseInstagram(url);
  }
  if (host === 'facebook.com' || host === 'fb.watch') {
    return parseFacebook(url, host, rawUrl);
  }

  return null;
}

function parseYouTube(url: URL, host: string): ParsedUrl | null {
  const tags: string[] = ['youtube'];
  let videoId: string | null = null;
  let author: string | undefined;

  if (host === 'youtu.be') {
    videoId = url.pathname.slice(1).split('/')[0] || null;
  } else {
    const path = url.pathname;
    if (path.startsWith('/shorts/')) {
      videoId = path.split('/shorts/')[1]?.split(/[/?]/)[0] || null;
      tags.push('shorts');
    } else if (path.startsWith('/watch')) {
      videoId = url.searchParams.get('v');
    } else if (path.startsWith('/embed/')) {
      videoId = path.split('/embed/')[1]?.split(/[/?]/)[0] || null;
    } else if (path.startsWith('/@')) {
      const channel = path.split('/@')[1]?.split('/')[0];
      if (channel) { author = channel; tags.push(channel); }
      const videoMatch = path.match(/\/(?:videos|shorts)\/([^/?]+)/);
      if (videoMatch) videoId = videoMatch[1];
      if (path.includes('/shorts/')) tags.push('shorts');
    }
  }

  if (!videoId) return null;

  return {
    platform: 'youtube',
    videoId,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0`,
    suggestedTags: uniqueTags(tags),
    author,
  };
}

function parseTikTok(url: URL, host: string): ParsedUrl | null {
  const tags: string[] = ['tiktok'];
  let videoId: string | null = null;
  let author: string | undefined;

  if (host === 'vm.tiktok.com' || host === 'vt.tiktok.com') {
    videoId = url.pathname.slice(1).split('/')[0] || null;
  } else {
    const path = url.pathname;
    const match = path.match(/@([^/]+)\/video\/(\d+)/);
    if (match) {
      author = match[1];
      videoId = match[2];
      tags.push(match[1]);
    } else {
      const segment = path.slice(1).split('/')[0];
      if (segment) videoId = segment;
    }
  }

  if (!videoId) return null;

  return {
    platform: 'tiktok',
    videoId,
    thumbnail: null,
    embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
    suggestedTags: uniqueTags(tags),
    author,
  };
}

function parseInstagram(url: URL): ParsedUrl | null {
  const tags: string[] = ['instagram'];
  let videoId: string | null = null;
  let author: string | undefined;
  let isReel = false;

  const path = url.pathname.replace(/\/$/, '');

  const reelMatch = path.match(/\/reels?\/([^/?]+)/);
  if (reelMatch) {
    videoId = reelMatch[1];
    isReel = true;
    tags.push('reels');
  }

  if (!videoId) {
    const postMatch = path.match(/\/p\/([^/?]+)/);
    if (postMatch) videoId = postMatch[1];
  }

  if (!videoId) {
    const tvMatch = path.match(/\/tv\/([^/?]+)/);
    if (tvMatch) { videoId = tvMatch[1]; tags.push('igtv'); }
  }

  if (!videoId) {
    const userReelMatch = path.match(/\/([^/]+)\/reels?\/([^/?]+)/);
    if (userReelMatch) {
      author = userReelMatch[1];
      videoId = userReelMatch[2];
      isReel = true;
      tags.push('reels', userReelMatch[1]);
    }
  }

  if (!videoId) return null;

  const embedPath = isReel ? 'reel' : 'p';

  return {
    platform: 'instagram',
    videoId,
    thumbnail: null,
    embedUrl: `https://www.instagram.com/${embedPath}/${videoId}/embed/`,
    suggestedTags: uniqueTags(tags),
    author,
  };
}

function parseFacebook(url: URL, host: string, rawUrl: string): ParsedUrl | null {
  const tags: string[] = ['facebook'];
  let videoId: string | null = null;

  if (host === 'fb.watch') {
    videoId = url.pathname.slice(1).split('/')[0] || null;
  } else {
    const path = url.pathname;
    const reelMatch = path.match(/\/reel\/(\d+)/);
    if (reelMatch) { videoId = reelMatch[1]; tags.push('reels'); }
    if (!videoId) videoId = url.searchParams.get('v');
    if (!videoId) {
      const videoMatch = path.match(/\/videos\/(\d+)/);
      if (videoMatch) videoId = videoMatch[1];
    }
  }

  if (!videoId) return null;

  return {
    platform: 'facebook',
    videoId,
    thumbnail: null,
    embedUrl: `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false`,
    suggestedTags: uniqueTags(tags),
  };
}
