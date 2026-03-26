import { X } from 'lucide-react';
import { useReelStore, useAllTags } from '../store';

export function TagFilter() {
  const { activeTags, toggleActiveTag, clearFilters } = useReelStore();
  const allTags = useAllTags();

  if (allTags.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <span className="text-xs font-medium text-slate-500 shrink-0">Tags:</span>
      {activeTags.length > 0 && (
        <button
          onClick={clearFilters}
          className="shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
        >
          <X className="w-3 h-3" />
          Clear
        </button>
      )}
      {allTags.map(({ tag, count }) => {
        const active = activeTags.includes(tag);
        return (
          <button
            key={tag}
            onClick={() => toggleActiveTag(tag)}
            className={`shrink-0 text-xs px-3 py-1 rounded-full border transition-all ${
              active
                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {tag}
            <span className={`ml-1 ${active ? 'text-blue-200' : 'text-slate-400'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
