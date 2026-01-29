// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Filter out specific errors
  beforeSend(event, hint) {
    const error = hint.originalException;

    // Ignore expected errors
    if (error instanceof Error) {
      if (
        error.message.includes('OFFLINE') ||
        error.message.includes('RATE_LIMIT_EXCEEDED')
      ) {
        return null;
      }
    }

    // Add custom context
    event.tags = {
      ...event.tags,
      app: 'speech-to-talk',
      context: 'pompiers',
    };

    return event;
  },
});
