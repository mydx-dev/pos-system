import type { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import type { CreateCustomerInput, CreateCustomerOutput } from './customer';
import { CreateEmployeeInput, CreateEmployeeOutput } from './employee';
import type { SaveMenuRequest, SaveMenuResponse } from './menu';
import type {
    SaveMenuCategoryRequest,
    SaveMenuCategoryResponse,
} from './menuCategory';
import type {
    CreatePaymentRecordRequest,
    CreatePaymentRecordResponse,
} from './paymentRecord';
import type {
    CreateRegisterTerminalRequest,
    CreateRegisterTerminalResponse,
    LoginRegisterTerminalRequest,
    LoginRegisterTerminalResponse,
    LogoutRegisterTerminalResponse,
    RefreshRegisterTerminalTokenRequest,
    RefreshRegisterTerminalTokenResponse,
} from './registerTerminal';
import type {
    GetRegisterTreatmentDetailRequest,
    GetRegisterTreatmentDetailResponse,
    ListRegisterMenusRequest,
    ListRegisterMenusResponse,
    ListRegisterTreatmentsRequest,
    ListRegisterTreatmentsResponse,
} from './register';
import type {
    PullDatabaseInput,
    PullDatabaseOutput,
    PullDatabaseRegisterTerminalInput,
    PullDatabaseRegisterTerminalOutput,
} from './system';
import type {
    CreateTreatmentRequest,
    CreateTreatmentResponse,
    SaveTreatmentMenusRequest,
    SaveTreatmentMenusResponse,
} from './treatment';
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
    createEmployee: (
        input: CreateEmployeeInput
    ) => AppsScriptServerResponse<CreateEmployeeOutput>;
    createCustomer: (
        input: CreateCustomerInput
    ) => AppsScriptServerResponse<CreateCustomerOutput>;
    saveMenuCategory: (
        input: SaveMenuCategoryRequest
    ) => AppsScriptServerResponse<SaveMenuCategoryResponse>;
    saveMenu: (
        input: SaveMenuRequest
    ) => AppsScriptServerResponse<SaveMenuResponse>;
    createTreatment: (
        input: CreateTreatmentRequest
    ) => AppsScriptServerResponse<CreateTreatmentResponse>;
    saveTreatmentMenus: (
        input: SaveTreatmentMenusRequest
    ) => AppsScriptServerResponse<SaveTreatmentMenusResponse>;
    createPaymentRecord: (
        input: CreatePaymentRecordRequest
    ) => AppsScriptServerResponse<CreatePaymentRecordResponse>;
    createRegisterTerminal: (
        input: CreateRegisterTerminalRequest
    ) => AppsScriptServerResponse<CreateRegisterTerminalResponse>;
    refreshRegisterTerminalToken: (
        input: RefreshRegisterTerminalTokenRequest
    ) => AppsScriptServerResponse<RefreshRegisterTerminalTokenResponse>;
    loginRegisterTerminal: (
        input: LoginRegisterTerminalRequest
    ) => AppsScriptServerResponse<LoginRegisterTerminalResponse>;
    logoutRegisterTerminal: () => AppsScriptServerResponse<LogoutRegisterTerminalResponse>;
    pullDatabaseRegisterTerminal: (
        input: PullDatabaseRegisterTerminalInput
    ) => AppsScriptServerResponse<PullDatabaseRegisterTerminalOutput>;
    listRegisterTreatments: (
        input: ListRegisterTreatmentsRequest
    ) => AppsScriptServerResponse<ListRegisterTreatmentsResponse>;
    getRegisterTreatmentDetail: (
        input: GetRegisterTreatmentDetailRequest
    ) => AppsScriptServerResponse<GetRegisterTreatmentDetailResponse>;
    listRegisterMenus: (
        input: ListRegisterMenusRequest
    ) => AppsScriptServerResponse<ListRegisterMenusResponse>;
};
