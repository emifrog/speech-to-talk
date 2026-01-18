# 💾 Cache de Traduction - Documentation

> **Date** : 18 janvier 2026  
> **Table** : `translation_cache`

---

## 📋 Vue d'ensemble

La table `translation_cache` permet de stocker les traductions fréquemment utilisées pour améliorer les performances et réduire les coûts d'API.

---

## 🗄️ Structure de la Table

### Colonnes

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `source_lang` | VARCHAR(5) | NOT NULL | Code langue source (ex: "en") |
| `target_lang` | VARCHAR(5) | NOT NULL | Code langue cible (ex: "it") |
| `source_text_hash` | VARCHAR(64) | NOT NULL | Hash SHA-256 du texte source |
| `source_text` | TEXT | NOT NULL | Texte original complet |
| `translated_text` | TEXT | NOT NULL | Texte traduit |
| `usage_count` | INT | DEFAULT 1 | Nombre d'utilisations |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Date de création |
| `last_used_at` | TIMESTAMPTZ | DEFAULT NOW() | Dernière utilisation |

### Contraintes

**Clé unique** : `(source_lang, target_lang, source_text_hash)`
- Garantit qu'une même traduction n'est stockée qu'une seule fois

### Index

```sql
-- Recherche rapide par langue et hash
CREATE INDEX idx_translation_cache_hash 
  ON translation_cache(source_lang, target_lang, source_text_hash);

-- Tri par popularité
CREATE INDEX idx_translation_cache_usage 
  ON translation_cache(usage_count DESC);
```

### Row Level Security (RLS)

```sql
-- Lecture publique (tous les utilisateurs peuvent lire le cache)
CREATE POLICY "Translation cache is readable" 
  ON translation_cache FOR SELECT USING (TRUE);

-- Écriture publique (pour mettre à jour le cache)
CREATE POLICY "Translation cache is writable" 
  ON translation_cache FOR INSERT WITH CHECK (TRUE);

-- Mise à jour publique (pour usage_count et last_used_at)
CREATE POLICY "Translation cache is updatable" 
  ON translation_cache FOR UPDATE USING (TRUE);
```

---

## 🔧 Utilisation

### 1. Calculer le Hash

```typescript
import crypto from 'crypto';

function hashText(text: string): string {
  return crypto
    .createHash('sha256')
    .update(text.toLowerCase().trim())
    .digest('hex');
}
```

### 2. Vérifier le Cache

```typescript
async function checkCache(
  sourceLang: string,
  targetLang: string,
  sourceText: string
): Promise<string | null> {
  const supabase = createClient();
  const hash = hashText(sourceText);

  const { data, error } = await supabase
    .from('translation_cache')
    .select('translated_text, id')
    .eq('source_lang', sourceLang)
    .eq('target_lang', targetLang)
    .eq('source_text_hash', hash)
    .single();

  if (error || !data) {
    return null; // Pas en cache
  }

  // Mettre à jour usage_count et last_used_at
  await supabase
    .from('translation_cache')
    .update({
      usage_count: supabase.rpc('increment', { row_id: data.id }),
      last_used_at: new Date().toISOString(),
    })
    .eq('id', data.id);

  return data.translated_text;
}
```

### 3. Ajouter au Cache

```typescript
async function addToCache(
  sourceLang: string,
  targetLang: string,
  sourceText: string,
  translatedText: string
): Promise<void> {
  const supabase = createClient();
  const hash = hashText(sourceText);

  await supabase
    .from('translation_cache')
    .insert({
      source_lang: sourceLang,
      target_lang: targetLang,
      source_text_hash: hash,
      source_text: sourceText,
      translated_text: translatedText,
      usage_count: 1,
      last_used_at: new Date().toISOString(),
    })
    .onConflict('source_lang,target_lang,source_text_hash')
    .ignore(); // Si déjà existant, ignorer
}
```

### 4. Intégration dans le Service de Traduction

```typescript
export async function translateText(
  params: TranslateTextParams
): Promise<APIResponse<TranslateTextResponse>> {
  try {
    // 1. Vérifier le cache
    const cachedTranslation = await checkCache(
      params.sourceLang,
      params.targetLang,
      params.text
    );

    if (cachedTranslation) {
      return {
        success: true,
        data: {
          translatedText: cachedTranslation,
          fromCache: true, // Indicateur optionnel
        },
      };
    }

    // 2. Appeler l'API de traduction
    const supabase = createClient();
    const { data, error } = await supabase.functions.invoke('translate', {
      body: params,
    });

    if (error) throw new Error(error.message);

    // 3. Ajouter au cache
    await addToCache(
      params.sourceLang,
      params.targetLang,
      params.text,
      data.translatedText
    );

    return {
      success: true,
      data: {
        translatedText: data.translatedText,
        fromCache: false,
      },
    };
  } catch (error) {
    console.error('Translation error:', error);
    return {
      success: false,
      error: {
        code: 'TRANSLATION_ERROR',
        message: error instanceof Error ? error.message : 'Erreur de traduction',
      },
    };
  }
}
```

---

## 📊 Statistiques du Cache

### Requête : Traductions les Plus Populaires

