import Link from "next/link";
import { AppHeader } from "./components/AppHeader";

const hubActions = [
  {
    color: "hub-yellow",
    eyebrow: "처음이라면",
    href: "/guide",
    title: "주린이 가이드",
    text: "용어, 차트, 주문 전 체크리스트부터 차근차근 배워요.",
  },
  {
    color: "hub-green",
    eyebrow: "오늘 시장",
    href: "/market",
    title: "증시 현황",
    text: "국내외 지수, 환율, 공포·탐욕 흐름을 한 번에 봐요.",
  },
  {
    color: "hub-blue",
    eyebrow: "종목이 있다면",
    href: "/analysis",
    title: "종목 분석",
    text: "이동평균과 변동성 흐름으로 진입 점수를 확인해요.",
  },
  {
    color: "hub-pink",
    eyebrow: "소식 모음",
    href: "/news",
    title: "뉴스·이벤트",
    text: "뉴스, 공모주, 배당, 증권사 이벤트를 놓치지 않게 모아요.",
  },
];

const checkItems = [
  "시장 분위기 먼저 보기",
  "관심 종목 점수 확인하기",
  "모르는 단어는 가이드에서 정리하기",
  "궁금한 건 커뮤니티에 남기기",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7d7] text-[#3d2b1f]">
      <section className="hero-shell">
        <AppHeader active="home" />

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">세나개 투자 출발판</p>
            <h1>세상에 나쁜 개미는 없다</h1>
            <p className="hero-description">
              시장 흐름을 보고, 종목을 분석하고, 모르는 개념은 바로 배우는
              초보 친화 주식 허브입니다.
            </p>
            <div className="hero-actions" aria-label="초안 상태">
              <Link href="/market">오늘 시장 보기</Link>
              <Link href="/analysis">종목 분석하기</Link>
            </div>
          </div>

          <section className="home-hub-panel" aria-label="세나개 주요 기능">
            <div className="hub-panel-title">
              <span>오늘 어디부터 볼까요?</span>
              <strong>4개 코너</strong>
            </div>
            <div className="hub-action-grid">
              {hubActions.map((action) => (
                <Link className={`hub-action-card ${action.color}`} href={action.href} key={action.title}>
                  <span>{action.eyebrow}</span>
                  <h2>{action.title}</h2>
                  <p>{action.text}</p>
                  <strong>바로가기</strong>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="content-band home-checkin-band" aria-label="오늘의 투자 체크인">
        <div className="section-title">
          <p>오늘의 체크인</p>
          <h2>흩어진 정보를 한 화면 흐름으로 이어봐요</h2>
        </div>

        <div className="home-dashboard-grid">
          <article className="home-check-card">
            <div className="board-title">
              <span>개미 루틴</span>
              <strong>초보자용</strong>
            </div>
            <ol>
              {checkItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </article>

          <article className="home-market-card">
            <div className="ticker-row up">
              <span>코스피</span>
              <strong>흐름 확인</strong>
            </div>
            <div className="ticker-row">
              <span>환율</span>
              <strong>시장 온도</strong>
            </div>
            <div className="ticker-row up">
              <span>공포·탐욕</span>
              <strong>심리 체크</strong>
            </div>
            <Link href="/market">대시보드 보기</Link>
          </article>

          <article className="home-community-card">
            <div className="board-title">
              <span>개미 게시판</span>
              <Link href="/community">입장</Link>
            </div>
            <p>혼자 헷갈리는 뉴스와 종목 이야기를 가볍게 남겨보세요.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
