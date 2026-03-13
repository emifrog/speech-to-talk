# Speech To Talk

SpeechToTalk est une application mobile de traduction vocale en temps réel conçue spécifiquement pour les sapeurs-pompiers qui sont au contact de personnes ne parlant pas français. L'application utilise la reconnaissance vocale pour capturer la parole, la traduit dans la langue cible, et peut même prononcer la traduction à haute voix. Grâce à son système de cache et à son Service Worker, elle peut fonctionner hors ligne dans des situations d'urgence.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![Tests](https://img.shields.io/badge/tests-54%20passing-brightgreen)
![CI](https://img.shields.io/github/actions/workflow/status/your-org/speech-to-talk/ci.yml?label=CI)
![License](https://img.shields.io/badge/license-MIT-green)

## Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Stack technique](#-stack-technique)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Structure du projet](#-structure-du-projet)
- [Développement](#-développement)
- [Tests](#-tests)
- [Déploiement](#-déploiement)

## Fonctionnalités

### Version 1.0 (actuelle)
- **Authentification** : Login/signup via Supabase Auth, toutes les pages protégées
- **Traduction vocale** : Parlez et obtenez une traduction instantanée avec lecture audio
- **Mode conversation** : Dialogue bilingue en temps réel entre deux interlocuteurs
- **Phrases d'urgence** : 16 phrases médicales prédéfinies, lecture audio instantanée
- **Scanner OCR** : Traduisez documents et images via Google Cloud Vision
- **5 langues** : Français, Anglais, Italien, Espagnol, Russe
- **PWA** : Installable sur mobile, support hors ligne via Service Worker
- **Dark mode** : Support complet du mode sombre

### En cours / prévu
- Chargement des phrases d'urgence depuis la base de données
- Tests e2e Playwright
- Logger centralisé

## Stack technique

| Technologie | Usage |
|-------------|-------|
| **Next.js 14** | Framework React avec App Router |
| **TypeScript** | Typage statique |
| **TailwindCSS** | Styling |
| **Supabase** | Backend (Auth, DB, Edge Functions) |
| **Google Cloud APIs** | STT, Translation, TTS, Vision |
| **Zustand** | State management |
| **Zod** | Validation des données |
| **Jest + RTL** | Tests automatisés |
| **GitHub Actions** | CI/CD |
| **Capacitor** | Build iOS/Android |

## Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Supabase
- Compte Google Cloud avec APIs activées

### Étapes

```bash
# 1. Cloner le projet
git clone <repository-url>
cd speech-to-talk

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env.local

# 4. Configurer les variables (voir section Configuration)

# 5. Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000)

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` avec :

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

### Supabase Setup

1. Créez un projet Supabase
2. Exécutez les migrations SQL (voir `/supabase/migrations`)
3. Déployez les 5 Edge Functions (voir `/supabase/functions`)

### Google Cloud Setup

1. Créez un projet Google Cloud
2. Activez les APIs :
   - Cloud Speech-to-Text
   - Cloud Translation
   - Cloud Text-to-Speech
   - Cloud Vision
3. Créez une clé API

## Structure du projet

```
speech-to-talk/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── layout.tsx          # Layout racine
│   │   ├── page.tsx            # Page d'accueil
│   │   ├── auth/               # Login, Register, Callback
│   │   ├── translate/          # Page traduction
│   │   ├── conversation/       # Mode conversation
│   │   ├── emergency/          # Phrases d'urgence
│   │   └── scan/               # Scanner OCR
│   │
│   ├── components/
│   │   ├── ui/                 # Composants UI réutilisables (Button, Card, Toast)
│   │   └── features/           # Composants métier (MicrophoneButton, SettingsMenu…)
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx     # Context d'authentification
│   │
│   ├── hooks/                  # Hooks personnalisés
│   │   ├── useAudioRecorder.ts
│   │   ├── useTranslationFlow.ts
│   │   ├── useConversationFlow.ts
│   │   ├── useAuth.ts
│   │   ├── useRequireAuth.ts
│   │   ├── useServiceWorker.ts
│   │   ├── useKeyboardNavigation.ts
│   │   ├── useFocusTrap.ts
│   │   ├── useArrowNavigation.ts
│   │   └── useRovingTabIndex.ts
│   │
│   ├── services/               # Services API
│   │   ├── translation.ts
│   │   ├── speechToText.ts
│   │   ├── textToSpeech.ts
│   │   ├── ocr.ts
│   │   └── translationCache.ts # Cache offline
│   │
│   ├── lib/                    # Utilitaires
│   │   ├── constants.ts        # Constantes (langues, phrases)
│   │   ├── store.ts            # Zustand store
│   │   ├── utils.ts
│   │   ├── validation.ts       # Schémas Zod
│   │   ├── rateLimit.ts
│   │   ├── retry.ts
│   │   └── supabase/           # Client Supabase
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── styles/
│   │   └── globals.css         # Styles globaux + design tokens
│   │
│   └── __tests__/              # Tests automatisés (54 tests)
│
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service Worker
│   ├── apple-touch-icon.png
│   └── icons/
│
├── supabase/
│   ├── functions/              # 5 Edge Functions
│   └── migrations/
│
├── .github/
│   └── workflows/
│       └── ci.yml              # Pipeline CI/CD
│
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Développement

### Scripts disponibles

```bash
# Développement
npm run dev

# Build production
npm run build

# Lancer en production
npm start

# Linting
npm run lint

# Type checking
npm run type-check

# Tests
npm test
```

### Ajouter une nouvelle langue

1. Ajoutez la langue dans `src/lib/constants.ts` :

```typescript
export const SUPPORTED_LANGUAGES: Language[] = [
  // ... langues existantes
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    googleCode: 'de-DE',
  },
];
```

2. Ajoutez les traductions des phrases d'urgence

### Tester sur mobile

```bash
# Installer Capacitor
npm install @capacitor/core @capacitor/cli

# Initialiser
npx cap init

# Ajouter les plateformes
npx cap add android
npx cap add ios

# Build et sync
npm run build
npx cap sync

# Ouvrir dans l'IDE natif
npx cap open android
npx cap open ios
```

## Tests

Le projet inclut 54 tests automatisés répartis en 5 suites, tous passants.

```bash
# Lancer tous les tests
npm test

# Mode watch
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Suites de tests

| Fichier | Description |
|---------|-------------|
| `BottomNavigation.test.tsx` | Navigation entre les pages |
| `MicrophoneButton.test.tsx` | Bouton d'enregistrement |
| `LanguageSelector.test.tsx` | Sélecteur de langue |
| `translation.test.ts` | Service de traduction |
| `useTranslationFlow.test.ts` | Hook du flux de traduction |

### CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) exécute 4 jobs à chaque push :
1. **lint** : ESLint
2. **typecheck** : TypeScript
3. **test** : Jest (54 tests)
4. **build** : Next.js build

## Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contribution

1. Fork le projet
2. Créez une branche (`git checkout -b feature/amazing-feature`)
3. Committez (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing-feature`)
5. Ouvrez une Pull Request

## License

MIT License - voir [LICENSE](LICENSE) pour plus de détails.

---

**Speech To Talk** - Faciliter la communication médicale d'urgence
