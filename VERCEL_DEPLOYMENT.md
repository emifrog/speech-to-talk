# 🚀 Déploiement sur Vercel - Speech To Talk

> **Date** : 18 janvier 2026  
> **Repository** : https://github.com/emifrog/speech-to-talk

---

## 📋 Prérequis

- ✅ Code poussé sur GitHub
- ✅ Compte Vercel (gratuit) : https://vercel.com/signup
- ✅ Variables d'environnement Supabase prêtes
- ✅ Clé API Google Cloud configurée

---

## 🎯 Étapes de Déploiement

### 1. Créer un Compte Vercel

1. Aller sur https://vercel.com/signup
2. Se connecter avec GitHub
3. Autoriser Vercel à accéder à vos repositories

### 2. Importer le Projet

1. Cliquer sur **"Add New Project"**
2. Sélectionner **"Import Git Repository"**
3. Chercher `emifrog/speech-to-talk`
4. Cliquer sur **"Import"**

### 3. Configurer le Projet

**Framework Preset** : Next.js (détecté automatiquement)

**Build Settings** :
- Build Command : `npm run build` (par défaut)
- Output Directory : `.next` (par défaut)
- Install Command : `npm install` (par défaut)

**Root Directory** : `.` (racine du projet)

### 4. Configurer les Variables d'Environnement

⚠️ **IMPORTANT** : Ajouter ces variables dans Vercel avant de déployer.

#### Variables Supabase (Publiques)

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### Variables Google Cloud (Privées - pour Edge Functions)

```
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key
GOOGLE_CLOUD_PROJECT_ID=your-project-id
```

#### Variables Supabase (Privées)

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

#### Variables App

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_DEBUG_MODE=false
```

**Comment ajouter les variables** :
1. Dans Vercel, section **"Environment Variables"**
2. Ajouter chaque variable une par une
3. Sélectionner les environnements : **Production**, **Preview**, **Development**
4. Cliquer sur **"Add"**

### 5. Déployer

1. Cliquer sur **"Deploy"**
2. Attendre la fin du build (2-5 minutes)
3. Votre app sera disponible sur `https://speech-to-talk.vercel.app`

---

## 🔧 Configuration Post-Déploiement

### 1. Configurer le Domaine Personnalisé (Optionnel)

1. Aller dans **Settings** → **Domains**
2. Ajouter votre domaine personnalisé
3. Suivre les instructions DNS

### 2. Mettre à Jour les URLs Supabase

Dans le dashboard Supabase :
1. **Authentication** → **URL Configuration**
2. Ajouter votre URL Vercel dans **Site URL** : `https://your-app.vercel.app`
3. Ajouter dans **Redirect URLs** :
   - `https://your-app.vercel.app/auth/callback`
   - `https://your-app.vercel.app/**`

### 3. Tester les Fonctionnalités

- ✅ Traduction vocale
- ✅ Reconnaissance vocale
- ✅ Synthèse vocale
- ✅ OCR (scan de texte)
- ✅ Phrases d'urgence
- ✅ Authentification
- ✅ Cache de traduction

---

## 📊 Déploiements Automatiques

Vercel déploie automatiquement :
- **Production** : À chaque push sur `main`
- **Preview** : À chaque pull request

### Workflow Git → Vercel

```bash
# Faire des modifications
git add .
git commit -m "Amélioration: description"
git push origin main

# Vercel déploie automatiquement en production
```

---

## 🔍 Monitoring et Logs

### Accéder aux Logs

1. Aller sur https://vercel.com/dashboard
2. Sélectionner votre projet
3. Onglet **"Deployments"**
4. Cliquer sur un déploiement
5. Voir les logs de build et runtime

### Métriques Disponibles

- **Analytics** : Visites, performances
- **Speed Insights** : Core Web Vitals
- **Logs** : Erreurs runtime
- **Functions** : Logs des Edge Functions

---

## ⚠️ Limitations du Plan Gratuit

| Ressource | Limite Gratuite |
|-----------|-----------------|
| Bande passante | 100 GB/mois |
| Builds | 6000 minutes/mois |
| Edge Functions | 100 GB-Hrs |
| Serverless Functions | 100 GB-Hrs |
| Projets | Illimités |

**Pour Speech To Talk** : Le plan gratuit est largement suffisant pour commencer.

---

## 🐛 Résolution de Problèmes

### Build Failed

**Erreur** : `Module not found`
**Solution** :
```bash
# Vérifier package.json
npm install
npm run build
```

**Erreur** : `Environment variable missing`
**Solution** : Vérifier que toutes les variables d'environnement sont configurées dans Vercel.

### Runtime Errors

**Erreur** : `CORS error`
**Solution** : Vérifier les URLs autorisées dans Supabase.

**Erreur** : `Microphone permission denied`
**Solution** : Vérifier que l'app est servie en HTTPS (Vercel le fait automatiquement).

### Edge Functions Not Working

**Erreur** : `Function invocation failed`
**Solution** :
1. Vérifier que les Edge Functions Supabase sont déployées
2. Vérifier les clés API Google Cloud
3. Vérifier les logs dans Supabase Dashboard

---

## 🔄 Redéploiement

### Redéployer Manuellement

1. Aller dans **Deployments**
2. Cliquer sur les **"..."** d'un déploiement
3. Sélectionner **"Redeploy"**

### Redéployer via Git

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## 🌍 Environnements

Vercel crée 3 environnements :

### Production
- URL : `https://speech-to-talk.vercel.app`
- Branch : `main`
- Variables : Production

### Preview
- URL : `https://speech-to-talk-git-feature-emifrog.vercel.app`
- Branch : Toutes les autres branches
- Variables : Preview

### Development
- URL : `http://localhost:3000`
- Local uniquement
- Variables : Development

---

## 📈 Optimisations Recommandées

### 1. Activer Analytics

```bash
npm install @vercel/analytics
```

Dans `src/app/layout.tsx` :
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

### 2. Activer Speed Insights

```bash
npm install @vercel/speed-insights
```

Dans `src/app/layout.tsx` :
```typescript
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. Optimiser les Images

Vercel optimise automatiquement les images avec Next.js Image Optimization.

---

## 🔒 Sécurité

### Headers de Sécurité

Déjà configurés dans `vercel.json` :
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: DENY`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Permissions-Policy: microphone=(self), camera=(self)`

### Variables d'Environnement

- ✅ Jamais commiter les fichiers `.env`
- ✅ Utiliser les variables Vercel
- ✅ Séparer les variables publiques (`NEXT_PUBLIC_*`) et privées

---

## 📚 Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Deployment Protection](https://vercel.com/docs/security/deployment-protection)

---

## ✅ Checklist de Déploiement

### Avant le Déploiement
- [x] Code poussé sur GitHub
- [x] Compte Vercel créé
- [ ] Variables d'environnement préparées
- [ ] URLs Supabase configurées

### Pendant le Déploiement
- [ ] Projet importé dans Vercel
- [ ] Variables d'environnement ajoutées
- [ ] Build réussi
- [ ] App accessible

### Après le Déploiement
- [ ] Tester toutes les fonctionnalités
- [ ] Configurer les URLs de callback Supabase
- [ ] Vérifier les permissions micro/caméra
- [ ] Tester sur mobile
- [ ] Configurer le domaine personnalisé (optionnel)

---

## 🎉 Félicitations !

Votre application **Speech To Talk** est maintenant déployée sur Vercel !

**URL de production** : `https://speech-to-talk.vercel.app`

---

*Guide créé par Cascade - 18 janvier 2026*
