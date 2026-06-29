import { useSyncDatabase } from '@/hooks/useSyncDatabase';
import { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../../shared/domain/entity/User';
import { routes } from '../../shared/routes';

type AuthContextType = {
    userId: string | null;
    sessionToken: string | null;
    user: User | null;
    login: (userId: string, token: string) => void;
    logout: () => void;
    syncUser: (user: User) => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [userId, setUserId] = useState<string | null>(null);
    const [sessionToken, setSessionToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const navigate = useNavigate();
    const { mutate } = useSyncDatabase({ userId, syncUser: setUser });

    const login = async (userId: string, token: string) => {
        setUserId(userId);
        setSessionToken(token);
        localStorage.setItem('sessionToken', token);
        mutate(token);
        navigate(routes.user.list);
    };
    const logout = () => {
        setUserId(null);
        setSessionToken(null);
        setUser(null);
        localStorage.removeItem('sessionToken');
        navigate(routes.user.login);
    };
    return (
        <AuthContext.Provider
            value={{
                userId,
                sessionToken,
                login,
                logout,
                syncUser: setUser,
                user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
