'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BottomNavigation, SettingsMenu } from '@/components/features';
import { useRequireAuth } from '@/hooks';
import { Shield, FileText, Scale, ChevronRight, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  useRequireAuth();

  const legalItems = [
    {
      href: '/settings/privacy',
      icon: Shield,
      title: 'Politique de confidentialité',
      description: 'Comment nous protégeons vos données',
    },
    {
      href: '/settings/terms',
      icon: FileText,
      title: 'Conditions générales d\'utilisation',
      description: 'Règles d\'utilisation du service',
    },
    {
      href: '/settings/gdpr',
      icon: Scale,
      title: 'RGPD - Vos droits',
      description: 'Accès, suppression et portabilité de vos données',
    },
  ];

  return (
    <div className="page-container">
      {/* Header */}
      <div className="header-gradient safe-area-pt">
        <div className="header-gradient-content">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image
                src="/icons/logo.png"
                alt="Speech To Talk"
                width={40}
                height={40}
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h1 className="text-lg font-bold text-white">Paramètres</h1>
                <p className="text-sm text-white/70">Configuration de l&apos;application</p>
              </div>
            </div>
            <SettingsMenu />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="content-area">
        <div className="content-area-inner space-y-6">
          {/* Back button */}
          <Link
            href="/translate"
            className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>

          {/* Legal section */}
          <div>
            <h2 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
              Informations légales
            </h2>
            <div className="space-y-3">
              {legalItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary/30 dark:hover:border-primary/30 transition-colors group"
                >
                  <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 dark:text-white">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* App info */}
          <div className="text-center text-xs text-slate-400 dark:text-slate-500 pt-4">
            <p>Speech To Talk v1.0.0</p>
            <p>Application de traduction vocale en temps réel pour les sapeurs-pompiers</p>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
