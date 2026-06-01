import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/community/password";
import { validateCommentPayload } from "@/lib/community/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(
  request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { postId } = await context.params;
  const validation = validateCommentPayload(await request.json().catch(() => null));

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("community_comments")
      .insert({
        content: validation.data.content,
        nickname: validation.data.nickname,
        password_hash: hashPassword(validation.data.password),
        post_id: postId,
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
