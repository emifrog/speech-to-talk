SpeechToTalk est une application mobile de traduction vocale en temps réel conçue spécifiquement pour les sapeurs-pompiers qui sont au contact de personnes ne parlant pas français. L'application utilise la reconnaissance vocale pour capturer la parole, la traduit dans la langue cible, et peut même prononcer la traduction à haute voix. Grâce à son système de cache, elle peut fonctionner hors ligne dans des situations d'urgence.

Document de Spécification Technique
Version 1.0

Date : Janvier 2026
 
Table des matières
1. Présentation du projet
2. Fonctionnalités principales
3. Stack technique
4. Architecture système
5. Base de données
6. Langues supportées
7. Flux utilisateur
8. Roadmap
 
1. Présentation du projet
Speech To Talk est une application de traduction vocale en temps réel conçue spécifiquement pour les situations d'urgence médicale. Elle permet aux professionnels de santé et aux patients de communiquer efficacement malgré les barrières linguistiques.
1.1 Problématique
Dans les situations d'urgence médicale, la communication rapide et précise est cruciale. Les barrières linguistiques peuvent retarder les diagnostics, provoquer des erreurs médicales et mettre en danger la vie des patients. Les solutions de traduction existantes ne sont pas optimisées pour le contexte médical d'urgence.
1.2 Solution proposée
•	Traduction vocale instantanée optimisée pour le vocabulaire médical
•	Phrases d'urgence prédéfinies pour une communication immédiate
•	Interface haute visibilité adaptée aux environnements difficiles
•	Mode conversation multilingue pour les échanges patient-soignant
1.3 Public cible
•	Les sapeur pompiers
 
2. Fonctionnalités principales
Fonctionnalité	Description	Version
Traduction vocale	Parlez dans votre langue et obtenez une traduction instantanée avec synthèse vocale	v1.0
Détection automatique	Identification automatique de la langue parlée pour une communication plus rapide	v1.0
Mode conversation	Permet à plusieurs utilisateurs de parler à tour de rôle dans leur langue préférée	v1.0
Phrases d'urgence	Accès rapide à des phrases essentielles pour les situations d'urgence médicales	v1.0
Traduction OCR	Extraction et traduction de texte à partir d'images et de documents	v1.0
Mode haute visibilité	Interface adaptée pour une utilisation dans des conditions difficiles (luminosité, stress)	v1.0
Cache intelligent	Stockage intelligent des traductions pour une utilisation hors ligne	v2.0
Mode hors ligne	Utilisez l'application même sans connexion internet (langues téléchargées)	v2.0

 
3. Stack technique
3.1 Frontend
Technologie	Justification
Next.js 14+ (App Router)	Framework React moderne avec SSR, optimisation automatique et excellent DX
TypeScript	Typage statique pour une meilleure maintenabilité et moins de bugs
TailwindCSS	Styling rapide et cohérent, facilite le mode haute visibilité
next-pwa	Configuration PWA simplifiée avec Service Worker automatique
Capacitor	Wrapper natif pour publication sur App Store et Google Play

3.2 Backend
Service	Utilisation
Supabase Auth	Authentification utilisateurs (email, OAuth)
Supabase PostgreSQL	Stockage historique, favoris, cache traductions
Supabase Edge Functions	Proxy sécurisé vers les APIs Google (clés API protégées)
Supabase Storage	Stockage temporaire des images pour OCR

3.3 APIs Google Cloud
API	Fonction
Speech-to-Text	Transcription vocale (reconnaissance vocale)
Cloud Translation	Traduction de texte entre les langues supportées
Text-to-Speech	Synthèse vocale pour lecture des traductions
Cloud Vision	OCR pour extraction de texte depuis images/documents
 
4. Architecture système
4.1 Diagramme d'architecture
┌─────────────────────────────────────────────────────┐
│                    Frontend                         │
│  Next.js 14+ (App Router) + TypeScript + Tailwind   │
│  PWA + Capacitor (iOS/Android)                      │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                 Backend (Supabase)                  │
│  Auth │ PostgreSQL │ Edge Functions │ Storage       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│               Google Cloud APIs                     │
│  Speech-to-Text │ Translation │ TTS │ Vision        │
└─────────────────────────────────────────────────────┘

