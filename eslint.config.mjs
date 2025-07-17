import react from '@eslint-react/eslint-plugin';
import { fixupPluginRules } from '@eslint/compat';
import nextPlugin from '@next/eslint-plugin-next';
import pluginQuery from '@tanstack/eslint-plugin-query';
import prettierConfig from 'eslint-config-prettier';
import perfectionist from 'eslint-plugin-perfectionist';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';

const ERROR = 'error';
const WARN = 'warn';

const has = (pkg) => {
  try {
    import.meta.resolve(pkg, import.meta.url);
    return true;
  } catch {
    return false;
  }
};

const hasJestDom = has('@testing-library/jest-dom');
const vitestFiles = ['**/__tests__/**/*', '**/*.test.*'];
const testFiles = ['**/tests/**', '**/#tests/**', ...vitestFiles];
const playwrightFiles = ['**/e2e/**'];

export const config = [
  {
    ignores: [
      '**/.cache/**',
      '**/node_modules/**',
      '**/build/**',
      '**/public/build/**',
      '**/playwright-report/**',
      '**/server-build/**',
      '**/dist/**',
      '**/.next/**',
      '.lintstagedrc.js',
      'tailwind.config.*',
      'package-lock.json',
    ],
  },

  // all files
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    plugins: {
      '@next/next': nextPlugin,
      import: (await import('eslint-plugin-import-x')).default,
      'unused-imports': unusedImports,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      // import plugin
      'import/no-duplicates': [WARN, { 'prefer-inline': true }],

      'no-unexpected-multiline': ERROR,

      // no unused imports plugin
      'no-unused-vars': 'off',

      'no-warning-comments': [
        ERROR,
        { location: 'anywhere', terms: ['FIXME'] },
      ],
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          vars: 'all',
          varsIgnorePattern: '^ignored',
        },
      ],

      // next plugin
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      '@next/next/no-duplicate-head': 'off',
      '@next/next/no-img-element': 'error',

      // other
      'no-param-reassign': ERROR,
    },
  },

  /**
   * `eslint-plugin-react` for JSX/TSX files
   * @see https://github.com/jsx-eslint/eslint-plugin-react
   */
  {
    files: ['**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parser: (await import('typescript-eslint')).parser,
      parserOptions: { jsx: true },
    },
    plugins: { react: (await import('eslint-plugin-react')).default },
    rules: {
      'react/jsx-boolean-value': ERROR,
      'react/jsx-key': WARN,
      'react/jsx-no-useless-fragment': ERROR,
    },
  },

  /**
   * `@eslint-react/eslint-plugin` for JSX/TSX files
   * @see https://eslint-react.xyz/
   */
  {
    files: ['**/*.tsx', '**/*.jsx'],
    ...react.configs['recommended-typescript'],
    languageOptions: {
      parser: (await import('typescript-eslint')).parser,
      parserOptions: { jsx: true },
    },
  },

  // react-hook rules are applicable in ts/js/tsx/jsx, but only with React as a dep
  {
    files: ['**/*.ts?(x)', '**/*.js?(x)'],
    plugins: {
      'react-hooks': fixupPluginRules(
        await import('eslint-plugin-react-hooks'),
      ),
    },
    rules: {
      'react-hooks/exhaustive-deps': WARN,
      'react-hooks/rules-of-hooks': ERROR,
    },
  },

  // TS and TSX files
  {
    files: ['**/*.ts?(x)'],
    languageOptions: {
      parser: (await import('typescript-eslint')).parser,
      parserOptions: { projectService: true },
    },
    plugins: {
      '@typescript-eslint': (await import('typescript-eslint')).plugin,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        WARN,
        {
          disallowTypeAnnotations: true,
          fixStyle: 'inline-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'error',

      '@typescript-eslint/no-misused-promises': [
        'error',
        { checksVoidReturn: false },
      ],

      'import/consistent-type-specifier-style': [WARN, 'prefer-inline'],

      // here are rules we've decided to not enable. Commented out rather
      // than setting them to disabled to avoid them being referenced at all
      // when config resolution happens.

      // @typescript-eslint/require-await - sometimes you really do want
      // async without await to make a function async. TypeScript will ensure
      // it's treated as an async function by consumers and that's enough for me.

      // @typescript-eslint/prefer-promise-reject-errors - sometimes you
      // aren't the one creating the error and you just want to propogate an
      // error object with an unknown type.

      // @typescript-eslint/only-throw-error - same reason as above.
      // However this rule supports options to allow you to throw `any` and
      // `unknown`. Unfortunately, in Remix you can throw Response objects
      // and we don't want to enable this rule for those cases.

      // @typescript-eslint/no-unsafe-declaration-merging - this is a rare
      // enough problem (especially if you focus on types over interfaces)
      // that it's not worth enabling.

      // @typescript-eslint/no-unsafe-enum-comparison - enums are not
      // recommended or used in epic projects, so it's not worth enabling.

      // @typescript-eslint/no-unsafe-unary-minus - this is a rare enough
      // problem that it's not worth enabling.

      // @typescript-eslint/no-base-to-string - this doesn't handle when
      // your object actually does implement toString unless you do so with
      // a class which is not 100% of the time. For example, the timings
      // object in the epic stack uses defineProperty to implement toString.
      // It's not high enough risk/impact to enable.

      // @typescript-eslint/no-non-null-assertion - normally you should not
      // use ! to tell TS to ignore the null case, but you're a responsible
      // adult and if you're going to do that, the linter shouldn't yell at
      // you about it.

      // @typescript-eslint/restrict-template-expressions - toString is a
      // feature of many built-in objects and custom ones. It's not worth
      // enabling.

      // @typescript-eslint/no-confusing-void-expression - what's confusing
      // to one person isn't necessarily confusing to others. Arrow
      // functions that call something that returns void is not confusing
      // and the types will make sure you don't mess something up.

      // these each protect you from `any` and while it's best to avoid
      // using `any`, it's not worth having a lint rule yell at you when you
      // do:
      // - @typescript-eslint/no-unsafe-argument
      // - @typescript-eslint/no-unsafe-call
      // - @typescript-eslint/no-unsafe-member-access
      // - @typescript-eslint/no-unsafe-return
      // - @typescript-eslint/no-unsafe-assignment
    },
  },

  // This assumes test files are those which are in the test directory or have
  // *.test.* in the filename. If a file doesn't match this assumption, then it
  // will not be allowed to import test files.
  {
    files: ['**/*.ts?(x)', '**/*.js?(x)'],
    ignores: testFiles,
    rules: {
      'no-restricted-imports': [
        ERROR,
        {
          patterns: [
            {
              group: testFiles,
              message: 'Do not import test files in source files',
            },
          ],
        },
      ],
    },
  },

  hasJestDom
    ? {
        files: testFiles,
        ignores: [...playwrightFiles],
        plugins: {
          'jest-dom': (await import('eslint-plugin-jest-dom')).default,
        },
        rules: {
          'jest-dom/prefer-checked': ERROR,
          'jest-dom/prefer-enabled-disabled': ERROR,
          'jest-dom/prefer-focus': ERROR,
          'jest-dom/prefer-required': ERROR,
        },
      }
    : null,

  prettierConfig,
  perfectionist.configs['recommended-natural'],
  ...pluginQuery.configs['flat/recommended'],
].filter(Boolean);

// this is for backward compatibility
export default config;
