import { AppHeader } from "../components/AppHeader";
import { getMarketOverview } from "@/lib/market-overview";

export const dynamic = "force-dynamic";

function formatChange(value: number | null) {
  if (value === null) return "연결 대기";
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatAsOf(value: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeZone: "Asia/Seoul",
    }).format(new Date(`${value}T00:00:00+09:00`));
  }

  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(new Date(value));
}

export default async function MarketPage() {
  const overview = await getMarketOverview();

  return (
    <main className="guide-page">
      <AppHeader active="market" />
      <section className="guide-hero">
        <div>
          <p className="eyebrow">증시 현황</p>
          <h1>시장 흐름을 빠르게 훑는 현황판</h1>
          <p className="hero-description">
            국내외 지수, 환율, 투자 심리를 한 화면에서 확인하고 종목 분석으로
            자연스럽게 이어지도록 정리했습니다.
          </p>
        </div>
        <aside className="guide-note" aria-label="증시 현황 안내">
          <strong>업데이트 기준</strong>
          <ul>
            <li>주요 지수와 환율은 서버에서 주기적으로 새로 가져옵니다.</li>
            <li>공포탐욕 지수는 KOSPI 기준 투자 심리 데이터를 우선 표시합니다.</li>
          </ul>
        </aside>
      </section>

      <section className="market-board" aria-label="실시간 증시 현황">
        <div className="market-card-grid">
          {overview.items.map((card) => (
            <article className={`market-card ${card.tone}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <em>{formatChange(card.change)}</em>
              <small>{card.note}</small>
            </article>
          ))}
        </div>
        <aside className={`fear-greed-card ${overview.fearGreed.tone}`} aria-label="공포 탐욕 지수">
          <span>공포·탐욕 지수</span>
          <strong>{overview.fearGreed.score ?? "--"}</strong>
          <h2>{overview.fearGreed.label}</h2>
          <div className="fear-greed-meter" aria-hidden="true">
            <i style={{ width: `${overview.fearGreed.score ?? 50}%` }} />
          </div>
          <p>
            {overview.fearGreed.score === null
              ? "외부 데이터 연결이 지연 중입니다."
              : "KOSPI 기준 시장 심리가 공포 쪽인지 탐욕 쪽인지 빠르게 보는 보조 지표입니다."}
          </p>
          <small>기준 {formatAsOf(overview.fearGreed.updatedAt ?? overview.asOf)}</small>
        </aside>
      </section>
    </main>
  );
}
