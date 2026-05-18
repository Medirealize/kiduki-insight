import { createClient } from "@supabase/supabase-js";

// ビルド時にクラッシュしないよう遅延初期化（env vars が未設定でも build は通る）
let _supabase: ReturnType<typeof createClient> | null = null;
export function getSupabaseClient() {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars not set");
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// サーバーサイド専用（service_role key — クライアントバンドルに含めない）
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

export type HonneLog = {
  id: string;
  user_id: string;
  created_at: string;
  user_input: string;
  insight: string;
  doctor_advice: string | null;
  selected_questions: string[];
  group_name: string | null;
};
