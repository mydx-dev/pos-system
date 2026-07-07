import { createContext, useState } from 'react';
import { ssr } from '../lib/AppsScriptClient';

type InitializeContextType = {
    scriptId: string;
    isSetupCompleted: boolean;
    setup: () => void;
    isTermsAccepted: boolean;
    acceptTerms: () => void;
};

export const InitializeContext = createContext<InitializeContextType | null>(
    null
);

export const InitializeProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [isSetupCompleted, setIsSetupCompleted] = useState<boolean>(
        ssr.isSetupCompleted
    );
    const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(
        ssr.isTermsAccepted
    );

    const setup = () => setIsSetupCompleted(true);
    const acceptTerms = () => setIsTermsAccepted(true);

    return (
        <InitializeContext.Provider
            value={{
                scriptId: ssr.scriptId,
                isSetupCompleted,
                setup,
                isTermsAccepted,
                acceptTerms,
            }}
        >
            {children}
        </InitializeContext.Provider>
    );
};
