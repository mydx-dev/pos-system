import { SheetDB, SheetGateway } from '@mydx-dev/gas-boost-runtime/core';
import { asFunction, asValue, createContainer, InjectionMode } from 'awilix';
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
import { MigrationController } from './controller/MigrationController';
import {
    OnOpenController,
    OpenController,
} from './controller/OnOpenController';
import { PullDataBaseController } from './controller/PullDataBaseController';
import { ResetPasswordController } from './controller/ResetPasswordController';
import { SetupSystemController } from './controller/SetupSystemController';
import { UnapproveUserController } from './controller/UnapproveUserController';
import { UpdateUserController } from './controller/UpdateUserController';
import { ALL_TABLES } from './infrastructure/database/tables';

export type AppContainer = {
    dbId: string;
    tables: typeof ALL_TABLES;
    dataStore: GoogleAppsScript.Spreadsheet.SpreadsheetApp;
    gateway: SheetGateway;
    cacheService: GoogleAppsScript.Cache.CacheService;
    utilities: GoogleAppsScript.Utilities.Utilities;
    properties: GoogleAppsScript.Properties.Properties;
    session: GoogleAppsScript.Base.Session;
    logger: Pick<GoogleAppsScript.Base.Logger, 'log'>;
    gmailApp: Pick<GoogleAppsScript.Gmail.GmailApp, 'sendEmail'>;
    scriptApp: Pick<
        GoogleAppsScript.Script.ScriptApp,
        'getService' | 'getScriptId'
    >;
    htmlService: Pick<
        GoogleAppsScript.HTML.HtmlService,
        'createTemplateFromFile'
    >;
    spreadsheetApp: Pick<GoogleAppsScript.Spreadsheet.SpreadsheetApp, 'getUi'>;
    xFrameOptionsMode: GoogleAppsScript.HTML.XFrameOptionsMode.ALLOWALL;
    isSetupCompletedKey: string;
    isTermsAcceptedKey: string;
    passwordPepperKey: string;
    db: SheetDB<typeof ALL_TABLES>;
    passwordProtection: PasswordProtection;
    systemAdmins: SystemAdmins;
    authentication: Authentication;
    updateUserUseCase: UpdateUserUseCase;
    updateUserController: UpdateUserController;
    createUserUseCase: CreateUserUseCase;
    createUserController: CreateUserController;
    permissionCheck: PermissionCheck;
    acceptTermsUseCase: AcceptTermsUseCase;
    acceptTermsController: AcceptTermsController;
    approveUserUseCase: ApproveUserUseCase;
    approveUserController: ApproveUserController;
    deleteUserUseCase: DeleteUserUseCase;
    deleteUserController: DeleteUserController;
    doGetUseCase: DoGetUseCase;
    doGetController: DoGetController;
    forgotPasswordUseCase: ForgotPasswordUseCase;
    forgotPasswordController: ForgotPasswordController;
    isSetupCompletedUseCase: IsSetupCompletedUseCase;
    isSetupCompletedController: IsSetupCompletedController;
    setupSystemUseCase: SetupSystemUseCase;
    setupSystemController: SetupSystemController;
    isTermsAcceptedUseCase: IsTermsAcceptedUseCase;
    isTermsAcceptedController: IsTermsAcceptedController;
    loginUserUseCase: LoginUserUseCase;
    loginUserController: LoginUserController;
    logoutUserUseCase: LogoutUserUseCase;
    logoutUserController: LogoutUserController;
    pullDataBaseUseCase: PullDataBaseUseCase;
    pullDataBaseController: PullDataBaseController;
    resetPasswordUseCase: ResetPasswordUseCase;
    resetPasswordController: ResetPasswordController;
    unapproveUserUseCase: UnapproveUserUseCase;
    unapproveUserController: UnapproveUserController;
    openController: OpenController;
    onOpenController: OnOpenController;
    migrationController: MigrationController;
};

export const container = createContainer<AppContainer>({
    injectionMode: InjectionMode.PROXY,
});

container.register({
    dbId: asValue(SpreadsheetApp.getActiveSpreadsheet().getId()),
});

