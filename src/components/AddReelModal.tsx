import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Info } from 'lucide-react';
import { useReelStore } from '../store';
import { parseReelUrl } from '../utils/urlParser';
import { fetchOEmbed } from '../utils/oembed';
import { extractKeywordTags, extractHashtags } from '../utils/tagExtractor';
import { ParsedUrl, Platform } from '../types';
import { PlatformBadge, PlatformPlaceholder } from './PlatformBadge';
import { resolveFacebookUrl } from '../utils/resolveFacebookUrl';

const PLATFORM_TITLE: Record<Platform, string> = {
  youtube: 'YouTube Video',
  tiktok: 'TikTok Video',
  instagram: 'Instagram Reel',
  facebook: 'Facebook Video',
};

// Platforms that can reliably return metadata automatically
const AUTO_META_PLATFORMS: Platform[] = ['youtube', 'tiktok'];

interface Props {
  onClose: () => void;
  initialUrl?: string;
}

function TagChips({ tags, onRemove }: { tags: string[]; onRemove: (t: string) => void }) {
  return (
    <>
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
        >
          {tag}
          <button type="button" onClick={() => onRemove(tag)} className="hover:text-blue-900 leading-none">
            ×
          </button>
        </span>
      ))}
    </>
  );
}

export function AddReelModal({ onClose, initialUrl = '' }: Props) {
  const { addReel, reels } = useReelStore();

  const [url, setUrl] = useState(initialUrl);
  const [parsed, setParsed] = useState<ParsedUrl | null>(null);
  const [title, setTitle] = useState('');
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [urlError, setUrlError] = useState('');
  const [formError, setFormError] = useState('');

  const titleRef = useRef<HTMLInputElement>(null);
  const titleEdited = useRef(false);
  const lastFetchedTitle = useRef(''); // track what the last auto-set title was
  const resolvedUrl = useRef(''); // canonical URL after resolving share links

  // ── Fetch metadata when URL is pasted ────────────────────────────────────
  useEffect(() => {
    setUrlError('');
    titleEdited.current = false;
    lastFetchedTitle.current = '';
    resolvedUrl.current = '';

    if (!url.trim()) { setParsed(null); setThumbnail(null); setTitle(''); setTags([]); return; }

    const timer = setTimeout(async () => {
      const result = parseReelUrl(url.trim());
      if (!result) {
        setUrlError('Unsupported URL. Paste a link from YouTube, TikTok, Instagram, or Facebook.');
        return;
      }

      setParsed(result);
      setTags(result.suggestedTags);
      const fallback = PLATFORM_TITLE[result.platform];
      setTitle(fallback);
      if (result.thumbnail) setThumbnail(result.thumbnail);

      setIsLoading(true);

      if (result.platform === 'youtube') {
        const meta = await fetchOEmbed(url.trim(), 'youtube');
        if (meta?.title && !titleEdited.current) {
          setTitle(meta.title);
          lastFetchedTitle.current = meta.title;
          mergeTags([...extractKeywordTags(meta.title), ...extractHashtags(meta.title)]);
        }
        if (meta?.thumbnailUrl) setThumbnail(meta.thumbnailUrl);

      } else if (result.platform === 'tiktok') {
        const meta = await fetchOEmbed(url.trim(), 'tiktok');
        if (meta?.title && !titleEdited.current) {
          // TikTok oEmbed title = raw caption; strip leading hashtag clusters for display
          const display = meta.title.replace(/^(#\S+\s*)+/, '').trim() || meta.title;
          setTitle(display);
          lastFetchedTitle.current = display;
          mergeTags([...extractKeywordTags(meta.title), ...extractHashtags(meta.title)]);
          if (meta.thumbnailUrl) setThumbnail(meta.thumbnailUrl);
        }

      } else if (result.platform === 'facebook' && /\/share\/r\//.test(url.trim())) {
        // Facebook share URLs can't be embedded — try to resolve to canonical /reel/ID URL
        const resolved = await resolveFacebookUrl(url.trim());
        if (resolved) {
          const reParsed = parseReelUrl(resolved);
          if (reParsed) {
            resolvedUrl.current = resolved;
            setParsed(reParsed);
            if (reParsed.thumbnail) setThumbnail(reParsed.thumbnail);
          }
        }
      }
      // Instagram / Facebook — metadata fetching is blocked; user types title manually

      setIsLoading(false);

      // If the title is still the platform default after all fetches, focus it
      setTitle((current) => {
        if (!titleEdited.current && Object.values(PLATFORM_TITLE).includes(current)) {
          setTimeout(() => titleRef.current?.focus(), 50);
        }
        return current;
      });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // ── Auto-generate tags when user finishes editing the title ──────────────
  const handleTitleBlur = () => {
    const defaultTitles = Object.values(PLATFORM_TITLE) as string[];
    if (!title || defaultTitles.includes(title) || title === lastFetchedTitle.current) return;
    mergeTags([...extractKeywordTags(title), ...extractHashtags(title)]);
  };

  function mergeTags(newTags: string[]) {
    setTags((prev) => [...new Set([...prev, ...newTags])]);
  }

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase()
      .replace(/\s+/g, '_').replace(/[^a-z0-9_@.-]/g, '').slice(0, 32);
    if (tag && !tags.includes(tag)) setTags((prev) => [...prev, tag]);
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!parsed) { setFormError('Please enter a valid reel URL.'); return; }
    const saveUrl = resolvedUrl.current || url.trim();
    if (reels.some((r) => r.url === saveUrl)) { setFormError('This reel has already been saved.'); return; }

    addReel({
      url: saveUrl,
      platform: parsed.platform,
      videoId: parsed.videoId,
      title: title.trim() || PLATFORM_TITLE[parsed.platform],
      thumbnail,
      tags,
      author: parsed.author,
    });
    onClose();
  };

  const titleIsDefault = parsed && Object.values(PLATFORM_TITLE).includes(title);
  const needsManualTitle = parsed && !isLoading && !AUTO_META_PLATFORMS.includes(parsed.platform);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl my-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">Add Reel</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* URL */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">URL</label>
            <input
              autoFocus
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste a YouTube, TikTok, Instagram, or Facebook URL…"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                urlError ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
            />
            {urlError && <p className="text-xs text-red-500 mt-1">{urlError}</p>}
            {parsed && !urlError && (
              <div className="flex items-center gap-2 mt-1.5">
                <PlatformBadge platform={parsed.platform} />
                {isLoading && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Fetching details…
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          {parsed && (
            <div className="rounded-xl overflow-hidden bg-slate-900 aspect-video">
              {parsed.embedUrl ? (
                <iframe
                  key={parsed.embedUrl}
                  src={parsed.embedUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video preview"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
                />
              ) : thumbnail ? (
                <img src={thumbnail} alt="Preview" className="w-full h-full object-cover"
                  onError={() => setThumbnail(null)} />
              ) : (
                <PlatformPlaceholder platform={parsed.platform} />
              )}
            </div>
          )}

          {/* Manual title hint for Facebook / Instagram */}
          {needsManualTitle && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                {parsed!.platform === 'facebook' ? 'Facebook' : 'Instagram'} blocks automatic title
                fetching. Watch the video above and type what it's about — tags will generate automatically.
              </p>
            </div>
          )}

          {/* Title */}
          {parsed && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-slate-700">Title</label>
                {isLoading && <span className="text-xs text-slate-400">fetching…</span>}
              </div>
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => { setTitle(e.target.value); titleEdited.current = true; }}
                onBlur={handleTitleBlur}
                placeholder={needsManualTitle ? 'Describe what this video is about…' : 'Reel title'}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  titleIsDefault ? 'border-amber-300 bg-amber-50 text-slate-400' : 'border-slate-200'
                }`}
              />
            </div>
          )}

          {/* Tags */}
          {parsed && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tags</label>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  <TagChips tags={tags} onRemove={(t) => setTags((prev) => prev.filter((x) => x !== t))} />
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Type a tag and press Enter"
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button type="button" onClick={addTag}
                  className="px-3 py-1.5 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                  Add
                </button>
              </div>
            </div>
          )}

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 text-sm border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={!parsed || !url.trim()}
              className="flex-1 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Save Reel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
