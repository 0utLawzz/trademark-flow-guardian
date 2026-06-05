// src/lib/supabaseClient.ts
/**
 * Supabase client – shared across the app.
 * Uses Vite-prefixed environment variables (VITE_*) which are injected at build time.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