container.register({
    tables: asValue(
        ALL_TABLES.map((table) => {
            table.setDbId(container.resolve('dbId'));
            return table;
        })
    ),
    dataStore: asValue(SpreadsheetApp),
    gateway: asFunction(() => new SheetGateway(SpreadsheetApp)).singleton(),
    cacheService: asValue(CacheService),
    utilities: asValue(Utilities),
    properties: asValue(PropertiesService.getScriptProperties()),
    session: asValue(Session),
    logger: asValue(Logger),
    gmailApp: asValue(GmailApp),
    scriptApp: asValue(ScriptApp),
    htmlService: asValue(HtmlService),
    spreadsheetApp: asValue(SpreadsheetApp),
    xFrameOptionsMode: asValue(HtmlService.XFrameOptionsMode.ALLOWALL),
});

container.register({
    isSetupCompletedKey: asValue(isSetupCompletedKey),
    isTermsAcceptedKey: asValue(isTermsAcceptedKey),
    passwordPepperKey: asValue(passwordPepperKey),
});

container.register({
    db: asFunction(
        ({ tables, gateway, cacheService, utilities }: AppContainer) =>
            new SheetDB(tables, gateway, cacheService, utilities)
    ).singleton(),
    passwordProtection: asFunction(
        ({ utilities, properties }: AppContainer) =>
            new PasswordProtection(utilities, properties)
    ).singleton(),
    systemAdmins: asFunction(
        ({ db }: AppContainer) => new SystemAdmins(db)
    ).singleton(),
    authentication: asFunction(
        ({ cacheService }: AppContainer) =>
            new Authentication(cacheService.getScriptCache())
    ).singleton(),
    permissionCheck: asFunction(
        ({ db }: AppContainer) => new PermissionCheck(db)
    ).singleton(),
    createUserUseCase: asFunction(
        ({
            utilities,
            passwordProtection,
            db,
            systemAdmins,
            session,
            gmailApp,
            scriptApp,
        }: AppContainer) => {
            return new CreateUserUseCase(
                utilities,
                passwordProtection,
                db,
                systemAdmins,
                session,
                gmailApp,
                scriptApp
            );
        }
    ).singleton(),
    approveUserUseCase: asFunction(({ db }: AppContainer) => {
        return new ApproveUserUseCase(db);
    }).singleton(),
    initSystemUseCase: asFunction(
        ({
            db,
            properties,
            utilities,
            session,
            logger,
            isSetupCompletedKey,
            passwordPepperKey,
        }: AppContainer) => {
            return new SetupSystemUseCase(
                db,
                properties,
                utilities,
                session,
                logger,
                {
                    isSetupCompletedKey,
                    passwordPepperKey,
                }
            );
        }
    ).singleton(),
    acceptTermsUseCase: asFunction(
        ({ properties, isTermsAcceptedKey }: AppContainer) => {
            return new AcceptTermsUseCase(properties, isTermsAcceptedKey);
        }
    ).singleton(),
    deleteUserUseCase: asFunction(
        ({ db }: AppContainer) => new DeleteUserUseCase(db)
    ).singleton(),
    doGetUseCase: asFunction(
        ({
            htmlService,
            properties,
            isSetupCompletedKey,
            isTermsAcceptedKey,
            scriptApp,
            xFrameOptionsMode,
        }: AppContainer) => {
            return new DoGetUseCase(
                htmlService,
                properties,
                isSetupCompletedKey,
                isTermsAcceptedKey,
                scriptApp,
                xFrameOptionsMode
            );
        }
    ).singleton(),
    forgotPasswordUseCase: asFunction(
        ({ db, utilities, gmailApp, scriptApp }: AppContainer) => {
            return new ForgotPasswordUseCase(
                db,
                utilities,
                gmailApp,
                scriptApp
            );
        }
    ).singleton(),
    isSetupCompletedUseCase: asFunction(
        ({ properties, isSetupCompletedKey }: AppContainer) => {
            return new IsSetupCompletedUseCase(properties, isSetupCompletedKey);
        }
    ).singleton(),
    setupSystemUseCase: asFunction(
        ({
            db,
            properties,
            utilities,
            session,
            logger,
            isSetupCompletedKey,
            passwordPepperKey,
        }: AppContainer) => {
            return new SetupSystemUseCase(
                db,
                properties,
                utilities,
                session,
                logger,
                {
                    isSetupCompletedKey,
                    passwordPepperKey,
                }
            );
        }
    ).singleton(),
    isTermsAcceptedUseCase: asFunction(
        ({ properties, isTermsAcceptedKey }: AppContainer) => {
            return new IsTermsAcceptedUseCase(properties, isTermsAcceptedKey);
        }
    ).singleton(),
    loginUserUseCase: asFunction(
        ({ passwordProtection, utilities, db, cacheService }: AppContainer) => {
            return new LoginUserUseCase(
                passwordProtection,
                utilities,
                db,
                cacheService.getScriptCache()
            );
        }
    ).singleton(),
    logoutUserUseCase: asFunction(({ cacheService }: AppContainer) => {
        return new LogoutUserUseCase(cacheService.getScriptCache());
    }).singleton(),
    pullDataBaseUseCase: asFunction(({ db }: AppContainer) => {
        return new PullDataBaseUseCase(db);
    }).singleton(),
    resetPasswordUseCase: asFunction(
        ({ db, passwordProtection }: AppContainer) => {
            return new ResetPasswordUseCase(db, passwordProtection);
        }
    ).singleton(),
    unapproveUserUseCase: asFunction(({ db }: AppContainer) => {
        return new UnapproveUserUseCase(db);
    }).singleton(),
    updateUserUseCase: asFunction(({ db }: AppContainer) => {
        return new UpdateUserUseCase(db);
    }).singleton(),
});

