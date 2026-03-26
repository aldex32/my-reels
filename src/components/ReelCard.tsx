import { useState } from 'react';
import { ExternalLink, Trash2, Tag } from 'lucide-react';
import { Reel } from '../types';
import { useReelStore } from '../store';
import { getEmbedUrl } from '../utils/embedUrl';
import { PlatformBadge, PlatformPlaceholder } from './PlatformBadge';

interface Props {
  reel: Reel;
  onEditTags: (reel: Reel) => void;
}

export function ReelCard({ reel, onEditTags }: Props) {
  const { deleteReel } = useReelStore();
  const embedUrl = getEmbedUrl(reel);
  const [confirming, setConfirming] = useState(false);

  const date = new Date(reel.addedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group relative">
      {/* Embed / preview area */}
      <div className="relative aspect-video bg-slate-900 overflow-hidden">
        {embedUrl ? (
          <iframe
            key={embedUrl}
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={reel.title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
            loading="lazy"
          />
        ) : reel.thumbnail ? (
          <img src={reel.thumbnail} alt={reel.title} className="w-full h-full object-cover" />
        ) : (
          <PlatformPlaceholder platform={reel.platform} />
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <PlatformBadge platform={reel.platform} />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <a
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              title="Open original"
              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); onEditTags(reel); }}
              title="Edit tags"
              className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Tag className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirming(true); }}
              title="Delete"
              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-800 line-clamp-2 mb-1" title={reel.title}>
          {reel.title}
        </p>

        {reel.author && (
          <p className="text-xs text-slate-500 mb-2">@{reel.author}</p>
        )}

        {reel.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {reel.tags.map((tag) => (
              <span key={tag} className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-slate-400">{date}</p>
      </div>

      {/* Inline delete confirmation overlay */}
      {confirming && (
        <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center gap-3 p-4">
          <Trash2 className="w-6 h-6 text-red-500" />
          <p className="text-sm font-medium text-slate-800 text-center">Delete this reel?</p>
          <p className="text-xs text-slate-500 text-center line-clamp-2">{reel.title}</p>
          <div className="flex gap-2 w-full">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 px-3 py-1.5 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteReel(reel.id)}
              className="flex-1 px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
