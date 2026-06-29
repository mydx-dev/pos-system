import { useContext } from 'react';
import { InitializeContext } from '../context/InitializeContext';

export const useInitialize = () => {
    const context = useContext(InitializeContext);
    if (!context) {
        throw new Error(
            'useInitialize must be used within an InitializeProvider'
        );
    }
    return context;
};
