import Link from "next/link";
import { AppHeader } from "./components/AppHeader";

const quickLinks = [
  {
    href: "/market",
    color: "mint",
    label: "증시 현황",
    meta: "지수 · 환율 · 공포탐욕",
  },
  {
    href: "/analysis",
    color: "blue",
    label: "종목 분석",
    meta: "이동평균 · 변동성 점수",
  },
  {
    href: "/news",
    color: "pink",
    label: "뉴스·이벤트",
    meta: "시장 소식 · 일정",
  },
  {
    href: "/community",
    color: "yellow",
    label: "커뮤니티",
    meta: "질문 · 기록 · 의견",
  },
];

const marketItems = [
  { change: "+0.42%", label: "KOSPI", tone: "up", value: "2,760.14" },
  { change: "-0.18%", label: "KOSDAQ", tone: "down", value: "842.20" },
  { change: "1,367원", label: "USD/KRW", tone: "flat", value: "환율" },
  { change: "중립", label: "공포·탐욕", tone: "flat", value: "52" },
];

const newsItems = [
  "오늘 국내외 지수와 환율 먼저 확인",
  "관심 종목은 분석 탭에서 점수 체크",
  "헷갈리는 용어는 가이드에서 바로 정리",
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-shell home-hero-shell">
        <AppHeader active="home" />

        <div className="home-overview">
          <section className="home-intro" aria-label="서비스 소개">
            <p className="eyebrow">세나개 투자 데스크</p>
            <h1>오늘 필요한 주식 정보만 가볍게 모아봐요</h1>
            <p>
              시장 흐름, 종목 분석, 뉴스와 초보 가이드를 한 화면에서 바로
              시작할 수 있게 정리했습니다.
            </p>
            <div className="home-primary-actions">
              <Link href="/market">오늘 시장</Link>
              <Link href="/guide">주린이 가이드</Link>
            </div>
          </section>

          <aside className="home-market-summary" aria-label="시장 요약">
            <div className="home-panel-heading">
              <span>Market Snapshot</span>
              <strong>시장 한눈에</strong>
            </div>
            <div className="home-market-list">
              {marketItems.map((item) => (
                <Link className="home-market-row" href="/market" key={item.label}>
                  <span>
                    <b>{item.label}</b>
                    {item.value}
                  </span>
                  <strong className={item.tone}>{item.change}</strong>
                  <i className={item.tone} aria-hidden="true" />
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="home-workspace" aria-label="서비스 바로가기">
        <div className="home-section-head">
          <span>Senagae Board</span>
          <h2>필요한 기능만 빠르게</h2>
        </div>

        <div className="home-quick-grid">
          {quickLinks.map((item) => (
            <Link className={`home-quick-card ${item.color}`} href={item.href} key={item.href}>
              <span>{item.meta}</span>
              <strong>{item.label}</strong>
              <em>바로가기</em>
            </Link>
          ))}
        </div>

        <div className="home-lower-grid">
          <article className="home-routine-panel">
            <div className="home-panel-heading">
              <span>Start</span>
              <strong>오늘의 체크</strong>
            </div>
            <ul>
              {newsItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>

          <article className="home-community-panel">
            <div className="home-panel-heading">
              <span>Beginner Guide</span>
              <strong>아직 주린이라면</strong>
            </div>
            <p>주식 필수 용어, 차트 보는 법, 주문 전 체크리스트부터 차근차근 볼 수 있어요.</p>
            <Link href="/guide">가이드 보기</Link>
          </article>
        </div>
      </section>
    </main>
  );
}
