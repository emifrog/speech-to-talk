// ===========================================
// Design Tokens - Centralized design constants
// ===========================================

export const shadows = {
  soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
  medium: '0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 30px -5px rgba(0, 0, 0, 0.04)',
  strong: '0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 20px 50px -10px rgba(0, 0, 0, 0.1)',
  glass: '0 8px 32px rgba(0, 0, 0, 0.08)',
  glassSm: '0 4px 16px rgba(0, 0, 0, 0.06)',
  glassLg: '0 16px 48px rgba(0, 0, 0, 0.12)',
  glowPrimary: '0 0 40px rgba(37, 99, 235, 0.4)',
  glowAccent: '0 0 40px rgba(220, 38, 38, 0.4)',
  glowSuccess: '0 0 40px rgba(16, 185, 129, 0.4)',
  menu: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
  menuDark: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.3)',
} as const;

export const colors = {
  primary: {
    DEFAULT: '#2563EB',
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  accent: {
    DEFAULT: '#DC2626',
    50: '#FEF2F2',
    100: '#FEE2E2',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },
  dark: {
    DEFAULT: '#0F0F23',
    light: '#1A1A2E',
    lighter: '#25253D',
  },
} as const;

export const gradients = {
  primary: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
  primaryDark: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
  accent: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
  page: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #fee2e2 100%)',
  pageDark: 'linear-gradient(135deg, #0f0f23 0%, #1e3a5f 50%, #1a1a2e 100%)',
} as const;

export const borderRadius = {
  sm: '0.5rem',
  md: '0.75rem',
  lg: '1rem',
  xl: '1.25rem',
  '2xl': '1.5rem',
  '3xl': '2rem',
  full: '9999px',
} as const;

export const spacing = {
  menuButtonSize: 'w-11 h-11', // 44px - minimum touch target for firefighters
  iconButtonSize: 'w-10 h-10', // 40px
  inputHeight: 'py-3', // comfortable touch height
} as const;

// Tailwind class tokens for consistent usage
export const tokens = {
  // Glass card styles
  glassCard: 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/50 dark:border-slate-700/50 shadow-soft',
  glassCardHover: 'hover:shadow-medium hover:scale-[1.01]',

  // Input styles with dark mode
  input: 'w-full pl-12 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500',

  // Label styles
  label: 'block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2',

  // Text styles
  textMuted: 'text-slate-500 dark:text-slate-400',
  textBody: 'text-slate-700 dark:text-slate-200',

  // Page background
  pageBg: 'bg-slate-50 dark:bg-dark',

  // Divider
  divider: 'border-slate-200 dark:border-slate-700',
} as const;
