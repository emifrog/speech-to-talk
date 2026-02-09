import { Language, LanguageCode, EmergencyCategory } from '@/types';

// ===========================================
// Langues supportées
// ===========================================
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    googleCode: 'fr-FR',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    googleCode: 'en-US',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    googleCode: 'de-DE',
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    googleCode: 'it-IT',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    googleCode: 'es-ES',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    googleCode: 'ru-RU',
  },
];

// Helper pour trouver une langue par son code
export const getLanguageByCode = (code: LanguageCode): Language | undefined => {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
};

// ===========================================
// Catégories d'urgence (Sapeurs-Pompiers)
// ===========================================
export const EMERGENCY_CATEGORIES: Array<{
  id: EmergencyCategory;
  label: string;
  icon: string;
  color: string;
}> = [
  { id: 'medical', label: 'Médical', icon: '🩺', color: 'red' },
  { id: 'fire', label: 'Incendie', icon: '🔥', color: 'orange' },
  { id: 'reassurance', label: 'Réconfort', icon: '🤝', color: 'blue' },
  { id: 'evacuation', label: 'Évacuation', icon: '🚨', color: 'yellow' },
  { id: 'general', label: 'Général', icon: '💬', color: 'gray' },
];

// ===========================================
// Phrases d'urgence Sapeurs-Pompiers
// Point de vue du pompier qui interroge/rassure
// ===========================================
export const EMERGENCY_PHRASES = [
  // ---- MÉDICAL ----
  {
    id: 'med-where-hurt',
    category: 'medical' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'Where does it hurt?',
      fr: 'Où avez-vous mal ?',
      de: 'Wo haben Sie Schmerzen?',
      it: 'Dove le fa male?',
      es: '¿Dónde le duele?',
      ru: 'Где у вас болит?',
    },
    displayOrder: 1,
  },
  {
    id: 'med-breathing',
    category: 'medical' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'Do you have trouble breathing?',
      fr: 'Avez-vous des difficultés à respirer ?',
      de: 'Haben Sie Schwierigkeiten beim Atmen?',
      it: 'Ha difficoltà a respirare?',
      es: '¿Tiene dificultad para respirar?',
      ru: 'Вам трудно дышать?',
    },
    displayOrder: 2,
  },
  {
    id: 'med-allergies',
    category: 'medical' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Are you allergic to any medications?',
      fr: 'Êtes-vous allergique à des médicaments ?',
      de: 'Sind Sie gegen Medikamente allergisch?',
      it: 'È allergico a qualche farmaco?',
      es: '¿Es alérgico a algún medicamento?',
      ru: 'У вас есть аллергия на лекарства?',
    },
    displayOrder: 3,
  },
  {
    id: 'med-medications',
    category: 'medical' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Are you taking any medications?',
      fr: 'Prenez-vous des médicaments ?',
      de: 'Nehmen Sie Medikamente ein?',
      it: 'Sta assumendo dei farmaci?',
      es: '¿Está tomando algún medicamento?',
      ru: 'Вы принимаете какие-либо лекарства?',
    },
    displayOrder: 4,
  },
  {
    id: 'med-history',
    category: 'medical' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Do you have any medical history?',
      fr: 'Avez-vous des antécédents médicaux ?',
      de: 'Haben Sie Vorerkrankungen?',
      it: 'Ha precedenti medici?',
      es: '¿Tiene antecedentes médicos?',
      ru: 'У вас есть хронические заболевания?',
    },
    displayOrder: 5,
  },
  {
    id: 'med-pain-duration',
    category: 'medical' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'How long have you been feeling this pain?',
      fr: 'Depuis quand ressentez-vous cette douleur ?',
      de: 'Seit wann haben Sie diese Schmerzen?',
      it: 'Da quanto tempo ha questo dolore?',
      es: '¿Desde cuándo siente este dolor?',
      ru: 'Как давно вы чувствуете эту боль?',
    },
    displayOrder: 6,
  },
  {
    id: 'med-consciousness',
    category: 'medical' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'Did you lose consciousness?',
      fr: 'Avez-vous perdu connaissance ?',
      de: 'Haben Sie das Bewusstsein verloren?',
      it: 'Ha perso conoscenza?',
      es: '¿Ha perdido el conocimiento?',
      ru: 'Вы теряли сознание?',
    },
    displayOrder: 7,
  },
  // ---- INCENDIE ----
  {
    id: 'fire-people-inside',
    category: 'fire' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'Are there other people inside?',
      fr: 'Y a-t-il d\'autres personnes à l\'intérieur ?',
      de: 'Sind noch andere Personen drinnen?',
      it: 'Ci sono altre persone all\'interno?',
      es: '¿Hay otras personas adentro?',
      ru: 'Есть ли другие люди внутри?',
    },
    displayOrder: 1,
  },
  {
    id: 'fire-how-many',
    category: 'fire' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'How many people are inside?',
      fr: 'Combien de personnes sont à l\'intérieur ?',
      de: 'Wie viele Personen sind drinnen?',
      it: 'Quante persone sono all\'interno?',
      es: '¿Cuántas personas están adentro?',
      ru: 'Сколько людей внутри?',
    },
    displayOrder: 2,
  },
  {
    id: 'fire-where',
    category: 'fire' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'Where are they?',
      fr: 'Où se trouvent-elles ?',
      de: 'Wo befinden sie sich?',
      it: 'Dove si trovano?',
      es: '¿Dónde están?',
      ru: 'Где они находятся?',
    },
    displayOrder: 3,
  },
  {
    id: 'fire-hazardous',
    category: 'fire' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Are there any hazardous materials inside?',
      fr: 'Y a-t-il des produits dangereux à l\'intérieur ?',
      de: 'Gibt es Gefahrstoffe im Gebäude?',
      it: 'Ci sono materiali pericolosi all\'interno?',
      es: '¿Hay materiales peligrosos adentro?',
      ru: 'Есть ли опасные вещества внутри?',
    },
    displayOrder: 4,
  },
  {
    id: 'fire-duration',
    category: 'fire' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'How long has the fire been burning?',
      fr: 'Depuis combien de temps l\'incendie a-t-il commencé ?',
      de: 'Seit wann brennt es?',
      it: 'Da quanto tempo brucia l\'incendio?',
      es: '¿Desde cuándo está el incendio?',
      ru: 'Как давно начался пожар?',
    },
    displayOrder: 5,
  },
  // ---- RÉCONFORT ----
  {
    id: 'reassure-here-help',
    category: 'reassurance' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'We are here to help you.',
      fr: 'Nous sommes là pour vous aider.',
      de: 'Wir sind hier, um Ihnen zu helfen.',
      it: 'Siamo qui per aiutarvi.',
      es: 'Estamos aquí para ayudarle.',
      ru: 'Мы здесь, чтобы вам помочь.',
    },
    displayOrder: 1,
  },
  {
    id: 'reassure-stay-calm',
    category: 'reassurance' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'Stay calm, help is here.',
      fr: 'Restez calme, les secours sont là.',
      de: 'Bleiben Sie ruhig, Hilfe ist da.',
      it: 'Stia calmo, i soccorsi sono qui.',
      es: 'Mantenga la calma, la ayuda está aquí.',
      ru: 'Сохраняйте спокойствие, помощь здесь.',
    },
    displayOrder: 2,
  },
  {
    id: 'reassure-fine',
    category: 'reassurance' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'Everything will be fine.',
      fr: 'Tout va bien se passer.',
      de: 'Alles wird gut.',
      it: 'Andrà tutto bene.',
      es: 'Todo va a salir bien.',
      ru: 'Всё будет хорошо.',
    },
    displayOrder: 3,
  },
  {
    id: 'reassure-take-care',
    category: 'reassurance' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'We will take care of you.',
      fr: 'Nous allons prendre soin de vous.',
      de: 'Wir kümmern uns um Sie.',
      it: 'Ci prenderemo cura di lei.',
      es: 'Vamos a cuidar de usted.',
      ru: 'Мы позаботимся о вас.',
    },
    displayOrder: 4,
  },
  {
    id: 'reassure-on-way',
    category: 'reassurance' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'Help is on the way.',
      fr: 'Les secours sont en route.',
      de: 'Hilfe ist unterwegs.',
      it: 'I soccorsi stanno arrivando.',
      es: 'La ayuda está en camino.',
      ru: 'Помощь уже в пути.',
    },
    displayOrder: 5,
  },
  // ---- ÉVACUATION ----
  {
    id: 'evac-building',
    category: 'evacuation' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'We need to evacuate the building.',
      fr: 'Nous devons évacuer le bâtiment.',
      de: 'Wir müssen das Gebäude evakuieren.',
      it: 'Dobbiamo evacuare l\'edificio.',
      es: 'Debemos evacuar el edificio.',
      ru: 'Нам нужно эвакуировать здание.',
    },
    displayOrder: 1,
  },
  {
    id: 'evac-follow',
    category: 'evacuation' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Please follow me.',
      fr: 'Suivez-moi, s\'il vous plaît.',
      de: 'Bitte folgen Sie mir.',
      it: 'Per favore, mi segua.',
      es: 'Por favor, sígame.',
      ru: 'Пожалуйста, следуйте за мной.',
    },
    displayOrder: 2,
  },
  {
    id: 'evac-no-elevator',
    category: 'evacuation' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Do not use the elevator.',
      fr: 'Ne prenez pas l\'ascenseur.',
      de: 'Benutzen Sie nicht den Aufzug.',
      it: 'Non prendete l\'ascensore.',
      es: 'No use el ascensor.',
      ru: 'Не пользуйтесь лифтом.',
    },
    displayOrder: 3,
  },
  {
    id: 'evac-stairs',
    category: 'evacuation' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Use the stairs.',
      fr: 'Utilisez les escaliers.',
      de: 'Benutzen Sie die Treppe.',
      it: 'Usate le scale.',
      es: 'Use las escaleras.',
      ru: 'Используйте лестницу.',
    },
    displayOrder: 4,
  },
  {
    id: 'evac-stay-low',
    category: 'evacuation' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'Stay low to avoid the smoke.',
      fr: 'Restez baissé pour éviter la fumée.',
      de: 'Bleiben Sie niedrig, um den Rauch zu vermeiden.',
      it: 'Restate bassi per evitare il fumo.',
      es: 'Agáchese para evitar el humo.',
      ru: 'Пригнитесь, чтобы избежать дыма.',
    },
    displayOrder: 5,
  },
  // ---- GÉNÉRAL ----
  {
    id: 'gen-name',
    category: 'general' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'What is your name?',
      fr: 'Comment vous appelez-vous ?',
      de: 'Wie heißen Sie?',
      it: 'Come si chiama?',
      es: '¿Cómo se llama?',
      ru: 'Как вас зовут?',
    },
    displayOrder: 1,
  },
  {
    id: 'gen-understand',
    category: 'general' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Do you understand what I\'m saying?',
      fr: 'Comprenez-vous ce que je dis ?',
      de: 'Verstehen Sie, was ich sage?',
      it: 'Capisce quello che dico?',
      es: '¿Entiende lo que digo?',
      ru: 'Вы понимаете, что я говорю?',
    },
    displayOrder: 2,
  },
  {
    id: 'gen-speak-slowly',
    category: 'general' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'Can you speak more slowly?',
      fr: 'Pouvez-vous parler plus lentement ?',
      de: 'Können Sie langsamer sprechen?',
      it: 'Può parlare più lentamente?',
      es: '¿Puede hablar más despacio?',
      ru: 'Вы можете говорить медленнее?',
    },
    displayOrder: 3,
  },
  {
    id: 'gen-interpreter',
    category: 'general' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'Do you need an interpreter?',
      fr: 'Avez-vous besoin d\'un interprète ?',
      de: 'Brauchen Sie einen Dolmetscher?',
      it: 'Ha bisogno di un interprete?',
      es: '¿Necesita un intérprete?',
      ru: 'Вам нужен переводчик?',
    },
    displayOrder: 4,
  },
  {
    id: 'gen-phone',
    category: 'general' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'Do you have a phone?',
      fr: 'Avez-vous un téléphone ?',
      de: 'Haben Sie ein Telefon?',
      it: 'Ha un telefono?',
      es: '¿Tiene un teléfono?',
      ru: 'У вас есть телефон?',
    },
    displayOrder: 5,
  },
  {
    id: 'gen-call-french',
    category: 'general' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'Can you call someone who speaks French?',
      fr: 'Pouvez-vous appeler quelqu\'un qui parle français ?',
      de: 'Können Sie jemanden anrufen, der Französisch spricht?',
      it: 'Può chiamare qualcuno che parla francese?',
      es: '¿Puede llamar a alguien que hable francés?',
      ru: 'Вы можете позвонить кому-то, кто говорит по-французски?',
    },
    displayOrder: 6,
  },
];

// ===========================================
// Configuration Audio
// ===========================================
export const AUDIO_CONFIG = {
  sampleRate: 16000,
  channelCount: 1,
  mimeType: 'audio/webm;codecs=opus',
  maxDuration: 30000, // 30 secondes max
  silenceThreshold: 0.01,
  silenceDuration: 1500, // 1.5 secondes de silence pour arrêter
};

// ===========================================
// Configuration App
// ===========================================
export const APP_CONFIG = {
  name: 'Speech To Talk',
  version: '1.0.0',
  defaultSourceLang: 'fr' as LanguageCode,
  defaultTargetLang: 'en' as LanguageCode,
};
