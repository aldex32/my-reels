import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Reel } from './types';

interface ReelStore {
  reels: Reel[];
  searchQuery: string;
  activeTags: string[];

  addReel: (reel: Omit<Reel, 'id' | 'addedAt'>) => void;
  deleteReel: (id: string) => void;
  updateTags: (id: string, tags: string[]) => void;
  setSearchQuery: (q: string) => void;
  toggleActiveTag: (tag: string) => void;
  clearFilters: () => void;
}

export const useReelStore = create<ReelStore>()(
  persist(
    (set) => ({
      reels: [],
      searchQuery: '',
      activeTags: [],

      addReel: (reelData) => {
        const reel: Reel = {
          ...reelData,
          id: crypto.randomUUID(),
          addedAt: Date.now(),
        };
        set((state) => ({ reels: [reel, ...state.reels] }));
      },

      deleteReel: (id) =>
        set((state) => ({ reels: state.reels.filter((r) => r.id !== id) })),

      updateTags: (id, tags) =>
        set((state) => ({
          reels: state.reels.map((r) => (r.id === id ? { ...r, tags } : r)),
        })),

      setSearchQuery: (searchQuery) => set({ searchQuery }),

      toggleActiveTag: (tag) =>
        set((state) => ({
          activeTags: state.activeTags.includes(tag)
            ? state.activeTags.filter((t) => t !== tag)
            : [...state.activeTags, tag],
        })),

      clearFilters: () => set({ searchQuery: '', activeTags: [] }),
    }),
    {
      name: 'my-reels-store',
      partialize: (state) => ({ reels: state.reels }),
    }
  )
);

export function useFilteredReels() {
  const { reels, searchQuery, activeTags } = useReelStore();

  return reels.filter((reel) => {
    if (activeTags.length > 0 && !activeTags.some((t) => reel.tags.includes(t))) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const haystack = [reel.title, reel.author ?? '', ...reel.tags, reel.url].join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function useAllTags(): { tag: string; count: number }[] {
  const { reels } = useReelStore();
  const counts: Record<string, number> = {};
  reels.forEach((r) => r.tags.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1; }));
  return Object.entries(counts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
