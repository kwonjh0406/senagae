import { createClient } from "@supabase/supabase-js";

export type CommunityPostRow = {
  id: string;
  nickname: string;
  title: string;
  content: string;
  password_hash: string;
  created_at: string;
};

export type CommunityCommentRow = {
  id: string;
  post_id: string;
  nickname: string;
  content: string;
  password_hash: string;
  created_at: string;
};

export type CommunityPostWithComments = CommunityPostRow & {
  community_comments: CommunityCommentRow[];
};

export function createSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    throw new Error("Supabase environment variables are missing.");
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
