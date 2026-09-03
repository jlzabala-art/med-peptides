import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    '.next',
    'node_modules',
    'public',
    'data_archive/**',
    'faq_backups/**',
    'reports/**',
    'protocol-exports/**',
    'Europeptides/**',
    'HORTMAN/**',
    'functions/**',
    'functions-*/**',
    'cypress/**',
    '*.log',
    '*.txt',
    '*.json'
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      // ── Existing Rules ────────────────────────────────────────────────
      'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
      'no-undef': 'warn',
      'no-duplicate-imports': 'error',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXElement[openingElement.name.name='table']",
          message: "Raw HTML tables are strictly forbidden. Use DataTable from src/components/ui/DataTable.jsx instead. If this is an email template or the DataTable implementation itself, disable this rule using // eslint-disable-next-line no-restricted-syntax"
        }
      ],

      // ── Code Quality Rules (Added) ────────────────────────────────────
      // Fuerza let/const sobre var
      'no-var': 'error',
      // Prefiere const para variables que no se reasignan
      'prefer-const': ['error', { destructuring: 'any', ignoreReadBeforeAssign: false }],
      // Igualdad estricta siempre (=== en lugar de ==)
      'eqeqeq': ['error', 'always', { null: 'ignore' }],
      // Prohíbe console.* en producción; usa src/utils/logger.js
      'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      // Detecta dependencias faltantes en useEffect/useCallback/useMemo
      'react-hooks/exhaustive-deps': 'warn',
      // Prohíbe coerciones implícitas tipo !!val, +val, '' + val
      'no-implicit-coercion': ['warn', { boolean: true, number: true, string: false }],

      // ── Golden Rule #2: Firestore Directo en UI Prohibido ─────────────
      // Bloquea import directo de `db`, `auth`, `storage` desde la carpeta firebase
      // en cualquier componente bajo src/components/, src/features/, src/templates/.
      // Para repositorios y servicios en src/repositories/ y src/services/ está permitido.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../firebase', '../../firebase', '../../../firebase', '../../../../firebase'],
              importNames: ['db'],
              message: '🚫 Golden Rule #2: No importes `db` directamente en la UI. Usa el repositorio correspondiente en src/repositories/. Si estás en un repositorio o servicio, usa // eslint-disable-next-line no-restricted-imports'
            }
          ]
        }
      ],
    },
  },
  {
    files: ['src/app/**/*.{js,jsx}', 'src/utils/**', 'src/context/**', 'src/templates/**'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
  // ── Repositories y Services: se permite importar db directamente ──────
  {
    files: [
      'src/repositories/**/*.{js,jsx}',
      'src/services/**/*.{js,jsx}',
      'src/actions/**/*.{js,jsx}',
      'src/hooks/**/*.{js,jsx}',
    ],
    rules: {
      'no-restricted-imports': 'off',
      // En repositorios, console está más controlado por el logger interno
      'no-console': 'off',
    },
  },
])
