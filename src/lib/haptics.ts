// ===========================================
// Haptic Feedback Utilities
// ===========================================

/**
 * Vérifie si l'API Vibration est disponible
 */
export function isHapticsSupported(): boolean {
  return typeof window !== 'undefined' && 'vibrate' in navigator;
}

/**
 * Vibration légère - pour les interactions UI standard
 * Ex: bouton pressé, toggle, sélection
 */
export function lightHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(10);
  }
}

/**
 * Vibration moyenne - pour les confirmations et succès
 * Ex: action complétée, copie réussie
 */
export function mediumHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(25);
  }
}

/**
 * Vibration forte - pour les erreurs et alertes
 * Ex: erreur, avertissement, action critique
 */
export function heavyHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(50);
  }
}

/**
 * Double vibration - pour les succès importants
 * Ex: traduction terminée, message envoyé
 */
export function successHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate([20, 50, 20]);
  }
}

/**
 * Triple vibration - pour les erreurs critiques
 * Ex: échec de connexion, erreur réseau
 */
export function errorHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate([50, 30, 50, 30, 50]);
  }
}

/**
 * Vibration de début d'enregistrement
 */
export function startRecordingHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(30);
  }
}

/**
 * Vibration de fin d'enregistrement
 */
export function stopRecordingHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate([15, 30, 15]);
  }
}

/**
 * Vibration pour les boutons d'urgence
 */
export function emergencyHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate([100, 50, 100]);
  }
}

/**
 * Vibration personnalisée
 * @param pattern - Tableau de durées [vibration, pause, vibration, ...]
 */
export function customHaptic(pattern: number | number[]): void {
  if (isHapticsSupported()) {
    navigator.vibrate(pattern);
  }
}

/**
 * Arrête toute vibration en cours
 */
export function cancelHaptic(): void {
  if (isHapticsSupported()) {
    navigator.vibrate(0);
  }
}
