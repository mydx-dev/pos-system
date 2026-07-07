import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import { systemName } from '../../../shared/config';
import { PasswordResetNotification } from '../../../shared/domain/valueObject/PasswordResetNotification';
import { UserEmail } from '../../../shared/domain/valueObject/UserEmail';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class ForgotPasswordUseCase {
    constructor(
        private readonly db: SheetDB<typeof ALL_TABLES>,
        private readonly utilities: GoogleAppsScript.Utilities.Utilities,
        private readonly gmailApp: Pick<
            GoogleAppsScript.Gmail.GmailApp,
            'sendEmail'
        >,
        private readonly scriptApp: Pick<
            GoogleAppsScript.Script.ScriptApp,
            'getService'
        >
    ) {}

    execute(email: string) {
        // バリデーション
        let userEmail: UserEmail;
        try {
            userEmail = new UserEmail(email);
        } catch {
            throw new InvalidArgumentError('EMAIL', 'Invalid email format');
        }

        const user = this.db
            .table('ユーザー')
            .find(
                this.db
                    .query('ユーザー')
                    .and('メールアドレス', '=', [userEmail.value])
            )[0];

        if (!user) {
            throw new ForbiddenError('User not found');
        }

        const token = this.utilities.getUuid();
        const url = this.scriptApp.getService().getUrl();
        const expiredAt = Date.now() + 30 * 60 * 1000; // 30分後
        const notification = new PasswordResetNotification(
            token,
            url,
            this.utilities.formatDate(
                new Date(expiredAt),
                'JST',
                'yyyy/MM/dd HH:mm:ss'
            ),
            systemName
        );
        this.db.transaction(() => {
            this.gmailApp.sendEmail(
                userEmail.value,
                notification.title,
                notification.body
            );

            this.db.table('パスワードリセット').create([
                {
                    ユーザーID: user.id,
                    トークン: token,
                    有効期限: expiredAt,
                },
            ]);
        });

        return { ok: true };
    }
}
