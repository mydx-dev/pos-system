import { emailSchema } from '@/../shared/schemas/form';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserApprovedBadge } from '@/components/user/UserApprovedBadge';
import { UserInfoBlock } from '@/components/user/UserInfoBlock';
import { UserInfoContent } from '@/components/user/UserInfoContent';
import { UserInfoPanel } from '@/components/user/UserInfoPanel';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    CircleX,
    Save,
    SquarePen,
    Trash2,
    User,
    UserRoundCheck,
} from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { routes } from '../../../shared/routes';
import { useApproveUser } from '../../hooks/useApproveUser';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteUser } from '../../hooks/useDeleteUser';
import { useFindUser } from '../../hooks/useFindUser';
import { useUnapproveUser } from '../../hooks/useUnapproveUser';
import { useUpdateUser } from '../../hooks/useUpdateUser';
import { replicaQL } from '../../lib/AppsScriptClient';

const userEditFormSchema = z.object({
    name: z.string().min(1, '氏名は必須です'),
    email: emailSchema,
});

const categories = ['基本情報', '設定'];

export const UserDetail = ({
    editable,
    id,
}: {
    editable: boolean;
    id: string;
}) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isValid },
    } = useForm({
        resolver: zodResolver(userEditFormSchema),
        mode: 'onChange',
    });

    const navigate = useNavigate();
    const query = replicaQL
        .query('ユーザー')
        .and('ID', '=', [id])
        .join('ID', 'ロール', 'ユーザーID');
    const users = useFindUser(query);
    const user = users?.[0];

    const { sessionToken } = useAuth();

    const approveUser = useApproveUser();
    const updateUser = useUpdateUser();
    const unapproveUser = useUnapproveUser();
    const deleteUser = useDeleteUser();

    useEffect(() => {
        if (!user) return;

        reset({
            name: user.name,
            email: user.email,
        });
    }, [user, reset]);

    if (!user) {
        return null;
    }

    const handleApprove = () => {
        approveUser.mutate({
            sessionToken: sessionToken!,
            user,
        });
    };

    const handleUnapprove = () => {
        unapproveUser.mutate({
            sessionToken: sessionToken!,
            user,
        });
    };

    const handleDelete = () => {
        deleteUser.mutate({
            sessionToken: sessionToken!,
            user,
        });
    };

    const handleSave = handleSubmit((data) =>
        updateUser.mutate({
            sessionToken: sessionToken!,
            user,
            updateParams: {
                name: data.name,
                email: data.email,
            },
        })
    );

    const handleEdit = () => {
        navigate(routes.user.edit.build(user.id));
    };

    return (
        <>
            <section className="px-8 pt-8 pb-4 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-surface-container-lowest shadow-lg">
                            <User className="w-full h-full object-cover" />
                        </div>
                        <span className="absolute bottom-1 right-1 w-6 h-6 bg-tertiary-fixed border-4 border-surface rounded-full"></span>
                    </div>

                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="md:text-xl font-headline font-extrabold tracking-tight">
                                {user.name}
                            </h1>

                            <UserApprovedBadge isApproved={user.approval} />
                        </div>

                        <p className="text-on-surface-variant font-medium mt-1">
                            {user.role?.join(', ') || ''}
                        </p>

                        <p className="text-on-surface-variant/60 text-xs font-label mt-2 tracking-widest uppercase">
                            ID: {user.id}
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    {!editable ? (
                        <>
                            {user.approval ? (
                                <button
                                    className="p-2 text-xs rounded-md bg-primary-container text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                                    onClick={handleUnapprove}
                                    disabled={unapproveUser.isPending}
                                >
                                    <CircleX className="w-4 h-4" />
                                    <span>承認取消</span>
                                </button>
                            ) : (
                                <button
                                    className="p-2 text-xs rounded-md bg-primary-container text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                                    onClick={handleApprove}
                                    disabled={approveUser.isPending}
                                >
                                    <UserRoundCheck className="w-4 h-4" />
                                    <span>承認する</span>
                                </button>
                            )}

                            <button
                                className="p-2 text-xs rounded-md bg-primary-container text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                                onClick={handleEdit}
                            >
                                <SquarePen className="w-4 h-4" />
                                <span>編集</span>
                            </button>

                            <button
                                className="p-2 text-xs rounded-md bg-primary-container text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
                                onClick={handleDelete}
                                disabled={deleteUser.isPending}
                            >
                                <Trash2 className="w-4 h-4" />
                                <span>削除</span>
                            </button>
                        </>
                    ) : (
                        <button
                            className="p-2 text-xs rounded-md bg-primary-container text-white flex items-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:pointer-events-none"
                            onClick={handleSave}
                            disabled={!isValid}
                        >
                            {updateUser.isPending ? (
                                <Spinner className="w-4 h-4" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}

                            <span>変更を保存</span>
                        </button>
                    )}
                </div>
            </section>

            <Tabs defaultValue="基本情報" className="w-full">
                <TabsList className="px-8 mt-4">
                    {categories.map((category) => (
                        <TabsTrigger key={category} value={category}>
                            {category}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <div className="flex-1 p-2 bg-surface-container-low/30 overflow-y-auto">
                    <TabsContent value="基本情報" className="px-4 mt-6">
                        <UserInfoContent>
                            <UserInfoPanel title="ユーザー情報">
                                <UserInfoBlock
                                    label="名前"
                                    value={user.name}
                                    editable={editable}
                                    register={register('name')}
                                    error={errors.name?.message}
                                />

                                <UserInfoBlock
                                    label="メールアドレス"
                                    value={user.email}
                                    editable={editable}
                                    register={register('email')}
                                    error={errors.email?.message}
                                />
                            </UserInfoPanel>
                        </UserInfoContent>
                    </TabsContent>
                </div>
            </Tabs>
        </>
    );
};