container.register({
    acceptTermsController: asFunction(
        ({ acceptTermsUseCase }: AppContainer) => {
            return new AcceptTermsController(acceptTermsUseCase);
        }
    ).singleton(),
    approveUserController: asFunction(
        ({ authentication, approveUserUseCase }: AppContainer) => {
            return new ApproveUserController(
                authentication,
                approveUserUseCase
            );
        }
    ).singleton(),
    createUserController: asFunction(({ createUserUseCase }: AppContainer) => {
        return new CreateUserController(createUserUseCase);
    }).singleton(),
    deleteUserController: asFunction(
        ({ authentication, deleteUserUseCase }: AppContainer) => {
            return new DeleteUserController(authentication, deleteUserUseCase);
        }
    ).singleton(),
    doGetController: asFunction(({ doGetUseCase }: AppContainer) => {
        return new DoGetController(doGetUseCase);
    }).singleton(),
    forgotPasswordController: asFunction(
        ({ forgotPasswordUseCase }: AppContainer) => {
            return new ForgotPasswordController(forgotPasswordUseCase);
        }
    ).singleton(),
    isSetupCompletedController: asFunction(
        ({ isSetupCompletedUseCase }: AppContainer) => {
            return new IsSetupCompletedController(isSetupCompletedUseCase);
        }
    ).singleton(),
    setupSystemController: asFunction(
        ({
            setupSystemUseCase,
            forgotPasswordUseCase,
            logger,
        }: AppContainer) => {
            return new SetupSystemController(
                setupSystemUseCase,
                forgotPasswordUseCase,
                logger
            );
        }
    ).singleton(),
    isTermsAcceptedController: asFunction(
        ({ isTermsAcceptedUseCase }: AppContainer) => {
            return new IsTermsAcceptedController(isTermsAcceptedUseCase);
        }
    ).singleton(),
    loginUserController: asFunction(({ loginUserUseCase }: AppContainer) => {
        return new LoginUserController(loginUserUseCase);
    }).singleton(),
    logoutUserController: asFunction(({ logoutUserUseCase }: AppContainer) => {
        return new LogoutUserController(logoutUserUseCase);
    }).singleton(),
    pullDataBaseController: asFunction(
        ({ authentication, pullDataBaseUseCase }: AppContainer) => {
            return new PullDataBaseController(
                authentication,
                pullDataBaseUseCase
            );
        }
    ).singleton(),
    resetPasswordController: asFunction(
        ({ resetPasswordUseCase }: AppContainer) => {
            return new ResetPasswordController(resetPasswordUseCase);
        }
    ).singleton(),
    unapproveUserController: asFunction(
        ({ authentication, unapproveUserUseCase }: AppContainer) => {
            return new UnapproveUserController(
                authentication,
                unapproveUserUseCase
            );
        }
    ).singleton(),
    updateUserController: asFunction(
        ({ authentication, updateUserUseCase }: AppContainer) => {
            return new UpdateUserController(authentication, updateUserUseCase);
        }
    ).singleton(),
    openController: asFunction(
        ({ doGetUseCase, spreadsheetApp }: AppContainer) => {
            return new OpenController(doGetUseCase, spreadsheetApp);
        }
    ).singleton(),
    onOpenController: asFunction(({ spreadsheetApp }: AppContainer) => {
        return new OnOpenController(spreadsheetApp);
    }).singleton(),
    migrationController: asFunction(({ db }: AppContainer) => {
        return new MigrationController(db);
    }).singleton(),
});
