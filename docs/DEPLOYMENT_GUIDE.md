# 🚀 Guide de déploiement - Speech To Talk

## 1. Déploiement des Edge Functions

### Prérequis
- Un projet Supabase Cloud créé sur https://supabase.com
- Votre `Project ID` et `Access Token`

### Étapes

#### 1.1 Se connecter à Supabase
```bash
npx supabase login
```
Cela ouvrira votre navigateur pour vous authentifier.

#### 1.2 Lier le projet local au projet Cloud
```bash
npx supabase link --project-ref YOUR_PROJECT_ID
```
Remplacez `YOUR_PROJECT_ID` par l'ID de votre projet (visible dans le dashboard Supabase).

#### 1.3 Déployer toutes les Edge Functions
```bash
npx supabase functions deploy translate
npx supabase functions deploy speech-to-text
npx supabase functions deploy text-to-speech
npx supabase functions deploy ocr
```

Ou déployer toutes en une seule commande :
```bash
npx supabase functions deploy
```

#### 1.4 Configurer les variables d'environnement
Dans le dashboard Supabase :
1. Allez dans **Edge Functions** > **Settings**
2. Ajoutez la variable : `GOOGLE_CLOUD_API_KEY`
3. Valeur : Votre clé API Google Cloud

---

## 2. Configuration de l'authentification Supabase

### 2.1 Activer Email/Password

1. Connectez-vous au **Dashboard Supabase** : https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Authentication**
4. Allez dans l'onglet **Providers**
5. Trouvez **Email** dans la liste
6. Activez **Enable Email provider**
7. Configurez les options :
   - ✅ **Confirm email** : Activé (recommandé pour la production)
   - ✅ **Secure email change** : Activé
   - ⚙️ **Minimum password length** : 6 (ou plus)

### 2.2 Configurer les templates d'email (optionnel)

1. Dans **Authentication** > **Email Templates**
2. Personnalisez les templates pour :
   - Confirmation d'inscription
   - Réinitialisation de mot de passe
   - Changement d'email

### 2.3 Configurer les URLs de redirection

1. Dans **Authentication** > **URL Configuration**
2. Ajoutez vos URLs autorisées :
   ```
   http://localhost:3000
   https://votre-domaine.com
   ```

---

## 3. Configuration des variables d'environnement

Assurez-vous que votre fichier `.env.local` contient :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Cloud (pour Edge Functions - à configurer dans Supabase Dashboard)
GOOGLE_CLOUD_API_KEY=your-google-cloud-api-key
GOOGLE_CLOUD_PROJECT_ID=your-project-id

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Où trouver ces valeurs ?**
- Dashboard Supabase > **Settings** > **API**
- `NEXT_PUBLIC_SUPABASE_URL` : Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` : service_role key (⚠️ Ne jamais exposer côté client)

---

## 4. Déploiement de la base de données

### 4.1 Appliquer les migrations
```bash
npx supabase db push
```

Cela appliquera le schéma de `supabase/migrations/001_initial_schema.sql` à votre base de données Cloud.

### 4.2 Vérifier les tables créées
Dans le dashboard Supabase :
1. **Table Editor**
2. Vérifiez que les tables suivantes existent :
   - `translations`
   - `emergency_phrases`
   - `translation_cache`
   - `user_preferences`

---

## 5. Test de l'application

### 5.1 Lancer en local
```bash
npm run dev
```

### 5.2 Tester les fonctionnalités
1. **Inscription** : http://localhost:3000/auth/register
2. **Connexion** : http://localhost:3000/auth/login
3. **Traduction vocale** : http://localhost:3000/translate
4. **Conversation** : http://localhost:3000/conversation
5. **Phrases d'urgence** : http://localhost:3000/emergency
6. **Scanner OCR** : http://localhost:3000/scan

---

## 6. Vérification des Edge Functions

### 6.1 Tester une fonction
```bash
curl -i --location --request POST 'https://YOUR_PROJECT_ID.supabase.co/functions/v1/translate' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"text":"Hello","sourceLang":"en","targetLang":"it"}'
```

### 6.2 Voir les logs
Dans le dashboard Supabase :
1. **Edge Functions**
2. Sélectionnez une fonction
3. Onglet **Logs**

---

## 7. Déploiement en production

### 7.1 Build de production
```bash
npm run build
```

### 7.2 Déployer sur Vercel (recommandé pour Next.js)
```bash
npm install -g vercel
vercel
```

Ou via GitHub :
1. Push votre code sur GitHub
2. Connectez le repo à Vercel
3. Configurez les variables d'environnement dans Vercel

### 7.3 Mettre à jour les URLs autorisées
Dans Supabase Dashboard > **Authentication** > **URL Configuration**, ajoutez :
```
https://votre-app.vercel.app
```

---

## 🔒 Sécurité

### Checklist de sécurité
- ✅ RLS (Row Level Security) activé sur toutes les tables
- ✅ Service Role Key jamais exposée côté client
- ✅ CORS configuré correctement dans les Edge Functions
- ✅ Validation des paramètres dans toutes les Edge Functions
- ✅ HTTPS uniquement en production
- ✅ Variables d'environnement sécurisées

---

## 📊 Monitoring

### Supabase Dashboard
- **Database** > **Table Editor** : Voir les données
- **Authentication** > **Users** : Gérer les utilisateurs
- **Edge Functions** > **Logs** : Surveiller les erreurs
- **Database** > **Logs** : Requêtes SQL

### Google Cloud Console
- **APIs & Services** > **Credentials** : Gérer les clés API
- **APIs & Services** > **Dashboard** : Voir l'utilisation des APIs

---

## 🆘 Dépannage

### Erreur : "Invalid API key"
- Vérifiez que `GOOGLE_CLOUD_API_KEY` est configurée dans Supabase Edge Functions Settings
- Vérifiez que les APIs Google Cloud sont activées

### Erreur : "User not found"
- Vérifiez que l'authentification Email/Password est activée
- Vérifiez les RLS policies

### Erreur CORS
- Vérifiez que les URLs sont autorisées dans Supabase Auth settings
- Vérifiez les headers CORS dans les Edge Functions

---

## 📚 Ressources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Cloud APIs](https://cloud.google.com/apis)
