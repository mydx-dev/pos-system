export class NewUserNotification {
    public readonly title: string = '新規ユーザーが作成されました';
    public readonly body: string;
    constructor(
        userId: string,
        url: string,
        name: string,
        email: string,
        public readonly recipients: string[]
    ) {
        this.body = `システム管理者各位

新規ユーザーがシステムに追加されました。

氏名: ${name}
メールアドレス: ${email}

こちらのURLから承認できます。
${url}#/users/${userId}`;
    }
}
