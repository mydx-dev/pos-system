import {
    createAppsScriptClient,
    FetchTransport,
} from '@mydx-dev/gas-boost-react-apps-script';
import { ALL_TABLES } from '../../backend/infrastructure/database/tables';
import { API } from '../../shared/api';
import { labels } from './AppsScriptClient';

export const { server, replica, replicaQL, job } = createAppsScriptClient<
    API,
    typeof ALL_TABLES
>(ALL_TABLES, 'local-script-id', labels, new FetchTransport());
