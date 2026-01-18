# 🤖 Guide Claude Code - Speech To Talk

Ce fichier contient les instructions pour utiliser Claude Code avec ce projet.

## 🚀 Démarrage rapide

```bash
# 1. Extraire le projet
unzip speech-to-talk.zip
cd speech-to-talk

# 2. Installer les dépendances
npm install

# 3. Copier les variables d'environnement
cp .env.example .env.local

# 4. Lancer en développement
npm run dev
```

## 📝 Commandes Claude Code

### Installation et configuration

```
Installe les dépendances npm et configure le projet Next.js
```

```
Configure Supabase avec les variables d'environnement
```

### Développement des fonctionnalités

```
Implémente le composant MicrophoneButton avec l'enregistrement audio
```

```
Crée le hook useTranslationFlow qui gère le flux complet de traduction vocale
```

```
Ajoute la fonctionnalité OCR avec Google Vision API
```

```
Implémente le mode conversation bilingue
```

### Tests et débogage

```
Teste le flux de traduction avec un fichier audio de test
```

```
Debug le problème de permission du microphone sur iOS
```

### Déploiement

```
Prépare le build de production et déploie sur Vercel
```

```
Configure et déploie les Edge Functions Supabase
```

## 📂 Structure des fichiers

### Fichiers clés à modifier

| Fichier | Description |
|---------|-------------|
| `src/hooks/useTranslationFlow.ts` | Logique principale de traduction |
| `src/hooks/useAudioRecorder.ts` | Gestion de l'enregistrement audio |
| `src/services/speechToText.ts` | Service Google STT |
| `src/services/translation.ts` | Service Google Translation |
| `src/services/textToSpeech.ts` | Service Google TTS |
| `src/lib/constants.ts` | Langues et phrases d'urgence |
| `src/lib/store.ts` | État global (Zustand) |

### Composants principaux

| Composant | Page |
|-----------|------|
| `LanguageSelector` | Traduction |
| `MicrophoneButton` | Traduction, Conversation |
| `TranslationResult` | Traduction |
| `EmergencyPhraseCard` | Urgences |
| `BottomNavigation` | Toutes |

## 🔧 Tâches de développement

### Priorité 1 - MVP

- [ ] Configurer Supabase (projet + Edge Functions)
- [ ] Implémenter le flux STT → Traduction → TTS
- [ ] Tester l'enregistrement audio sur navigateur
- [ ] Ajouter la gestion des erreurs
- [ ] Implémenter les phrases d'urgence

### Priorité 2 - Améliorations

- [ ] Mode conversation bilingue
- [ ] Scanner OCR
- [ ] Historique des traductions
- [ ] Favoris
- [ ] Mode haute visibilité

### Priorité 3 - Publication

- [ ] Configuration PWA complète
- [ ] Build Capacitor iOS/Android
- [ ] Tests sur appareils réels
- [ ] Optimisation des performances

## 🛠 Dépannage courant

### Erreur: Permission micro refusée
```
Vérifier les permissions dans navigator.mediaDevices.getUserMedia()
Sur iOS Safari, l'utilisateur doit interagir avant de demander la permission
```

### Erreur: CORS sur Edge Functions
```
Les headers CORS sont définis dans chaque Edge Function
Vérifier que 'Access-Control-Allow-Origin': '*' est présent
```

### Erreur: Audio ne joue pas sur mobile
```
Sur iOS, l'audio doit être déclenché par une interaction utilisateur
Utiliser le pattern: onClick -> playAudio()
```

## 📚 Ressources

- [Documentation Next.js](https://nextjs.org/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text/docs)
- [Google Cloud Translation](https://cloud.google.com/translate/docs)
- [Google Cloud Text-to-Speech](https://cloud.google.com/text-to-speech/docs)
- [Capacitor](https://capacitorjs.com/docs)
