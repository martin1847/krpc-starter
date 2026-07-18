/**
 * Tailwind v3 + NativeWind preset (cross-platform: web = react-native-web, mobile = react-native).
 * This file is the single source of truth for the design tokens; the mobile config re-exports its
 * `theme`. NativeWind v4 only supports Tailwind v3.
 *
 * The palette below is a brand-NEUTRAL placeholder (slate). Swap the values for your brand — the
 * runtime mirror in packages/app/src/features/theme.ts must stay aligned (checked by ds:check).
 */
module.exports = {
  presets: [require('nativewind/preset')],
  // important:true — every tailwind utility gets !important so it wins over react-native-web's
  // base styles regardless of stylesheet injection order (kills the pre-hydration layout flip).
  // Web-only; mobile has no CSS cascade. Web components emit zero inline styles (RNW compiles to
  // classes), so !important never clobbers inline style.
  important: true,
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    '../../packages/app/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f1f5f9',
          100: '#e2e8f0',
          200: '#cbd5e1',
          400: '#94a3b8',
          500: '#475569',
          600: '#334155',
          700: '#1e293b',
        },
        star: '#f59e0b',
        'badge-sale': '#ef4444',
        bg: '#f4f6fa',
        'detail-bg': '#f1f5f9',
        surface: '#ffffff',
        ink: '#1e293b',
        'ink-muted': '#64748b',
        line: '#e5e8ee',
      },
      borderRadius: {
        card: '16px',
      },
      boxShadow: {
        card: '0 2px 12px rgba(20, 30, 60, 0.06)',
      },
    },
  },
  plugins: [],
};
