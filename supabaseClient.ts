
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fxdufqqlnbzhlfdllyrz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ4ZHVmcXFsbmJ6aGxmZGxseXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MjMyODcsImV4cCI6MjA4MzM5OTI4N30.gFlbRekc5BMgfLDS43f-7SJ6McdQbrHAlGZcQbE1Km0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
