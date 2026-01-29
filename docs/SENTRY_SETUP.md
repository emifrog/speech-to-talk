# Configuration de Sentry pour Speech To Talk

Ce guide explique comment configurer Sentry pour le monitoring des erreurs de l'application.

## Installation

1. **Installer le package Sentry**

```bash
npm install @sentry/nextjs
```

2. **Renommer les fichiers de configuration**

```bash
mv sentry.client.config.ts.example sentry.client.config.ts
mv sentry.server.config.ts.example sentry.server.config.ts
mv sentry.edge.config.ts.example sentry.edge.config.ts
```

3. **Configurer les variables d'environnement**

Ajoutez ces variables à votre fichier `.env.local` :

```env
# Sentry DSN - récupérez-le depuis votre projet Sentry
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx

# Organisation et projet Sentry (pour l'upload des source maps)
SENTRY_ORG=votre-organisation
SENTRY_PROJECT=speech-to-talk

# Token d'authentification (optionnel, pour l'upload des source maps en CI)
SENTRY_AUTH_TOKEN=votre-token
```

4. **Créer un projet sur Sentry**

- Allez sur [sentry.io](https://sentry.io)
- Créez un nouveau projet de type "Next.js"
- Copiez le DSN fourni

## Fonctionnalités

### Capture automatique des erreurs

Les erreurs sont automatiquement capturées :
- Erreurs React (via Error Boundary)
- Erreurs API
- Erreurs réseau

### Tracking personnalisé

Utilisez les utilitaires dans `src/lib/sentry.ts` :

```typescript
import { captureError, addBreadcrumb, trackTranslationError } from '@/lib/sentry';

// Capturer une erreur avec contexte
captureError(error, {
  tags: { service: 'translation' },
  extra: { textLength: 150 },
});

// Ajouter un breadcrumb pour le debugging
addBreadcrumb({
  message: 'User started recording',
  category: 'audio',
  level: 'info',
});

// Tracking spécifique par service
trackTranslationError(error, {
  sourceLang: 'fr',
  targetLang: 'en',
  textLength: 150,
});
```

### Erreurs filtrées

Ces erreurs ne sont pas envoyées à Sentry (comportement normal) :
- `OFFLINE` - Utilisateur hors ligne
- `RATE_LIMIT_EXCEEDED` - Limite de requêtes atteinte
- `Failed to fetch` - Erreur réseau

### Replay des sessions

En production, Sentry enregistre les replays de session pour :
- 100% des sessions avec erreurs
- 10% des sessions normales

Les données sensibles sont masquées automatiquement.

## Configuration avancée

### Modifier le sample rate

Dans `sentry.client.config.ts` :

```typescript
Sentry.init({
  // Augmenter pour plus de traces (coût plus élevé)
  tracesSampleRate: 0.2, // 20% des requêtes

  // Replay
  replaysOnErrorSampleRate: 1.0, // 100% des sessions avec erreur
  replaysSessionSampleRate: 0.1, // 10% des sessions normales
});
```

### Ajouter des tags personnalisés

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.setTag('department', 'pompiers');
Sentry.setTag('region', 'ile-de-france');
```

### Tunnel pour contourner les ad-blockers

Le tunnel est configuré automatiquement via `/monitoring-tunnel`. Les requêtes Sentry passent par votre serveur Next.js.

## Coûts

Sentry offre un plan gratuit avec :
- 5,000 erreurs/mois
- 1 utilisateur
- 30 jours de rétention

Pour une utilisation en production, prévoyez un plan payant (~$26/mois pour 100k erreurs).
