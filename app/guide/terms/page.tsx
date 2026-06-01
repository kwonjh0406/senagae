import Link from "next/link";
import { GuideHeader } from "../GuideHeader";
import { guideBySlug } from "../data";

export default function TermsPage() {
  const article = guideBySlug.terms;

  return (
    <main className="guide-page">
      <GuideHeader />
      <article className="guide-article">
        <div className="article-hero guide-green">
          <p>{article.eyebrow}</p>
          <h1>{article.title}</h1>
          <span>{article.readingTime} 읽기</span>
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
          <Link href="/guide/charts">다음: 필수 차트와 설명</Link>
          <Link href="/guide">가이드 목록</Link>
        </footer>
      </article>
    </main>
  );
}
