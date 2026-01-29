'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BottomNavigation, SettingsMenu } from '@/components/features';
import { Camera, Upload, Volume2, Copy, RefreshCw, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { useLanguages } from '@/lib/store';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/constants';
import type { LanguageCode, OCRResult } from '@/types';

// Lazy load validation functions (sync, small)
const isValidImageFile = (file: File) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  return validTypes.includes(file.type);
};

const isValidFileSize = (file: File, maxSizeMB = 10) => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

type ScanState = 'idle' | 'uploading' | 'extracting' | 'translating' | 'speaking' | 'done' | 'error';

interface ScanResult {
  originalText: string;
  translatedText: string;
  detectedLanguage?: LanguageCode;
  confidence: number;
  imagePreview: string;
  fileName: string;
}

export default function ScanPage() {
  const { sourceLang, targetLang, setSourceLang, setTargetLang } = useLanguages();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioContent, setAudioContent] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setScanState('idle');
    setScanResult(null);
    setErrorMessage(null);
    setCopied(false);
    setAudioContent(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset l'input pour permettre de re-sélectionner le même fichier
    event.target.value = '';

    // Validation du fichier
    if (!isValidImageFile(file)) {
      setErrorMessage('Format non supporté. Utilisez JPG, PNG, GIF ou WebP.');
      setScanState('error');
      return;
    }

    if (!isValidFileSize(file)) {
      setErrorMessage('Fichier trop volumineux. Maximum 10 MB.');
      setScanState('error');
      return;
    }

    try {
      setScanState('uploading');
      setErrorMessage(null);

      // Créer l'aperçu de l'image
      const imagePreview = URL.createObjectURL(file);

      // Lazy load OCR service
      setScanState('extracting');
      const { compressImage, extractTextFromImage } = await import('@/services/ocr');
      const base64Content = await compressImage(file);

      // Appeler l'API OCR
      const ocrResponse = await extractTextFromImage({
        imageContent: base64Content,
        languageHints: [sourceLang, targetLang],
      });

      if (!ocrResponse.success) {
        throw new Error(ocrResponse.error?.message || 'Erreur OCR');
      }

      const ocrResult = ocrResponse.data as OCRResult;

      // Vérifier si du texte a été détecté
      if (!ocrResult.text || ocrResult.text.trim() === '') {
        setErrorMessage('Aucun texte détecté dans l\'image. Essayez avec une image plus nette.');
        setScanState('error');
        return;
      }

      // Déterminer la langue source
      const detectedLang = ocrResult.detectedLanguage || sourceLang;

      // Lazy load translation service
      setScanState('translating');
      const { translateText } = await import('@/services/translation');
      const translationResponse = await translateText({
        text: ocrResult.text,
        sourceLang: detectedLang,
        targetLang: targetLang,
      });

      if (!translationResponse.success) {
        throw new Error(translationResponse.error?.message || 'Erreur de traduction');
      }

      // Lazy load TTS service
      setScanState('speaking');
      const { textToSpeech } = await import('@/services/textToSpeech');
      const ttsResponse = await textToSpeech({
        text: translationResponse.data!.translatedText,
        languageCode: targetLang,
      });

      if (ttsResponse.success && ttsResponse.data) {
        setAudioContent(ttsResponse.data.audioContent);
      }

      // Stocker le résultat
      setScanResult({
        originalText: ocrResult.text,
        translatedText: translationResponse.data!.translatedText,
        detectedLanguage: detectedLang,
        confidence: ocrResult.confidence,
        imagePreview,
        fileName: file.name,
      });

      setScanState('done');
    } catch (error) {
      console.error('Scan error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue');
      setScanState('error');
    }
  };

  const handlePlayAudio = async () => {
    if (!audioContent || isPlaying) return;

    try {
      setIsPlaying(true);
      const { playAudioFromBase64 } = await import('@/services/textToSpeech');
      await playAudioFromBase64(audioContent);
    } catch (error) {
      console.error('Audio playback error:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleCopyText = async () => {
    if (!scanResult) return;

    try {
      await navigator.clipboard.writeText(scanResult.translatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const getStateMessage = (): string => {
    switch (scanState) {
      case 'uploading':
        return 'Chargement de l\'image...';
      case 'extracting':
        return 'Extraction du texte...';
      case 'translating':
        return 'Traduction en cours...';
      case 'speaking':
        return 'Génération audio...';
      default:
        return '';
    }
  };

  const sourceLanguage = scanResult?.detectedLanguage
    ? getLanguageByCode(scanResult.detectedLanguage)
    : getLanguageByCode(sourceLang);
  const targetLanguage = getLanguageByCode(targetLang);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-gradient safe-area-pt">
        <div className="flex items-center justify-between max-w-lg mx-auto relative z-10">
          <div className="flex items-center gap-4">
            {/* Logo */}
            <img
              src="/icons/logo.png"
              alt="Speech To Talk"
              className="w-14 h-14 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
            />
            <div>
              <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                Scanner
              </h1>
              <p className="text-white/80 text-sm font-medium">Traduire documents et images</p>
            </div>
          </div>
          <SettingsMenu />
        </div>
      </div>

      {/* Content */}
      <div className="content-area min-h-[calc(100vh-180px)]">
        <div className="max-w-lg mx-auto">
        {/* Language selectors */}
        <div className="flex items-center justify-between mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-xl p-3 shadow-soft border border-white/50 dark:border-slate-700/50">
          <div className="flex-1">
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Langue source</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-800">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="px-4 text-slate-400 dark:text-slate-500">→</div>
          <div className="flex-1">
            <label className="text-xs text-slate-500 dark:text-slate-400 block mb-1">Langue cible</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
              className="w-full bg-transparent font-medium text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="dark:bg-slate-800">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload area - visible only in idle or error state */}
        {(scanState === 'idle' || scanState === 'error') && (
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center mb-6 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
            <div className="w-16 h-16 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary dark:text-primary-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-2">
              Prenez une photo ou importez
            </p>
            <p className="text-slate-400 dark:text-slate-500 text-sm mb-4">
              Ordonnances, notices, documents médicaux
            </p>
            <div className="flex gap-3 justify-center">
              <label className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium cursor-pointer hover:bg-primary-600 transition-colors flex items-center gap-2">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Camera className="w-4 h-4" />
                Caméra
              </label>
              <label className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="w-4 h-4" />
                Galerie
              </label>
            </div>

            {/* Error message */}
            {scanState === 'error' && errorMessage && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Processing state */}
        {['uploading', 'extracting', 'translating', 'speaking'].includes(scanState) && (
          <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 shadow-soft text-center border border-white/50 dark:border-slate-700/50">
            <div className="w-12 h-12 border-4 border-primary dark:border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-300 font-medium">{getStateMessage()}</p>
            <div className="mt-4 flex justify-center gap-2">
              {['uploading', 'extracting', 'translating', 'speaking'].map((step, index) => {
                const currentIndex = ['uploading', 'extracting', 'translating', 'speaking'].indexOf(scanState);
                const stepIndex = index;
                return (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      stepIndex <= currentIndex ? 'bg-primary dark:bg-primary-400' : 'bg-slate-200 dark:bg-slate-600'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Scanned result */}
        {scanState === 'done' && scanResult && (
          <div className="space-y-4">
            {/* Image preview */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-soft overflow-hidden border border-white/50 dark:border-slate-700/50">
              <div className="relative bg-slate-100 dark:bg-slate-900 h-40 flex items-center justify-center">
                <img
                  src={scanResult.imagePreview}
                  alt="Document scanné"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={resetState}
                  className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-full shadow-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
              </div>
              <div className="p-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 truncate">{scanResult.fileName}</span>
                  {scanResult.confidence > 0 && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                      {Math.round(scanResult.confidence * 100)}% confiance
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Extracted text */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-soft p-4 border border-white/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Texte extrait</span>
                  {sourceLanguage && (
                    <span className="text-lg">{sourceLanguage.flag}</span>
                  )}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{scanResult.originalText}</p>
              </div>
            </div>

            {/* Translated text */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl rounded-2xl shadow-soft p-4 border border-white/50 dark:border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary dark:text-primary-400 uppercase">Traduction</span>
                  {targetLanguage && (
                    <span className="text-lg">{targetLanguage.flag}</span>
                  )}
                </div>
              </div>
              <div className="bg-primary/5 dark:bg-primary/10 rounded-xl p-3 border border-primary/20 dark:border-primary/30">
                <p className="text-sm text-primary dark:text-primary-400 font-medium whitespace-pre-wrap">
                  {scanResult.translatedText}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handlePlayAudio}
                  disabled={!audioContent || isPlaying}
                  className="flex-1 bg-accent/10 dark:bg-accent/20 text-accent dark:text-accent-400 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm hover:bg-accent/20 dark:hover:bg-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPlaying ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                  {isPlaying ? 'Lecture...' : 'Écouter'}
                </button>
                <button
                  onClick={handleCopyText}
                  className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                  {copied ? 'Copié !' : 'Copier'}
                </button>
              </div>
            </div>

            {/* New scan button */}
            <button
              onClick={resetState}
              className="w-full bg-primary text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-primary-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Nouveau scan
            </button>
          </div>
        )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
