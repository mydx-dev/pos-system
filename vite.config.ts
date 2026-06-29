import { createLocalRpcVitePlugin } from '@mydx-dev/gas-boost-react-apps-script';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'module';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, normalizePath, type Plugin } from 'vite';

const realDi = normalizePath(
    fileURLToPath(new URL('./src/backend/di.ts', import.meta.url))
);

const mockDi = normalizePath(
    fileURLToPath(new URL('./src/backend/di.local.ts', import.meta.url))
);

const localDiAlias = (): Plugin => ({
    name: 'local-di-alias',
    enforce: 'pre',

    resolveId(source, importer) {
        if (!importer || !source.startsWith('.')) {
            return null;
        }

        const resolved = normalizePath(
            path.resolve(path.dirname(importer), source)
        );

        if (resolved === realDi || resolved === realDi.replace(/\.ts$/, '')) {
            return mockDi;
        }

        return null;
    },
});

const backendMainPath = fileURLToPath(
    new URL('./src/backend/main.ts', import.meta.url)
);

const plugin = createLocalRpcVitePlugin({
    loadHandlers: async (server) => {
        const module = await server.ssrLoadModule(backendMainPath);

        return module.ServerFunctions;
    },
});

const require = createRequire(import.meta.url);
const reactEntry = require.resolve('react');
const reactJsxRuntimeEntry = require.resolve('react/jsx-runtime');
const reactJsxDevRuntimeEntry = require.resolve('react/jsx-dev-runtime');
const reactDomEntry = require.resolve('react-dom');
const reactDomClientEntry = require.resolve('react-dom/client');
const reactDomServerEntry = require.resolve('react-dom/server');
const reactRouterDomEntry = require.resolve('react-router-dom');
const reactQueryEntry = require.resolve('@tanstack/react-query');

const isDev = process.env.NODE_ENV === 'development';

const appsScriptClientAlias = isDev
    ? fileURLToPath(
          new URL(
              './src/frontend/lib/AppsScriptClient.local.ts',
              import.meta.url
          )
      )
    : fileURLToPath(
          new URL('./src/frontend/lib/AppsScriptClient.ts', import.meta.url)
      );

const findDealAlias = isDev
    ? fileURLToPath(
          new URL('./src/frontend/hooks/useFindDeal.mock.tsx', import.meta.url)
      )
    : fileURLToPath(
          new URL('./src/frontend/hooks/useFindDeal.tsx', import.meta.url)
      );

export default defineConfig({
    plugins: [
        localDiAlias(),
        react(),
        tailwindcss(),
        {
            name: 'inject-ssr',
            transformIndexHtml(html) {
                const ssrData = {
                    scriptId: 'local-script-id',
                    isSetupCompleted: true,
                    isTermsAccepted: true,
                };
                return html.replace(
                    /['"]<\?= ssr \?>['"]/,
                    `'${JSON.stringify(ssrData)}'`
                );
            },
        },
        plugin,
    ],
    root: fileURLToPath(new URL('./src/frontend/apps', import.meta.url)),
    server: {
        fs: {
            allow: [fileURLToPath(new URL('./src', import.meta.url))],
        },
    },
    optimizeDeps: {
        exclude: ['fsevents'],
        include: [
            '@base-ui/react/button',
            '@base-ui/react/menu',
            '@base-ui/react/separator',
            '@base-ui/react/tooltip',
            '@base-ui/react/merge-props',
            '@base-ui/react/use-render',
            'class-variance-authority',
            'clsx',
            'lucide-react',
            'tailwind-merge',
            'sonner',
            '@floating-ui/utils',
        ],
    },
    resolve: {
        dedupe: [
            'react',
            'react-dom',
            '@tanstack/react-query',
            'react-router-dom',
            '@base-ui/react',
        ],
        alias: [
            {
                find: '@/lib/AppsScriptClient',
                replacement: appsScriptClientAlias,
            },
            {
                find: '@/hooks/useFindDeal',
                replacement: findDealAlias,
            },
            {
                find: /^@\//,
                replacement:
                    fileURLToPath(new URL('./src/frontend', import.meta.url)) +
                    '/',
            },
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
});
