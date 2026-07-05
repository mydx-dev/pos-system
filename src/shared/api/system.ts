import { z } from 'zod';
import {
    CustomerTable,
    EmployeeTable,
    MenuCategoryTable,
    MenuTable,
    PaymentRecordTable,
    RoleTable,
    TreatmentMenuTable,
    TreatmentTable,
    UserTable,
} from '../../backend/infrastructure/database/tables';

export type PullDatabaseInput = {
    sessionToken: string;
};

type SyncTable = {
    name: string;
    primaryKey: string;
};

export type PullDatabaseOutput = Array<
    | {
          table: SyncTable;
          records: ReturnType<typeof UserTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof RoleTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof TreatmentTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof MenuTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof TreatmentMenuTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof PaymentRecordTable.serialize>[];
      }
>;

export const pullDatabaseRegisterTerminalInput = z.object({
    registerTerminalToken: z.string(),
});

export type PullDatabaseRegisterTerminalInput = z.infer<
    typeof pullDatabaseRegisterTerminalInput
>;

export type PullDatabaseRegisterTerminalOutput = Array<
    | {
          table: SyncTable;
          records: ReturnType<typeof CustomerTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof EmployeeTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof UserTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof TreatmentTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof TreatmentMenuTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof MenuTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof MenuCategoryTable.serialize>[];
      }
    | {
          table: SyncTable;
          records: ReturnType<typeof PaymentRecordTable.serialize>[];
      }
>;
