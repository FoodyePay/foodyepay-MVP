import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 诊断：当没有配置 Service Role Key 时，提醒可能受 RLS 影响
if (!supabaseServiceKey) {
  console.warn(
    '[Supabase] Service role key missing. Falling back to anon key for admin client. Writes that bypass RLS may fail.'
  );
}

// 客户端用的匿名客户端
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 服务端用的服务角色客户端（绕过 RLS）
export const supabaseAdmin = createClient(
  supabaseUrl, 
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
