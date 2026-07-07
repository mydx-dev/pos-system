import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSyncDatabaseRegisterTerminal } from '../../hooks/useSyncDatabaseRegisterTerminal';
import { BottomNav } from './RegisterBottomNav';
import { RegisterHeader } from './RegisterHeader';

export const RegisterLayout = () => {
    const { mutate: syncDatabase, isPending } =
        useSyncDatabaseRegisterTerminal();

    useEffect(() => {
        syncDatabase();
    }, [syncDatabase]);

    return (
        <div className="h-screen overflow-hidden bg-[#f7fafc]">
            <RegisterHeader />

            <div className="h-full overflow-hidden pb-16 pt-16">
                {isPending && (
                    <div className="flex h-10 items-center justify-center gap-2 border-b border-[#c6c6cc] bg-white text-sm font-bold text-primary">
                        <Loader2 className="size-4 animate-spin" />
                        レジ端末データを同期中...
                    </div>
                )}
                <main className="h-full min-w-0 overflow-hidden">
                    <Outlet />
                </main>
            </div>

            <BottomNav />
        </div>
    );
};
