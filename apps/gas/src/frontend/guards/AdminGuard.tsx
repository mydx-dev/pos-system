import { useAuth } from '@/hooks/useAuth';
import { Navigate, Outlet } from 'react-router-dom';

export const AdminGuard = () => {
    const { user } = useAuth();

    /**
     * 未ログイン
     */
    if (!user || !user.isAdmin()) return <Navigate to="/login" replace />;

    /**
     * ログイン済み
     */
    return (
        <>
            <Outlet />
        </>
    );
};
