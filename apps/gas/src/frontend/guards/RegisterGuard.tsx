import { Navigate, Outlet } from 'react-router-dom';
import { routes } from '../../shared/routes';
import { registerTerminalTokenStorageKey } from '../hooks/useLoginRegisterTerminal';

export const RegisterGuard = () => {
    const token = localStorage.getItem(registerTerminalTokenStorageKey);

    if (!token) {
        return <Navigate to={routes.register.login} replace />;
    }

    return <Outlet />;
};
