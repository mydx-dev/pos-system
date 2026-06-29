import { icon, systemName } from '@/../shared/config';
import { server } from '@/lib/AppsScriptClient';
import { useMutation } from '@tanstack/react-query';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { routes } from '../../../shared/routes';
import { JobList } from '../../components/job/JobList';
import { SyncButton } from '../../components/job/SyncButton';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '../../components/ui/dropdown-menu';
import { useAuth } from '../../hooks/useAuth';
import { subNavigations } from './Navigations';

export const Header = () => {
    const { logout, sessionToken, user } = useAuth();
    const navigate = useNavigate();
    const { mutate, isPending } = useMutation({
        mutationFn: () => {
            const toastId = toast.loading('ログアウト中...');
            return server.logoutUser(sessionToken!).finally(() => {
                toast.dismiss(toastId);
            });
        },
        onSuccess: () => {
            logout();
        },
        onError: () => {
            toast.error('ログアウトに失敗しました。再度お試しください');
        },
    });

    return (
        <header className="bg-[#f7fafc] dark:bg-slate-900 flex justify-between items-center w-full px-6 h-16 fixed top-0 z-40 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary-container hidden sm:flex">
                    <span className="material-symbols-outlined text-sm">
                        {icon}
                    </span>
                </div>
                <h1 className="text-primary text-sm md:text-lg dark:text-blue-400 font-manrope font-bold tracking-tight">
                    {systemName}
                </h1>
            </div>
            <div className="flex items-center">
                <SyncButton />
                <JobList />
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={
                            <button
                                type="button"
                                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-accent transition-colors"
                            >
                                <Avatar className="h-9 w-9">
                                    <AvatarFallback>
                                        <User className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>

                                <span className="hidden md:block text-sm font-medium max-w-32 truncate">
                                    {user?.name || 'ユーザー'}
                                </span>
                            </button>
                        }
                    />

                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuGroup>
                            <DropdownMenuLabel>
                                マイアカウント
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                                onClick={() => navigate(routes.user.profile)}
                            >
                                <User className="mr-2 h-4 w-4" />
                                プロフィール
                            </DropdownMenuItem>

                            {subNavigations.length > 0 && (
                                <div className="md:hidden">
                                    <DropdownMenuSeparator />
                                    <DropdownMenuLabel>環境</DropdownMenuLabel>

                                    {subNavigations.map((nav) => (
                                        <DropdownMenuItem
                                            key={nav.label}
                                            onClick={() => navigate(nav.to)}
                                        >
                                            <nav.icon className="mr-2 h-4 w-4" />
                                            {nav.label}
                                        </DropdownMenuItem>
                                    ))}
                                </div>
                            )}

                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                onClick={() => mutate()}
                                className="text-red-500 focus:text-red-500"
                                disabled={isPending}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                ログアウト
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
