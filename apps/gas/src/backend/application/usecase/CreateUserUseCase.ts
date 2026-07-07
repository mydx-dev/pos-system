import {
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import { RoleName } from '../../../shared/domain/entity/Role';
import { NewUserNotification } from '../../../shared/domain/valueObject/NewUserNotification';
import { UserEmail } from '../../../shared/domain/valueObject/UserEmail';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PasswordProtection } from '../service/PasswordProtection';
import { SystemAdmins } from '../service/SystemAdmins';

export class CreateUserUseCase {
    constructor(
        private utilities: GoogleAppsScript.Utilities.Utilities,
        private passwordProtection: PasswordProtection,
        private db: SheetDB<typeof ALL_TABLES>,
        private systemAdmins: SystemAdmins,
        private session: GoogleAppsScript.Base.Session,
        private gmailApp: Pick<GoogleAppsScript.Gmail.GmailApp, 'sendEmail'>,
        private scriptApp: Pick<GoogleAppsScript.Script.ScriptApp, 'getService'>
    ) {}
    execute({
        name,
        email,
        password,
    }: {
        name: string;
        email: string;
        password: string;
    }): { id: string; name: string; email: string } {
        // バリデーション
        let userEmail: UserEmail;
        try {
            userEmail = new UserEmail(email);
        } catch {
            throw new InvalidArgumentError('EMAIL', 'Invalid email format');
        }

        if (password.length < 8) {
            throw new InvalidArgumentError(
                'PASSWORD',
                'Password must be at least 8 characters long'
            );
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&-]+$/;
        if (!regex.test(password)) {
            throw new InvalidArgumentError(
                'PASSWORD',
                'Password must be a combination of uppercase letters, lowercase letters, numbers, and special characters'
            );
        }

        // IDを生成（UUID v4形式）
        const id = this.utilities.getUuid();
        const hashedPassword = this.passwordProtection.execute(
            password,
            id // ソルトはユーザーID
        );

        // 全てのシステム管理者を取得する
        const admins = this.systemAdmins.search();
        const scriptOwnerEmail = this.session.getEffectiveUser().getEmail();
        const isOwnerExecuting = userEmail.value === scriptOwnerEmail;
        let isApproval: boolean = false;
        let role: RoleName = 'ユーザー';

        if (admins.length === 0) {
            if (!isOwnerExecuting) {
                throw new Error('Not allowd to create user');
            }

            isApproval = true;
            role = 'システム管理者';
        }

        // ユーザーを作成する
        return this.db.transaction(() => {
            this.db.table('ユーザー').create([
                {
                    ID: id,
                    氏名: name,
                    メールアドレス: email,
                    パスワード: hashedPassword,
                    承認: isApproval,
                    バージョン: 1,
                    relations: {
                        ロール: [
                            {
                                ユーザーID: id,
                                名称: role,
                            },
                        ],
                    },
                },
            ]);

            if (admins.length === 0) {
                return { id, name, email };
            }

            // 通知文章を作成する
            const url = this.scriptApp.getService().getUrl();
            const notification = new NewUserNotification(
                id,
                url,
                name,
                email,
                admins.map((admin) => admin.email)
            );
            const to = notification.recipients.shift();
            if (!to) {
                throw new Error('No system admin email');
            }

            this.gmailApp.sendEmail(to, notification.title, notification.body, {
                cc: notification.recipients.slice(0).join(','),
            });
            return { id, name, email };
        });
    }
}
