const STOP_WORDS = new Set([
  // English function words
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'was', 'are', 'were', 'be', 'been',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'this', 'that', 'these', 'those', 'i', 'you',
  'he', 'she', 'it', 'we', 'they', 'what', 'which', 'who', 'how', 'when',
  'where', 'why', 'not', 'no', 'so', 'up', 'out', 'if', 'as', 'my', 'your',
  'his', 'her', 'its', 'our', 'their', 'just', 'also', 'more', 'than',
  'into', 'about', 'over', 'after', 'before', 'during', 'through',
  'get', 'got', 'can', 'all', 'one', 'two', 'new',
  // Social media / video noise — present in almost every title but not useful as tags
  'video', 'watch', 'see', 'look', 'here', 'now', 'today',
  'subscribe', 'follow', 'like', 'share', 'comment', 'click',
  'check', 'link', 'bio', 'please', 'swipe', 'tap',
  'via', 'amp',
]);

/**
 * Extracts meaningful keyword tags from a video title.
 * Filters stop words and short words, returns up to 8 unique tags.
 */
export function extractKeywordTags(title: string): string[] {
  return [
    ...new Set(
      title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
    ),
  ].slice(0, 8);
}

/**
 * Extracts #hashtags from a string (TikTok captions, OG descriptions, etc).
 */
export function extractHashtags(text: string): string[] {
  return [
    ...new Set(
      (text.match(/#([a-zA-Z][a-zA-Z0-9_]*)/g) ?? [])
        .map((h) => h.slice(1).toLowerCase())
        .filter((h) => h.length > 1 && h.length < 32 && !STOP_WORDS.has(h))
    ),
  ].slice(0, 10);
}
