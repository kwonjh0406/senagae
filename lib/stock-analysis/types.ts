export type TrendMode = "20D" | "60D";
export type Regime = "BULL" | "BEAR" | "SIDEWAYS";
export type Signal = "STRONG_BUY" | "BUY" | "WATCH" | "AVOID";
export type MarketName = "KOSPI" | "KOSDAQ" | "NYSE" | "NASDAQ";

export type PriceCandle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IndicatorCandle = PriceCandle & {
  ma5: number;
  ma20: number;
  ma60: number;
  atr: number;
  atrPct: number;
  adx: number;
  changePct1d: number;
  changePct5d: number;
  ma5Slope: number;
  ma20Slope: number;
  ma60Slope: number;
};

export type IndicatorSnapshot = {
  close: number;
  ma20: number;
  ma60: number;
  adx: number;
  atr: number;
  atrPct: number;
  changePct1d: number;
  changePct5d: number;
};

export type StructureSnapshot = {
  higherHigh: boolean;
  higherLow: boolean;
  lowerHigh: boolean;
  lowerLow: boolean;
  priceHugsMa20: boolean;
};

export type RegimeDetails = {
  trendScore: number;
  bearScore: number;
  sidewaysScore: number;
  bullishChecks: number;
  bearishChecks: number;
  sidewaysChecks: number;
};

export type RegimeResponse = {
  market: string;
  regime: Regime;
  confidence: number;
  asOf: string;
  price: number;
  indicators: IndicatorSnapshot;
  structure: StructureSnapshot;
  details: RegimeDetails;
};

export type ScoreBreakdown = {
  trendAlignment: number;
  marketMatch: number;
  momentum: number;
  pullback: number;
  volatility: number;
};

export type ScoreDetails = {
  maAlignment: boolean;
  marketAlignment: boolean;
  adx: number;
  atrState: "stable" | "elevated" | "compressed";
  priceVsMa20Pct: number;
  priceVsMa60Pct: number;
};

export type ChartCandle = {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma20: number | null;
  ma60: number | null;
};

export type AnalyzeResponse = {
  symbol: string;
  resolvedSymbol: string;
  market: MarketName;
  trendMode: TrendMode;
  regime: Regime;
  score: number;
  signal: Signal;
  confidence: number;
  asOf: string;
  price: number;
  priceBasis: "daily_close";
  name: string;
  indicators: IndicatorSnapshot;
  structure: StructureSnapshot;
  regimeDetails: RegimeDetails;
  details: ScoreDetails;
  breakdown: ScoreBreakdown;
  marketContext: RegimeResponse;
  chart: ChartCandle[];
};
