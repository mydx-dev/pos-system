import { createAppsScriptClient } from '@mydx-dev/gas-boost-react-apps-script';
import { ALL_TABLES } from '../../backend/infrastructure/database/tables';
import { API, SSR } from '@mydx-pos/shared/api';
import { labels } from './AppsScriptClientLabels';

export const ssr: SSR = {
    scriptId: window.__SSR__.scriptId,
    isSetupCompleted: window.__SSR__.isSetupCompleted,
    isTermsAccepted: window.__SSR__.isTermsAccepted,
};

const adminClient = createAppsScriptClient<API, typeof ALL_TABLES>(
    ALL_TABLES,
    'pos-system-admin',
    labels
);

const registerClient = createAppsScriptClient<API, typeof ALL_TABLES>(
    ALL_TABLES,
    'pos-system-register',
    labels
);

export const { server, replica, replicaQL, job } = adminClient;

export const {
    replica: registerReplica,
    replicaQL: registerReplicaQL,
    job: registerJob,
} = registerClient;
