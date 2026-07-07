export class PasswordResetNotification {
    public readonly title: string;
    public readonly body: string;
    constructor(
        token: string,
        serviceUrl: string,
        expiredAt: string,
        systemName: string
    ) {
        this.title = `${systemName} パスワードリセット`;
        this.body = `以下のURLをクリックして、パスワードをリセットしてください。\n\n${serviceUrl}#/reset-password/?token=${token}\n\nこのURLの有効期限は30分間です。（${expiredAt}まで）\n一時的なもので、他人に知られないようにしてください。`;
    }
}
