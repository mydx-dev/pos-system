import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { createRequire } from 'module';
import { defineConfig } from 'vitest/config';

const require = createRequire(import.meta.url);
const reactEntry = require.resolve('react');
const reactJsxRuntimeEntry = require.resolve('react/jsx-runtime');
const reactJsxDevRuntimeEntry = require.resolve('react/jsx-dev-runtime');
const reactDomEntry = require.resolve('react-dom');
const reactDomClientEntry = require.resolve('react-dom/client');
const reactDomServerEntry = require.resolve('react-dom/server');
const reactRouterDomEntry = require.resolve('react-router-dom');
const reactQueryEntry = require.resolve('@tanstack/react-query');

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        tsconfigPaths: true,
        alias: [
            { find: /^react$/, replacement: reactEntry },
            { find: /^react\/jsx-runtime$/, replacement: reactJsxRuntimeEntry },
            {
                find: /^react\/jsx-dev-runtime$/,
                replacement: reactJsxDevRuntimeEntry,
            },
            { find: /^react-dom$/, replacement: reactDomEntry },
            { find: /^react-dom\/client$/, replacement: reactDomClientEntry },
            { find: /^react-dom\/server$/, replacement: reactDomServerEntry },
            {
                find: /^@tanstack\/react-query$/,
                replacement: reactQueryEntry,
            },
            {
                find: /^react-router-dom$/,
                replacement: reactRouterDomEntry,
            },
        ],
    },
    optimizeDeps: {
        exclude: ['fsevents'],
        include: [
            '@base-ui/react/button',
            '@testing-library/jest-dom',
            'class-variance-authority',
            'clsx',
            'lucide-react',
            'tailwind-merge',
        ],
    },
    test: {
        globals: true,
        setupFiles: ['./tests/vitest.setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            thresholds: {
                branches: 100,
            },
        },
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [
                {
                    browser: 'chromium',
                },
            ],
            expect: {
                toMatchScreenshot: {
                    comparatorName: 'pixelmatch',
                    comparatorOptions: {
                        threshold: 0.2,
                        allowedMismatchedPixels: 100,
                    },
                    resolveScreenshotPath: ({ arg, ext }) =>
                        `tests/design/screenshots/${arg}${ext}`,
                },
            },
        },
    },
});
