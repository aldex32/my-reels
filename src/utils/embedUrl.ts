import { Reel } from '../types';

export function getEmbedUrl(reel: Reel): string | null {
  switch (reel.platform) {
    case 'youtube':
      return `https://www.youtube.com/embed/${reel.videoId}?rel=0`;
    case 'tiktok':
      return `https://www.tiktok.com/embed/v2/${reel.videoId}`;
    case 'instagram': {
      const path = reel.tags.includes('reels') || reel.tags.includes('igtv') ? 'reel' : 'p';
      return `https://www.instagram.com/${path}/${reel.videoId}/embed/`;
    }
    case 'facebook':
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(reel.url)}&show_text=false`;
    default:
      return null;
  }
}
