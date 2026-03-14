'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
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
            <h1 className="text-lg font-bold text-white">Politique de confidentialité</h1>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="content-area-inner prose prose-sm dark:prose-invert max-w-none">
          <p className="text-xs text-slate-500 dark:text-slate-400">Dernière mise à jour : 14 mars 2026</p>

          <h2>1. Responsable du traitement</h2>
          <p>
            L&apos;application <strong>Speech To Talk</strong> est éditée dans le cadre d&apos;un projet
            destiné aux sapeurs-pompiers (SDIS). Le responsable du traitement des données
            personnelles est l&apos;éditeur de l&apos;application.
          </p>

          <h2>2. Données collectées</h2>
          <p>Dans le cadre de l&apos;utilisation de l&apos;application, nous collectons :</p>
          <ul>
            <li><strong>Données d&apos;authentification :</strong> adresse e-mail et mot de passe (chiffré)</li>
            <li><strong>Données audio :</strong> enregistrements vocaux temporaires, transmis aux services Google Cloud pour transcription et traduction. Ces données ne sont <strong>pas stockées</strong> après traitement.</li>
            <li><strong>Données de traduction :</strong> textes sources et traduits, stockés dans votre historique personnel</li>
            <li><strong>Images (OCR) :</strong> images transmises pour extraction de texte. Elles ne sont <strong>pas conservées</strong> après traitement.</li>
            <li><strong>Données de monitoring :</strong> erreurs techniques anonymisées (via Sentry) pour améliorer la qualité du service</li>
          </ul>

          <h2>3. Finalités du traitement</h2>
          <ul>
            <li>Fournir le service de traduction vocale en temps réel</li>
            <li>Permettre la communication entre les sapeurs-pompiers et les victimes allophones</li>
            <li>Améliorer la qualité du service (monitoring des erreurs)</li>
            <li>Gérer l&apos;authentification et les préférences utilisateur</li>
          </ul>

          <h2>4. Base légale</h2>
          <p>
            Le traitement des données repose sur <strong>l&apos;intérêt légitime</strong> du SDIS
            à assurer une communication efficace lors des interventions, ainsi que sur le
            <strong> consentement</strong> de l&apos;utilisateur lors de la création de son compte.
          </p>

          <h2>5. Hébergement et sous-traitants</h2>
          <table>
            <thead>
              <tr>
                <th>Service</th>
                <th>Fournisseur</th>
                <th>Localisation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Hébergement web</td>
                <td>Vercel Inc.</td>
                <td>Paris (CDG1), UE</td>
              </tr>
              <tr>
                <td>Base de données</td>
                <td>Supabase (AWS)</td>
                <td>UE</td>
              </tr>
              <tr>
                <td>API vocale</td>
                <td>Google Cloud</td>
                <td>UE (configurable)</td>
              </tr>
              <tr>
                <td>Monitoring</td>
                <td>Sentry</td>
                <td>UE</td>
              </tr>
            </tbody>
          </table>

          <h2>6. Durée de conservation</h2>
          <ul>
            <li><strong>Données audio :</strong> non conservées (traitement temps réel)</li>
            <li><strong>Historique de traductions :</strong> conservé tant que le compte est actif</li>
            <li><strong>Compte utilisateur :</strong> conservé jusqu&apos;à suppression par l&apos;utilisateur</li>
            <li><strong>Cache de traductions :</strong> 30 jours maximum</li>
            <li><strong>Logs d&apos;erreurs (Sentry) :</strong> 90 jours</li>
          </ul>

          <h2>7. Sécurité</h2>
          <p>Nous mettons en œuvre les mesures suivantes :</p>
          <ul>
            <li>Chiffrement des communications (HTTPS/TLS)</li>
            <li>Authentification sécurisée (Supabase Auth avec hachage bcrypt)</li>
            <li>Row Level Security (RLS) sur toutes les tables</li>
            <li>Aucun stockage de données sensibles côté client</li>
            <li>Masquage des données dans les replays Sentry</li>
          </ul>

          <h2>8. Contact</h2>
          <p>
            Pour toute question relative à la protection de vos données, contactez-nous
            via la page <Link href="/contact" className="text-primary hover:underline">Contact</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
