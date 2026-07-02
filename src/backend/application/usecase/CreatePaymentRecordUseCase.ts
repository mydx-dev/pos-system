import {
    ForbiddenError,
    InvalidArgumentError,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    CreatePaymentRecordRequest,
    CreatePaymentRecordResponse,
} from '../../../shared/api/paymentRecord';
import { Treatment } from '../../../shared/domain/entity/Treatment';
import {
    ALL_TABLES,
    PaymentRecordTable,
} from '../../infrastructure/database/tables';
import { ExistsCheck } from '../service/ExistsCheck';
import { PermissionCheck } from '../service/PermissionCheck';

export class CreatePaymentRecordUseCase {
    constructor(
        private readonly permissionCheck: PermissionCheck,
        private readonly db: SheetDB<typeof ALL_TABLES>,
        private readonly existsCheck: ExistsCheck
    ) {}

    execute(
        userId: string,
        { paymentRecord }: Pick<CreatePaymentRecordRequest, 'paymentRecord'>
    ): CreatePaymentRecordResponse {
        if (!userId) {
            throw new InvalidArgumentError('User ID is required');
        }

        if (!this.permissionCheck.isApprovedSystemAdminOrEmployee(userId)) {
            throw new ForbiddenError(
                'You do not have permission to perform this action'
            );
        }

        if (!this.existsCheck.hasTreatment(paymentRecord.施術ID)) {
            throw new InvalidArgumentError('Treatment not found');
        }

        const treatment = this.db
            .table('施術')
            .find(
                this.db
                    .query('施術')
                    .and('ID', '=', [paymentRecord.施術ID])
                    .join('ID', '精算履歴', '施術ID')
            )[0];

        if (
            !treatment.canCreatePaymentRecord(
                paymentRecord.種別,
                paymentRecord.金額,
                paymentRecord.対象精算ID
            )
        ) {
            throw new InvalidArgumentError('Invalid payment record');
        }

        const { savedPaymentRecord, savedTreatment } = this.db.transaction(
            () => {
                const savedPaymentRecord = this.db.table('精算履歴').create([
                    {
                        施術ID: paymentRecord.施術ID,
                        種別: paymentRecord.種別,
                        金額: paymentRecord.金額,
                        支払方法: paymentRecord.支払方法,
                        発生日時: new Date().toISOString(),
                        備考: paymentRecord.備考,
                        対象精算ID: paymentRecord.対象精算ID,
                        バージョン: 1,
                    },
                ])[0];

                const savedTreatment =
                    savedPaymentRecord.isPaid && treatment.status !== '精算済み'
                        ? this.db
                              .table('施術')
                              .update([
                                  new Treatment(
                                      treatment.id,
                                      treatment.customerId,
                                      treatment.staffId,
                                      '精算済み',
                                      treatment.startAt,
                                      treatment.duration,
                                      treatment.note,
                                      treatment.version
                                  ),
                              ])[0]
                        : null;

                return { savedPaymentRecord, savedTreatment };
            }
        );

        const updatedTreatment = this.db
            .table('施術')
            .find(
                this.db
                    .query('施術')
                    .and('ID', '=', [paymentRecord.施術ID])
                    .join('ID', '精算履歴', '施術ID')
            )[0];

        return {
            paymentRecord: PaymentRecordTable.serialize(savedPaymentRecord),
            treatment: savedTreatment
                ? {
                      ID: savedTreatment.id,
                      状態: savedTreatment.status,
                      バージョン: savedTreatment.version,
                  }
                : null,
            summary: {
                精算合計: updatedTreatment.paidTotal,
                取消合計: updatedTreatment.cancelTotal,
                返金合計: updatedTreatment.repaymentTotal,
                差引売上: updatedTreatment.currentSales,
            },
        };
    }
}
