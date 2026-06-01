import { CommunityHeader } from "./CommunityHeader";
import { CommunityClient } from "./CommunityClient";
import { makeNickname } from "@/lib/community/nickname";

export const dynamic = "force-dynamic";

export default function CommunityPage() {
  return (
    <main className="guide-page community-page">
      <CommunityHeader />
      <CommunityClient initialNickname={makeNickname()} />
    </main>
  );
}
