'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="page-container">
      <div className="header-gradient safe-area-pt">
        <div className="header-gradient-content">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              className="p-2 -ml-2 text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold text-white">Conditions générales d&apos;utilisation</h1>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="content-area-inner prose prose-sm dark:prose-invert max-w-none">
          <p className="text-xs text-slate-500 dark:text-slate-400">Dernière mise à jour : 14 mars 2026</p>

          <h2>1. Objet</h2>
          <p>
            Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;accès et
            l&apos;utilisation de l&apos;application <strong>Speech To Talk</strong>, un outil de
            traduction vocale en temps réel destiné aux sapeurs-pompiers pour faciliter la
            communication avec les victimes allophones lors d&apos;interventions.
          </p>

          <h2>2. Accès au service</h2>
          <ul>
            <li>L&apos;accès à l&apos;application nécessite la création d&apos;un compte avec une adresse e-mail valide.</li>
            <li>L&apos;application est réservée aux agents du SDIS et aux personnes autorisées.</li>
            <li>L&apos;utilisateur s&apos;engage à ne pas partager ses identifiants de connexion.</li>
          </ul>

          <h2>3. Description du service</h2>
          <p>L&apos;application propose les fonctionnalités suivantes :</p>
          <ul>
            <li><strong>Traduction vocale :</strong> enregistrement audio → transcription → traduction → synthèse vocale</li>
            <li><strong>Mode conversation :</strong> échange bilingue en temps réel entre deux interlocuteurs</li>
            <li><strong>Scanner (OCR) :</strong> extraction et traduction de texte depuis des images ou documents</li>
            <li><strong>Phrases d&apos;urgence :</strong> phrases pré-traduites pour les situations d&apos;urgence courantes</li>
          </ul>

          <h2>4. Limites du service</h2>
          <ul>
            <li>Les traductions sont fournies par des services tiers (Google Cloud) et peuvent contenir des imprécisions.</li>
            <li>L&apos;application <strong>ne se substitue pas</strong> à un interprète professionnel pour les situations critiques.</li>
            <li>La qualité des traductions dépend de la clarté de l&apos;enregistrement audio et de la connexion internet.</li>
            <li>L&apos;application nécessite une connexion internet pour fonctionner (mode hors-ligne limité au cache).</li>
          </ul>

          <h2>5. Responsabilités</h2>
          <h3>5.1 Éditeur</h3>
          <p>
            L&apos;éditeur s&apos;engage à assurer la disponibilité du service dans la mesure du possible.
            Il ne saurait être tenu responsable des interruptions de service dues à la maintenance,
            aux pannes des services tiers (Google Cloud, Supabase), ou à des cas de force majeure.
          </p>

          <h3>5.2 Utilisateur</h3>
          <p>L&apos;utilisateur s&apos;engage à :</p>
          <ul>
            <li>Utiliser l&apos;application conformément à sa finalité (aide à la communication en intervention)</li>
            <li>Ne pas tenter de contourner les mesures de sécurité</li>
            <li>Signaler tout dysfonctionnement via la page contact</li>
            <li>Ne pas utiliser l&apos;application à des fins illicites</li>
          </ul>

          <h2>6. Propriété intellectuelle</h2>
          <p>
            L&apos;ensemble des éléments de l&apos;application (code, design, contenus) sont protégés
            par le droit de la propriété intellectuelle. Toute reproduction non autorisée est interdite.
          </p>

          <h2>7. Modification des CGU</h2>
          <p>
            L&apos;éditeur se réserve le droit de modifier les présentes CGU. Les utilisateurs
            seront informés de toute modification significative. La poursuite de l&apos;utilisation
            du service après modification vaut acceptation des nouvelles conditions.
          </p>

          <h2>8. Droit applicable</h2>
          <p>
            Les présentes CGU sont soumises au droit français. Tout litige sera porté devant
            les tribunaux compétents.
          </p>

          <h2>9. Contact</h2>
          <p>
            Pour toute question, contactez-nous via la page{' '}
            <Link href="/contact" className="text-primary hover:underline">Contact</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
