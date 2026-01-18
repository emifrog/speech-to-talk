-- ===========================================
-- Migration: 002_add_translation_cache.sql
-- Description: Ajoute la table translation_cache pour le cache des traductions
-- ===========================================

-- Créer la table translation_cache si elle n'existe pas
CREATE TABLE IF NOT EXISTS translation_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_lang VARCHAR(5) NOT NULL,
  target_lang VARCHAR(5) NOT NULL,
  source_text_hash VARCHAR(64) NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  usage_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(source_lang, target_lang, source_text_hash)
);

-- Créer les index s'ils n'existent pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_translation_cache_hash'
  ) THEN
    CREATE INDEX idx_translation_cache_hash 
      ON translation_cache(source_lang, target_lang, source_text_hash);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname = 'idx_translation_cache_usage'
  ) THEN
    CREATE INDEX idx_translation_cache_usage 
      ON translation_cache(usage_count DESC);
  END IF;
END $$;

-- Activer RLS
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

-- Créer la politique si elle n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'translation_cache' 
    AND policyname = 'Translation cache is readable'
  ) THEN
    CREATE POLICY "Translation cache is readable" 
      ON translation_cache FOR SELECT USING (TRUE);
  END IF;
END $$;

-- Créer une politique pour permettre l'insertion (pour le cache)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'translation_cache' 
    AND policyname = 'Translation cache is writable'
  ) THEN
    CREATE POLICY "Translation cache is writable" 
      ON translation_cache FOR INSERT WITH CHECK (TRUE);
  END IF;
END $$;

-- Créer une politique pour permettre la mise à jour (pour usage_count et last_used_at)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'translation_cache' 
    AND policyname = 'Translation cache is updatable'
  ) THEN
    CREATE POLICY "Translation cache is updatable" 
      ON translation_cache FOR UPDATE USING (TRUE);
  END IF;
END $$;
