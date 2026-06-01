import { AppHeader } from "../components/AppHeader";

const newsGroups = [
  {
    items: ["실적 발표", "정책·금리", "환율 이슈", "산업 리포트"],
    title: "오늘 볼 뉴스",
  },
  {
    items: ["증권사 이벤트", "수수료 혜택", "공모주 일정", "배당 캘린더"],
    title: "놓치기 쉬운 이벤트",
  },
  {
    items: ["개장 전 체크", "장중 속보", "마감 요약", "내일의 일정"],
    title: "시장 일정",
  },
];

export default function NewsPage() {
  return (
    <main className="guide-page">
      <AppHeader active="news" />
      <section className="guide-hero">
        <div>
          <p className="eyebrow">뉴스·이벤트 종합</p>
          <h1>투자자가 놓치기 쉬운 소식을 한곳에</h1>
          <p className="hero-description">
            뉴스, 증권사 이벤트, 공모주 일정, 배당 캘린더를 한 화면에서 확인하는
            코너로 확장할 예정입니다.
          </p>
        </div>
        <aside className="guide-note" aria-label="뉴스 이벤트 안내">
          <strong>준비 중인 구성</strong>
          <ul>
            <li>시장 뉴스와 이벤트를 성격별로 묶어 보여줍니다.</li>
            <li>중요 일정은 증시 현황과 연결해 흐름을 같이 볼 수 있게 만듭니다.</li>
          </ul>
        </aside>
      </section>

      <section className="info-panel-grid" aria-label="뉴스 이벤트 영역">
        {newsGroups.map((group) => (
          <article className="info-panel" key={group.title}>
            <h2>{group.title}</h2>
            <ul>
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
}
