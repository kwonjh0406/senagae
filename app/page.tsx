import Link from "next/link";
import { AppHeader } from "./components/AppHeader";

const quickLinks = [
  {
    href: "/market",
    label: "증시 현황",
    meta: "지수 · 환율 · 심리",
  },
  {
    href: "/analysis",
    label: "종목 분석",
    meta: "진입 점수 계산",
  },
  {
    href: "/guide",
    label: "주린이 가이드",
    meta: "용어 · 차트 · 체크리스트",
  },
  {
    href: "/news",
    label: "뉴스·이벤트",
    meta: "시장 소식 · 일정",
  },
];

const marketItems = [
  { label: "KOSPI", value: "시장 대시보드", tone: "up" },
  { label: "USD/KRW", value: "환율 체크", tone: "flat" },
  { label: "공포·탐욕", value: "투자 심리", tone: "down" },
];

const routines = [
  "오늘 시장 온도 확인",
  "관심 종목 흐름 점검",
  "모르는 개념은 가이드에서 정리",
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-shell home-hero-shell">
        <AppHeader active="home" />

        <div className="home-overview">
          <section className="home-intro" aria-label="서비스 소개">
            <p className="eyebrow">세나개 투자 홈</p>
            <h1>오늘 볼 투자 정보를 한 화면에 정리해요</h1>
            <p>
              시장 흐름, 종목 분석, 초보 가이드, 커뮤니티를 차분하게 이어주는
              귀여운 주식 대시보드입니다.
            </p>
            <div className="home-primary-actions">
              <Link href="/market">시장 먼저 보기</Link>
              <Link href="/analysis">종목 분석하기</Link>
            </div>
          </section>

          <aside className="home-market-summary" aria-label="시장 요약">
            <div className="home-panel-heading">
              <span>Market</span>
              <strong>오늘의 흐름</strong>
            </div>
            <div className="home-market-list">
              {marketItems.map((item) => (
                <Link className="home-market-row" href="/market" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                  <i className={item.tone} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="home-workspace" aria-label="서비스 바로가기">
        <div className="home-section-head">
          <span>Quick Access</span>
          <h2>필요한 기능으로 바로 이동</h2>
        </div>

        <div className="home-quick-grid">
          {quickLinks.map((item) => (
            <Link className="home-quick-card" href={item.href} key={item.href}>
              <span>{item.meta}</span>
              <strong>{item.label}</strong>
            </Link>
          ))}
        </div>

        <div className="home-lower-grid">
          <article className="home-routine-panel">
            <div className="home-panel-heading">
              <span>Routine</span>
              <strong>초보 개미 루틴</strong>
            </div>
            <ol>
              {routines.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>

          <article className="home-community-panel">
            <div className="home-panel-heading">
              <span>Community</span>
              <strong>헷갈리는 건 같이 보기</strong>
            </div>
            <p>뉴스 해석, 종목 질문, 초보 고민을 가볍게 남길 수 있습니다.</p>
            <Link href="/community">커뮤니티 입장</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
