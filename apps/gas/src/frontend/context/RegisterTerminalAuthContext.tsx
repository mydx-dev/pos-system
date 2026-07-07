import { createContext, useState } from 'react';
import { registerReplica } from '../lib/AppsScriptClient';

type RegisterTerminalAuthContextType = {
    registerTerminalToken: string | null;
    login: (token: string) => void;
    logout: () => Promise<void>;
};

export const RegisterTerminalAuthContext =
    createContext<RegisterTerminalAuthContextType | null>(null);

export const RegisterTerminalAuthProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [token, setToken] = useState<string | null>(
        localStorage.getItem('registerTerminalToken')
    );

    const login = (token: string) => {
        setToken(token);
        localStorage.setItem('registerTerminalToken', token);
    };

    const logout = async () => {
        setToken(null);
        localStorage.removeItem('registerTerminalToken');
        await registerReplica.delete();
        await registerReplica.open();
    };

    return (
        <RegisterTerminalAuthContext.Provider
            value={{ registerTerminalToken: token, login, logout }}
        >
            {children}
        </RegisterTerminalAuthContext.Provider>
    );
};
