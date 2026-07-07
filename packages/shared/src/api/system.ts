import { z } from 'zod';
import {
    customerSchema,
    employeeSchema,
    menuCategorySchema,
    menuSchema,
    paymentRecordSchema,
    permissionSchema,
    treatmentMenuSchema,
    treatmentSchema,
    userSchema,
} from '../schemas/database';

export type PullDatabaseInput = {
    sessionToken: string;
};

type SyncTable = {
    name: string;
    primaryKey: string;
};

type SyncRecord<T extends z.ZodType> = z.infer<T>;

export type PullDatabaseOutput = Array<
    | {
          table: SyncTable;
          records: SyncRecord<typeof userSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof permissionSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof treatmentSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof menuSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof treatmentMenuSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof paymentRecordSchema>[];
      }
>;

export const pullDatabaseRegisterTerminalInput = z.object({
    registerTerminalToken: z.string(),
});

/**
 * Legacy compatibility API for the GAS / Spreadsheet-era register sync model.
 * New register screen implementations should use purpose-specific register APIs.
 */
export type PullDatabaseRegisterTerminalInput = z.infer<
    typeof pullDatabaseRegisterTerminalInput
>;

export type PullDatabaseRegisterTerminalOutput = Array<
    | {
          table: SyncTable;
          records: SyncRecord<typeof customerSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof employeeSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof userSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof treatmentSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof treatmentMenuSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof menuSchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof menuCategorySchema>[];
      }
    | {
          table: SyncTable;
          records: SyncRecord<typeof paymentRecordSchema>[];
      }
>;