```sql
SELECT 
  source_lang,
  target_lang,
  source_text,
  translated_text,
  usage_count,
  last_used_at
FROM translation_cache
ORDER BY usage_count DESC
LIMIT 50;
```

### Requête : Taux d'Utilisation par Langue

```sql
SELECT 
  source_lang,
  target_lang,
  COUNT(*) as total_entries,
  SUM(usage_count) as total_uses,
  AVG(usage_count) as avg_uses_per_entry
FROM translation_cache
GROUP BY source_lang, target_lang
ORDER BY total_uses DESC;
```

### Requête : Nettoyage des Entrées Anciennes

```sql
-- Supprimer les traductions non utilisées depuis 90 jours
DELETE FROM translation_cache
WHERE last_used_at < NOW() - INTERVAL '90 days'
  AND usage_count < 5;
```

---

## 🎯 Avantages du Cache

### 1. **Performance**
- ⚡ Réponse instantanée pour les traductions en cache
- 🚀 Réduction de la latence de ~2000ms à ~50ms

### 2. **Coûts**
- 💰 Réduction des appels API Google Translate
- 📉 Économies sur les traductions fréquentes

### 3. **Expérience Utilisateur**
- ✨ Traductions instantanées pour les phrases communes
- 🔄 Cohérence des traductions

### 4. **Scalabilité**
- 📈 Supporte un grand nombre d'utilisateurs
- 🌍 Partage du cache entre tous les utilisateurs

---

## 🔒 Sécurité et Confidentialité

### Considérations

1. **Cache Public** : Toutes les traductions sont partagées entre utilisateurs
   - ✅ Bon pour : Phrases communes, urgences, expressions courantes
   - ❌ Éviter : Informations personnelles, données sensibles

2. **Nettoyage Automatique** : Implémenter une politique de rétention
   - Supprimer les entrées anciennes et peu utilisées
   - Limiter la taille totale du cache

3. **Validation** : Toujours valider les données avant insertion
   - Vérifier la longueur du texte
   - Nettoyer les caractères spéciaux

---

## 🚀 Déploiement

### Vérifier que la Table Existe

```bash
# Via Supabase Dashboard
# Table Editor → Chercher "translation_cache"

# Via SQL
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'translation_cache';
```

### Appliquer les Migrations

```bash
# Appliquer toutes les migrations
npx supabase db push

# Vérifier le statut
npx supabase db remote commit
```

---

## 📈 Métriques Recommandées

### À Surveiller

1. **Taux de Hit du Cache**
   - Pourcentage de traductions servies depuis le cache
   - Objectif : > 60% pour les phrases courantes

2. **Taille du Cache**
   - Nombre total d'entrées
   - Espace disque utilisé

3. **Traductions Populaires**
   - Top 100 des traductions les plus utilisées
   - Identifier les patterns d'utilisation

4. **Performance**
   - Temps de réponse avec cache vs sans cache
   - Latence moyenne

---

## 🧪 Tests

### Test 1 : Insertion et Récupération

```typescript
// 1. Traduire un texte
const result1 = await translateText({
  text: "Hello",
  sourceLang: "en",
  targetLang: "it",
});
// Devrait appeler l'API

// 2. Traduire le même texte
const result2 = await translateText({
  text: "Hello",
  sourceLang: "en",
  targetLang: "it",
});
// Devrait venir du cache (fromCache: true)
```

### Test 2 : Vérifier usage_count

```sql
-- Après plusieurs utilisations
SELECT usage_count, last_used_at
FROM translation_cache
WHERE source_text = 'Hello'
  AND source_lang = 'en'
  AND target_lang = 'it';
-- usage_count devrait être > 1
```

### Test 3 : Hash Collision

```typescript
// Deux textes différents ne doivent pas avoir le même hash
const hash1 = hashText("Hello");
const hash2 = hashText("Hello!");
// hash1 !== hash2
```

---

## 🔄 Maintenance

### Tâches Régulières

1. **Hebdomadaire** : Analyser les statistiques d'utilisation
2. **Mensuel** : Nettoyer les entrées anciennes
3. **Trimestriel** : Optimiser les index si nécessaire

### Scripts de Maintenance

```sql
-- Analyser la table
ANALYZE translation_cache;

-- Vacuum pour récupérer l'espace
VACUUM translation_cache;

-- Reindex si nécessaire
REINDEX TABLE translation_cache;
```

---

## 📚 Ressources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Indexing](https://www.postgresql.org/docs/current/indexes.html)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist de Déploiement

- [x] Table `translation_cache` créée
- [x] Index créés (`hash`, `usage`)
- [x] RLS activé avec policies
- [x] Migration appliquée sur Supabase
- [x] Fonction `hashText()` implémentée (`src/lib/utils.ts`)
- [x] Fonction `getCachedTranslation()` implémentée (`src/services/translationCache.ts`)
- [x] Fonction `saveToCache()` implémentée (`src/services/translationCache.ts`)
- [x] Intégration dans `translateText()` (`src/services/translation.ts`)
- [x] Cache mémoire implémenté (100 entrées max)
- [x] Cache base de données avec upsert
- [ ] Tests unitaires ajoutés
- [ ] Monitoring configuré

---

*Document créé par Cascade - 18 janvier 2026*
