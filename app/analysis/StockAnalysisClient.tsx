"use client";

import { FormEvent, useMemo, useState } from "react";
import type { AnalyzeResponse, ScoreBreakdown, Signal, TrendMode } from "@/lib/stock-analysis/types";

const signalLabels: Record<Signal, string> = {
  STRONG_BUY: "강한 관심",
  BUY: "관심",
  WATCH: "관찰",
  AVOID: "보류",
};

const signalText: Record<Signal, string> = {
  STRONG_BUY: "추세와 시장 흐름이 꽤 잘 맞아 있는 상태입니다.",
  BUY: "조건은 나쁘지 않지만 가격 위치를 같이 확인하세요.",
  WATCH: "아직은 관찰 구간에 가깝습니다.",
  AVOID: "진입 판단은 서두르지 않는 편이 좋아 보입니다.",
};

const breakdownLabels: { key: keyof ScoreBreakdown; label: string; max: number }[] = [
  { key: "trendAlignment", label: "추세 정렬", max: 30 },
  { key: "marketMatch", label: "시장 일치", max: 20 },
  { key: "momentum", label: "모멘텀", max: 20 },
  { key: "pullback", label: "눌림목", max: 15 },
  { key: "volatility", label: "변동성", max: 15 },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(value);
}

function formatPct(value: number) {
  return `${value > 0 ? "+" : ""}${formatNumber(value)}%`;
}

function AnalysisChart({ data }: { data: AnalyzeResponse["chart"] }) {
  const chart = useMemo(() => {
    const width = 760;
    const height = 360;
    const pad = { bottom: 44, left: 18, right: 70, top: 24 };
    const plotWidth = width - pad.left - pad.right;
    const plotHeight = 228;
    const volumeTop = pad.top + plotHeight + 22;
    const volumeHeight = height - volumeTop - pad.bottom;
    const prices = data.flatMap((row) => [row.high, row.low, row.ma20, row.ma60].filter((value): value is number => value !== null));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const pricePadding = (maxPrice - minPrice || maxPrice || 1) * 0.08;
    const min = minPrice - pricePadding;
    const max = maxPrice + pricePadding;
    const range = max - min || 1;
    const xStep = plotWidth / Math.max(data.length - 1, 1);
    const candleWidth = Math.max(4, Math.min(10, xStep * 0.58));
    const maxVolume = Math.max(...data.map((row) => row.volume), 1);

    const x = (index: number) => pad.left + index * xStep;
    const y = (value: number) => pad.top + ((max - value) / range) * plotHeight;
    const volumeY = (value: number) => volumeTop + volumeHeight - (value / maxVolume) * volumeHeight;

    const linePath = (key: "ma20" | "ma60") =>
      data
        .map((row, index) => {
          const value = row[key];
          if (value === null) return "";
          return `${index === 0 ? "M" : "L"} ${x(index).toFixed(2)} ${y(value).toFixed(2)}`;
        })
        .filter(Boolean)
        .join(" ");

    const priceTicks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
      const value = max - range * ratio;
      return { value, y: pad.top + plotHeight * ratio };
    });

    return {
      candleWidth,
      height,
      line20: linePath("ma20"),
      line60: linePath("ma60"),
      pad,
      priceTicks,
      volumeHeight,
      volumeTop,
      volumeY,
      width,
      x,
      y,
    };
  }, [data]);

  return (
    <div className="analysis-chart-wrap">
      <div className="chart-toolbar">
        <span>최근 60거래일</span>
        <strong>캔들 + MA20 + MA60</strong>
      </div>
      <svg className="analysis-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="최근 60일 캔들 차트">
        <rect className="chart-bg" height={chart.height} width={chart.width} x="0" y="0" />
        {chart.priceTicks.map((tick) => (
          <g className="chart-grid-line" key={tick.y}>
            <line x1={chart.pad.left} x2={chart.width - chart.pad.right} y1={tick.y} y2={tick.y} />
            <text x={chart.width - chart.pad.right + 12} y={tick.y + 5}>
              {formatNumber(tick.value)}
            </text>
          </g>
        ))}
        <line className="chart-axis" x1={chart.pad.left} x2={chart.width - chart.pad.right} y1={chart.volumeTop + chart.volumeHeight} y2={chart.volumeTop + chart.volumeHeight} />
        {data.map((row, index) => {
          const x = chart.x(index);
          const isUp = row.close >= row.open;
          const top = chart.y(Math.max(row.open, row.close));
          const bottom = chart.y(Math.min(row.open, row.close));
          const bodyHeight = Math.max(2, bottom - top);
          return (
            <g className={isUp ? "candle up" : "candle down"} key={row.date}>
              <line x1={x} x2={x} y1={chart.y(row.high)} y2={chart.y(row.low)} />
              <rect height={bodyHeight} width={chart.candleWidth} x={x - chart.candleWidth / 2} y={top} />
              <rect
                className="volume-bar"
                height={chart.volumeTop + chart.volumeHeight - chart.volumeY(row.volume)}
                width={chart.candleWidth}
                x={x - chart.candleWidth / 2}
                y={chart.volumeY(row.volume)}
              />
            </g>
          );
        })}
        <path className="ma-line ma20" d={chart.line20} />
        <path className="ma-line ma60" d={chart.line60} />
      </svg>
      <div className="chart-legend">
        <span><i className="up" />상승 캔들</span>
        <span><i className="down" />하락 캔들</span>
        <span><i className="ma20" />MA20</span>
        <span><i className="ma60" />MA60</span>
      </div>
    </div>
  );
}

