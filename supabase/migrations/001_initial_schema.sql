-- ===========================================
-- Speech To Talk - Database Schema
-- ===========================================
-- Migration: 001_initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- Table: translations (historique des traductions)
-- ===========================================
CREATE TABLE IF NOT EXISTS translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  source_lang VARCHAR(5) NOT NULL,
  target_lang VARCHAR(5) NOT NULL,
  source_text TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  audio_url TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes par utilisateur
CREATE INDEX IF NOT EXISTS idx_translations_user_id ON translations(user_id);
CREATE INDEX IF NOT EXISTS idx_translations_created_at ON translations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_translations_favorite ON translations(user_id, is_favorite) WHERE is_favorite = TRUE;

-- RLS (Row Level Security)
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- Politique: les utilisateurs ne voient que leurs traductions
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'translations' AND policyname = 'Users can view own translations'
  ) THEN
    CREATE POLICY "Users can view own translations" ON translations FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'translations' AND policyname = 'Users can insert own translations'
  ) THEN
    CREATE POLICY "Users can insert own translations" ON translations FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'translations' AND policyname = 'Users can update own translations'
  ) THEN
    CREATE POLICY "Users can update own translations" ON translations FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'translations' AND policyname = 'Users can delete own translations'
  ) THEN
    CREATE POLICY "Users can delete own translations" ON translations FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ===========================================
-- Table: emergency_phrases (phrases d'urgence prédéfinies)
-- ===========================================
CREATE TABLE IF NOT EXISTS emergency_phrases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL,
  translations JSONB NOT NULL,
  icon VARCHAR(50),
  severity VARCHAR(20) DEFAULT 'medium',
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes par catégorie
CREATE INDEX IF NOT EXISTS idx_emergency_phrases_category ON emergency_phrases(category);
CREATE INDEX IF NOT EXISTS idx_emergency_phrases_order ON emergency_phrases(display_order);

-- RLS: lecture publique
ALTER TABLE emergency_phrases ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'emergency_phrases' AND policyname = 'Emergency phrases are viewable by everyone'
  ) THEN
    CREATE POLICY "Emergency phrases are viewable by everyone" ON emergency_phrases FOR SELECT USING (is_active = TRUE);
  END IF;
END $$;

-- ===========================================
-- Table: translation_cache (cache des traductions)
-- ===========================================
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

-- Index pour les recherches de cache
CREATE INDEX IF NOT EXISTS idx_translation_cache_hash ON translation_cache(source_lang, target_lang, source_text_hash);
CREATE INDEX IF NOT EXISTS idx_translation_cache_usage ON translation_cache(usage_count DESC);

-- RLS: accès public en lecture seule
ALTER TABLE translation_cache ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'translation_cache' AND policyname = 'Translation cache is readable'
  ) THEN
    CREATE POLICY "Translation cache is readable" ON translation_cache FOR SELECT USING (TRUE);
  END IF;
END $$;

-- ===========================================
-- Table: user_preferences (préférences utilisateur)
-- ===========================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_source_lang VARCHAR(5) DEFAULT 'en',
  default_target_lang VARCHAR(5) DEFAULT 'it',
  auto_play_audio BOOLEAN DEFAULT TRUE,
  high_visibility_mode BOOLEAN DEFAULT FALSE,
  theme VARCHAR(20) DEFAULT 'light',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can view own preferences'
  ) THEN
    CREATE POLICY "Users can view own preferences" ON user_preferences FOR SELECT USING (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can insert own preferences'
  ) THEN
    CREATE POLICY "Users can insert own preferences" ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'user_preferences' AND policyname = 'Users can update own preferences'
  ) THEN
    CREATE POLICY "Users can update own preferences" ON user_preferences FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ===========================================
-- Fonction: Créer les préférences par défaut
-- ===========================================
CREATE OR REPLACE FUNCTION create_default_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: créer préférences à l'inscription
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION create_default_preferences();
  END IF;
END $$;

