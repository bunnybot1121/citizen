import { createClient } from '@supabase/supabase-js';

// For GitHub Pages deployment, we fallback to hardcoded values if env vars are missing
// Note: It is safe to expose the ANON key on the client side as prolonged as RLS policies are set correctly in Supabase.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://itflkttrcrtxfxdrqysn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZmxrdHRyY3J0eGZ4ZHJxeXNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzI4MjgsImV4cCI6MjA4NjMwODgyOH0.dVOZuI1luH7KvgSfwK3cNyP7AVDjtzYLjE1hvIEvrAo';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Missing Supabase environment variables. Auth features will not work.');
}

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
