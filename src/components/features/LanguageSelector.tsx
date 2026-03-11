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

  // Close dropdowns on outside click
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
        className={cn(
          'absolute top-full left-0 right-0 mt-1 z-50 overflow-hidden',
          'rounded-xl',
          'bg-white dark:bg-slate-800',
          'border border-slate-200 dark:border-slate-700',
          'shadow-strong dark:shadow-none',
          'animate-fade-in'
        )}
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
              'w-full px-4 py-3 flex items-center gap-3 transition-colors duration-150 text-left',
              'focus:outline-none',
              focusedIndex === index && 'bg-slate-50 dark:bg-slate-700/50',
              lang.code === selectedCode && 'bg-primary-50 dark:bg-primary/10'
            )}
          >
            <span className="text-lg" aria-hidden="true">{lang.flag}</span>
            <span className={cn(
              'font-medium text-sm',
              lang.code === selectedCode ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-200'
            )}>
              {lang.nativeName}
            </span>
            {lang.code === selectedCode && (
              <span className="ml-auto text-primary-600 dark:text-primary-400 text-sm" aria-hidden="true">✓</span>
            )}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Sélection des langues">
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
            'w-full rounded-xl px-4 py-3 text-left transition-all duration-200',
            'bg-white dark:bg-slate-800',
            'border border-slate-200 dark:border-slate-700',
            'hover:border-slate-300 dark:hover:border-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
            'dark:focus:ring-offset-dark',
            isSourceOpen && 'ring-2 ring-primary-400'
          )}
        >
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">De</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{sourceLanguage?.flag}</span>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                {sourceLanguage?.nativeName}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
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
          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
          'bg-primary-600 text-white',
          'hover:bg-primary-700',
          'shadow-sm hover:shadow-md',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
          'dark:focus:ring-offset-dark',
          'active:scale-95'
        )}
        aria-label="Inverser les langues"
      >
        <ArrowLeftRight className="w-4 h-4" aria-hidden="true" />
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
            'w-full rounded-xl px-4 py-3 text-left transition-all duration-200',
            'bg-white dark:bg-slate-800',
            'border border-slate-200 dark:border-slate-700',
            'hover:border-slate-300 dark:hover:border-slate-600',
            'focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2',
            'dark:focus:ring-offset-dark',
            isTargetOpen && 'ring-2 ring-primary-400'
          )}
        >
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mb-0.5">Vers</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{targetLanguage?.flag}</span>
              <span className="font-semibold text-sm text-slate-900 dark:text-white">
                {targetLanguage?.nativeName}
              </span>
            </div>
            <ChevronDown
              className={cn(
                'w-4 h-4 text-slate-400 transition-transform duration-200',
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