-- ===========================================
-- Données initiales: Phrases d'urgence
-- ===========================================
INSERT INTO emergency_phrases (category, severity, translations, icon, display_order) VALUES
-- Douleur
('pain', 'critical', '{"en": "I have chest pain", "it": "Ho dolore al petto", "es": "Tengo dolor en el pecho", "ru": "У меня боль в груди"}', '🩺', 1),
('pain', 'critical', '{"en": "I have a severe headache", "it": "Ho un forte mal di testa", "es": "Tengo un dolor de cabeza severo", "ru": "У меня сильная головная боль"}', '🩺', 2),
('pain', 'high', '{"en": "I have abdominal pain", "it": "Ho dolore addominale", "es": "Tengo dolor abdominal", "ru": "У меня боль в животе"}', '🩺', 3),
('pain', 'high', '{"en": "I feel dizzy", "it": "Ho le vertigini", "es": "Me siento mareado", "ru": "У меня кружится голова"}', '🩺', 4),
('pain', 'medium', '{"en": "I have back pain", "it": "Ho mal di schiena", "es": "Tengo dolor de espalda", "ru": "У меня болит спина"}', '🩺', 5),

-- Respiration
('breathing', 'critical', '{"en": "I cannot breathe", "it": "Non riesco a respirare", "es": "No puedo respirar", "ru": "Я не могу дышать"}', '🫁', 1),
('breathing', 'critical', '{"en": "I have difficulty breathing", "it": "Ho difficoltà a respirare", "es": "Tengo dificultad para respirar", "ru": "Мне трудно дышать"}', '🫁', 2),
('breathing', 'high', '{"en": "I have asthma", "it": "Ho l''asma", "es": "Tengo asma", "ru": "У меня астма"}', '🫁', 3),

-- Allergies
('allergies', 'critical', '{"en": "I am having an allergic reaction", "it": "Sto avendo una reazione allergica", "es": "Estoy teniendo una reacción alérgica", "ru": "У меня аллергическая реакция"}', '⚠️', 1),
('allergies', 'high', '{"en": "I am allergic to penicillin", "it": "Sono allergico alla penicillina", "es": "Soy alérgico a la penicilina", "ru": "У меня аллергия на пенициллин"}', '⚠️', 2),
('allergies', 'high', '{"en": "I am allergic to this medication", "it": "Sono allergico a questo farmaco", "es": "Soy alérgico a este medicamento", "ru": "У меня аллергия на это лекарство"}', '⚠️', 3),

-- Médicaments
('medication', 'critical', '{"en": "I need insulin", "it": "Ho bisogno di insulina", "es": "Necesito insulina", "ru": "Мне нужен инсулин"}', '💊', 1),
('medication', 'high', '{"en": "I need my medication", "it": "Ho bisogno dei miei farmaci", "es": "Necesito mi medicación", "ru": "Мне нужны мои лекарства"}', '💊', 2),
('medication', 'high', '{"en": "I am diabetic", "it": "Sono diabetico", "es": "Soy diabético", "ru": "У меня диабет"}', '💊', 3),
('medication', 'medium', '{"en": "I take blood thinners", "it": "Prendo anticoagulanti", "es": "Tomo anticoagulantes", "ru": "Я принимаю разжижители крови"}', '💊', 4),

-- Général
('general', 'critical', '{"en": "Call an ambulance", "it": "Chiamate un''ambulanza", "es": "Llamen a una ambulancia", "ru": "Вызовите скорую"}', '🏥', 1),
('general', 'high', '{"en": "I need help", "it": "Ho bisogno di aiuto", "es": "Necesito ayuda", "ru": "Мне нужна помощь"}', '🏥', 2),
('general', 'high', '{"en": "Take me to the hospital", "it": "Portatemi in ospedale", "es": "Lléveme al hospital", "ru": "Отвезите меня в больницу"}', '🏥', 3),
('general', 'medium', '{"en": "I need to see a doctor", "it": "Ho bisogno di vedere un medico", "es": "Necesito ver a un médico", "ru": "Мне нужно к врачу"}', '🏥', 4),
('general', 'low', '{"en": "Where is the pharmacy?", "it": "Dove si trova la farmacia?", "es": "¿Dónde está la farmacia?", "ru": "Где находится аптека?"}', '🏥', 5);

-- ===========================================
-- Fonction: Mettre à jour updated_at
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_preferences_updated_at'
  ) THEN
    CREATE TRIGGER update_user_preferences_updated_at
      BEFORE UPDATE ON user_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
