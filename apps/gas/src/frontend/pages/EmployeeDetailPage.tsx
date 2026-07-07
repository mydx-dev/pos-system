import { RoleName } from '@mydx-pos/shared/domain/entity/Role';
import { routes } from '@/../shared/routes';
import { EmployeeDeleteDialog } from '@/components/employee/EmployeeDeleteDialog';
import { RoleBadge } from '@/components/employee/RoleBadge';
import { PermissionSummary } from '@/components/role/PermissionSummary';
import { TreatmentStatusBadge } from '@/components/treatment/TreatmentStatusBadge';
import { useFindEmployee } from '@/hooks/useFindEmployee';
import { replicaQL } from '@/lib/AppsScriptClient';
import { User } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export const EmployeeDetailPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const query = replicaQL
        .query('スタッフ')
        .and('ユーザーID', '=', [id!])
        .join('ユーザーID', 'ユーザー', 'ID');

    const employees = useFindEmployee(query);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    if (!employees) {
        return <div>スタッフを検索中</div>;
    }

    const employee = employees[0];
    const user = employee.user;

    if (!user) {
        return <div>ユーザー情報が見つかりません</div>;
    }

    return (
        <>
            <div className="p-lg max-w-7xl mx-auto space-y-gutter">
                {/* Action Header */}
                <div className="flex justify-between items-end">
                    <div>
                        <h3 className="font-display-lg text-display-lg text-primary">
                            スタッフ詳細
                        </h3>
                    </div>
                    <div className="flex gap-sm">
                        <button
                            className="flex items-center gap-sm bg-primary-container text-on-primary px-lg py-md rounded-lg font-label-lg active:scale-95 transition-all hover:bg-primary-container/80 hover:cursor-pointer"
                            onClick={() =>
                                navigate(routes.user.edit.build(id!))
                            }
                        >
                            <span className="material-symbols-outlined">
                                edit
                            </span>
                            編集する
                        </button>
                        <button
                            className="flex items-center gap-sm bg-error text-on-error px-lg py-md rounded-lg font-label-lg active:scale-95 transition-all hover:bg-error-container/80 hover:cursor-pointer"
                            onClick={() => setIsDeleteDialogOpen(true)}
                        >
                            <span className="material-symbols-outlined">
                                delete
                            </span>
                            削除する
                        </button>
                    </div>
                </div>
                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                    {/* Profile Card */}
                    <div className="md:col-span-4 bento-card rounded-xl p-lg flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden mb-md border-4 shadow-sm">
                            <User className="w-full h-full p-8" />
                        </div>
                        <h4 className="font-headline-lg text-headline-lg text-primary">
                            {user.name}
                        </h4>
                        <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                            {user.email}
                        </p>
                        <div className="flex gap-sm mb-lg">
                            {user.role.map((role) => (
                                <RoleBadge key={role} role={role as RoleName} />
                            ))}
                        </div>
                    </div>
                    {/* Permissions & Role */}
                    <div className="md:col-span-8 space-y-gutter">
                        {/* Performance Summary */}
                        <PermissionSummary
                            hasAdminRole={user.hasRole('システム管理者')}
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-md">
                            <div className="bento-card rounded-xl p-lg text-center">
                                <p className="font-label-md text-label-md text-on-surface-variant mb-xs">
                                    今月の客数
                                </p>
                                <h6 className="font-display-lg text-display-lg text-primary"></h6>
                                <p className="text-emerald-600 font-label-md text-label-md flex items-center justify-center gap-xs">
                                    <span className="material-symbols-outlined text-sm">
                                        trending_up
                                    </span>
                                </p>
                            </div>
                            <div className="bento-card rounded-xl p-lg text-center">
                                <p className="font-label-md text-label-md text-on-surface-variant mb-xs">
                                    平均客単価
                                </p>
                                <h6 className="font-display-lg text-display-lg text-primary"></h6>
                                <p className="text-on-surface-variant font-label-md text-label-md">
                                    前月比 ±0%
                                </p>
                            </div>
                            <div className="bento-card rounded-xl p-lg text-center">
                                <p className="font-label-md text-label-md text-on-surface-variant mb-xs">
                                    今月の売上
                                </p>
                                <h6 className="font-display-lg text-display-lg text-primary"></h6>
                                <p className="text-emerald-600 font-label-md text-label-md flex items-center justify-center gap-xs">
                                    <span className="material-symbols-outlined text-sm">
                                        trending_up
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                    {/* Upcoming Schedule */}
                    <div className="md:col-span-12 bento-card rounded-xl p-lg">
                        <div className="flex justify-between items-center mb-lg">
                            <div className="flex items-center gap-sm">
                                <span className="material-symbols-outlined text-primary">
                                    calendar_month
                                </span>
                                <h5 className="font-headline-md text-headline-md text-primary">
                                    本日のスケジュール
                                </h5>
                            </div>
                            <p className="font-label-lg text-label-lg text-on-surface-variant">
                                {new Date().toLocaleDateString('ja-JP', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    weekday: 'narrow',
                                })}
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-surface-container-low text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                                    <tr>
                                        <th className="px-md py-md font-semibold">
                                            時間
                                        </th>
                                        <th className="px-md py-md font-semibold">
                                            顧客名
                                        </th>
                                        <th className="px-md py-md font-semibold">
                                            メニュー
                                        </th>
                                        <th className="px-md py-md font-semibold">
                                            ステータス
                                        </th>
                                        <th className="px-md py-md font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline-variant font-body-sm text-body-sm">
                                    <tr className="hover:bg-surface-container-low transition-colors group">
                                        <td className="px-md py-lg font-semibold text-primary"></td>
                                        <td className="px-md py-lg">
                                            <div className="flex items-center gap-sm"></div>
                                        </td>
                                        <td className="px-md py-lg text-on-surface-variant"></td>
                                        <td className="px-md py-lg">
                                            <TreatmentStatusBadge status="完了" />
                                        </td>
                                        <td className="px-md py-lg text-right">
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity material-symbols-outlined text-primary">
                                                chevron_right
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            {isDeleteDialogOpen && (
                <EmployeeDeleteDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        navigate(routes.employee.list);
                    }}
                    name={employee.user?.name}
                    id={employee.userId}
                />
            )}
        </>
    );
};
