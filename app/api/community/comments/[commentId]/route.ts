import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/community/password";
import { validatePasswordPayload } from "@/lib/community/validation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ commentId: string }> },
) {
  const { commentId } = await context.params;
  const validation = validatePasswordPayload(await request.json().catch(() => null));

  if (!validation.ok) {
    return NextResponse.json({ message: validation.message }, { status: 400 });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data: comment, error: selectError } = await supabase
      .from("community_comments")
      .select("id, password_hash")
      .eq("id", commentId)
      .single();

    if (selectError || !comment) {
      return NextResponse.json({ message: "댓글을 찾을 수 없습니다." }, { status: 404 });
    }

    if (!verifyPassword(validation.data.password, comment.password_hash)) {
      return NextResponse.json({ message: "비밀번호가 맞지 않습니다." }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from("community_comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      return NextResponse.json({ message: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { message: "Supabase 환경 변수가 설정되지 않았습니다." },
      { status: 500 },
    );
  }
}
