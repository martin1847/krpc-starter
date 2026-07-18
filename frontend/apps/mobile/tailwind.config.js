/**
 * Reuse the web design tokens (single source of truth) — only the `content` globs differ.
 * theme/presets are taken from apps/web/tailwind.config.cjs to prevent token drift.
 */
const webConfig = require('../web/tailwind.config.cjs');

module.exports = {
  presets: [require('nativewind/preset')],
  // Light-only app: use the 'class' strategy so NativeWind doesn't try to write color-scheme via
  // a MutationObserver (which throws on web). See NativeWind darkMode notes.
  darkMode: 'class',
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    '../../packages/app/src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: webConfig.theme,
  plugins: webConfig.plugins,
};
