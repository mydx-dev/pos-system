import type { API } from '@mydx-pos/shared/api';
import { ok } from '../http';

type RpcName = keyof API;

export const rpc = async (name: string) => {
    switch (name as RpcName) {
        case 'isSetupCompleted':
            return ok(false);
        default:
            return null;
    }
};
