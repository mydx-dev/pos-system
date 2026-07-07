import { RegisterTerminalAuthContext } from '@/context/RegisterTerminalAuthContext';
import { useContext } from 'react';

export const useRegisterTerminalAuth = () => {
    const context = useContext(RegisterTerminalAuthContext);

    if (!context) {
        throw new Error(
            'useRegisterTerminalAuth must be used within a RegisterTerminalAuthProvider'
        );
    }

    return context;
};
