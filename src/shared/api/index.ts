import type { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import type { PullDatabaseInput, PullDatabaseOutput } from './system';
import type {
    ApproveUserInput,
    ApproveUserOutput,
    CreateUserInput,
    CreateUserOutput,
    DeleteUserInput,
    DeleteUserOutput,
    ForgotPasswordInput,
    ForgotPasswordOutput,
    LoginUserInput,
    LoginUserOutput,
    LogoutUserInput,
    LogoutUserOutput,
    ResetPasswordInput,
    ResetPasswordOutput,
    UnapproveUserInput,
    UnapproveUserOutput,
    UpdateUserInput,
    UpdateUserOutput,
} from './user';

export type SSR = {
    isSetupCompleted: boolean;
    isTermsAccepted: boolean;
    scriptId: string;
};

declare global {
    interface Window {
        __SSR__: SSR;
    }
}

export type API = {
    acceptTerms: () => AppsScriptServerResponse<boolean>;
    isSetupCompleted: () => AppsScriptServerResponse<boolean>;
    isTermsAccepted: () => AppsScriptServerResponse<boolean>;
    createUser: (
        input: CreateUserInput
    ) => AppsScriptServerResponse<CreateUserOutput>;
    loginUser: (
        input: LoginUserInput
    ) => AppsScriptServerResponse<LoginUserOutput>;
    logoutUser: (
        input: LogoutUserInput
    ) => AppsScriptServerResponse<LogoutUserOutput>;
    approveUser: (
        input: ApproveUserInput
    ) => AppsScriptServerResponse<ApproveUserOutput>;
    unapproveUser: (
        input: UnapproveUserInput
    ) => AppsScriptServerResponse<UnapproveUserOutput>;
    updateUser: (
        input: UpdateUserInput
    ) => AppsScriptServerResponse<UpdateUserOutput>;
    deleteUser: (
        input: DeleteUserInput
    ) => AppsScriptServerResponse<DeleteUserOutput>;
    pullDatabase: (
        input: PullDatabaseInput
    ) => AppsScriptServerResponse<PullDatabaseOutput>;
    forgotPassword: (
        input: ForgotPasswordInput
    ) => AppsScriptServerResponse<ForgotPasswordOutput>;
    resetPassword: (
        input: ResetPasswordInput
    ) => AppsScriptServerResponse<ResetPasswordOutput>;
};
