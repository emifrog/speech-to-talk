'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function GDPRPage() {
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
            <h1 className="text-lg font-bold text-white">RGPD - Vos droits</h1>
          </div>
        </div>
      </div>

      <div className="content-area">
        <div className="content-area-inner prose prose-sm dark:prose-invert max-w-none">
          <p className="text-xs text-slate-500 dark:text-slate-400">Dernière mise à jour : 14 mars 2026</p>

          <p>
            Conformément au Règlement Général sur la Protection des Données (RGPD - Règlement UE 2016/679)
            et à la loi Informatique et Libertés, vous disposez de droits sur vos données personnelles.
          </p>

          <h2>1. Vos droits</h2>

          <h3>Droit d&apos;accès (Article 15)</h3>
          <p>
            Vous pouvez demander une copie de toutes les données personnelles que nous détenons
            vous concernant. Nous répondrons dans un délai de 30 jours.
          </p>

          <h3>Droit de rectification (Article 16)</h3>
          <p>
            Vous pouvez demander la correction de données inexactes ou incomplètes vous concernant.
            Vous pouvez modifier votre adresse e-mail et votre mot de passe directement dans l&apos;application.
          </p>

          <h3>Droit à l&apos;effacement (Article 17)</h3>
          <p>
            Vous pouvez demander la suppression de vos données personnelles. La suppression de
            votre compte entraîne l&apos;effacement de :
          </p>
          <ul>
            <li>Votre compte utilisateur et vos identifiants</li>
            <li>Votre historique de traductions</li>
            <li>Vos préférences utilisateur</li>
            <li>Toute donnée associée à votre compte</li>
          </ul>

          <h3>Droit à la portabilité (Article 20)</h3>
          <p>
            Vous pouvez demander à recevoir vos données dans un format structuré, couramment utilisé
            et lisible par machine (JSON/CSV).
          </p>

          <h3>Droit d&apos;opposition (Article 21)</h3>
          <p>
            Vous pouvez vous opposer au traitement de vos données à des fins de monitoring technique
            (Sentry). Contactez-nous pour désactiver le suivi.
          </p>

          <h3>Droit à la limitation du traitement (Article 18)</h3>
          <p>
            Vous pouvez demander la limitation du traitement de vos données dans certaines circonstances
            (contestation de l&apos;exactitude, traitement illicite, etc.).
          </p>

          <h2>2. Données traitées</h2>
          <table>
            <thead>
              <tr>
                <th>Donnée</th>
                <th>Finalité</th>
                <th>Conservation</th>
                <th>Base légale</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>E-mail</td>
                <td>Authentification</td>
                <td>Durée du compte</td>
                <td>Consentement</td>
              </tr>
              <tr>
                <td>Mot de passe (haché)</td>
                <td>Sécurité</td>
                <td>Durée du compte</td>
                <td>Consentement</td>
              </tr>
              <tr>
                <td>Audio (temporaire)</td>
                <td>Transcription</td>
                <td>Non conservé</td>
                <td>Intérêt légitime</td>
              </tr>
              <tr>
                <td>Traductions</td>
                <td>Historique</td>
                <td>Durée du compte</td>
                <td>Consentement</td>
              </tr>
              <tr>
                <td>Images OCR</td>
                <td>Extraction texte</td>
                <td>Non conservé</td>
                <td>Intérêt légitime</td>
              </tr>
              <tr>
                <td>Erreurs techniques</td>
                <td>Monitoring</td>
                <td>90 jours</td>
                <td>Intérêt légitime</td>
              </tr>
            </tbody>
          </table>

          <h2>3. Transferts hors UE</h2>
          <p>
            Nos principaux sous-traitants (Vercel, Supabase) disposent de serveurs dans l&apos;Union
            Européenne. Google Cloud peut traiter des données aux États-Unis sous les
            clauses contractuelles types (CCT) approuvées par la Commission Européenne.
          </p>

          <h2>4. Exercer vos droits</h2>
          <p>Pour exercer vos droits, contactez-nous :</p>
          <ul>
            <li>
              Via la page{' '}
              <Link href="/contact" className="text-primary hover:underline">Contact</Link>{' '}
              de l&apos;application
            </li>
            <li>En précisant votre demande et votre adresse e-mail de compte</li>
          </ul>
          <p>
            Nous traiterons votre demande dans un délai maximum de <strong>30 jours</strong>.
          </p>

          <h2>5. Réclamation</h2>
          <p>
            Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une
            réclamation auprès de la <strong>CNIL</strong> (Commission Nationale de l&apos;Informatique
            et des Libertés) :
          </p>
          <ul>
            <li>Site web : www.cnil.fr</li>
            <li>Adresse : 3 Place de Fontenoy, TSA 80715, 75334 Paris Cedex 07</li>
          </ul>

          <h2>6. Délégué à la protection des données</h2>
          <p>
            Pour toute question relative au traitement de vos données personnelles,
            contactez-nous via la page{' '}
            <Link href="/contact" className="text-primary hover:underline">Contact</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
