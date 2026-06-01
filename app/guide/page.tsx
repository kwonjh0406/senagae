import Link from "next/link";
import { GuideHeader } from "./GuideHeader";
import { guideArticles } from "./data";

const roadmap = [
  "처음에는 용어와 차트처럼 모든 투자자가 반복해서 찾는 지식부터 정리합니다.",
  "이후 종목 정보, 뉴스, 증권사 수수료, 환율 콘텐츠와 자연스럽게 연결합니다.",
  "모든 글은 매수 추천이 아니라 판단 기준을 만드는 데 초점을 둡니다.",
];

export default function GuidePage() {
  return (
    <main className="guide-page">
      <GuideHeader />

      <section className="guide-hero">
        <div>
          <p className="eyebrow">개미 교실</p>
          <h1>주식 공부를 처음부터 다시 정리하는 곳</h1>
          <p className="hero-description">
            어려운 말은 풀어서 설명하고, 실제로 투자 앱과 뉴스에서 자주 보는
            개념부터 차근차근 쌓아갑니다.
          </p>
        </div>
        <aside className="guide-note" aria-label="가이드 방향">
          <strong>세나개 가이드 원칙</strong>
          <ul>
            {roadmap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="guide-card-grid" aria-label="가이드 세부 페이지">
        {guideArticles.map((article) => (
          <Link
            className={`guide-card ${article.color}`}
            href={`/guide/${article.slug}`}
            key={article.slug}
          >
            <span>{article.eyebrow}</span>
            <h2>{article.title}</h2>
            <p>{article.summary}</p>
            <strong>{article.readingTime} 읽기</strong>
          </Link>
        ))}
      </section>
    </main>
  );
}
