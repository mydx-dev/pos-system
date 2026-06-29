import { createAppsScriptClient } from '@mydx-dev/gas-boost-react-apps-script';
import { ALL_TABLES } from '../../backend/infrastructure/database/tables';
import { API, SSR } from '../../shared/api';

export const ssr: SSR = {
    scriptId: window.__SSR__.scriptId,
    isSetupCompleted: window.__SSR__.isSetupCompleted,
    isTermsAccepted: window.__SSR__.isTermsAccepted,
};

export const labels = {
    pullDatabase: 'データ同期',
    createUser: 'ユーザー作成',
    loginUser: 'ログイン',
    logoutUser: 'ログアウト',
    updateUser: 'ユーザー更新',
    deleteUser: 'ユーザー削除',
    approveUser: 'ユーザー承認',
    unapproveUser: 'ユーザー承認取消',
    forgotPassword: 'パスワード再設定',
    resetPassword: 'パスワードリセット',
    isSetupCompleted: '初期設定完了確認',
    isTermsAccepted: '利用規約同意確認',
    acceptTerms: '利用規約同意',
};

export const { server, replica, replicaQL, job } = createAppsScriptClient<
    API,
    typeof ALL_TABLES
>(ALL_TABLES, ssr.scriptId, labels);
