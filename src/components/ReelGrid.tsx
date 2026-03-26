import { Reel } from '../types';
import { useReelStore, useFilteredReels } from '../store';
import { ReelCard } from './ReelCard';

interface Props {
  onEditTags: (reel: Reel) => void;
}

export function ReelGrid({ onEditTags }: Props) {
  const filteredReels = useFilteredReels();
  const { reels, searchQuery, activeTags } = useReelStore();
  const hasFilters = searchQuery.trim() || activeTags.length > 0;

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-6xl mb-4">🎬</div>
        <p className="text-slate-600 text-lg font-medium">No reels saved yet</p>
        <p className="text-slate-400 text-sm mt-1">
          Click <strong>Add Reel</strong> and paste a link from YouTube, TikTok, Instagram, or Facebook.
        </p>
      </div>
    );
  }

  if (filteredReels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-3">🔍</div>
        <p className="text-slate-600 text-lg font-medium">No reels found</p>
        <p className="text-slate-400 text-sm mt-1">
          {hasFilters ? 'Try different search terms or clear the filters.' : 'No results.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredReels.map((reel) => (
        <ReelCard key={reel.id} reel={reel} onEditTags={onEditTags} />
      ))}
    </div>
  );
}
