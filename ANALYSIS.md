# 🏥 Analyse Complète - Speech To Talk

> **Date d'analyse** : 18 janvier 2026  
> **Version analysée** : 1.0.0

---

## 📋 Vue d'ensemble

**Speech To Talk** est une application de traduction vocale en temps réel conçue pour les **sapeurs-pompiers** en intervention auprès de personnes ne parlant pas français. L'application permet de capturer la parole, la traduire et la prononcer dans la langue cible.

### Objectifs de l'application
- Faciliter la communication médicale d'urgence
- Traduction vocale instantanée
- Support de phrases d'urgence prédéfinies
- Scanner OCR pour documents médicaux

---

## 🛠 Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 14.2.0 | Framework React avec App Router |
| **TypeScript** | 5.3.0 | Typage statique |
| **TailwindCSS** | 3.4.0 | Styling et design system |
| **Supabase** | 2.39.0 | Backend (Auth, DB, Edge Functions) |
| **Zustand** | 4.5.0 | State management |
| **Lucide React** | 0.344.0 | Icônes |
| **Google Cloud APIs** | - | STT, Translation, TTS, Vision |

### Dépendances de développement
- TypeScript 5.3.0
- ESLint 8.56.0
- PostCSS 8.4.0
- Autoprefixer 10.4.0
- @tailwindcss/forms 0.5.7

---

## 📁 Architecture du Projet

