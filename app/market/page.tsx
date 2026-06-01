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
    <main className="guide-page market-page">
      <AppHeader active="market" />
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
          <span>KOSPI 공포·탐욕</span>
          <strong>{overview.fearGreed.score ?? "--"}</strong>
          <h2>{overview.fearGreed.label}</h2>
          <div className="fear-greed-meter" aria-hidden="true">
            <i style={{ width: `${overview.fearGreed.score ?? 50}%` }} />
          </div>
          <small>기준 {formatAsOf(overview.fearGreed.updatedAt ?? overview.asOf)}</small>
        </aside>
      </section>
    </main>
  );
}
