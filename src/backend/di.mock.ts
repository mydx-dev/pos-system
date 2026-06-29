import {
    InMemoryDataStore,
    InMemoryGateway,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    InMemoryContext,
    InMemoryPropertiesService,
    InMemorySession,
    NodeUtilities,
    OAuthScope,
    SecurityPolicy,
} from '@mydx-dev/gas-boost-runtime/testing';
import {
    asClass,
    asFunction,
    asValue,
    createContainer,
    InjectionMode,
} from 'awilix';
import { vi } from 'vitest';
import {
    isSetupCompletedKey,
    isTermsAcceptedKey,
    passwordPepperKey,
} from '../shared/config';
import { Authentication } from './application/service/Authentication';
import { PasswordProtection } from './application/service/PasswordProtection';
import { PermissionCheck } from './application/service/PermissionCheck';
import { SystemAdmins } from './application/service/SystemAdmins';
import { AcceptTermsUseCase } from './application/usecase/AcceptTermsUseCase';
import { ApproveUserUseCase } from './application/usecase/ApproveUserUseCase';
import { CreateUserUseCase } from './application/usecase/CreateUserUseCase';
import { DeleteUserUseCase } from './application/usecase/DeleteUserUseCase';
import { DoGetUseCase } from './application/usecase/DoGetUseCase';
import { ForgotPasswordUseCase } from './application/usecase/ForgotPasswordUseCase';
import { IsSetupCompletedUseCase } from './application/usecase/IsSetupCompletedUseCase';
import { IsTermsAcceptedUseCase } from './application/usecase/IsTermsAcceptedUseCase';
import { LoginUserUseCase } from './application/usecase/LoginUserUseCase';
import { LogoutUserUseCase } from './application/usecase/LogoutUserUseCase';
import { PullDataBaseUseCase } from './application/usecase/PullDataBaseUseCase';
import { ResetPasswordUseCase } from './application/usecase/ResetPasswordUseCase';
import { SetupSystemUseCase } from './application/usecase/SetupSystemUseCase';
import { UnapproveUserUseCase } from './application/usecase/UnapproveUserUseCase';
import { UpdateUserUseCase } from './application/usecase/UpdateUserUseCase';
import { AcceptTermsController } from './controller/AcceptTermsController';
import { ApproveUserController } from './controller/ApproveUserController';
import { CreateUserController } from './controller/CreateUserController';
import { DeleteUserController } from './controller/DeleteUserController';
import { DoGetController } from './controller/DoGetController';
import { ForgotPasswordController } from './controller/ForgotPasswordController';
import { IsSetupCompletedController } from './controller/IsSetupCompletedController';
import { IsTermsAcceptedController } from './controller/IsTermsAcceptedController';
import { LoginUserController } from './controller/LoginUserController';
import { LogoutUserController } from './controller/LogoutUserController';
import { PullDataBaseController } from './controller/PullDataBaseController';
import { ResetPasswordController } from './controller/ResetPasswordController';
import { SetupSystemController } from './controller/SetupSystemController';
import { UnapproveUserController } from './controller/UnapproveUserController';
import { UpdateUserController } from './controller/UpdateUserController';
import { AppContainer } from './di';
import {
    ALL_TABLES,
    PasswordResetTable,
    RoleTable,
    UserTable,
} from './infrastructure/database/tables';

const dataStore = new InMemoryDataStore();

dataStore.set(':ユーザー', [Object.keys(UserTable.schema.def.shape)]);
dataStore.set(':ロール', [Object.keys(RoleTable.schema.def.shape)]);
dataStore.set(':パスワードリセット', [
    Object.keys(PasswordResetTable.schema.def.shape),
]);

type TestContainer = Omit<
    AppContainer,
    'dataStore' | 'gateway' | 'xFrameOptionsMode' | 'envKeys'
> & {
    dataStore: InMemoryDataStore;
    gateway: InMemoryGateway;
    xFrameOptionsMode: 'ALLOWALL';
    envKeys: {
        isSetupCompletedKey: string;
        passwordPepperKey: string;
    };
};

export const testContainer = createContainer<TestContainer>({
    injectionMode: InjectionMode.CLASSIC,
});

