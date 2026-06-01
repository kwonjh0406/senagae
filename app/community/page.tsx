import { GuideHeader } from "../guide/GuideHeader";
import { CommunityClient } from "./CommunityClient";
import { makeNickname } from "@/lib/community/nickname";

export const dynamic = "force-dynamic";

export default function CommunityPage() {
  return (
    <main className="guide-page">
      <GuideHeader />
      <section className="guide-hero community-hero">
        <div>
          <p className="eyebrow">개미 게시판</p>
          <h1>로그인 없이 바로 쓰는 커뮤니티</h1>
          <p className="hero-description">
            랜덤 닉네임으로 글과 댓글을 남기고, 등록할 때 정한 임시 비밀번호로
            나중에 삭제할 수 있습니다.
          </p>
        </div>
        <aside className="guide-note" aria-label="커뮤니티 안내">
          <strong>운영 규칙</strong>
          <ul>
            <li>비밀번호는 평문 저장 없이 서버에서 해시로 저장합니다.</li>
            <li>글은 삭제만 지원하며, 댓글도 작성자 비밀번호로 삭제합니다.</li>
            <li>투자 추천보다 정보 공유와 질문 중심으로 운영합니다.</li>
          </ul>
        </aside>
      </section>
      <CommunityClient initialNickname={makeNickname()} />
    </main>
  );
}
