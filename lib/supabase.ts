import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// クライアントサイド・APIルート共用（anon key）
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// サーバーサイド専用（service_role key — クライアントバンドルに含めない）
export function createServerClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  return createClient(SUPABASE_URL, serviceKey, {
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
