import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'no-undef': 'warn',
      'no-duplicate-imports': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXElement[openingElement.name.name='table']",
          message: "Raw HTML tables are strictly forbidden. Use DataTable from src/components/ui/DataTable.jsx instead. If this is an email template or the DataTable implementation itself, disable this rule using // eslint-disable-next-line no-restricted-syntax"
        }
      ],
    },
  },
])
