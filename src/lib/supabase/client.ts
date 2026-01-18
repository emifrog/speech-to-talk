import { createBrowserClient } from '@supabase/ssr';

// ===========================================
// Client Supabase (côté navigateur)
// ===========================================
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// ===========================================
// Types pour les tables Supabase
// ===========================================
export interface Database {
  public: {
    Tables: {
      translations: {
        Row: {
          id: string;
          user_id: string;
          source_lang: string;
          target_lang: string;
          source_text: string;
          translated_text: string;
          audio_url: string | null;
          is_favorite: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_lang: string;
          target_lang: string;
          source_text: string;
          translated_text: string;
          audio_url?: string | null;
          is_favorite?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          source_lang?: string;
          target_lang?: string;
          source_text?: string;
          translated_text?: string;
          audio_url?: string | null;
          is_favorite?: boolean;
          created_at?: string;
        };
      };
      emergency_phrases: {
        Row: {
          id: string;
          category: string;
          translations: Record<string, string>;
          icon: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          translations: Record<string, string>;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: string;
          translations?: Record<string, string>;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      translation_cache: {
        Row: {
          id: string;
          source_lang: string;
          target_lang: string;
          source_text_hash: string;
          source_text: string;
          translated_text: string;
          usage_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          source_lang: string;
          target_lang: string;
          source_text_hash: string;
          source_text: string;
          translated_text: string;
          usage_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          source_lang?: string;
          target_lang?: string;
          source_text_hash?: string;
          source_text?: string;
          translated_text?: string;
          usage_count?: number;
          created_at?: string;
        };
      };
    };
  };
}
