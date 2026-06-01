import Link from "next/link";

const menuItems = ["투자정보", "뉴스", "종목방", "수수료", "환율", "커뮤니티"];

const featureTiles = [
  { title: "오늘의 장터", text: "시장 흐름과 주요 이슈가 모이는 곳", color: "tile-mint" },
  { title: "개미 교실", text: "처음 투자하는 사람도 편하게 읽는 가이드", color: "tile-yellow" },
  { title: "증권사 가게", text: "수수료와 혜택을 한눈에 비교하는 코너", color: "tile-pink" },
  { title: "종목 놀이터", text: "관심 종목을 귀엽게 정리하는 공간", color: "tile-blue" },
];

const boardPosts = [
  "초보 개미를 위한 오늘의 단어장",
  "배당주 고르는 법, 쉬운 그림으로 보기",
  "증권사 이벤트 모아보기 준비중",
  "달러 환율이 오르면 무슨 일이 생길까?",
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#fff7d7] text-[#3d2b1f]">
      <section className="hero-shell">
        <header className="site-header" aria-label="서비스 소개">
          <Link className="brand-mark" href="/" aria-label="세상에 나쁜 개미는 없다 홈">
            <span className="brand-ant" aria-hidden="true">
              <span />
            </span>
            <span>세나개</span>
          </Link>
          <nav className="nav-tabs" aria-label="준비 중인 메뉴">
            <Link className="active-tab" href="/guide">
              가이드
            </Link>
            {menuItems.map((item) => (
              <a href="#" key={item}>
                {item}
              </a>
            ))}
          </nav>
        </header>

        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">통합 주식 플랫폼 준비중</p>
            <h1>세상에 나쁜 개미는 없다</h1>
            <p className="hero-description">
              투자 정보, 뉴스, 가이드, 증권사 수수료, 종목 이야기, 커뮤니티와
              환율까지 한곳에 모으는 귀여운 주식 놀이터입니다.
            </p>
            <div className="hero-actions" aria-label="초안 상태">
              <Link href="/guide">가이드 먼저 보기</Link>
              <span>기능은 아직 쉬는 중</span>
            </div>
          </div>

          <div className="browser-scene" aria-label="서비스 미리보기 일러스트">
            <div className="window-bar">
              <span />
              <span />
              <span />
              <strong>senagae.kr</strong>
            </div>
            <div className="mascot-stage">
              <div className="sun-badge">OPEN SOON</div>
              <div className="ant-mascot" aria-hidden="true">
                <i className="antenna left" />
                <i className="antenna right" />
                <span className="head">
                  <b />
                  <b />
                </span>
                <span className="body" />
                <span className="belly" />
                <i className="leg one" />
                <i className="leg two" />
                <i className="leg three" />
                <i className="leg four" />
              </div>
              <div className="speech-bubble">오늘도 차근차근!</div>
              <div className="mini-chart" aria-hidden="true">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="content-band" aria-label="준비 중인 서비스 영역">
        <div className="section-title">
          <p>세나개 마을 지도</p>
          <h2>나중에 커질 기능들을 먼저 귀엽게 배치했어요</h2>
        </div>

        <div className="feature-grid">
          {featureTiles.map((tile) => (
            <article className={`feature-tile ${tile.color}`} key={tile.title}>
              <div className="tile-icon" aria-hidden="true" />
              <h3>{tile.title}</h3>
              <p>{tile.text}</p>
              {tile.title === "개미 교실" ? <Link href="/guide">가이드 열기</Link> : null}
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-band" aria-label="커뮤니티와 정보 박스 미리보기">
        <div className="notice-board">
          <div className="board-title">
            <span>개미 게시판</span>
            <strong>새 글</strong>
          </div>
          <ul>
            {boardPosts.map((post) => (
              <li key={post}>{post}</li>
            ))}
          </ul>
        </div>

        <div className="ticker-box" aria-label="예시 시세판">
          <div className="ticker-row up">
            <span>코스피</span>
            <strong>2,999.99</strong>
          </div>
          <div className="ticker-row">
            <span>원달러</span>
            <strong>1,234.50</strong>
          </div>
          <div className="ticker-row up">
            <span>개미지수</span>
            <strong>100점</strong>
          </div>
          <p>실제 데이터가 아닌 디자인용 예시입니다.</p>
        </div>
      </section>
    </main>
  );
}
