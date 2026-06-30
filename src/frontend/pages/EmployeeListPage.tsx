import { RoleName } from '@/../shared/domain/entity/Role';
import { RoleBadge } from '@/components/employee/RoleBadge';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../shared/routes';
import { useFindEmployee } from '../hooks/useFindEmployee';
import { replicaQL } from '../lib/AppsScriptClient';

export const EmployeeListPage = () => {
    const navigate = useNavigate();
    const query = replicaQL
        .query('スタッフ')
        .join('ユーザーID', 'ユーザー', 'ID');
    const employees = useFindEmployee(query);

    if (!employees) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-on-surface-variant font-body-md">
                    スタッフ情報を取得中...
                </p>
            </div>
        );
    }

    return (
        <div className="p-lg space-y-lg max-w-[1200px] mx-auto w-full">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className=" text-headline-lg text-primary">
                        スタッフ管理
                    </h2>
                    <p className="text-on-surface-variant font-body-md">
                        全スタッフのステータス確認と権限管理が可能です。
                    </p>
                </div>
                <button
                    className="flex items-center gap-sm bg-primary-container text-on-primary px-lg py-md rounded-lg font-label-lg shadow-md hover:bg-primary-container/80 cursor-pointer transition-all active:scale-95"
                    onClick={() => navigate(routes.employee.create)}
                >
                    <span className="material-symbols-outlined">
                        person_add
                    </span>
                    新規スタッフ追加
                </button>
            </div>
            {/* Bento Stats */}
            <div className="grid grid-cols-4 gap-md">
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-soft">
                    <p className="text-on-surface-variant font-label-md">
                        総スタッフ数
                    </p>
                    <p className="text-display-lg font-display-lg text-primary mt-xs">
                        {employees.length}
                        <span className="text-body-sm font-body-sm text-on-surface-variant">
                            名
                        </span>
                    </p>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-soft">
                    <p className="text-on-surface-variant font-label-md"></p>
                    <p className="text-display-lg font-display-lg text-primary mt-xs">
                        <span className="text-body-sm font-body-sm text-on-surface-variant"></span>
                    </p>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-soft">
                    <p className="text-on-surface-variant font-label-md"></p>
                    <p className="text-display-lg font-display-lg text-primary mt-xs">
                        <span className="text-body-sm font-body-sm text-on-surface-variant"></span>
                    </p>
                </div>
                <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-soft">
                    <p className="text-on-surface-variant font-label-md"></p>
                    <p className="text-display-lg font-display-lg text-primary mt-xs">
                        <span className="text-body-sm font-body-sm text-on-surface-variant"></span>
                    </p>
                </div>
            </div>
            {/* Table Section */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-soft overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-surface-container-low border-b border-outline-variant">
                        <tr>
                            <th className="px-lg py-md font-label-lg text-label-lg text-on-surface-variant">
                                名前
                            </th>
                            <th className="px-lg py-md font-label-lg text-label-lg text-on-surface-variant">
                                メールアドレス
                            </th>
                            <th className="px-lg py-md font-label-lg text-label-lg text-on-surface-variant">
                                権限
                            </th>
                            <th className="px-lg py-md font-label-lg text-label-lg text-on-surface-variant"></th>
                            <th className="px-lg py-md font-label-lg text-label-lg text-on-surface-variant text-right">
                                操作
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                        {/* Row 1 */}
                        {employees.map((employee) => {
                            return (
                                <tr
                                    className="hover:bg-surface-container-low transition-colors"
                                    onClick={() =>
                                        navigate(
                                            routes.employee.detail.build(
                                                employee.userId
                                            )
                                        )
                                    }
                                >
                                    <td className="px-lg py-md flex items-center gap-md">
                                        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden">
                                            <User className="w-full h-full p-2 object-cover" />
                                        </div>
                                        <div>
                                            <p className="font-body-md text-primary font-bold">
                                                {employee.user?.name}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-lg py-md">
                                        <p className="text-body-sm font-body-sm text-on-surface">
                                            {employee.user?.email}
                                        </p>
                                    </td>
                                    <td className="px-lg py-md">
                                        {employee.user?.role.map((role) => (
                                            <RoleBadge
                                                key={role}
                                                role={role as RoleName}
                                            />
                                        ))}
                                    </td>
                                    <td className="px-lg py-md">
                                        <span className="text-body-sm font-body-sm text-on-surface-variant"></span>
                                    </td>
                                    <td className="px-lg py-md text-right">
                                        <div className="flex justify-end gap-md">
                                            <button
                                                className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                edit
                                            </button>
                                            <button
                                                className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                }}
                                            >
                                                delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
