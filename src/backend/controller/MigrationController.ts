import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { ALL_TABLES } from '../infrastructure/database/tables';

export class MigrationController {
    constructor(private readonly db: SheetDB<typeof ALL_TABLES>) {}

    execute(): void {
        this.db.migrate();
    }
}