```
speech-to-talk/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx          # Layout racine avec PWA config
│   │   ├── page.tsx            # Page d'accueil (redirection)
│   │   ├── translate/          # Traduction vocale principale
│   │   ├── conversation/       # Mode conversation bilingue
│   │   ├── emergency/          # Phrases d'urgence médicales
│   │   └── scan/               # Scanner OCR pour documents
│   │
│   ├── components/
│   │   ├── features/           # Composants métier
│   │   │   ├── MicrophoneButton.tsx
│   │   │   ├── LanguageSelector.tsx
│   │   │   ├── TranslationResult.tsx
│   │   │   ├── EmergencyPhraseCard.tsx
│   │   │   ├── BottomNavigation.tsx
│   │   │   └── index.ts
│   │   └── ui/                 # Composants UI réutilisables
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── index.ts
│   │
│   ├── hooks/                  # Hooks personnalisés
│   │   ├── useAudioRecorder.ts # Enregistrement audio
│   │   ├── useTranslationFlow.ts # Flux complet de traduction
│   │   └── index.ts
│   │
│   ├── services/               # Services API
│   │   ├── translation.ts      # Traduction via Supabase
│   │   ├── speechToText.ts     # Reconnaissance vocale
│   │   ├── textToSpeech.ts     # Synthèse vocale
│   │   └── ocr.ts              # Extraction texte images
│   │
│   ├── lib/
│   │   ├── constants.ts        # Langues, phrases d'urgence
│   │   ├── store.ts            # Zustand store global
│   │   ├── utils.ts            # Fonctions utilitaires
│   │   └── supabase/
│   │       └── client.ts       # Client Supabase
│   │
│   ├── types/
│   │   └── index.ts            # Types TypeScript
│   │
│   └── styles/
│       └── globals.css         # Styles globaux
│
├── supabase/
│   ├── functions/              # Edge Functions
│   │   ├── translate/
│   │   ├── speech-to-text/
│   │   ├── text-to-speech/
│   │   └── ocr/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # Icônes PWA
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## ✨ Fonctionnalités Implémentées

### 1. Traduction Vocale (`/translate`)

**Fichier principal** : `src/app/translate/page.tsx`

- Enregistrement audio via MediaRecorder API
- Conversion parole → texte (Google Speech-to-Text)
- Traduction automatique (Google Translation API)
- Synthèse vocale de la traduction (Google Text-to-Speech)
- Lecture automatique après traduction
- Gestion des permissions microphone

**Flux de traduction** :
1. Appui sur le bouton micro → démarrage enregistrement
2. Relâchement → arrêt et envoi à l'API STT
3. Texte transcrit → envoi à l'API Translation
4. Texte traduit → envoi à l'API TTS
5. Audio généré → lecture automatique

### 2. Mode Conversation (`/conversation`)

**Fichier principal** : `src/app/conversation/page.tsx`

- Interface bilingue avec 2 participants (A et B)
- Historique des messages avec traductions
- Affichage du texte original et traduit
- Indicateurs visuels par participant

### 3. Phrases d'Urgence (`/emergency`)

**Fichier principal** : `src/app/emergency/page.tsx`

- 16 phrases médicales prédéfinies
- 5 catégories :
  - 🩺 **Douleur** : douleur thoracique, maux de tête, abdominale, vertiges
  - 🫁 **Respiration** : difficultés respiratoires, asthme
  - ⚠️ **Allergies** : réactions allergiques, allergies médicamenteuses
  - 💊 **Médicaments** : insuline, diabète, besoins médicamenteux
  - 🏥 **Général** : appel ambulance, besoin d'aide, hôpital
- Niveaux de sévérité : critical, high, medium, low
- Lecture audio instantanée au tap

### 4. Scanner OCR (`/scan`)

**Fichier principal** : `src/app/scan/page.tsx`

- Capture photo via caméra ou import galerie
- Compression d'image avant envoi (max 1920px, qualité 80%)
- Extraction texte via Google Cloud Vision
- Détection automatique de la langue
- Traduction du texte extrait
- Génération audio de la traduction
- Copie du texte dans le presse-papier

### 5. Langues Supportées

| Code | Langue | Nom natif | Drapeau | Code Google |
|------|--------|-----------|---------|-------------|
| `en` | English | English | 🇬🇧 | en-US |
| `it` | Italian | Italiano | 🇮🇹 | it-IT |
| `es` | Spanish | Español | 🇪🇸 | es-ES |
| `ru` | Russian | Русский | 🇷🇺 | ru-RU |

---

## 🗄 Base de Données (Supabase)

### Tables

#### `translations`
Historique des traductions utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| user_id | UUID | Référence auth.users |
| source_lang | VARCHAR(5) | Langue source |
| target_lang | VARCHAR(5) | Langue cible |
| source_text | TEXT | Texte original |
| translated_text | TEXT | Texte traduit |
| audio_url | TEXT | URL audio (optionnel) |
| is_favorite | BOOLEAN | Marqué comme favori |
| created_at | TIMESTAMPTZ | Date de création |

#### `emergency_phrases`
Phrases d'urgence prédéfinies.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| category | VARCHAR(50) | Catégorie |
| translations | JSONB | Traductions par langue |
| icon | VARCHAR(50) | Emoji icône |
| severity | VARCHAR(20) | Niveau de sévérité |
| display_order | INT | Ordre d'affichage |
| is_active | BOOLEAN | Phrase active |

#### `translation_cache`
Cache des traductions pour optimisation.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| source_lang | VARCHAR(5) | Langue source |
| target_lang | VARCHAR(5) | Langue cible |
| source_text_hash | VARCHAR(64) | Hash du texte source |
| source_text | TEXT | Texte original |
| translated_text | TEXT | Texte traduit |
| usage_count | INT | Nombre d'utilisations |

#### `user_preferences`
Préférences utilisateur.

| Colonne | Type | Description |
|---------|------|-------------|
| id | UUID | Clé primaire |
| user_id | UUID | Référence auth.users |
| default_source_lang | VARCHAR(5) | Langue source par défaut |
| default_target_lang | VARCHAR(5) | Langue cible par défaut |
| auto_play_audio | BOOLEAN | Lecture auto |
| high_visibility_mode | BOOLEAN | Mode haute visibilité |
| theme | VARCHAR(20) | Thème (light/dark/system) |

### Sécurité (RLS)

Row Level Security activé sur toutes les tables :
- Les utilisateurs ne voient que leurs propres données
- Les phrases d'urgence sont accessibles publiquement (lecture seule)
- Le cache de traduction est accessible en lecture seule

---

## 🔌 Edge Functions Supabase

| Fonction | API Google | Description |
|----------|------------|-------------|
| `translate` | Translation API v2 | Traduction de texte |
| `speech-to-text` | Speech-to-Text | Reconnaissance vocale |
| `text-to-speech` | Text-to-Speech | Synthèse vocale |
| `ocr` | Cloud Vision | Extraction de texte |

### Configuration requise

Variables d'environnement pour les Edge Functions :
- `GOOGLE_CLOUD_API_KEY` : Clé API Google Cloud

---

## 🎨 Design System

### Couleurs

```typescript
// Couleurs principales
primary: '#2E5DA8'    // Bleu médical
accent: '#E63946'     // Rouge urgence
dark: '#1A1A2E'       // Fond sombre
```

### Animations personnalisées

- `pulse-ring` : Animation de pulsation pour l'enregistrement
- `recording` : Animation de scale pour le bouton micro
- `fade-in` : Animation d'apparition
- `slide-up` : Animation de glissement vers le haut
- `waveform` : Animation des barres audio

### Classes utilitaires

- `.page-container` : Container de page avec padding bottom pour navigation
- `.header-gradient` : Dégradé bleu pour les headers
- `.header-gradient-emergency` : Dégradé rouge pour la page urgence
- `.content-area` : Zone de contenu avec coins arrondis
- `.glass` : Effet glassmorphism
- `.scrollbar-hide` : Cache la scrollbar

---

## 💪 Points Forts

### Architecture & Code

1. **Architecture propre** : Séparation claire entre composants, hooks, services et types
2. **TypeScript strict** : Typage complet avec interfaces bien définies
3. **Pattern APIResponse** : Gestion d'erreurs uniforme avec `APIResponse<T>`
4. **Hooks réutilisables** : `useAudioRecorder` et `useTranslationFlow` bien encapsulés

### State Management

5. **Zustand efficace** : Store global avec persistance localStorage
6. **Hooks helpers** : `useLanguages`, `useAudioState`, `useTranslation`, `useConversation`
7. **Persistance sélective** : Seules les données nécessaires sont persistées

### UX/UI

8. **PWA ready** : Manifest, icônes, meta tags pour installation mobile
9. **Design cohérent** : Tailwind avec design system personnalisé
10. **Accessibilité** : Labels ARIA, safe areas mobiles
11. **Mode haute visibilité** : Prévu pour accessibilité (contraste élevé)

### Performance

12. **Compression d'images** : Avant envoi OCR
13. **Cache de traduction** : Table dédiée pour éviter les appels redondants
14. **Chunking audio** : Enregistrement par morceaux de 100ms

---

## ⚠️ Axes d'Amélioration

### 🔴 Critiques

#### 1. Mode Conversation incomplet
Le bouton micro dans la page conversation n'est pas connecté au flux de traduction.

**Fichier** : `src/app/conversation/page.tsx` (lignes 112-121)
```tsx
<button className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
  <Mic className="w-6 h-6 text-white" />
