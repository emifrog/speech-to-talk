# Analyse Complète - Speech To Talk

> **Date d'analyse** : 13 mars 2026
> **Version analysée** : 1.0.0

---

## Vue d'ensemble

**Speech To Talk** est une application de traduction vocale en temps réel conçue pour les **sapeurs-pompiers** en intervention auprès de personnes ne parlant pas français. L'application permet de capturer la parole, la traduire et la prononcer dans la langue cible.

### Objectifs de l'application
- Faciliter la communication médicale d'urgence
- Traduction vocale instantanée
- Support de phrases d'urgence prédéfinies
- Scanner OCR pour documents médicaux

---

## Stack Technique

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 14.2.0 | Framework React avec App Router |
| **TypeScript** | 5.3.0 | Typage statique |
| **TailwindCSS** | 3.4.0 | Styling et design system |
| **Supabase** | 2.39.0 | Backend (Auth, DB, Edge Functions) |
| **Zustand** | 4.5.0 | State management |
| **Zod** | - | Validation des données |
| **Jest + RTL** | - | Tests automatisés |
| **Lucide React** | 0.344.0 | Icônes |
| **Google Cloud APIs** | - | STT, Translation, TTS, Vision |

### Dépendances de développement
- TypeScript 5.3.0
- ESLint 8.56.0
- PostCSS 8.4.0
- Autoprefixer 10.4.0
- @tailwindcss/forms 0.5.7
- Jest + React Testing Library

---

## Architecture du Projet