export function StockAnalysisClient({
  initialAnalysis,
  initialMessage,
  initialSymbol,
}: {
  initialAnalysis: AnalyzeResponse | null;
  initialMessage: string;
  initialSymbol: string;
}) {
  const [symbol, setSymbol] = useState(initialSymbol || "005930");
  const [mode, setMode] = useState<TrendMode>("60D");
  const [analysis, setAnalysis] = useState<AnalyzeResponse | null>(initialAnalysis);
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);

  async function runAnalysis(nextSymbol = symbol, nextMode = mode) {
    const trimmed = nextSymbol.trim();
    if (!trimmed) {
      setMessage("종목명 또는 티커를 입력해주세요.");
      return;
    }

    setLoading(true);
    setMessage("시세와 시장 흐름을 읽는 중입니다.");
    try {
      const response = await fetch(
        `/api/stock-analysis?symbol=${encodeURIComponent(trimmed)}&mode=${encodeURIComponent(nextMode)}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message ?? "분석에 실패했습니다.");
      }
      setAnalysis(payload);
      setMessage(`${payload.name} 분석이 완료됐습니다.`);
    } catch (error) {
      setAnalysis(null);
      setMessage(error instanceof Error ? error.message : "분석에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    runAnalysis();
  }

  function changeMode(nextMode: TrendMode) {
    setMode(nextMode);
    if (analysis) runAnalysis(symbol, nextMode);
  }

  return (
    <section className="analysis-workbench" aria-label="종목 분석 도구">
      <form className="analysis-search-panel" onSubmit={onSubmit}>
        <div>
          <p className="eyebrow">종목 분석</p>
          <h1>차트 흐름으로 진입 점수를 계산해요</h1>
          <p className="hero-description">
            이동평균, ADX, ATR, 시장 국면을 함께 읽어 원본 분석 엔진의 진입 점수를 세나개 디자인에 맞게 보여줍니다.
          </p>
        </div>
        <div className="analysis-input-card">
          <label htmlFor="analysis-symbol">종목명 또는 티커</label>
          <div className="analysis-input-row">
            <input
              id="analysis-symbol"
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="삼성전자, 005930, AAPL"
              value={symbol}
            />
            <button disabled={loading} type="submit">
              {loading ? "분석 중" : "분석"}
            </button>
          </div>
          <div className="mode-toggle" aria-label="분석 기간">
            <button className={mode === "60D" ? "is-active" : undefined} onClick={() => changeMode("60D")} type="button">
              60일 추세
            </button>
            <button className={mode === "20D" ? "is-active" : undefined} onClick={() => changeMode("20D")} type="button">
              20일 추세
            </button>
          </div>
          <p>{message}</p>
        </div>
      </form>

      {analysis ? (
        <div className="analysis-result-grid">
          <article className={`analysis-score-card signal-${analysis.signal.toLowerCase()}`}>
            <span>{analysis.name}</span>
            <strong>{analysis.score}</strong>
            <h2>{signalLabels[analysis.signal]}</h2>
            <p>{signalText[analysis.signal]}</p>
          </article>

          <article className="analysis-chart-card">
            <div>
              <span>{analysis.market} · {analysis.resolvedSymbol}</span>
              <strong>{formatNumber(analysis.price)}</strong>
              <em>{analysis.asOf} 기준</em>
            </div>
            <AnalysisChart data={analysis.chart} />
          </article>

          <article className="analysis-breakdown-card">
            <h2>점수 구성</h2>
            {breakdownLabels.map((item) => (
              <div className="score-bar" key={item.key}>
                <span>{item.label}</span>
                <strong>{analysis.breakdown[item.key]} / {item.max}</strong>
                <i style={{ width: `${(analysis.breakdown[item.key] / item.max) * 100}%` }} />
              </div>
            ))}
          </article>

          <article className="analysis-facts-card">
            <h2>지표 읽기</h2>
            <dl>
              <div>
                <dt>종목 국면</dt>
                <dd>{analysis.regime}</dd>
              </div>
              <div>
                <dt>시장 국면</dt>
                <dd>{analysis.marketContext.regime}</dd>
              </div>
              <div>
                <dt>ADX</dt>
                <dd>{formatNumber(analysis.details.adx)}</dd>
              </div>
              <div>
                <dt>ATR 상태</dt>
                <dd>{analysis.details.atrState}</dd>
              </div>
              <div>
                <dt>20일선 대비</dt>
                <dd>{formatPct(analysis.details.priceVsMa20Pct)}</dd>
              </div>
              <div>
                <dt>5일 변화</dt>
                <dd>{formatPct(analysis.indicators.changePct5d)}</dd>
              </div>
            </dl>
          </article>
        </div>
      ) : (
        <div className="analysis-empty-card">
          <strong>예시 입력</strong>
          <span>삼성전자 · 005930 · AAPL · TSLA</span>
        </div>
      )}
    </section>
  );
}
