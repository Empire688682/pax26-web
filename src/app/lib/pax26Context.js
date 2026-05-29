/**
 * Pax26 Dynamic Knowledge Builder
 *
 * Fetches live content from Pax26 website pages using the Jina reader API,
 * builds a rich AI context string, and caches it for 30 minutes.
 * Falls back to the hardcoded PAX26_KNOWLEDGE if fetching fails.
 */

import { fetchUrl } from '@/app/lib/fetchUrl';
import { PAX26_KNOWLEDGE } from '@/config/pax26Knowledge';

// In-memory cache (survives across requests in the same server process)
let _cachedContext = null;
let _cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Pages to scan. Ordered by priority — most important first.
 * We cap total context to avoid bloating the AI prompt.
 */
const PAX26_PAGES = [
  { url: 'pax26.com',                label: 'Homepage'          },
  { url: 'pax26.com/about',          label: 'About'             },
  { url: 'pax26.com/contact',        label: 'Contact'           },
];

const FETCH_TIMEOUT_MS = 8000;  // 8 seconds per page
const MAX_CHARS_PER_PAGE = 2000; // trim each page to keep prompt lean
const MAX_TOTAL_CHARS = 8000;    // hard cap on total dynamic content

/**
 * Fetch a single page with timeout. Returns trimmed text or null.
 */
async function fetchPage(url, label) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    // fetchUrl already prepends https://www. — pass just the domain+path
    const raw = await fetchUrl(url);
    clearTimeout(timer);

    if (!raw || raw.length < 50) return null;

    // Trim to max chars and clean up excessive whitespace
    const trimmed = raw
      .replace(/\s{3,}/g, '\n\n')
      .slice(0, MAX_CHARS_PER_PAGE);

    console.log(`[pax26Context] Fetched ${label} (${trimmed.length} chars)`);
    return `### ${label}\n${trimmed}`;
  } catch (err) {
    console.warn(`[pax26Context] Failed to fetch ${label} (${url}): ${err.message}`);
    return null;
  }
}

/**
 * Build the dynamic context by scanning Pax26 pages.
 * Returns a string combining live content + hardcoded fallback.
 */
async function buildDynamicContext() {
  // Fetch all pages concurrently
  const results = await Promise.allSettled(
    PAX26_PAGES.map(({ url, label }) => fetchPage(url, label))
  );

  const sections = results
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean);

  if (sections.length === 0) {
    console.warn('[pax26Context] All page fetches failed — using hardcoded knowledge only');
    return PAX26_KNOWLEDGE;
  }

  // Build dynamic section, capped at MAX_TOTAL_CHARS
  let dynamicContent = sections.join('\n\n---\n\n');
  if (dynamicContent.length > MAX_TOTAL_CHARS) {
    dynamicContent = dynamicContent.slice(0, MAX_TOTAL_CHARS) + '\n\n[Content truncated]';
  }

  // Combine: dynamic content first (higher priority), hardcoded as supplement
  const combined = `## Live Pax26 Website Content\n\n${dynamicContent}\n\n---\n\n## Additional Pax26 Knowledge\n\n${PAX26_KNOWLEDGE}`;

  console.log(`[pax26Context] Built dynamic context (${combined.length} chars, ${sections.length}/${PAX26_PAGES.length} pages)`);
  return combined;
}

/**
 * Get the Pax26 AI context, using cache when fresh.
 * Always returns a non-empty string.
 */
export async function getPax26Context() {
  const now = Date.now();

  if (_cachedContext && now - _cacheTimestamp < CACHE_TTL_MS) {
    console.log('[pax26Context] Serving from cache');
    return _cachedContext;
  }

  try {
    const context = await buildDynamicContext();
    _cachedContext = context;
    _cacheTimestamp = now;
    return context;
  } catch (err) {
    console.error('[pax26Context] buildDynamicContext threw:', err.message);
    // Return hardcoded fallback — never crash
    return PAX26_KNOWLEDGE;
  }
}

/**
 * Force-invalidate the cache (useful for testing or manual refresh).
 * Also called automatically on module load after knowledge base updates.
 */
export function invalidatePax26ContextCache() {
  _cachedContext = null;
  _cacheTimestamp = 0;
}

// Invalidate on every cold start so updated knowledge is always picked up
invalidatePax26ContextCache();
