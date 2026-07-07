import { useInitialize } from '@/hooks/useInitialize';
import { Navigate, Outlet } from 'react-router-dom';

export const InitializeGuard = () => {
    const { isSetupCompleted, isTermsAccepted } = useInitialize();

    /**
     * セットアップが終わっていないもしくは、利用規約に同意していない
     */
    if (!isSetupCompleted || !isTermsAccepted) {
        return <Navigate to="/initialize" replace />;
    }

    /**
     * セットアップと利用規約の同意が完了している
     */
    return <Outlet />;
};
