// Optional retail-price verification for AI Accommodation Letter Generator.
//
// Default behavior: Claude returns AI-estimated price ranges based on
// training knowledge. Honest, fast, no external dependency.
//
// Opt-in upgrade: set BRAVE_SEARCH_API_KEY in Vercel env. When set, every
// paid solution is also looked up on Brave Search, real retail prices
// are extracted from snippets, and the solution's price range is
// replaced with the live-verified one. `priceSource` flips from
// "ai-estimated" to "live-verified" and `verifiedAt` is set.
//
// Brave is preferred over alternatives for vendor coverage and because
// the API is one HTTP call away — no SDK, no auth dance. Tavily or
// Serper would slot in identically: implement the same shape.

export interface PaidSolutionInput {
  label: string;
  estimatedPriceLow: number;
  estimatedPriceHigh: number;
}

export interface VerifiedPriceRange {
  low: number;
  high: number;
  sourcesConsulted: string[]; // URLs we extracted prices from
}

const PRICE_RX = /\$\s?([0-9]{1,3}(?:,?[0-9]{3})*(?:\.[0-9]{2})?)/g;

function parsePrice(s: string): number {
  return parseFloat(s.replace(/,/g, ""));
}

interface BraveResult {
  title?: string;
  description?: string;
  url?: string;
}

async function braveSearch(
  query: string,
  apiKey: string,
): Promise<BraveResult[]> {
  const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`;
  const resp = await fetch(url, {
    headers: {
      Accept: "application/json",
      "X-Subscription-Token": apiKey,
    },
  });
  if (!resp.ok) return [];
  const body = (await resp.json()) as {
    web?: { results?: BraveResult[] };
  };
  return body.web?.results ?? [];
}

function extractPrices(results: BraveResult[]): {
  prices: number[];
  urls: string[];
} {
  const prices: number[] = [];
  const urls: string[] = [];
  for (const r of results) {
    const haystack = `${r.title ?? ""} ${r.description ?? ""}`;
    const found = haystack.match(PRICE_RX);
    if (!found) continue;
    let hit = false;
    for (const m of found) {
      const v = parsePrice(m.replace(/[^\d.,]/g, ""));
      // Filter obvious noise — sub-$5 mentions are usually shipping or
      // fees; sub-$0 nonsense from misparsed text; absurd outliers
      // beyond $50k for office accommodations.
      if (v >= 5 && v < 50_000) {
        prices.push(v);
        hit = true;
      }
    }
    if (hit && r.url) urls.push(r.url);
  }
  return { prices, urls };
}

export async function verifyPriceRange(
  solution: PaidSolutionInput,
): Promise<VerifiedPriceRange | null> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;
  if (!apiKey) return null;

  try {
    // Bias the query toward retail product pages rather than reviews
    // or news articles by appending "price" + the current year.
    const year = new Date().getFullYear();
    const query = `${solution.label} price ${year}`;
    const results = await braveSearch(query, apiKey);
    const { prices, urls } = extractPrices(results);
    if (prices.length < 2) return null;

    // Use the 25th / 75th percentile rather than absolute min/max so a
    // single outlier (e.g. $1 accessory shipping line, $9999 enterprise
    // SKU) doesn't pollute the range.
    prices.sort((a, b) => a - b);
    const lowIdx = Math.floor(prices.length * 0.25);
    const highIdx = Math.floor(prices.length * 0.75);
    return {
      low: Math.round(prices[lowIdx]),
      high: Math.round(prices[highIdx] ?? prices[prices.length - 1]),
      sourcesConsulted: urls.slice(0, 3),
    };
  } catch {
    return null;
  }
}
