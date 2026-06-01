import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/community/password";
import { validatePostPayload } from "@/lib/community/validation";
import {
  CommunityPostWithComments,
  createSupabaseAdminClient,
} from "@/lib/supabase/admin";

export const runtime = "nodejs";

function toPublicPost(row: CommunityPostWithComments) {
  return {
    comments: row.community_comments.map((comment) => ({
      content: comment.content,
      createdAt: comment.created_at,
      id: comment.id,
      nickname: comment.nickname,
    })),
    content: row.content,
    createdAt: row.created_at,
    id: row.id,
    nickname: row.nickname,
    title: row.title,
  };
}

export async function GET() {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("community_posts")
      .select(
        `
          id,
          nickname,
          title,
          content,
          password_hash,
          created_at,
          community_comments (
            id,
            post_id,
            nickname,
            content,
            password_hash,
            created_at
          )
        `,
      )
      .order("created_at", { ascending: false })
      .order("created_at", { ascending: true, referencedTable: "community_comments" });

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ posts: (data as CommunityPostWithComments[]).map(toPublicPost) });
  } catch {
    return NextResponse.json(
      { message: "Supabase 환경 변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const validation = validatePostPayload(await request.json().catch(() => null));

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("community_posts")
      .insert({
        content: validation.data.content,
        nickname: validation.data.nickname,
        password_hash: hashPassword(validation.data.password),
        title: validation.data.title,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: data.id }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Supabase 환경 변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }
}
