import type {
  AnalyzeResponse,
  ChartCandle,
  IndicatorCandle,
  IndicatorSnapshot,
  MarketName,
  PriceCandle,
  Regime,
  RegimeResponse,
  ScoreBreakdown,
  ScoreDetails,
  Signal,
  TrendMode,
} from "./types";
import krxListing from "./krx-listing.json";

const MIN_BARS = 80;

const INDEX_SYMBOLS: Record<MarketName, string> = {
  KOSPI: "^KS11",
  KOSDAQ: "^KQ11",
  NYSE: "^DJI",
  NASDAQ: "^IXIC",
};

const KOREAN_SYMBOLS: Record<string, { code: string; name: string }> = {
  삼성전자: { code: "005930", name: "삼성전자" },
  sk하이닉스: { code: "000660", name: "SK하이닉스" },
  "sk 하이닉스": { code: "000660", name: "SK하이닉스" },
  현대차: { code: "005380", name: "현대차" },
  기아: { code: "000270", name: "기아" },
  네이버: { code: "035420", name: "NAVER" },
  naver: { code: "035420", name: "NAVER" },
  카카오: { code: "035720", name: "카카오" },
  셀트리온: { code: "068270", name: "셀트리온" },
  lg에너지솔루션: { code: "373220", name: "LG에너지솔루션" },
  "lg 에너지솔루션": { code: "373220", name: "LG에너지솔루션" },
  posco홀딩스: { code: "005490", name: "POSCO홀딩스" },
  포스코홀딩스: { code: "005490", name: "POSCO홀딩스" },
  삼성바이오로직스: { code: "207940", name: "삼성바이오로직스" },
  에코프로: { code: "086520", name: "에코프로" },
  에코프로비엠: { code: "247540", name: "에코프로비엠" },
  알테오젠: { code: "196170", name: "알테오젠" },
  hls: { code: "028300", name: "HLB" },
  hlb: { code: "028300", name: "HLB" },
};

const KOREAN_CODE_NAMES = Object.values(KOREAN_SYMBOLS).reduce<Record<string, string>>((acc, item) => {
  acc[item.code] = item.name;
  return acc;
}, {});

type KrxListingRow = {
  code: string;
  market: "KOSDAQ" | "KOSPI";
  name: string;
};

const KRX_LISTING = krxListing as KrxListingRow[];

type ResolvedSymbol = {
  userSymbol: string;
  dataSymbol: string;
  market: MarketName;
  name: string;
  yahooSymbol: string;
};

type YahooQuote = {
  close?: Array<number | null>;
  high?: Array<number | null>;
  low?: Array<number | null>;
  open?: Array<number | null>;
  volume?: Array<number | null>;
};

function clamp(value: number, low = 0, high = 1) {
  return Math.max(low, Math.min(high, value));
}

function round(value: number, digits = 2) {
  const unit = 10 ** digits;
  return Math.round(value * unit) / unit;
}

