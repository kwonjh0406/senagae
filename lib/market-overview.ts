type YahooChartResult = {
  meta?: {
    currency?: string;
    regularMarketPrice?: number;
    previousClose?: number;
    chartPreviousClose?: number;
  };
  timestamp?: number[];
  indicators?: {
    quote?: Array<{
      close?: Array<number | null>;
    }>;
  };
};

export type MarketOverviewItem = {
  category: "exchange" | "index" | "sentiment";
  change: number | null;
  label: string;
  note: string;
  tone: "down" | "flat" | "up";
  value: string;
};

export type FearGreedItem = {
  label: string;
  score: number | null;
  tone: "fear" | "greed" | "neutral";
  updatedAt: string | null;
};

export type MarketOverview = {
  asOf: string;
  fearGreed: FearGreedItem;
  items: MarketOverviewItem[];
};

const MARKET_CONFIG = [
  { category: "index", label: "코스피", note: "한국 대표 지수", symbol: "^KS11" },
  { category: "index", label: "코스닥", note: "성장주 흐름", symbol: "^KQ11" },
  { category: "index", label: "S&P 500", note: "미국 대형주", symbol: "^GSPC" },
  { category: "index", label: "나스닥", note: "미국 기술주", symbol: "^IXIC" },
  { category: "exchange", label: "원달러", note: "USD/KRW", symbol: "KRW=X" },
] as const;

function formatNumber(value: number, digits = 2) {
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value);
}

function toneFromChange(change: number | null): MarketOverviewItem["tone"] {
  if (change === null || Math.abs(change) < 0.03) return "flat";
  return change > 0 ? "up" : "down";
}

function sentimentLabel(score: number | null, fallback = "") {
  if (score === null) return "데이터 대기";
  const normalized = fallback.toLowerCase();
  if (normalized.includes("extreme fear")) return "극단적 공포";
  if (normalized.includes("fear")) return "공포";
  if (normalized.includes("neutral")) return "중립";
  if (normalized.includes("extreme greed")) return "극단적 탐욕";
  if (normalized.includes("greed")) return "탐욕";
  if (score <= 20) return "극단적 공포";
  if (score <= 40) return "공포";
  if (score <= 60) return "중립";
  if (score <= 80) return "탐욕";
  return "극단적 탐욕";
}

async function fetchYahooSnapshot(symbol: string) {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    },
  );

  if (!response.ok) {
    throw new Error(`Yahoo snapshot failed: ${symbol}`);
  }

  const payload = await response.json();
  const result: YahooChartResult | undefined = payload?.chart?.result?.[0];
  const closes = result?.indicators?.quote?.[0]?.close?.filter((value): value is number => typeof value === "number") ?? [];
  const latest = result?.meta?.regularMarketPrice ?? closes.at(-1);
  const previous = result?.meta?.previousClose ?? result?.meta?.chartPreviousClose ?? closes.at(-2);

  if (typeof latest !== "number") {
    throw new Error(`No latest price: ${symbol}`);
  }

  const change = typeof previous === "number" && previous > 0 ? ((latest - previous) / previous) * 100 : null;
  return { change, latest };
}

async function fetchFearGreed(): Promise<FearGreedItem> {
  try {
    const response = await fetch("https://kospi.feargreedchart.com/api/?action=kospi", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error("KOSPI fear and greed fetch failed");
    }

    const payload = await response.json();
    const rawScore = Number(payload?.score);
    const label = String(payload?.label ?? "");
    const updated = typeof payload?.updated === "string" ? payload.updated : null;
    const score = Number.isFinite(rawScore) ? Math.round(rawScore) : null;
    const tone = score === null ? "neutral" : score >= 55 ? "greed" : score <= 45 ? "fear" : "neutral";

    return {
      label: sentimentLabel(score, label),
      score,
      tone,
      updatedAt: updated,
    };
  } catch {
    // Fall through to the broader US stock sentiment endpoint below.
  }

  try {
    const response = await fetch("https://feargreedchart.com/api/?action=all", {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 1800 },
    });

    if (!response.ok) {
      throw new Error("Fear and greed fetch failed");
    }

    const payload = await response.json();
    const rawScore = Number(payload?.score?.score);
    const timestamp = Number(payload?.ts);
    const score = Number.isFinite(rawScore) ? Math.round(rawScore) : null;
    const tone = score === null ? "neutral" : score >= 55 ? "greed" : score <= 45 ? "fear" : "neutral";

    return {
      label: sentimentLabel(score),
      score,
      tone,
      updatedAt: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null,
    };
  } catch {
    return {
      label: "데이터 대기",
      score: null,
      tone: "neutral",
      updatedAt: null,
    };
  }
}

export async function getMarketOverview(): Promise<MarketOverview> {
  const [snapshots, fearGreed] = await Promise.all([
    Promise.allSettled(MARKET_CONFIG.map((item) => fetchYahooSnapshot(item.symbol))),
    fetchFearGreed(),
  ]);

  const items = MARKET_CONFIG.map((item, index): MarketOverviewItem => {
    const snapshot = snapshots[index];
    if (snapshot.status === "rejected") {
      return {
        category: item.category,
        change: null,
        label: item.label,
        note: item.note,
        tone: "flat",
        value: "대기",
      };
    }

    return {
      category: item.category,
      change: snapshot.value.change,
      label: item.label,
      note: item.note,
      tone: toneFromChange(snapshot.value.change),
      value: formatNumber(snapshot.value.latest, item.category === "exchange" ? 2 : 2),
    };
  });

  return {
    asOf: new Date().toISOString(),
    fearGreed,
    items,
  };
}