</button>
```
Le bouton est purement visuel, sans handler.

**Solution** : Intégrer `useTranslationFlow` et ajouter la logique de conversation.

#### 2. Pas d'authentification
Les services utilisent `userId` mais aucun système d'auth n'est implémenté côté client.

**Impact** : 
- Les données ne sont pas sécurisées
- L'historique n'est pas persisté par utilisateur
- Les préférences ne sont pas synchronisées

**Solution** : Implémenter Supabase Auth avec login/signup.

#### 3. Gestion des erreurs Edge Functions
Le typage `error.message` peut échouer si l'erreur n'est pas une instance d'Error.

**Fichier** : `supabase/functions/translate/index.ts` (ligne 72)
```typescript
JSON.stringify({ error: error.message })
```

**Solution** : Utiliser un helper de gestion d'erreur.

### 🟡 Importants

#### 4. Pas de tests
Aucun fichier de test (unit, integration, e2e).

**Solution** : Ajouter Jest/Vitest + React Testing Library + Playwright.

#### 5. Mode hors ligne non implémenté
Mentionné en v2.0 mais le cache n'est pas utilisé côté client.

**Solution** : Implémenter Service Worker + IndexedDB.

#### 6. Edge Function manquante
La fonction `detectSpokenLanguage` appelle `detect-language` qui n'existe pas.

**Fichier** : `src/services/speechToText.ts` (ligne 82)

**Solution** : Créer la fonction ou supprimer la fonctionnalité.


#### 8. Pas de validation des données
Les données entrantes ne sont pas validées côté client.

**Solution** : Ajouter Zod pour la validation.

### 🟢 Mineurs

#### 10. Constantes dupliquées
Les phrases d'urgence sont définies dans `constants.ts` ET dans la migration SQL.

**Solution** : Charger les phrases depuis la base de données.

#### 11. Pas de loading skeleton
Les états de chargement pourraient être plus visuels.

**Solution** : Ajouter des composants Skeleton.

#### 12. Console.log en production
Plusieurs `console.error` qui devraient utiliser un logger.

**Solution** : Implémenter un service de logging.

---

## 📊 Métriques

| Métrique | Valeur |
|----------|--------|
| Fichiers TypeScript | ~30 |
| Composants React | 9 |
| Hooks personnalisés | 2 |
| Services API | 4 |
| Edge Functions | 4 |
| Tables DB | 4 |
| Langues supportées | 4 |
| Phrases d'urgence | 16 |
| Lignes de code (estimé) | ~3500 |

---

## 🚀 Recommandations Prioritaires

### Court terme (Sprint 1)

1. **Implémenter l'authentification** Supabase Auth
2. **Connecter le mode conversation** au flux de traduction
3. **Supprimer le dossier `{src/`** mal nommé
4. **Corriger l'import redondant** dans MicrophoneButton

### Moyen terme (Sprint 2-3)

5. **Ajouter des tests** avec Jest/Vitest + RTL
6. **Créer la Edge Function `detect-language`** ou supprimer la fonctionnalité
7. **Implémenter la validation Zod** pour les formulaires
8. **Charger les phrases d'urgence** depuis la DB

### Long terme (v2.0)

9. **Implémenter le mode hors ligne** avec Service Worker
10. **Ajouter des langues** supplémentaires
11. **Créer un système de logging** centralisé
12. **Ajouter des analytics** pour le suivi d'usage

---

## 🔧 Configuration Requise

### Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud (pour Edge Functions)
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### APIs Google Cloud à activer

1. Cloud Speech-to-Text API
2. Cloud Translation API
3. Cloud Text-to-Speech API
4. Cloud Vision API

---

## 📝 Conclusion

L'application **Speech To Talk** est bien structurée avec une architecture moderne (Next.js 14 + App Router). Le code est propre, typé et organisé selon les bonnes pratiques React/TypeScript.

### État actuel
- ✅ Traduction vocale fonctionnelle
- ✅ Scanner OCR fonctionnel
- ✅ Phrases d'urgence fonctionnelles
- ⚠️ Mode conversation incomplet
- ❌ Authentification manquante
- ❌ Tests manquants

### Prêt pour
- MVP / Démonstration
- Tests utilisateurs internes

### Nécessite avant production
- Authentification utilisateur
- Tests automatisés
- Mode conversation complet
- Gestion d'erreurs robuste

---

*Analyse réalisée par Cascade - 18 janvier 2026*
