import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  window.__MIS_COMPRAS_CONFIG__?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL,
  window.__MIS_COMPRAS_CONFIG__?.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY,
)
