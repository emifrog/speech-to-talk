import { Language, LanguageCode, EmergencyCategory } from '@/types';

// ===========================================
// Langues supportées
// ===========================================
export const SUPPORTED_LANGUAGES: Language[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    googleCode: 'en-US',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    googleCode: 'fr-FR',
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
// Catégories d'urgence
// ===========================================
export const EMERGENCY_CATEGORIES: Array<{
  id: EmergencyCategory;
  label: string;
  icon: string;
  color: string;
}> = [
  { id: 'pain', label: 'Douleur', icon: '🩺', color: 'red' },
  { id: 'breathing', label: 'Respiration', icon: '🫁', color: 'red' },
  { id: 'allergies', label: 'Allergies', icon: '⚠️', color: 'orange' },
  { id: 'medication', label: 'Médicaments', icon: '💊', color: 'blue' },
  { id: 'general', label: 'Général', icon: '🏥', color: 'gray' },
];

// ===========================================
// Phrases d'urgence prédéfinies
// ===========================================
export const EMERGENCY_PHRASES = [
  // Douleur - Critique
  {
    id: 'pain-chest',
    category: 'pain' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'I have chest pain',
      fr: 'J\'ai une douleur thoracique',
      de: 'Ich habe Brustschmerzen',
      it: 'Ho dolore al petto',
      es: 'Tengo dolor en el pecho',
      ru: 'У меня боль в груди',
    },
    displayOrder: 1,
  },
  {
    id: 'pain-head-severe',
    category: 'pain' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'I have a severe headache',
      fr: 'J\'ai un mal de tête sévère',
      de: 'Ich habe starke Kopfschmerzen',
      it: 'Ho un forte mal di testa',
      es: 'Tengo un dolor de cabeza severo',
      ru: 'У меня сильная головная боль',
    },
    displayOrder: 2,
  },
  {
    id: 'pain-abdomen',
    category: 'pain' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I have abdominal pain',
      fr: 'J\'ai des douleurs abdominales',
      de: 'Ich habe Bauchschmerzen',
      it: 'Ho dolore addominale',
      es: 'Tengo dolor abdominal',
      ru: 'У меня боль в животе',
    },
    displayOrder: 3,
  },
  {
    id: 'pain-dizzy',
    category: 'pain' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I feel dizzy',
      fr: 'J\'ai des vertiges',
      de: 'Mir ist schwindelig',
      it: 'Ho le vertigini',
      es: 'Me siento mareado',
      ru: 'У меня кружится голова',
    },
    displayOrder: 4,
  },
  // Respiration - Critique
  {
    id: 'breathing-cant',
    category: 'breathing' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: "I can't breathe",
      fr: 'Je ne peux pas respirer',
      de: 'Ich kann nicht atmen',
      it: 'Non riesco a respirare',
      es: 'No puedo respirar',
      ru: 'Я не могу дышать',
    },
    displayOrder: 1,
  },
  {
    id: 'breathing-difficult',
    category: 'breathing' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'I have difficulty breathing',
      fr: 'J\'ai des difficultés à respirer',
      de: 'Ich habe Schwierigkeiten beim Atmen',
      it: 'Ho difficoltà a respirare',
      es: 'Tengo dificultad para respirar',
      ru: 'Мне трудно дышать',
    },
    displayOrder: 2,
  },
  {
    id: 'breathing-asthma',
    category: 'breathing' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I have asthma',
      fr: 'J\'ai de l\'asthme',
      de: 'Ich habe Asthma',
      it: 'Ho l\'asma',
      es: 'Tengo asma',
      ru: 'У меня астма',
    },
    displayOrder: 3,
  },
  // Allergies
  {
    id: 'allergy-severe',
    category: 'allergies' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'I am having an allergic reaction',
      fr: 'Je fais une réaction allergique',
      de: 'Ich habe eine allergische Reaktion',
      it: 'Sto avendo una reazione allergica',
      es: 'Estoy teniendo una reacción alérgica',
      ru: 'У меня аллергическая реакция',
    },
    displayOrder: 1,
  },
  {
    id: 'allergy-food',
    category: 'allergies' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I am allergic to',
      fr: 'Je suis allergique à',
      de: 'Ich bin allergisch gegen',
      it: 'Sono allergico a',
      es: 'Soy alérgico a',
      ru: 'У меня аллергия на',
    },
    displayOrder: 2,
  },
  {
    id: 'allergy-medication',
    category: 'allergies' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I am allergic to this medication',
      fr: 'Je suis allergique à ce médicament',
      de: 'Ich bin allergisch gegen dieses Medikament',
      it: 'Sono allergico a questo farmaco',
      es: 'Soy alérgico a este medicamento',
      ru: 'У меня аллергия на это лекарство',
    },
    displayOrder: 3,
  },
  // Médicaments
  {
    id: 'medication-need',
    category: 'medication' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I need my medication',
      fr: 'J\'ai besoin de mes médicaments',
      de: 'Ich brauche meine Medikamente',
      it: 'Ho bisogno dei miei farmaci',
      es: 'Necesito mi medicación',
      ru: 'Мне нужны мои лекарства',
    },
    displayOrder: 1,
  },
  {
    id: 'medication-diabetes',
    category: 'medication' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I am diabetic',
      fr: 'Je suis diabétique',
      de: 'Ich bin Diabetiker',
      it: 'Sono diabetico',
      es: 'Soy diabético',
      ru: 'У меня диабет',
    },
    displayOrder: 2,
  },
  {
    id: 'medication-insulin',
    category: 'medication' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'I need insulin',
      fr: 'J\'ai besoin d\'insuline',
      de: 'Ich brauche Insulin',
      it: 'Ho bisogno di insulina',
      es: 'Necesito insulina',
      ru: 'Мне нужен инсулин',
    },
    displayOrder: 3,
  },
  // Général
  {
    id: 'general-help',
    category: 'general' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'I need help',
      fr: 'J\'ai besoin d\'aide',
      de: 'Ich brauche Hilfe',
      it: 'Ho bisogno di aiuto',
      es: 'Necesito ayuda',
      ru: 'Мне нужна помощь',
    },
    displayOrder: 1,
  },
  {
    id: 'general-doctor',
    category: 'general' as EmergencyCategory,
    severity: 'medium' as const,
    translations: {
      en: 'I need to see a doctor',
      fr: 'J\'ai besoin de voir un médecin',
      de: 'Ich muss einen Arzt sehen',
      it: 'Ho bisogno di vedere un medico',
      es: 'Necesito ver a un médico',
      ru: 'Мне нужно к врачу',
    },
    displayOrder: 2,
  },
  {
    id: 'general-hospital',
    category: 'general' as EmergencyCategory,
    severity: 'high' as const,
    translations: {
      en: 'Take me to the hospital',
      fr: 'Emmenez-moi à l\'hôpital',
      de: 'Bringen Sie mich ins Krankenhaus',
      it: 'Portatemi in ospedale',
      es: 'Lléveme al hospital',
      ru: 'Отвезите меня в больницу',
    },
    displayOrder: 3,
  },
  {
    id: 'general-ambulance',
    category: 'general' as EmergencyCategory,
    severity: 'critical' as const,
    translations: {
      en: 'Call an ambulance',
      fr: 'Appelez une ambulance',
      de: 'Rufen Sie einen Krankenwagen',
      it: 'Chiamate un\'ambulanza',
      es: 'Llamen a una ambulancia',
      ru: 'Вызовите скорую',
    },
    displayOrder: 4,
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
  defaultSourceLang: 'en' as LanguageCode,
  defaultTargetLang: 'it' as LanguageCode,
};
