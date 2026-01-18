/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Configuration pour PWA (à activer avec next-pwa plus tard)
  // const withPWA = require('next-pwa')({ dest: 'public' })
  
  // Headers pour les permissions du micro et de la caméra
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'microphone=(self), camera=(self)',
          },
        ],
      },
    ];
  },

  // Images optimisées
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },

  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_APP_NAME: 'Speech To Talk',
    NEXT_PUBLIC_APP_VERSION: '1.0.0',
  },
};

module.exports = nextConfig;
