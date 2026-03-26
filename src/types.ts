export type Platform = 'youtube' | 'instagram' | 'tiktok' | 'facebook';

export interface Reel {
  id: string;
  url: string;
  platform: Platform;
  videoId: string;
  title: string;
  thumbnail: string | null;
  tags: string[];
  addedAt: number;
  author?: string;
}

export interface ParsedUrl {
  platform: Platform;
  videoId: string;
  thumbnail: string | null;
  embedUrl: string | null;
  suggestedTags: string[];
  author?: string;
}