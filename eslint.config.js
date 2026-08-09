import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

// Constitution (T005): named exports only — disallow default exports in app source.
// (eslint-plugin-import does not support ESLint 10 yet, hence the inline rule.)
const noDefaultExport = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow default exports (constitution: named exports only)',
    },
    schema: [],
  },
  create(context) {
    return {
      ExportDefaultDeclaration(node) {
        context.report({
          node,
          message:
            'Default exports are not allowed — use a named export instead.',
        });
      },
    };
  },
};

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    // Constitution (T005): no `as` casts, no non-null assertions.
    rules: {
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        { assertionStyle: 'never' },
      ],
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: {
      constitution: { rules: { 'no-default-export': noDefaultExport } },
    },
    rules: { 'constitution/no-default-export': 'error' },
  },
]);
