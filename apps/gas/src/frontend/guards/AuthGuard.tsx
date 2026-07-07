import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export const AuthGuard = () => {
    const { userId: user, sessionToken } = useAuth();

    /**
     * 未ログイン
     */
    if (!user || !sessionToken) return <Navigate to="/login" replace />;

    /**
     * ログイン済み
     */
    return <Outlet />;
};
