// Try to load Sentry config (optional dependency)
let withSentryConfig;
try {
  withSentryConfig = require('@sentry/nextjs').withSentryConfig;
} catch {
  // Sentry not installed, skip
}

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

// Sentry configuration options
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload source maps and enable build-time features
  // Note: Source maps are not uploaded during development builds
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: false,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: '/monitoring-tunnel',

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
};

// Wrap the config with Sentry only when SENTRY_DSN is set and Sentry is installed
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN && withSentryConfig
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
