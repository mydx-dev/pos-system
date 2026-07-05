import {
    createAppsScriptClient,
    FetchTransport,
} from '@mydx-dev/gas-boost-react-apps-script';
import { ALL_TABLES } from '../../backend/infrastructure/database/tables';
import { API } from '../../shared/api';
import { labels } from './AppsScriptClientLabels';

const adminClient = createAppsScriptClient<API, typeof ALL_TABLES>(
    ALL_TABLES,
    'pos-system-admin',
    labels,
    new FetchTransport()
);

const registerClient = createAppsScriptClient<API, typeof ALL_TABLES>(
    ALL_TABLES,
    'pos-system-register',
    labels,
    new FetchTransport()
);

export const { server, replica, replicaQL, job } = adminClient;

export const {
    replica: registerReplica,
    replicaQL: registerReplicaQL,
    job: registerJob,
} = registerClient;
