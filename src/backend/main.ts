import { API } from '../shared/api';
import { container } from './di';

export const ServerFunctions: API & Record<string, unknown> = {
    setupSystem: () => container.resolve('setupSystemController').execute(),
    migration: () => container.resolve('migrationController').execute(),
    doGet: () => container.resolve('doGetController').execute(),
    onOpen: () => container.resolve('onOpenController').execute(),
    open: () => container.resolve('openController').execute(),
    isSetupCompleted: () =>
        container.resolve('isSetupCompletedController').execute(),
    isTermsAccepted: () =>
        container.resolve('isTermsAcceptedController').execute(),
    acceptTerms: () => container.resolve('acceptTermsController').execute(),
    createUser: (input) =>
        container.resolve('createUserController').execute(input),
    loginUser: (input) =>
        container.resolve('loginUserController').execute(input),
    logoutUser: (input) =>
        container.resolve('logoutUserController').execute(input),
    approveUser: (input) =>
        container.resolve('approveUserController').execute(input),
    unapproveUser: (input) =>
        container.resolve('unapproveUserController').execute(input),
    updateUser: (input) =>
        container.resolve('updateUserController').execute(input),
    deleteUser: (input) =>
        container.resolve('deleteUserController').execute(input),
    forgotPassword: (input) =>
        container.resolve('forgotPasswordController').execute(input),
    resetPassword: (input) =>
        container.resolve('resetPasswordController').execute(input),
    pullDatabase: (input) =>
        container.resolve('pullDataBaseController').execute(input),
};

Object.entries(ServerFunctions).forEach(([name, fn]) => {
    (globalThis as Record<string, unknown>)[name] = fn;
});
