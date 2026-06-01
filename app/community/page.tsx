import { CommunityHeader } from "./CommunityHeader";
import { CommunityClient } from "./CommunityClient";
import { makeNickname } from "@/lib/community/nickname";

export const dynamic = "force-dynamic";

export default function CommunityPage() {
  return (
    <main className="guide-page">
      <CommunityHeader />
      <section className="guide-hero community-hero">
        <div>
          <p className="eyebrow">개미 게시판</p>
          <h1>로그인 없이 바로 쓰는 커뮤니티</h1>
          <p className="hero-description">
            랜덤 닉네임으로 가볍게 글과 댓글을 남길 수 있습니다.
          </p>
        </div>
        <aside className="guide-note" aria-label="커뮤니티 안내">
          <strong>이용 안내</strong>
          <ul>
            <li>글과 댓글은 작성할 때 정한 비밀번호로 삭제할 수 있습니다.</li>
            <li>서로의 판단을 돕는 질문과 정보 공유를 중심으로 남겨주세요.</li>
          </ul>
        </aside>
      </section>
      <CommunityClient initialNickname={makeNickname()} />
    </main>
  );
}
