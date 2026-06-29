import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        include: [
            'src/backend/**/*.spec.ts',
            'src/backend/**/*.test.ts',
            'src/shared/**/*.spec.ts',
            'src/shared/**/*.test.ts',
        ],
        alias: {
            '../di': 'src/backend/di.mock.ts',
        },
    },
});
