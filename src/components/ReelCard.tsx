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

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${reel.title}"?`)) deleteReel(reel.id);
  };

  const date = new Date(reel.addedAt).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
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
              onClick={handleDelete}
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
    </div>
  );
}