testContainer.register({
    tables: asValue(ALL_TABLES),
    dataStore: asFunction(() => {
        const dataStore = new InMemoryDataStore();
        testContainer.resolve('tables').forEach((table) => {
            dataStore.set(table.name, [Object.keys(table.schema.def.shape)]);
        });
        return dataStore;
    }).scoped(),
    gateway: asClass(InMemoryGateway).scoped(),
    cache: asFunction((cacheService: InMemoryCacheService) =>
        cacheService.getScriptCache()
    ).scoped(),
    utilities: asClass(NodeUtilities).scoped(),
    properties: asValue(new InMemoryPropertiesService().getScriptProperties()),
    cacheService: asClass(InMemoryCacheService).scoped(),
    session: asValue(
        new InMemorySession(
            new InMemoryContext(
                'developer@example.com',
                'user@example.com',
                {
                    type: 'WEB_APP',
                    executeAs: 'OWNER',
                },
                new SecurityPolicy([OAuthScope.USERINFO_EMAIL]),
                'ja',
                'Asia/Tokyo'
            )
        )
    ),
    logger: asValue({ log: vi.fn() }),
    gmailApp: asValue({ sendEmail: vi.fn() }),
    scriptApp: asValue({
        getService: vi.fn().mockReturnValue({
            getUrl: vi
                .fn()
                .mockReturnValue(
                    'https://script.google.com/macros/s/AKfycbx/exec'
                ),
        }),
        getScriptId: vi.fn(),
    }),
    htmlService: asValue({
        createTemplateFromFile: vi.fn().mockReturnValue({
            evaluate: vi.fn().mockReturnValue({
                addMetaTag: vi.fn().mockReturnThis(),
                setXFrameOptionsMode: vi.fn().mockReturnThis(),
                setTitle: vi.fn().mockReturnThis(),
            }),
        }),
    }),
    xFrameOptionsMode: asValue('ALLOWALL'),
});

testContainer.register({
    isSetupCompletedKey: asValue(isSetupCompletedKey),
    isTermsAcceptedKey: asValue(isTermsAcceptedKey),
    passwordPepperKey: asValue(passwordPepperKey),
    envKeys: asValue({
        isSetupCompletedKey,
        passwordPepperKey,
    }),
});

testContainer.register({
    db: asFunction(
        (tables, gateway, cacheService, utilities) =>
            new SheetDB(tables, gateway, cacheService, utilities)
    ).scoped(),
});

testContainer.register({
    permissionCheck: asClass(PermissionCheck).scoped(),
    authentication: asClass(Authentication).scoped(),
    passwordProtection: asClass(PasswordProtection).scoped(),
    systemAdmins: asClass(SystemAdmins).scoped(),
});

testContainer.register({
    approveUserUseCase: asClass(ApproveUserUseCase).scoped(),
    acceptTermsUseCase: asClass(AcceptTermsUseCase).scoped(),
    createUserUseCase: asClass(CreateUserUseCase).scoped(),
    deleteUserUseCase: asClass(DeleteUserUseCase).scoped(),
    doGetUseCase: asClass(DoGetUseCase).scoped(),
    forgotPasswordUseCase: asClass(ForgotPasswordUseCase).scoped(),
    isSetupCompletedUseCase: asClass(IsSetupCompletedUseCase).scoped(),
    setupSystemUseCase: asClass(SetupSystemUseCase).scoped(),
    isTermsAcceptedUseCase: asClass(IsTermsAcceptedUseCase).scoped(),
    loginUserUseCase: asClass(LoginUserUseCase).scoped(),
    logoutUserUseCase: asClass(LogoutUserUseCase).scoped(),
    pullDataBaseUseCase: asClass(PullDataBaseUseCase).scoped(),
    resetPasswordUseCase: asClass(ResetPasswordUseCase).scoped(),
    unapproveUserUseCase: asClass(UnapproveUserUseCase).scoped(),
    updateUserUseCase: asClass(UpdateUserUseCase).scoped(),
});

testContainer.register({
    approveUserController: asClass(ApproveUserController).scoped(),
    acceptTermsController: asClass(AcceptTermsController).scoped(),
    createUserController: asClass(CreateUserController).scoped(),
    deleteUserController: asClass(DeleteUserController).scoped(),
    doGetController: asClass(DoGetController).scoped(),
    forgotPasswordController: asClass(ForgotPasswordController).scoped(),
    isSetupCompletedController: asClass(IsSetupCompletedController).scoped(),
    setupSystemController: asClass(SetupSystemController).scoped(),
    isTermsAcceptedController: asClass(IsTermsAcceptedController).scoped(),
    loginUserController: asClass(LoginUserController).scoped(),
    logoutUserController: asClass(LogoutUserController).scoped(),
    pullDataBaseController: asClass(PullDataBaseController).scoped(),
    resetPasswordController: asClass(ResetPasswordController).scoped(),
    unapproveUserController: asClass(UnapproveUserController).scoped(),
    updateUserController: asClass(UpdateUserController).scoped(),
});
