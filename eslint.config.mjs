import { FlatCompat } from '@eslint/eslintrc';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import vitest from '@vitest/eslint-plugin';
import boundaries from 'eslint-plugin-boundaries';
import importPlugin from 'eslint-plugin-import';
import reactDom from 'eslint-plugin-react-dom';
import reactHooks from 'eslint-plugin-react-hooks';
import { fileURLToPath } from 'node:url';

const compat = new FlatCompat({
    baseDirectory: fileURLToPath(new URL('.', import.meta.url)),
});

export default [
    {
        ignores: ['dist/**', 'coverage/**'],
    },
    ...compat.extends(
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
        'prettier'
    ),
    ...compat.env({ browser: true, node: true, es6: true }),
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            import: importPlugin,
            boundaries,
            'react-hooks': reactHooks,
            'react-dom': reactDom,
        },
        settings: {
            'boundaries/elements': [
                {
                    type: 'controller',
                    pattern: 'src/backend/controller/**',
                },
                {
                    type: 'usecase',
                    pattern: 'src/backend/application/usecase/**',
                },
                {
                    type: 'service',
                    pattern: 'src/backend/application/service/**',
                },
                { type: 'domain', pattern: 'src/shared/domain/**' },
                { type: 'infra', pattern: 'src/backend/infrastructure/**' },
                { type: 'di', pattern: 'src/backend/di.ts' },
                { type: 'function', pattern: 'src/backend/main.ts' },
                { type: 'shared', pattern: 'src/shared/**' },
            ],
        },
        rules: {
            'no-console': 'warn',
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            complexity: ['error', 10],
            'max-lines-per-function': ['warn', 120],
            'max-depth': ['error', 3],
            'import/no-cycle': ['error', { maxDepth: 2 }],
            'no-restricted-imports': [
                'error',
                {
                    paths: [
                        {
                            name: 'axios',
                            message:
                                'Use approved runtime gateway instead of axios.',
                        },
                        {
                            name: 'node-fetch',
                            message:
                                'Use approved runtime gateway instead of node-fetch.',
                        },
                        {
                            name: 'got',
                            message:
                                'Use approved runtime gateway instead of got.',
                        },
                    ],
                    patterns: ['@googleapis/*'],
                },
            ],
            'no-restricted-syntax': [
                'error',
                {
                    selector:
                        "AssignmentExpression[left.type='MemberExpression'][left.property.name='innerHTML']",
                    message:
                        'Avoid assigning to innerHTML; use React rendering or sanitize the HTML first.',
                },
                {
                    selector:
                        "CallExpression[callee.property.name='insertAdjacentHTML']",
                    message:
                        'Avoid insertAdjacentHTML; sanitize input or render via React instead.',
                },
                {
                    selector: "MethodDefinition[accessibility='private']",
                    message:
                        'Private methods are disallowed. Keep logic in the main method or extract reusable collaborators.',
                },
            ],
            'boundaries/dependencies': [
                'error',
                {
                    default: 'disallow',
                    rules: [
                        {
                            from: { type: 'controller' },
                            allow: {
                                to: { type: ['usecase', 'shared', 'di'] },
                            },
                        },
                        {
                            from: { type: 'usecase' },
                            allow: {
                                to: { type: ['service', 'domain', 'shared'] },
                            },
                        },
                        {
                            from: { type: 'service' },
                            allow: {
                                to: { type: ['domain', 'infra', 'shared'] },
                            },
                        },
                        {
                            from: { type: 'domain' },
                            allow: { to: { type: ['shared'] } },
                        },
                        {
                            from: { type: 'infra' },
                            allow: { to: { type: ['domain', 'shared'] } },
                        },
                        {
                            from: { type: 'di' },
                            allow: {
                                to: {
                                    type: [
                                        'controller',
                                        'usecase',
                                        'service',
                                        'domain',
                                        'infra',
                                        'shared',
                                    ],
                                },
                            },
                        },
                        {
                            from: { type: 'function' },
                            allow: {
                                to: { type: ['controller', 'di', 'shared'] },
                            },
                        },
                        {
                            from: { type: 'shared' },
                            allow: { to: { type: ['shared'] } },
                        },
                    ],
                },
            ],
            'react-dom/no-dangerously-set-innerhtml': 'error',
        },
    },
    {
        files: [
            'src/frontend/pages/**/*.tsx',
            'src/frontend/layouts/**/*.tsx',
            'src/frontend/components/**/*.tsx',
            'src/frontend/routes/**/*.tsx',
            'src/frontend/context/**/*.tsx',
        ],
        rules: {
            'max-lines-per-function': 'off',
        },
    },
    {
        files: [
            'tests/**/*.ts',
            'tests/**/*.tsx',
            '**/*.test.ts',
            '**/*.spec.ts',
        ],
        plugins: {
            vitest,
        },
        rules: {
            'max-lines-per-function': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'no-console': 'off',
            'boundaries/dependencies': 'off',
            'import/no-cycle': 'off',
            'vitest/no-focused-tests': 'error',
            'vitest/no-disabled-tests': 'error',
            'vitest/no-standalone-expect': 'error',
            'vitest/valid-expect-in-promise': 'error',
            'vitest/no-unneeded-async-expect-function': 'error',
        },
    },
    {
        files: ['src/frontend/actions/**/*.ts'],
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
    {
        files: [
            'src/frontend/components/reui/**/*.tsx',
            'src/frontend/components/ui/**/*.tsx',
            'src/**/*.mock.tsx',
            'src/**/*.mock.ts',
        ],
        rules: {
            // 設計系
            complexity: 'off',
            'max-lines-per-function': 'off',
            'max-depth': 'off',
            'boundaries/dependencies': 'off',
            'import/no-cycle': 'off',

            // React内部実装系
            'react-hooks/exhaustive-deps': 'off',
            'react-hooks/refs': 'off',
        },
    },
    {
        files: ['src/backend/application/usecase/PullDataBaseUseCase.ts'],
        rules: {
            'max-lines-per-function': 'off',
        },
    },
];
