import Link from "next/link";
import { GuideHeader } from "../GuideHeader";
import { guideBySlug } from "../data";

const chartBars = ["28%", "64%", "42%", "82%", "58%", "74%"];

export default function ChartsPage() {
  const article = guideBySlug.charts;

  return (
    <main className="guide-page">
      <GuideHeader current="/guide/charts" />
      <article className="guide-article">
        <div className="article-hero guide-blue">
          <div>
            <p>{article.eyebrow}</p>
            <h1>{article.title}</h1>
            <span>{article.readingTime} 읽기</span>
          </div>
          <div className="chart-preview" aria-label="차트 예시 일러스트">
            {chartBars.map((height, index) => (
              <i key={`${height}-${index}`} style={{ height }} />
            ))}
          </div>
        </div>
        <p className="article-intro">{article.intro}</p>

        <div className="article-section-list">
          {article.sections.map((section) => (
            <section className="article-section" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <footer className="article-footer">
          <Link href="/guide/checklist">다음: 초보 투자 체크리스트</Link>
          <Link href="/guide">가이드 목록</Link>
        </footer>
      </article>
    </main>
  );
}