```
speech-to-talk/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx          # Layout racine avec PWA config
│   │   ├── page.tsx            # Page d'accueil (redirection)
│   │   ├── auth/               # Pages d'authentification
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── callback/route.ts
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
│   │   │   ├── SettingsMenu.tsx
│   │   │   └── index.ts
│   │   └── ui/                 # Composants UI réutilisables
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Toast.tsx
│   │       └── index.ts
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     # Context d'authentification
│   │
│   ├── hooks/                  # Hooks personnalisés
│   │   ├── useAudioRecorder.ts     # Enregistrement audio
│   │   ├── useTranslationFlow.ts   # Flux complet de traduction
│   │   ├── useConversationFlow.ts  # Flux de conversation bilingue
│   │   ├── useAuth.ts              # Authentification
│   │   ├── useRequireAuth.ts       # Protection de routes
│   │   ├── useServiceWorker.ts     # PWA / offline
│   │   ├── useKeyboardNavigation.ts
│   │   ├── useFocusTrap.ts
│   │   ├── useArrowNavigation.ts
│   │   ├── useRovingTabIndex.ts
│   │   └── index.ts
│   │
│   ├── services/               # Services API
│   │   ├── translation.ts      # Traduction via Supabase
│   │   ├── speechToText.ts     # Reconnaissance vocale
│   │   ├── textToSpeech.ts     # Synthèse vocale
│   │   ├── ocr.ts              # Extraction texte images
│   │   └── translationCache.ts # Cache offline
│   │
│   ├── lib/
│   │   ├── constants.ts        # Langues, phrases d'urgence
│   │   ├── store.ts            # Zustand store global
│   │   ├── utils.ts            # Fonctions utilitaires
│   │   ├── validation.ts       # Schémas Zod
│   │   ├── rateLimit.ts        # Limitation de requêtes
│   │   ├── retry.ts            # Logique de retry
│   │   ├── haptics.ts          # Retour haptique
│   │   └── supabase/
│   │       └── client.ts       # Client Supabase
│   │
│   ├── types/
│   │   └── index.ts            # Types TypeScript
│   │
│   ├── styles/
│   │   └── globals.css         # Styles globaux + design tokens
│   │
│   └── __tests__/              # Tests automatisés
│       ├── BottomNavigation.test.tsx
│       ├── MicrophoneButton.test.tsx
│       ├── LanguageSelector.test.tsx
│       ├── translation.test.ts
│       └── useTranslationFlow.test.ts
│
├── supabase/
│   ├── functions/              # Edge Functions
│   │   ├── translate/
│   │   ├── speech-to-text/
│   │   ├── text-to-speech/
│   │   ├── detect-language/
│   │   └── ocr/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── apple-touch-icon.png    # Icône PWA iOS
│   └── icons/                  # Icônes PWA
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Fonctionnalités Implémentées

### 1. Authentification (`/auth/login`, `/auth/register`)

**Fichiers principaux** : `src/app/auth/login/page.tsx`, `src/app/auth/register/page.tsx`, `src/contexts/AuthContext.tsx`

- Supabase Auth avec login/signup
- Pages avec design glassmorphism
- Callback OAuth (`/auth/callback`)
- Hook `useRequireAuth` : redirige les utilisateurs non authentifiés vers `/auth/login?redirect=<path>`
- Toutes les pages protégées : `/translate`, `/conversation`, `/scan`, `/emergency`

### 2. Traduction Vocale (`/translate`)

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

### 3. Mode Conversation (`/conversation`)

**Fichier principal** : `src/app/conversation/page.tsx`

- Interface bilingue avec 2 participants (A et B)
- Historique des messages avec traductions
- Affichage du texte original et traduit
- Hook `useConversationFlow` connecté au bouton micro

### 4. Phrases d'Urgence (`/emergency`)

**Fichier principal** : `src/app/emergency/page.tsx`

- 16 phrases médicales prédéfinies
- 5 catégories :
  - **Douleur** : douleur thoracique, maux de tête, abdominale, vertiges
  - **Respiration** : difficultés respiratoires, asthme
  - **Allergies** : réactions allergiques, allergies médicamenteuses
  - **Médicaments** : insuline, diabète, besoins médicamenteux
  - **Général** : appel ambulance, besoin d'aide, hôpital
- Niveaux de sévérité : critical, high, medium, low
- Lecture audio instantanée au tap

### 5. Scanner OCR (`/scan`)

**Fichier principal** : `src/app/scan/page.tsx`

- Capture photo via caméra ou import galerie
- Compression d'image avant envoi (max 1920px, qualité 80%)
- Extraction texte via Google Cloud Vision
- Détection automatique de la langue
- Traduction du texte extrait
- Génération audio de la traduction
- Copie du texte dans le presse-papier

### 6. Langues Supportées

| Code | Langue | Nom natif | Drapeau | Code Google |
|------|--------|-----------|---------|-------------|
| `fr` | French | Français | 🇫🇷 | fr-FR |
| `en` | English | English | 🇬🇧 | en-US |
| `it` | Italian | Italiano | 🇮🇹 | it-IT |
| `es` | Spanish | Español | 🇪🇸 | es-ES |
| `ru` | Russian | Русский | 🇷🇺 | ru-RU |

---

## Base de Données (Supabase)

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

## Edge Functions Supabase

| Fonction | API Google | Statut | Description |
|----------|------------|--------|-------------|
| `translate` | Translation API v2 | ✅ 200 OK | Traduction de texte |
| `speech-to-text` | Speech-to-Text | ✅ 200 OK | Reconnaissance vocale (modèle `default`) |
| `text-to-speech` | Text-to-Speech | ✅ 200 OK | Synthèse vocale |
| `detect-language` | Translation API v2 | ✅ 200 OK | Détection automatique de langue |
| `ocr` | Cloud Vision | ✅ 200 OK | Extraction de texte |

### Configuration requise

Variables d'environnement pour les Edge Functions :
- `GOOGLE_CLOUD_API_KEY` : Clé API Google Cloud

---

## Design System

### Couleurs

```typescript
// Couleurs principales
primary: '#2E5DA8'    // Bleu médical
accent: '#E63946'     // Rouge urgence
dark: '#1A1A2E'       // Fond sombre
```

### Design tokens

Variables CSS pour la cohérence visuelle et le dark mode complet.

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
- `.glass` : Effet glassmorphism (utilisé notamment sur les pages auth)
- `.scrollbar-hide` : Cache la scrollbar

---

## Points Forts

### Architecture & Code

1. **Architecture propre** : Séparation claire entre composants, hooks, services et types
2. **TypeScript strict** : Typage complet avec interfaces bien définies
3. **Pattern APIResponse** : Gestion d'erreurs uniforme avec `APIResponse<T>`
4. **Hooks réutilisables** : `useAudioRecorder`, `useTranslationFlow`, `useConversationFlow` bien encapsulés
5. **Validation Zod** : Schémas de validation pour tous les inputs/outputs API (`src/lib/validation.ts`)

### State Management

6. **Zustand efficace** : Store global avec persistance localStorage
7. **Hooks helpers** : `useLanguages`, `useAudioState`, `useTranslation`, `useConversation`
8. **Persistance sélective** : Seules les données nécessaires sont persistées

### Sécurité & Robustesse

9. **Authentification Supabase** : Login/signup avec protection de toutes les routes
10. **Rate limiting** : `src/lib/rateLimit.ts` pour limiter les abus
11. **Retry logic** : `src/lib/retry.ts` pour la résilience réseau
12. **Cache offline** : `src/services/translationCache.ts` avec support hors ligne

### UX/UI

13. **PWA complète** : Service Worker (`sw.js`), manifest, icônes iOS/Android
14. **Dark mode** : Support complet via design tokens CSS
15. **Toast notifications** : Composant `Toast.tsx` avec hook `useToast`
16. **Accessibilité** : Hooks de navigation clavier (`useKeyboardNavigation`, `useFocusTrap`, `useArrowNavigation`, `useRovingTabIndex`), labels ARIA

### Performance

17. **Compression d'images** : Avant envoi OCR
18. **Cache de traduction** : Table dédiée + cache client pour éviter les appels redondants
19. **Chunking audio** : Enregistrement par morceaux de 100ms

### Qualité logicielle

20. **54 tests automatisés** : 5 suites Jest + React Testing Library, tous passants
21. **CI/CD pipeline** : GitHub Actions avec 4 jobs (lint, typecheck, test, build)

---

## Axes d'Amélioration

### Importants

#### 1. Phrases d'urgence encore hardcodées
Les phrases sont définies dans `constants.ts` ET dans la migration SQL — la page n'interroge pas la base de données.

**Solution** : Charger les phrases depuis la table `emergency_phrases` (Supabase).

#### 2. Pas de skeleton loading
Les états de chargement pourraient être plus visuels.

**Solution** : Ajouter des composants Skeleton pour les zones de contenu qui chargent de façon asynchrone.

### Mineurs

#### 3. console.error en production
Plusieurs `console.error` subsistent sans logger centralisé.

**Solution** : Implémenter un service de logging (ex. Sentry, déjà partiellement présent dans la config).

#### 4. Credentials exposés dans l'historique git
Le fichier `.env.local` est dans `.gitignore` mais les clés ont été visibles dans l'historique git.

**Solution** : Faire une rotation des clés Google Cloud et Supabase.

---

## Métriques

| Métrique | Valeur |
|----------|--------|
| Fichiers TypeScript | ~55 |
| Composants React | 12 |
| Hooks personnalisés | 10 |
| Services API | 5 |
| Edge Functions | 5 |
| Tables DB | 4 |
| Langues supportées | 5 |
| Phrases d'urgence | 16 |
| Tests automatisés | 54 |
| Suites de tests | 5 |
| Jobs CI/CD | 4 |
| Lignes de code (estimé) | ~5500 |

---

## Recommandations Prioritaires

### Court terme

1. **Charger les phrases d'urgence** depuis la table `emergency_phrases` plutôt que depuis `constants.ts`
2. **Rotation des clés API** compromises dans l'historique git
3. **Ajouter des skeleton loaders** pour améliorer la perception de performance

### Moyen terme

4. **Implémenter un logger centralisé** (Sentry ou équivalent) pour remplacer les `console.error`
5. **Ajouter des tests e2e** avec Playwright pour les flux critiques (traduction, authentification)
6. **Ajouter des langues** supplémentaires selon les besoins du terrain

### Long terme

7. **Analytics** pour le suivi d'usage en conditions réelles
8. **Mode haute visibilité** (contraste élevé) pour les interventions en plein soleil
9. **Historique des traductions** par utilisateur avec interface de consultation

---

## Configuration Requise

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

## Conclusion

L'application **Speech To Talk** est bien structurée avec une architecture moderne (Next.js 14 + App Router). Depuis l'analyse initiale de janvier 2026, les axes critiques ont tous été traités : l'authentification est implémentée, le mode conversation est fonctionnel, une suite de tests complète a été ajoutée, et un pipeline CI/CD est en place.

### État actuel
- ✅ Traduction vocale fonctionnelle
- ✅ Scanner OCR fonctionnel
- ✅ Phrases d'urgence fonctionnelles
- ✅ Mode conversation fonctionnel (connecté à `useConversationFlow`)
- ✅ Authentification implémentée (Supabase Auth)
- ✅ Tests automatisés (54 tests, tous passants)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ Protection des routes (`useRequireAuth`)
- ✅ 5 Edge Functions déployées et testées
- ✅ PWA avec Service Worker
- ✅ Dark mode complet
- ✅ Toast notifications
- ✅ Validation Zod
- ✅ Rate limiting + Retry logic
- ⚠️ Phrases d'urgence encore hardcodées (pas chargées depuis la DB)
- ⚠️ Pas de skeleton loading
- ⚠️ `console.error` en production (pas de logger centralisé)

### Prêt pour
- Production (fonctionnalités core stables et testées)
- Déploiement terrain avec utilisateurs réels

### Axes restants avant v2.0
- Chargement dynamique des phrases d'urgence depuis la DB
- Logger centralisé
- Tests e2e Playwright

---

*Analyse réalisée par Cascade - 13 mars 2026*
