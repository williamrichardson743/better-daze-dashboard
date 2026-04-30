/**
 * Step 1 — Trend Detection
 * Fetches top 5 trending keywords. Uses mock data (Google Trends API
 * requires a scraper or third-party service; swap in a real client here).
 */

export interface TrendResult {
  keyword: string;
  searchVolume: number;
}

const MOCK_TRENDS: TrendResult[] = [
  { keyword: 'AI automation', searchVolume: 850000 },
  { keyword: 'remote work lifestyle', searchVolume: 620000 },
  { keyword: 'crypto comeback', searchVolume: 540000 },
  { keyword: 'vintage aesthetic', searchVolume: 480000 },
  { keyword: 'mindfulness hustle', searchVolume: 390000 },
];

export async function detectTrends(): Promise<TrendResult[]> {
  console.log('📊 [Step 1] Detecting trending keywords...');

  // TODO: Replace with real Google Trends API / SerpAPI / Pytrends call
  // e.g. const response = await axios.get('https://serpapi.com/search?engine=google_trends&...')
  const trends = MOCK_TRENDS;

  console.log(`✅ [Step 1] Found ${trends.length} trending keywords`);
  trends.forEach((t) =>
    console.log(`   • "${t.keyword}" — ${t.searchVolume.toLocaleString()} searches`)
  );

  return trends;
}
