'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { BottomNavigation, SettingsMenu } from '@/components/features';
import { useToast } from '@/components/ui';
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
  const toast = useToast();

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

    event.target.value = '';

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

      const imagePreview = URL.createObjectURL(file);

      setScanState('extracting');
      const { compressImage, extractTextFromImage } = await import('@/services/ocr');
      const base64Content = await compressImage(file);

      const ocrResponse = await extractTextFromImage({
        imageContent: base64Content,
        languageHints: [sourceLang, targetLang],
      });

      if (!ocrResponse.success) {
        throw new Error(ocrResponse.error?.message || 'Erreur OCR');
      }

      const ocrResult = ocrResponse.data as OCRResult;

      if (!ocrResult.text || ocrResult.text.trim() === '') {
        setErrorMessage('Aucun texte détecté dans l\'image. Essayez avec une image plus nette.');
        setScanState('error');
        return;
      }

      const detectedLang = ocrResult.detectedLanguage || sourceLang;

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

      setScanState('speaking');
      const { textToSpeech } = await import('@/services/textToSpeech');
      const ttsResponse = await textToSpeech({
        text: translationResponse.data!.translatedText,
        languageCode: targetLang,
      });

      if (ttsResponse.success && ttsResponse.data) {
        setAudioContent(ttsResponse.data.audioContent);
      }

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
      const msg = error instanceof Error ? error.message : 'Une erreur est survenue';
      setErrorMessage(msg);
      setScanState('error');
      toast.error(msg);
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
      toast.error('Erreur de lecture audio');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleCopyText = async () => {
    if (!scanResult) return;

    try {
      await navigator.clipboard.writeText(scanResult.translatedText);
      setCopied(true);
      toast.success('Texte copié');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Impossible de copier le texte');
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
        <div className="header-gradient-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/icons/logo.png"
                alt="Speech To Talk"
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="text-lg font-bold text-white">
                  Scanner
                </h1>
                <p className="text-white/70 text-xs">Traduire documents et images</p>
              </div>
            </div>
            <SettingsMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        <div className="content-area-inner">
          {/* Language selectors */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-1">Source</label>
              <select
                value={sourceLang}
                onChange={(e) => setSourceLang(e.target.value as LanguageCode)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-medium text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-slate-800">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="pt-4 text-slate-400 dark:text-slate-500 text-lg">→</div>
            <div className="flex-1">
              <label className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider block mb-1">Cible</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as LanguageCode)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 font-medium text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code} className="dark:bg-slate-800">
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Upload area */}
          {(scanState === 'idle' || scanState === 'error') && (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center mb-5 bg-white dark:bg-slate-800">
              <div className="w-14 h-14 bg-primary-50 dark:bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Camera className="w-7 h-7 text-primary-600 dark:text-primary-400" />
              </div>
              <p className="text-slate-900 dark:text-white font-semibold mb-1">
                Prenez une photo ou importez
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">
                Panneaux, documents, notices
              </p>
              <div className="flex gap-3 justify-center">
                <label className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium cursor-pointer transition-colors flex items-center gap-2">
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
                <label className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-medium cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-2">
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
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}
            </div>
          )}

          {/* Processing state */}
          {['uploading', 'extracting', 'translating', 'speaking'].includes(scanState) && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-700">
              <div className="w-12 h-12 border-4 border-primary-600 dark:border-primary-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-700 dark:text-slate-200 font-medium">{getStateMessage()}</p>
              <div className="mt-4 flex justify-center gap-2">
                {['uploading', 'extracting', 'translating', 'speaking'].map((step, index) => {
                  const currentIndex = ['uploading', 'extracting', 'translating', 'speaking'].indexOf(scanState);
                  return (
                    <div
                      key={step}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index <= currentIndex ? 'bg-primary-600 dark:bg-primary-400' : 'bg-slate-200 dark:bg-slate-600'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Scanned result */}
          {scanState === 'done' && scanResult && (
            <div className="space-y-3">
              {/* Image preview */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <div className="relative bg-slate-100 dark:bg-slate-900 h-40 flex items-center justify-center">
                  <img
                    src={scanResult.imagePreview}
                    alt="Document scanné"
                    className="max-h-full max-w-full object-contain"
                  />
                  <button
                    onClick={resetState}
                    className="absolute top-2 right-2 p-2 bg-white/90 dark:bg-slate-800/90 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                  </button>
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 dark:text-slate-400 truncate">{scanResult.fileName}</span>
                    {scanResult.confidence > 0 && (
                      <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800/50">
                        {Math.round(scanResult.confidence * 100)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Extracted text */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  {sourceLanguage && <span className="text-lg">{sourceLanguage.flag}</span>}
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Texte extrait</span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{scanResult.originalText}</p>
              </div>

              {/* Translated text */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {targetLanguage && <span className="text-lg">{targetLanguage.flag}</span>}
                    <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">Traduction</span>
                  </div>
                  <p className="text-sm text-slate-900 dark:text-white font-medium whitespace-pre-wrap leading-relaxed">
                    {scanResult.translatedText}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={handlePlayAudio}
                    disabled={!audioContent || isPlaying}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-accent-600 dark:text-accent-400 font-medium text-sm hover:bg-accent-50 dark:hover:bg-accent/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border-r border-slate-100 dark:border-slate-700"
                  >
                    {isPlaying ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                    {isPlaying ? 'Lecture...' : 'Écouter'}
                  </button>
                  <button
                    onClick={handleCopyText}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                    {copied ? 'Copié' : 'Copier'}
                  </button>
                </div>
              </div>

              {/* New scan button */}
              <button
                onClick={resetState}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Nouveau scan
              </button>
            </div>
          )}
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