function average(values: number[]) {
  if (!values.length) return Number.NaN;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rollingAverage(values: number[], endIndex: number, window: number) {
  if (endIndex + 1 < window) return Number.NaN;
  return average(values.slice(endIndex - window + 1, endIndex + 1));
}

function ewm(values: number[], alpha: number, minPeriods: number) {
  const result: number[] = [];
  let previous = Number.NaN;

  values.forEach((value, index) => {
    if (Number.isNaN(previous)) {
      previous = value;
    } else {
      previous = alpha * value + (1 - alpha) * previous;
    }
    result.push(index + 1 >= minPeriods ? previous : Number.NaN);
  });

  return result;
}

function resolveInputSymbol(input: string) {
  const raw = input.trim();
  if (!raw) {
    throw new Error("종목명 또는 티커를 입력해주세요.");
  }

  const lowered = raw.toLowerCase();
  const mapped = KOREAN_SYMBOLS[lowered];
  if (mapped) {
    return { code: mapped.code, name: mapped.name, preferredMarket: undefined as MarketName | undefined };
  }

  if (/^\d{1,6}$/.test(raw)) {
    const code = raw.padStart(6, "0");
    const listed = KRX_LISTING.find((row) => row.code === code);
    if (listed) {
      return { code, name: listed.name, preferredMarket: listed.market as MarketName };
    }
    return { code, name: KOREAN_CODE_NAMES[code] ?? code, preferredMarket: undefined as MarketName | undefined };
  }

  const exactName = KRX_LISTING.find((row) => row.name.toLowerCase() === lowered);
  if (exactName) {
    return { code: exactName.code, name: exactName.name, preferredMarket: exactName.market as MarketName };
  }

  const startsWith = KRX_LISTING.filter((row) => row.name.toLowerCase().startsWith(lowered));
  if (startsWith.length === 1) {
    const [listed] = startsWith;
    return { code: listed.code, name: listed.name, preferredMarket: listed.market as MarketName };
  }

  const contains = KRX_LISTING.filter((row) => row.name.toLowerCase().includes(lowered));
  if (contains.length === 1) {
    const [listed] = contains;
    return { code: listed.code, name: listed.name, preferredMarket: listed.market as MarketName };
  }

  const suggestions = [...startsWith, ...contains]
    .filter((row, index, rows) => rows.findIndex((item) => item.code === row.code) === index)
    .slice(0, 5);
  if (suggestions.length > 0) {
    const formatted = suggestions.map((row) => `${row.name}(${row.code})`).join(", ");
    throw new Error(`'${raw}' 검색 결과가 여러 개입니다. 예: ${formatted}`);
  }

  if (/[ㄱ-ㅎㅏ-ㅣ가-힣]/.test(raw)) {
    throw new Error(`종목을 찾지 못했습니다: '${raw}'. 종목명 또는 6자리 코드를 입력해주세요.`);
  }

  return { code: raw.toUpperCase(), name: raw.toUpperCase(), preferredMarket: "NASDAQ" as MarketName };
}

async function fetchYahooCandles(yahooSymbol: string): Promise<PriceCandle[]> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      yahooSymbol,
    )}?range=1y&interval=1d`,
    {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 600 },
    },
  );

  if (!response.ok) {
    throw new Error("시세 데이터를 가져오지 못했습니다.");
  }

  const payload = await response.json();
  const result = payload?.chart?.result?.[0];
  const timestamps: number[] = result?.timestamp ?? [];
  const quote: YahooQuote = result?.indicators?.quote?.[0] ?? {};

  const candles = timestamps
    .map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().slice(0, 10),
      open: quote.open?.[index],
      high: quote.high?.[index],
      low: quote.low?.[index],
      close: quote.close?.[index],
      volume: quote.volume?.[index] ?? 0,
    }))
    .filter(
      (row): row is PriceCandle =>
        typeof row.open === "number" &&
        typeof row.high === "number" &&
        typeof row.low === "number" &&
        typeof row.close === "number",
    );

  if (candles.length < MIN_BARS) {
    throw new Error("분석에 필요한 일봉 데이터가 부족합니다.");
  }

  return candles;
}

async function resolveSymbol(input: string): Promise<ResolvedSymbol> {
  const resolved = resolveInputSymbol(input);

  if (resolved.preferredMarket === "KOSPI" || resolved.preferredMarket === "KOSDAQ") {
    return {
      userSymbol: resolved.code,
      dataSymbol: resolved.code,
      market: resolved.preferredMarket,
      name: resolved.name,
      yahooSymbol: `${resolved.code}.${resolved.preferredMarket === "KOSPI" ? "KS" : "KQ"}`,
    };
  }

  if (resolved.preferredMarket === "NASDAQ") {
    return {
      userSymbol: resolved.code,
      dataSymbol: resolved.code,
      market: "NASDAQ",
      name: resolved.name,
      yahooSymbol: resolved.code,
    };
  }

  const kospiSymbol = `${resolved.code}.KS`;
  try {
    await fetchYahooCandles(kospiSymbol);
    return {
      userSymbol: resolved.code,
      dataSymbol: resolved.code,
      market: "KOSPI",
      name: resolved.name,
      yahooSymbol: kospiSymbol,
    };
  } catch {
    return {
      userSymbol: resolved.code,
      dataSymbol: resolved.code,
      market: "KOSDAQ",
      name: resolved.name,
      yahooSymbol: `${resolved.code}.KQ`,
    };
  }
}

function addIndicators(candles: PriceCandle[]): IndicatorCandle[] {
  const closes = candles.map((row) => row.close);
  const highs = candles.map((row) => row.high);
  const lows = candles.map((row) => row.low);
  const trueRanges = candles.map((row, index) => {
    const previousClose = index > 0 ? closes[index - 1] : row.close;
    return Math.max(row.high - row.low, Math.abs(row.high - previousClose), Math.abs(row.low - previousClose));
  });
  const atr = ewm(trueRanges, 1 / 14, 14);

  const plusDm = candles.map((_, index) => {
    if (index === 0) return 0;
    const upMove = highs[index] - highs[index - 1];
    const downMove = lows[index - 1] - lows[index];
    return upMove > downMove && upMove > 0 ? upMove : 0;
  });
  const minusDm = candles.map((_, index) => {
    if (index === 0) return 0;
    const upMove = highs[index] - highs[index - 1];
    const downMove = lows[index - 1] - lows[index];
    return downMove > upMove && downMove > 0 ? downMove : 0;
  });

  const smoothPlusDm = ewm(plusDm, 1 / 14, 14);
  const smoothMinusDm = ewm(minusDm, 1 / 14, 14);
  const dx = candles.map((_, index) => {
    const currentAtr = atr[index];
    if (!currentAtr || Number.isNaN(currentAtr)) return 0;
    const plusDi = (100 * smoothPlusDm[index]) / currentAtr;
    const minusDi = (100 * smoothMinusDm[index]) / currentAtr;
    const sum = plusDi + minusDi;
    return sum ? (100 * Math.abs(plusDi - minusDi)) / sum : 0;
  });
  const adx = ewm(dx, 1 / 14, 14);

  return candles.map((row, index) => {
    const ma5 = rollingAverage(closes, index, 5);
    const ma20 = rollingAverage(closes, index, 20);
    const ma60 = rollingAverage(closes, index, 60);
    return {
      ...row,
      ma5,
      ma20,
      ma60,
      atr: atr[index],
      atrPct: row.close > 0 ? (atr[index] / row.close) * 100 : Number.NaN,
      adx: adx[index],
      changePct1d: index > 0 ? ((row.close - closes[index - 1]) / closes[index - 1]) * 100 : 0,
      changePct5d: index >= 5 ? ((row.close - closes[index - 5]) / closes[index - 5]) * 100 : 0,
      ma5Slope: index >= 3 ? ma5 - rollingAverage(closes, index - 3, 5) : 0,
      ma20Slope: index >= 5 ? ma20 - rollingAverage(closes, index - 5, 20) : 0,
      ma60Slope: index >= 5 ? ma60 - rollingAverage(closes, index - 5, 60) : 0,
    };
  });
}

function recentStructure(df: IndicatorCandle[], window: number, maColumn: "ma20") {
  const recent = df.slice(-window);
  const pivot = Math.max(Math.floor(window / 2), 1);
  const first = recent.slice(0, pivot);
  const second = recent.slice(pivot);
  const avgDistance = average(
    recent
      .map((row) => Math.abs(row.close - row[maColumn]) / row[maColumn])
      .filter((value) => Number.isFinite(value)),
  );

  return {
    higherHigh: Math.max(...second.map((row) => row.high)) > Math.max(...first.map((row) => row.high)),
    higherLow: Math.min(...second.map((row) => row.low)) > Math.min(...first.map((row) => row.low)),
    lowerHigh: Math.max(...second.map((row) => row.high)) < Math.max(...first.map((row) => row.high)),
    lowerLow: Math.min(...second.map((row) => row.low)) < Math.min(...first.map((row) => row.low)),
    priceHugsMa20: Number.isFinite(avgDistance) ? avgDistance < 0.018 : false,
  };
}

function indicatorSnapshot(row: IndicatorCandle): IndicatorSnapshot {
  return {
    close: round(row.close),
    ma20: round(row.ma20),
    ma60: round(row.ma60),
    adx: round(row.adx),
    atr: round(row.atr),
    atrPct: round(row.atrPct),
    changePct1d: round(row.changePct1d),
    changePct5d: round(row.changePct5d),
  };
}

function analyzeRegime(df: IndicatorCandle[], label: string, trendMode: TrendMode): RegimeResponse {
  const latest = df[df.length - 1];
  const isShort = trendMode === "20D";
  const structure = recentStructure(df, isShort ? 10 : 20, "ma20");
  const fastMa = isShort ? latest.ma5 : latest.ma20;
  const baseMa = isShort ? latest.ma20 : latest.ma60;
  const fastSlope = isShort ? latest.ma5Slope : latest.ma20Slope;
  const baseSlope = isShort ? latest.ma20Slope : latest.ma60Slope;
  const closeVsBase = baseMa ? (latest.close - baseMa) / baseMa : 0;
  const maGap = baseMa ? (fastMa - baseMa) / baseMa : 0;
  const distanceRows = df.slice(isShort ? -10 : -12);
  const avgMaDistance = average(
    distanceRows.map((row) => Math.abs(row.close - row.ma20) / row.ma20).filter((value) => Number.isFinite(value)),
  );
  const adxBullThreshold = isShort ? 20 : 25;
  const sidewaysAdxThreshold = isShort ? 18 : 20;

  let bullScore =
    0.26 * clamp(closeVsBase / (isShort ? 0.04 : 0.05)) +
    0.24 * clamp(maGap / (isShort ? 0.02 : 0.03)) +
    0.2 * clamp((latest.adx - (isShort ? 18 : 20)) / (isShort ? 12 : 15)) +
    0.15 * Number(structure.higherHigh) +
    0.15 * Number(structure.higherLow);
  if (fastSlope > 0) bullScore += 0.05;
  if (baseSlope > 0) bullScore += 0.03;

  let bearScore =
    0.26 * clamp(-closeVsBase / (isShort ? 0.04 : 0.05)) +
    0.24 * clamp(-maGap / (isShort ? 0.02 : 0.03)) +
    0.2 * clamp((latest.adx - (isShort ? 18 : 20)) / (isShort ? 12 : 15)) +
    0.15 * Number(structure.lowerHigh) +
    0.15 * Number(structure.lowerLow);
  if (fastSlope < 0) bearScore += 0.05;
  if (baseSlope < 0) bearScore += 0.03;

  const sidewaysScore =
    0.38 * clamp((sidewaysAdxThreshold - latest.adx) / 10) +
    0.32 * clamp(1 - Math.abs(maGap) / (isShort ? 0.018 : 0.02)) +
    0.3 * clamp(1 - (Number.isFinite(avgMaDistance) ? avgMaDistance : 1) / 0.025);

  const bullishChecks = [
    latest.close > baseMa,
    fastMa > baseMa,
    latest.adx > adxBullThreshold,
    structure.higherHigh,
    structure.higherLow,
  ].filter(Boolean).length;
  const bearishChecks = [
    latest.close < baseMa,
    fastMa < baseMa,
    latest.adx > adxBullThreshold,
    structure.lowerHigh,
    structure.lowerLow,
  ].filter(Boolean).length;
  const sidewaysChecks = [
    latest.adx < sidewaysAdxThreshold,
    Math.abs(maGap) < (isShort ? 0.01 : 0.012),
    Number.isFinite(avgMaDistance) ? avgMaDistance < 0.018 : false,
  ].filter(Boolean).length;

  const scores: Record<Regime, number> = { BULL: bullScore, BEAR: bearScore, SIDEWAYS: sidewaysScore };
  let regime: Regime;
  if (bullishChecks >= 4 && bullScore >= Math.max(bearScore, sidewaysScore) - 0.03) {
    regime = "BULL";
  } else if (bearishChecks >= 4 && bearScore >= Math.max(bullScore, sidewaysScore) - 0.03) {
    regime = "BEAR";
  } else {
    regime = (Object.keys(scores) as Regime[]).reduce((best, key) => (scores[key] > scores[best] ? key : best), "BULL");
    if (regime !== "SIDEWAYS" && scores[regime] < 0.58) regime = "SIDEWAYS";
  }

  const sortedScores = Object.values(scores).sort((a, b) => b - a);
  const confidence = clamp(scores[regime] * 0.78 + (sortedScores[0] - sortedScores[1]) * 0.7, 0.5, 0.98);

  return {
    market: label,
    regime,
    confidence: round(confidence),
    asOf: latest.date,
    price: round(latest.close),
    indicators: indicatorSnapshot(latest),
    structure,
    details: {
      trendScore: round(bullScore, 3),
      bearScore: round(bearScore, 3),
      sidewaysScore: round(sidewaysScore, 3),
      bullishChecks,
      bearishChecks,
      sidewaysChecks,
    },
  };
}

function scoreEntry(args: {
  close: number;
  ma5: number;
  ma20: number;
  ma60: number;
  adx: number;
  atrPct: number;
  changePct5d: number;
  symbolRegime: Regime;
  marketRegime: Regime;
  ma5Slope: number;
  ma20Slope: number;
  ma60Slope: number;
  trendMode: TrendMode;
}): { score: number; signal: Signal; breakdown: ScoreBreakdown; details: ScoreDetails } {
  let trendAlignment = 0;
  if (args.trendMode === "20D") {
    if (args.close > args.ma20) trendAlignment += 12;
    if (args.ma5 > args.ma20) trendAlignment += 10;
    if (args.ma20Slope > 0) trendAlignment += 8;
  } else {
    if (args.close > args.ma20) trendAlignment += 10;
    if (args.ma20 > args.ma60) trendAlignment += 10;
    if (args.ma60Slope > 0) trendAlignment += 10;
  }

  let marketMatch = 0;
  if (args.symbolRegime === "BULL" && args.marketRegime === "BULL") marketMatch = 20;
  else if (args.symbolRegime === "BULL" && args.marketRegime === "SIDEWAYS") marketMatch = 12;
  else if (args.symbolRegime === "SIDEWAYS" && args.marketRegime === "BULL") marketMatch = 10;

  let momentum = 0;
  if (args.trendMode === "20D") {
    if (args.adx >= 20) momentum += 10;
    else if (args.adx >= 15) momentum += 6;
    else if (args.adx >= 12) momentum += 3;
    if (args.ma5Slope > 0) momentum += 6;
    if (args.changePct5d >= 2) momentum += 4;
    else if (args.changePct5d > 0) momentum += 2;
  } else {
    if (args.adx >= 25) momentum += 12;
    else if (args.adx >= 20) momentum += 8;
    else if (args.adx >= 15) momentum += 4;
    if (args.ma20Slope > 0) momentum += 4;
    if (args.changePct5d >= 3) momentum += 4;
    else if (args.changePct5d > 0) momentum += 2;
  }

  const distanceToMa20Pct = args.ma20 ? ((args.close - args.ma20) / args.ma20) * 100 : 0;
  const distanceAbs = Math.abs(distanceToMa20Pct);
  let pullback = 0;
  if (args.trendMode === "20D") {
    if (args.close >= args.ma20 && distanceAbs <= 2.5) pullback = 15;
    else if (args.close >= args.ma20 && distanceAbs <= 5) pullback = 10;
    else if (args.close > args.ma20) pullback = 6;
    else if (args.close > 0) pullback = 2;
  } else {
    if (args.close >= args.ma20 && distanceAbs <= 3) pullback = 15;
    else if (args.close >= args.ma20 && distanceAbs <= 6) pullback = 10;
    else if (args.close > args.ma60) pullback = 6;
    else if (args.close > 0) pullback = 2;
  }

  let volatility = 0;
  let atrState: ScoreDetails["atrState"];
  if (args.atrPct >= 1.5 && args.atrPct <= 4.5) {
    volatility = 15;
    atrState = "stable";
  } else if (args.atrPct >= 0.8 && args.atrPct < 1.5) {
    volatility = 10;
    atrState = "compressed";
  } else if (args.atrPct > 4.5 && args.atrPct <= 6) {
    volatility = 8;
    atrState = "elevated";
  } else {
    volatility = args.atrPct > 0 ? 3 : 0;
    atrState = args.atrPct > 4.5 ? "elevated" : "compressed";
  }

  const breakdown = { trendAlignment, marketMatch, momentum, pullback, volatility };
  let score = Math.min(100, trendAlignment + marketMatch + momentum + pullback + volatility);
  if (args.close < (args.trendMode === "20D" ? args.ma20 : args.ma60)) score = Math.min(score, 45);
  else if (args.symbolRegime === "SIDEWAYS") score = Math.min(score, 70);

  const signal: Signal = score >= 85 ? "STRONG_BUY" : score >= 70 ? "BUY" : score >= 55 ? "WATCH" : "AVOID";

  return {
    score,
    signal,
    breakdown,
    details: {
      maAlignment: args.trendMode === "20D" ? args.close > args.ma20 && args.ma5 > args.ma20 : args.close > args.ma20 && args.ma20 > args.ma60,
      marketAlignment: args.symbolRegime === "BULL" && args.marketRegime === "BULL",
      adx: round(args.adx),
      atrState,
      priceVsMa20Pct: round(distanceToMa20Pct),
      priceVsMa60Pct: round(args.ma60 ? ((args.close - args.ma60) / args.ma60) * 100 : 0),
    },
  };
}

async function fetchInstrument(input: string) {
  const resolved = await resolveSymbol(input);
  const raw = await fetchYahooCandles(resolved.yahooSymbol);
  return { resolved, frame: addIndicators(raw) };
}

async function fetchMarketFrame(market: MarketName) {
  const raw = await fetchYahooCandles(INDEX_SYMBOLS[market]);
  return addIndicators(raw);
}

function toChart(rows: IndicatorCandle[]): ChartCandle[] {
  return rows.slice(-60).map((row) => ({
    date: row.date,
    open: round(row.open),
    high: round(row.high),
    low: round(row.low),
    close: round(row.close),
    volume: round(row.volume),
    ma20: Number.isFinite(row.ma20) ? round(row.ma20) : null,
    ma60: Number.isFinite(row.ma60) ? round(row.ma60) : null,
  }));
}

export async function analyzeStock(symbol: string, trendMode: TrendMode = "60D"): Promise<AnalyzeResponse> {
  const { resolved, frame } = await fetchInstrument(symbol);
  const marketFrame = await fetchMarketFrame(resolved.market);
  const instrumentRegime = analyzeRegime(frame, resolved.market, trendMode);
  const marketRegime = analyzeRegime(marketFrame, resolved.market, trendMode);
  const latest = frame[frame.length - 1];
  const scored = scoreEntry({
    close: latest.close,
    ma5: latest.ma5,
    ma20: latest.ma20,
    ma60: latest.ma60,
    adx: latest.adx,
    atrPct: latest.atrPct,
    changePct5d: latest.changePct5d,
    symbolRegime: instrumentRegime.regime,
    marketRegime: marketRegime.regime,
    ma5Slope: latest.ma5Slope,
    ma20Slope: latest.ma20Slope,
    ma60Slope: latest.ma60Slope,
    trendMode,
  });

  return {
    symbol: resolved.userSymbol,
    resolvedSymbol: resolved.dataSymbol,
    market: resolved.market,
    trendMode,
    regime: instrumentRegime.regime,
    score: scored.score,
    signal: scored.signal,
    confidence: instrumentRegime.confidence,
    asOf: instrumentRegime.asOf,
    price: round(latest.close),
    priceBasis: "daily_close",
    name: resolved.name,
    indicators: instrumentRegime.indicators,
    structure: instrumentRegime.structure,
    regimeDetails: instrumentRegime.details,
    details: scored.details,
    breakdown: scored.breakdown,
    marketContext: marketRegime,
    chart: toChart(frame),
  };
}
