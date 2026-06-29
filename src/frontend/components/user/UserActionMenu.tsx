import { User } from '@/../shared/domain/entity/User';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CircleX,
    MoreVertical,
    SquarePen,
    Trash2,
    UserRoundCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '../../../shared/routes';
import { useApproveUser } from '../../hooks/useApproveUser';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteUser } from '../../hooks/useDeleteUser';
import { useUnapproveUser } from '../../hooks/useUnapproveUser';

export const UserActionMenu = ({ user }: { user: User }) => {
    const { sessionToken } = useAuth();
    const navigate = useNavigate();

    const approveUser = useApproveUser();
    const unapproveUser = useUnapproveUser();
    const deleteUser = useDeleteUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <MoreVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white shadow-md rounded-md p-2">
                <DropdownMenuItem
                    onClick={() => navigate(routes.user.edit.build(user.id))}
                >
                    <SquarePen className="w-4 h-4 mr-2" />
                    編集
                </DropdownMenuItem>
                {user.approval ? (
                    <DropdownMenuItem
                        onClick={() =>
                            unapproveUser.mutate({
                                sessionToken: sessionToken!,
                                user,
                            })
                        }
                    >
                        <CircleX className="w-4 h-4 mr-2" />
                        承認取消
                    </DropdownMenuItem>
                ) : (
                    <DropdownMenuItem
                        onClick={() =>
                            approveUser.mutate({
                                sessionToken: sessionToken!,
                                user,
                            })
                        }
                    >
                        <UserRoundCheck className="w-4 h-4 mr-2" />
                        承認する
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem
                    className="text-red-500 focus:text-red-500"
                    onClick={() =>
                        deleteUser.mutate({ sessionToken: sessionToken!, user })
                    }
                >
                    <Trash2 className="w-4 h-4 mr-2" />
                    削除する
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
