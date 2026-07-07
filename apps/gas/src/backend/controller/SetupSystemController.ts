import { ForgotPasswordUseCase } from '../application/usecase/ForgotPasswordUseCase';
import { SetupSystemUseCase } from '../application/usecase/SetupSystemUseCase';

export class SetupSystemController {
    constructor(
        private readonly setupSystemUseCase: SetupSystemUseCase,
        private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
        private readonly logger: Pick<GoogleAppsScript.Base.Logger, 'log'>
    ) {}
    execute(): void {
        const ownerEmail = this.setupSystemUseCase.execute();
        this.forgotPasswordUseCase.execute(ownerEmail);
        this.logger.log(`========================================
システムの初期設定が完了しました。

初期管理者:
${ownerEmail}

上記メールアドレス宛に
パスワード設定メールを送信しました。

メール内のURLから
初回パスワードを設定してください。
========================================`);
    }
}
