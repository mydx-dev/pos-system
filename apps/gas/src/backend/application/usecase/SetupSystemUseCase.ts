import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class SetupSystemUseCase {
    constructor(
        private readonly db: SheetDB<typeof ALL_TABLES>,
        private readonly properties: GoogleAppsScript.Properties.Properties,
        private readonly utilities: GoogleAppsScript.Utilities.Utilities,
        private readonly session: GoogleAppsScript.Base.Session,
        private readonly logger: Pick<GoogleAppsScript.Base.Logger, 'log'>,
        private readonly envKeys: {
            isSetupCompletedKey: string;
            passwordPepperKey: string;
        }
    ) {}
    execute() {
        this.db.migrate();
        this.logger.log('データベースの初期化が完了しました');

        this.db.protect();
        this.logger.log('データベースの保護が完了しました');

        const pepper = this.properties.getProperty(
            this.envKeys.passwordPepperKey
        );
        if (!pepper) {
            const pepper = this.utilities.getUuid();
            this.properties.setProperty(this.envKeys.passwordPepperKey, pepper);
        }

        const ownerEmail = this.session.getEffectiveUser().getEmail();
        const newId = this.utilities.getUuid();

        this.db.seed('ユーザー', [
            {
                ID: newId,
                氏名: 'システム管理者',
                メールアドレス: ownerEmail,
                パスワード: '',
                承認: true,
                バージョン: 1,
            },
        ]);

        this.db.seed('ロール', [
            {
                ユーザーID: newId,
                名称: 'システム管理者',
            },
        ]);

        this.properties.setProperty(this.envKeys.isSetupCompletedKey, 'true');
        this.logger.log('初期ユーザーの作成が完了しました');
        return ownerEmail;
    }
}
