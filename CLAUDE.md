# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server at http://localhost:5173
npm run build     # Type-check + build to dist/
npm run preview   # Serve the production build locally
npx tsc --noEmit  # Type-check only (no build)
```

## Architecture

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS + Zustand

**Data flow:** All state lives in a single Zustand store (`src/store.ts`) persisted to `localStorage` under the key `my-reels-store`. Only the `reels` array is persisted; `searchQuery` and `activeTags` reset on page load.

**Adding a reel (the full flow):**
1. User pastes a URL → `parseReelUrl()` in `src/utils/urlParser.ts` detects platform and extracts `videoId`, thumbnail URL, suggested tags, and author.
2. `fetchOEmbed()` in `src/utils/oembed.ts` hits the platform's oEmbed endpoint to get a real title. YouTube works CORS-free; TikTok is blocked browser-side so it silently falls back to the video ID as title. Instagram/Facebook have no public oEmbed.
3. The resulting `Reel` object is stored via `store.addReel()`.

**Thumbnails:** YouTube thumbnails are fetched directly from `img.youtube.com/vi/{id}/hqdefault.jpg` — no auth needed. TikTok, Instagram, and Facebook show a styled platform-colored placeholder (`src/components/PlatformBadge.tsx → PlatformPlaceholder`).

**Tag normalization:** All tags are lowercased, spaces replaced with `_`, non-alphanumeric chars stripped (except `-`, `_`, `@`, `.`), max 32 chars. Apply this same normalization in both auto-extraction and manual tag input to avoid duplicates.

**Filtering:** `useFilteredReels()` in `store.ts` applies OR tag filtering (reel shown if it has *any* active tag) combined with a substring search across title + author + tags + URL.

## Key files

| File | Purpose |
|---|---|
| `src/store.ts` | Zustand store + `useFilteredReels` + `useAllTags` selectors |
| `src/types.ts` | `Reel` and `ParsedUrl` interfaces; `Platform` type |
| `src/utils/urlParser.ts` | URL → `ParsedUrl` for all 4 platforms |
| `src/utils/oembed.ts` | oEmbed fetch with 5s timeout |
| `src/components/AddReelModal.tsx` | URL parse + oEmbed fetch + tag editing in one flow |
| `src/components/PlatformBadge.tsx` | `PlatformBadge` and `PlatformPlaceholder` components |

## URL patterns handled

| Platform | Example URLs |
|---|---|
| YouTube | `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID` |
| TikTok | `tiktok.com/@user/video/ID`, `vm.tiktok.com/CODE` |
| Instagram | `instagram.com/reel/ID`, `instagram.com/p/ID`, `instagram.com/tv/ID` |
| Facebook | `facebook.com/reel/ID`, `facebook.com/watch?v=ID`, `facebook.com/*/videos/ID`, `fb.watch/CODE` |
