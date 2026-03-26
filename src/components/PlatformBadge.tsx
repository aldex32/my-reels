import { Platform } from '../types';

const CONFIG: Record<Platform, { label: string; classes: string; placeholderClasses: string; short: string }> = {
  youtube: {
    label: 'YouTube',
    classes: 'bg-red-600 text-white',
    placeholderClasses: 'bg-red-600',
    short: 'YT',
  },
  tiktok: {
    label: 'TikTok',
    classes: 'bg-black text-white',
    placeholderClasses: 'bg-black',
    short: 'TT',
  },
  instagram: {
    label: 'Instagram',
    classes: 'bg-gradient-to-r from-purple-600 to-pink-500 text-white',
    placeholderClasses: 'bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400',
    short: 'IG',
  },
  facebook: {
    label: 'Facebook',
    classes: 'bg-blue-600 text-white',
    placeholderClasses: 'bg-blue-600',
    short: 'FB',
  },
};

export function PlatformBadge({ platform }: { platform: Platform }) {
  const c = CONFIG[platform];
  return (
    <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${c.classes}`}>
      {c.label}
    </span>
  );
}

export function PlatformPlaceholder({ platform }: { platform: Platform }) {
  const c = CONFIG[platform];
  return (
    <div className={`w-full h-full ${c.placeholderClasses} flex items-center justify-center`}>
      <span className="text-white text-5xl font-black opacity-20 select-none">{c.short}</span>
    </div>
  );
}
