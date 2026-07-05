import { routes } from '@/../shared/routes';
import { UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { JobList } from '../../components/job/JobList';
import { SyncButtonRegisterTerminal } from '../../components/job/SyncButtonRegisterTerminal';

export const RegisterHeader = () => {
    const navigate = useNavigate();
    return (
        <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-[#c6c6cc] bg-white px-4 shadow-sm md:px-6">
            <div className="flex items-center gap-3">
                <button
                    className="flex h-10 items-center gap-2 rounded-lg border border-[#c6c6cc] bg-white px-3 text-sm font-bold transition-colors hover:bg-[#f1f4f6]"
                    type="button"
                    onClick={() => navigate(routes.customer.list)}
                >
                    <UserRound className="size-4" />
                    管理画面
                </button>
            </div>

            <div className="flex items-center">
                <SyncButtonRegisterTerminal />
                <JobList />
            </div>
        </header>
    );
};
