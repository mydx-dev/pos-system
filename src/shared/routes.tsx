export const routes = {
    system: {
        initialize: '/initialize',
        notFound: '*',
        settings: '/settings',
        support: '/support',
    },
    user: {
        login: '/login',
        forgotPassword: '/forgot-password',
        resetPassword: '/reset-password',
        profile: '/profile',
        list: '/users',
        create: '/users/new',
        detail: {
            path: '/users/:id',
            build: (id: string) => `/users/${id}`,
        },
        edit: {
            path: '/users/:id/edit',
            build: (id: string) => `/users/${id}/edit`,
        },
    },
    client: {
        create: '/clients/new',
    },
    deal: {
        create: '/deals/new',
        list: '/deals',
        detail: {
            path: '/deals/:id',
            build: (id: string) => `/deals/${id}`,
        },
    },
    estimate: {
        list: '/estimates',
        create: '/estimates/new',
        detail: {
            path: '/estimates/:id',
            build: (id: string) => `/estimates/${id}`,
        },
        edit: {
            path: '/estimates/:id/edit',
            build: (id: string) => `/estimates/${id}/edit`,
        },
    },
    project: {
        requirementDefinition: {
            path: '/projects/:id/requirement-definition',
            build: (id: string) => `/projects/${id}/requirement-definition`,
        },
    },
};
