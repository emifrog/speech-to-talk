'use client';

import { useState, useRef } from 'react';
import { BottomNavigation, UserMenu } from '@/components/features';
import { Camera, Upload, Volume2, Copy, RefreshCw, AlertCircle, Check, X, Loader2 } from 'lucide-react';
import { extractTextFromImage, fileToBase64, isValidImageFile, isValidFileSize, compressImage } from '@/services/ocr';
import { translateText } from '@/services/translation';
import { textToSpeech, playAudioFromBase64 } from '@/services/textToSpeech';
import { useLanguages } from '@/lib/store';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/constants';
import type { LanguageCode, OCRResult } from '@/types';

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

      // Compresser et convertir en base64
      setScanState('extracting');
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

      // Traduire le texte extrait
      setScanState('translating');
      const translationResponse = await translateText({
        text: ocrResult.text,
        sourceLang: detectedLang,
        targetLang: targetLang,
      });

      if (!translationResponse.success) {
        throw new Error(translationResponse.error?.message || 'Erreur de traduction');
      }

      // Générer l'audio de la traduction
      setScanState('speaking');
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
      <div className="header-gradient px-6 pt-12 pb-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">📸 Scanner</h1>
            <p className="text-white/80 text-sm">Traduire documents et images</p>
          </div>
          <UserMenu />
        </div>
      </div>

      {/* Content */}
      <div className="content-area px-4 pt-6 pb-6 min-h-[calc(100vh-180px)]">
        {/* Language selectors */}
        <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-3 shadow-soft">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Langue source</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
              className="w-full bg-transparent font-medium text-gray-800 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
          <div className="px-4 text-gray-400">→</div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Langue cible</label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
              className="w-full bg-transparent font-medium text-gray-800 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Upload area - visible only in idle or error state */}
        {(scanState === 'idle' || scanState === 'error') && (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center mb-6 bg-white">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-600 font-medium mb-2">
              Prenez une photo ou importez
            </p>
            <p className="text-gray-400 text-sm mb-4">
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
              <label className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-sm font-medium cursor-pointer hover:bg-gray-300 transition-colors flex items-center gap-2">
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
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{errorMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Processing state */}
        {['uploading', 'extracting', 'translating', 'speaking'].includes(scanState) && (
          <div className="bg-white rounded-2xl p-8 shadow-soft text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">{getStateMessage()}</p>
            <div className="mt-4 flex justify-center gap-2">
              {['uploading', 'extracting', 'translating', 'speaking'].map((step, index) => {
                const currentIndex = ['uploading', 'extracting', 'translating', 'speaking'].indexOf(scanState);
                const stepIndex = index;
                return (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      stepIndex <= currentIndex ? 'bg-primary' : 'bg-gray-200'
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
            <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
              <div className="relative bg-gray-100 h-40 flex items-center justify-center">
                <img
                  src={scanResult.imagePreview}
                  alt="Document scanné"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={resetState}
                  className="absolute top-2 right-2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              <div className="p-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 truncate">{scanResult.fileName}</span>
                  {scanResult.confidence > 0 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {Math.round(scanResult.confidence * 100)}% confiance
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Extracted text */}
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 uppercase">Texte extrait</span>
                  {sourceLanguage && (
                    <span className="text-lg">{sourceLanguage.flag}</span>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{scanResult.originalText}</p>
              </div>
            </div>

            {/* Translated text */}
            <div className="bg-white rounded-2xl shadow-soft p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-primary uppercase">Traduction</span>
                  {targetLanguage && (
                    <span className="text-lg">{targetLanguage.flag}</span>
                  )}
                </div>
              </div>
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/20">
                <p className="text-sm text-primary font-medium whitespace-pre-wrap">
                  {scanResult.translatedText}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handlePlayAudio}
                  disabled={!audioContent || isPlaying}
                  className="flex-1 bg-accent/10 text-accent py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm hover:bg-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm hover:bg-gray-200 transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
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

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
