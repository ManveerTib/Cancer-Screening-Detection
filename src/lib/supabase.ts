import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pnmjyxbsyfkhcubmnshf.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBubWp5eGJzeWZraGN1Ym1uc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzQ2NDMsImV4cCI6MjA3OTIxMDY0M30.7JK0kJAoVjiImJ1_t8pfDNzWk0yhC0dEBtLapGBM9fA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
