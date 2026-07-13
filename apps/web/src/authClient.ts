import { createAuthClient } from 'better-auth/react';

const authBaseUrl = () =>
    (import.meta.env.VITE_WORKER_API_BASE_URL || 'http://localhost:8787')
        .toString()
        .replace(/\/+$/, '');

export const authClient = createAuthClient({
    baseURL: authBaseUrl(),
    basePath: '/api/auth',
    fetchOptions: {
        credentials: 'include',
    },
});
