import { SheetDB } from '@mydx-dev/gas-boost-runtime/core';
import { ALL_TABLES } from '../../infrastructure/database/tables';

export class ExistsCheck {
    private menuIdCache: Set<string> | null = null;

    constructor(private readonly db: SheetDB<typeof ALL_TABLES>) {}

    hasCustomer(customerId: string): boolean {
        return (
            this.db
                .table('顧客')
                .find(this.db.query('顧客').and('ID', '=', [customerId]))
                .length > 0
        );
    }

    hasStaff(staffId: string): boolean {
        return (
            this.db
                .table('スタッフ')
                .find(
                    this.db.query('スタッフ').and('ユーザーID', '=', [staffId])
                ).length > 0
        );
    }

    hasTreatment(treatmentId: string): boolean {
        return (
            this.db
                .table('施術')
                .find(this.db.query('施術').and('ID', '=', [treatmentId]))
                .length > 0
        );
    }

    cacheMenuIds(menuIds: string[]): void {
        this.menuIdCache = new Set(menuIds);
    }

    hasMenu(menuId: string): boolean {
        if (this.menuIdCache) {
            return this.menuIdCache.has(menuId);
        }

        return (
            this.db
                .table('メニュー')
                .find(this.db.query('メニュー').and('ID', '=', [menuId]))
                .length > 0
        );
    }
}
