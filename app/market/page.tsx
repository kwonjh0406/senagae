import { AppHeader } from "../components/AppHeader";

const marketCards = [
  { label: "코스피", tone: "up", value: "2,999.99" },
  { label: "코스닥", tone: "up", value: "899.10" },
  { label: "원달러", tone: "down", value: "1,234.50" },
  { label: "나스닥 선물", tone: "flat", value: "18,888.00" },
];

const watchItems = ["주요 지수", "업종별 등락", "환율", "원자재", "해외 선물", "시장 일정"];

export default function MarketPage() {
  return (
    <main className="guide-page">
      <AppHeader active="market" />
      <section className="guide-hero">
        <div>
          <p className="eyebrow">증시 현황</p>
          <h1>시장 흐름을 빠르게 훑는 현황판</h1>
          <p className="hero-description">
            국내외 지수, 환율, 업종 흐름을 한눈에 보는 대시보드 형태로 확장할
            예정입니다.
          </p>
        </div>
        <aside className="guide-note" aria-label="증시 현황 안내">
          <strong>현황판 방향</strong>
          <ul>
            <li>숫자만 나열하지 않고, 왜 움직였는지 읽을 수 있게 구성합니다.</li>
            <li>뉴스·이벤트와 연결해 시장 흐름을 이어서 볼 수 있게 만듭니다.</li>
          </ul>
        </aside>
      </section>

      <section className="market-board" aria-label="증시 현황 예시">
        <div className="market-card-grid">
          {marketCards.map((card) => (
            <article className={`market-card ${card.tone}`} key={card.label}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </article>
          ))}
        </div>
        <div className="info-panel market-watch">
          <h2>나중에 붙일 항목</h2>
          <ul>
            {watchItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
