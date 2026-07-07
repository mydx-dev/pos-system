import { PermissionBadge } from './PermissionBadge';

export const PermissionSummary = ({
    hasAdminRole,
}: {
    hasAdminRole: boolean;
}) => {
    const roleLabel = hasAdminRole
        ? 'Admin（管理者権限）'
        : 'Staff（スタッフ権限）';

    const roleDescription = hasAdminRole
        ? '店舗全体の運営、売上管理、および設定の変更が可能です。すべての顧客データへのアクセス権を持っています。'
        : '予約の管理や売上レポートの閲覧など、店舗運営に必要な基本的な権限を持っています。';

    return (
        <div className="bento-card rounded-xl p-lg">
            <div className="flex items-center gap-sm mb-md">
                <span className="material-symbols-outlined text-primary">
                    admin_panel_settings
                </span>
                <h5 className="font-headline-md text-headline-md text-primary">
                    権限とロール
                </h5>
            </div>
            <div className="bg-surface-container-low p-md rounded-lg mb-lg">
                <p className="font-label-lg text-label-lg text-primary mb-xs">
                    {roleLabel}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {roleDescription}
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <PermissionBadge label="全予約の管理・編集" has={true} />
                <PermissionBadge label="売上レポートの閲覧" has={true} />

                <PermissionBadge
                    label="マスタ（スタッフ・カテゴリ・メニュー）の管理"
                    has={hasAdminRole}
                />
                <PermissionBadge label="顧客データへのアクセス" has={true} />
            </div>
        </div>
    );
};