4.2 Flux de traduction vocale
1.	L'utilisateur appuie sur le bouton micro et parle
2.	L'audio est capturé et encodé côté client
3.	L'audio est envoyé à Supabase Edge Function
4.	Google Speech-to-Text transcrit l'audio en texte
5.	Google Translation traduit le texte
6.	Google Text-to-Speech génère l'audio de la traduction
7.	Le résultat est affiché et lu à l'utilisateur
4.3 Latence estimée
Étape	Durée estimée
Capture audio + encodage	~200 ms
Transfert réseau	~300 ms
Speech-to-Text	500-800 ms
Traduction	200-400 ms
Text-to-Speech	300-500 ms
TOTAL	1.5 à 2.5 secondes
 
5. Base de données
5.1 Table : translations
Stocke l'historique des traductions effectuées par les utilisateurs.
Colonne	Type	Description
id	UUID	Clé primaire
user_id	UUID	Référence utilisateur
source_lang	VARCHAR(5)	Langue source (en, it, es, ru)
target_lang	VARCHAR(5)	Langue cible
source_text	TEXT	Texte original
translated_text	TEXT	Texte traduit
is_favorite	BOOLEAN	Marqué comme favori
created_at	TIMESTAMPTZ	Date de création

5.2 Table : emergency_phrases
Contient les phrases d'urgence prédéfinies avec leurs traductions.
Colonne	Type	Description
id	UUID	Clé primaire
category	VARCHAR(50)	Catégorie (pain, allergies, medication)
translations	JSONB	Traductions : {en: "...", it: "...", ...}
icon	VARCHAR(50)	Icône associée
display_order	INT	Ordre d'affichage
 
6. Langues supportées
6.1 Version 1.0
Drapeau	Langue	Code Google	Code
🇬🇧	English	en-US	en
🇮🇹	Italiano	it-IT	it
🇪🇸	Español	es-ES	es
🇷🇺	Русский	ru-RU	ru

6.2 Langues prévues en v2.0
Les langues suivantes seront ajoutées selon les retours utilisateurs : Français, Allemand, Portugais, Arabe, Chinois (Mandarin), Japonais, Hindi, Turc, Polonais, Ukrainien.
 
7. Flux utilisateur
7.1 Traduction vocale simple
8.	L'utilisateur sélectionne la langue source et la langue cible
9.	L'utilisateur appuie sur le bouton microphone
10.	L'application affiche un indicateur d'enregistrement
11.	L'utilisateur parle puis relâche le bouton
12.	L'application affiche la transcription puis la traduction
13.	L'audio de la traduction est joué automatiquement
7.2 Mode conversation
14.	L'utilisateur A configure sa langue préférée
15.	L'utilisateur B configure sa langue préférée
16.	Chaque utilisateur parle à tour de rôle
17.	L'application détecte automatiquement qui parle
18.	La traduction est affichée et lue dans la langue de l'autre utilisateur
7.3 Phrases d'urgence
19.	L'utilisateur accède à l'écran des phrases d'urgence
20.	L'utilisateur sélectionne une catégorie (douleur, allergies, etc.)
21.	L'utilisateur tape sur une phrase
22.	La phrase est immédiatement traduite et lue à voix haute
 
8. Roadmap
8.1 Version 1.0 — MVP
Durée estimée : 2-3 semaines
•	Traduction vocale temps réel (4 langues)
•	Phrases d'urgence prédéfinies
•	Mode conversation basique
•	OCR pour documents
•	Publication PWA + stores (Capacitor)
8.2 Version 1.5 — Améliorations
•	Mode haute visibilité
•	Historique des traductions avec favoris
•	Nouvelles langues selon demande utilisateurs
•	Optimisations de performance
8.3 Version 2.0 — Mode hors ligne
•	Téléchargement des modèles de langue
•	Traduction hors ligne (Whisper + NLLB)
•	Synchronisation automatique
•	Cache intelligent des traductions fréquentes

— Fin du document —
