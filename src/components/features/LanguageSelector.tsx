'use client';

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { SUPPORTED_LANGUAGES, getLanguageByCode } from '@/lib/constants';
import { useLanguages } from '@/lib/store';
import { cn } from '@/lib/utils';
import { lightHaptic } from '@/lib/haptics';
import type { LanguageCode } from '@/types';
import { ArrowLeftRight, ChevronDown } from 'lucide-react';

// ===========================================
// Language Selector Component (Accessible)
// ===========================================

export function LanguageSelector() {
  const { sourceLang, targetLang, setSourceLang, setTargetLang, swapLanguages } = useLanguages();
  const [isSourceOpen, setIsSourceOpen] = useState(false);
  const [isTargetOpen, setIsTargetOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const sourceButtonRef = useRef<HTMLButtonElement>(null);
  const targetButtonRef = useRef<HTMLButtonElement>(null);
  const sourceListRef = useRef<HTMLDivElement>(null!);
  const targetListRef = useRef<HTMLDivElement>(null!);

  const sourceLanguage = getLanguageByCode(sourceLang);
  const targetLanguage = getLanguageByCode(targetLang);

  // Fermer les dropdowns lors d'un clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        sourceListRef.current &&
        !sourceListRef.current.contains(target) &&
        sourceButtonRef.current &&
        !sourceButtonRef.current.contains(target)
      ) {
        setIsSourceOpen(false);
      }
      if (
        targetListRef.current &&
        !targetListRef.current.contains(target) &&
        targetButtonRef.current &&
        !targetButtonRef.current.contains(target)
      ) {
        setIsTargetOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset focus index when dropdown opens/closes
  useEffect(() => {
    if (isSourceOpen || isTargetOpen) {
      setFocusedIndex(0);
    } else {
      setFocusedIndex(-1);
    }
  }, [isSourceOpen, isTargetOpen]);

  const handleSourceSelect = useCallback((code: LanguageCode) => {
    lightHaptic();
    if (code === targetLang) {
      swapLanguages();
    } else {
      setSourceLang(code);
    }
    setIsSourceOpen(false);
    sourceButtonRef.current?.focus();
  }, [targetLang, swapLanguages, setSourceLang]);

  const handleTargetSelect = useCallback((code: LanguageCode) => {
    lightHaptic();
    if (code === sourceLang) {
      swapLanguages();
    } else {
      setTargetLang(code);
    }
    setIsTargetOpen(false);
    targetButtonRef.current?.focus();
  }, [sourceLang, swapLanguages, setTargetLang]);

  const handleSwap = () => {
    lightHaptic();
    swapLanguages();
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback((
    e: KeyboardEvent<HTMLButtonElement | HTMLDivElement>,
    isSource: boolean
  ) => {
    const isOpen = isSource ? isSourceOpen : isTargetOpen;
    const setOpen = isSource ? setIsSourceOpen : setIsTargetOpen;
    const handleSelect = isSource ? handleSourceSelect : handleTargetSelect;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
        } else if (focusedIndex >= 0) {
          handleSelect(SUPPORTED_LANGUAGES[focusedIndex].code);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setOpen(true);
        } else {
          setFocusedIndex((prev) =>
            prev < SUPPORTED_LANGUAGES.length - 1 ? prev + 1 : 0
          );
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : SUPPORTED_LANGUAGES.length - 1
          );
        }
        break;

      case 'Escape':
        e.preventDefault();
        setOpen(false);
        if (isSource) {
          sourceButtonRef.current?.focus();
        } else {
          targetButtonRef.current?.focus();
        }
        break;

      case 'Tab':
        if (isOpen) {
          setOpen(false);
        }
        break;

      case 'Home':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(0);
        }
        break;

      case 'End':
        if (isOpen) {
          e.preventDefault();
          setFocusedIndex(SUPPORTED_LANGUAGES.length - 1);
        }
        break;

      default:
        // Type-ahead: find language by first letter
        if (isOpen && e.key.length === 1) {
          const index = SUPPORTED_LANGUAGES.findIndex(
            (lang) => lang.nativeName.toLowerCase().startsWith(e.key.toLowerCase())
          );
          if (index >= 0) {
            setFocusedIndex(index);
          }
        }
        break;
    }
  }, [isSourceOpen, isTargetOpen, focusedIndex, handleSourceSelect, handleTargetSelect]);

  // Dropdown component
  const Dropdown = ({
    isOpen,
    languages,
    selectedCode,
    onSelect,
    listRef,
    isSource,
  }: {
    isOpen: boolean;
    languages: typeof SUPPORTED_LANGUAGES;
    selectedCode: LanguageCode;
    onSelect: (code: LanguageCode) => void;
    listRef: React.RefObject<HTMLDivElement>;
    isSource: boolean;
  }) => {
    if (!isOpen) return null;

    return (
      <div
        ref={listRef}
        role="listbox"
        aria-label={isSource ? 'Sélectionner la langue source' : 'Sélectionner la langue cible'}
        aria-activedescendant={focusedIndex >= 0 ? `lang-option-${isSource ? 'source' : 'target'}-${focusedIndex}` : undefined}
        tabIndex={-1}
        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-light rounded-xl shadow-medium z-50 overflow-hidden border border-gray-100 dark:border-gray-700 animate-fade-in"
        onKeyDown={(e) => handleKeyDown(e, isSource)}
      >
        {languages.map((lang, index) => (
          <button
            key={lang.code}
            id={`lang-option-${isSource ? 'source' : 'target'}-${index}`}
            role="option"
            aria-selected={lang.code === selectedCode}
            onClick={() => onSelect(lang.code)}
            onMouseEnter={() => setFocusedIndex(index)}
            className={cn(
              'w-full px-4 py-3 flex items-center gap-3 transition-colors text-left',
              'focus:outline-none focus-visible:outline-none',
              focusedIndex === index && 'bg-primary-50 dark:bg-primary-900/20',
              lang.code === selectedCode && 'bg-primary-50 dark:bg-primary-900/30'
            )}
          >
            <span className="text-xl" aria-hidden="true">{lang.flag}</span>
            <span className={cn(
              'font-medium',
              lang.code === selectedCode ? 'text-primary' : 'text-gray-700 dark:text-gray-200'
            )}>
              {lang.nativeName}
            </span>
            {lang.code === selectedCode && (
              <span className="ml-auto text-primary" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between gap-3" role="group" aria-label="Sélection des langues">
      {/* Source Language */}
      <div className="flex-1 relative">
        <button
          ref={sourceButtonRef}
          onClick={() => {
            lightHaptic();
            setIsSourceOpen(!isSourceOpen);
            setIsTargetOpen(false);
          }}
          onKeyDown={(e) => handleKeyDown(e, true)}
          aria-haspopup="listbox"
          aria-expanded={isSourceOpen}
          aria-label={`Langue source: ${sourceLanguage?.nativeName}`}
          className={cn(
            'w-full bg-white dark:bg-dark-light rounded-xl p-4 shadow-soft text-left transition-all',
            'hover:shadow-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'dark:focus:ring-offset-dark',
            isSourceOpen && 'ring-2 ring-primary'
          )}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">De</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">{sourceLanguage?.flag}</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {sourceLanguage?.nativeName}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform',
                isSourceOpen && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </div>
        </button>

        <Dropdown
          isOpen={isSourceOpen}
          languages={SUPPORTED_LANGUAGES}
          selectedCode={sourceLang}
          onSelect={handleSourceSelect}
          listRef={sourceListRef}
          isSource={true}
        />
      </div>

      {/* Swap Button */}
      <button
        onClick={handleSwap}
        className={cn(
          'w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg',
          'hover:bg-primary-600 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          'dark:focus:ring-offset-dark',
          'active:scale-95'
        )}
        aria-label="Inverser les langues"
      >
        <ArrowLeftRight className="w-5 h-5 text-white" aria-hidden="true" />
      </button>

      {/* Target Language */}
      <div className="flex-1 relative">
        <button
          ref={targetButtonRef}
          onClick={() => {
            lightHaptic();
            setIsTargetOpen(!isTargetOpen);
            setIsSourceOpen(false);
          }}
          onKeyDown={(e) => handleKeyDown(e, false)}
          aria-haspopup="listbox"
          aria-expanded={isTargetOpen}
          aria-label={`Langue cible: ${targetLanguage?.nativeName}`}
          className={cn(
            'w-full bg-white dark:bg-dark-light rounded-xl p-4 shadow-soft text-left transition-all',
            'hover:shadow-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'dark:focus:ring-offset-dark',
            isTargetOpen && 'ring-2 ring-primary'
          )}
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Vers</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl" aria-hidden="true">{targetLanguage?.flag}</span>
              <span className="font-medium text-gray-800 dark:text-white">
                {targetLanguage?.nativeName}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform',
                isTargetOpen && 'rotate-180'
              )}
              aria-hidden="true"
            />
          </div>
        </button>

        <Dropdown
          isOpen={isTargetOpen}
          languages={SUPPORTED_LANGUAGES}
          selectedCode={targetLang}
          onSelect={handleTargetSelect}
          listRef={targetListRef}
          isSource={false}
        />
      </div>
    </div>
  );
}
