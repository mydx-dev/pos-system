import {
    RoleTable,
    UserTable,
} from '../../backend/infrastructure/database/tables';

export type PullDatabaseInput = {
    sessionToken: string;
};

export type PullDatabaseOutput = Array<
    | {
          table: typeof UserTable;
          records: ReturnType<typeof UserTable.serialize>[];
      }
    | {
          table: typeof RoleTable;
          records: ReturnType<typeof RoleTable.serialize>[];
      }
>;
