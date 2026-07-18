// Flat ESLint config (root, shared by every workspace package's `eslint src`).
// Non-type-checked recommended: fast, no project service needed.
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**', '**/.turbo/**', '**/.expo/**'],
  },
  ...tseslint.configs.recommended,
  {
    rules: {
      // Allow intentional throwaway via leading underscore (e.g. unused catch binding).
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
);
