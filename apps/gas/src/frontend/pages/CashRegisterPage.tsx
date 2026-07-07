import { Customer } from '@/../shared/domain/entity/Customer';
import { PaymentRecord } from '@/../shared/domain/entity/PaymentRecord';
import { Treatment } from '@/../shared/domain/entity/Treatment';
import { TreatmentMenu } from '@/../shared/domain/entity/TreatmentMenu';
import { ReceiptData } from '@/../shared/domain/valueObject/Receipt';
import { CashRegisterModal } from '@/components/register/CashRegisterModal';
import { CashRegisterTreatmentDetail } from '@/components/register/CashRegisterTreatmentDetail';
import {
    CashRegisterStatusFilter,
    CashRegisterTreatmentList,
} from '@/components/register/CashRegisterTreatmentList';
import { CashRegisterTreatmentSummary } from '@/components/register/CashRegisterTreatmentSummary';
import {
    dateKey,
    RegisterOperation,
    today,
} from '@/components/register/cashRegisterUtils';
import { PrinterConfigModal } from '@/components/register/PrinterConfigModal';
import { useCreatePaymentRecord } from '@/hooks/useCreatePaymentRecord';
import { useReceiptPrinter } from '@/hooks/useReceiptPrinter';
import { registerReplicaQL } from '@/lib/AppsScriptClient';
import { type CharacterEncoding, type Command } from '@mydx-pos/printer';
import { useLiveQuery } from 'dexie-react-hooks';
import { useMemo, useState } from 'react';

const printerCharacterEncodings: CharacterEncoding[] = [
    'gb18030',
    'cp932',
    'shiftjis',
];
const printerCommands: Command[] = [
    'escpos',
    'epson',
    'sii',
    'citizen',
    'starsbcs',
    'starmbcs',
    'starmbcs2',
];

const receiptNo = (paymentRecordId: string, occurredAt: string) => {
    const date = new Date(occurredAt);
    const datePart = [
        date.getFullYear(),
        `${date.getMonth() + 1}`.padStart(2, '0'),
        `${date.getDate()}`.padStart(2, '0'),
    ].join('');
    return `${datePart}-${paymentRecordId.slice(0, 8).toUpperCase()}`;
};

const storeInfo = () => ({
    name: import.meta.env.VITE_STORE_NAME,
    postalCode: import.meta.env.VITE_STORE_POSTAL_CODE,
    address1: import.meta.env.VITE_STORE_ADDRESS1,
    address2: import.meta.env.VITE_STORE_ADDRESS2,
    phoneNumber: import.meta.env.VITE_STORE_PHONE,
    message: import.meta.env.VITE_STORE_MESSAGE,
});

export const CashRegisterPage = () => {
    const employeeQuery = useMemo(
        () =>
            registerReplicaQL
                .query('スタッフ')
                .join('ユーザーID', 'ユーザー', 'ID'),
        []
    );
    const employees = useLiveQuery(async () => {
        const result = await registerReplicaQL
            .table('スタッフ')
            .find(employeeQuery);
        return result;
    }, [employeeQuery]);
    const treatments = useLiveQuery(async () => {
        const query = registerReplicaQL
            .query('施術')
            .join('顧客ID', '顧客', 'ID')
            .join('ID', '施術メニュー', '施術ID')
            .join('ID', '精算履歴', '施術ID');
        const result = await registerReplicaQL.table('施術').find(query);
        return result as Treatment[];
    }, []);

    const createPaymentRecord = useCreatePaymentRecord();
    const receiptPrinter = useReceiptPrinter();

    const [date, setDate] = useState(today);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<CashRegisterStatusFilter>('来店済み');
    const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
    const [operation, setOperation] = useState<RegisterOperation | null>(null);
    const [operationAmount, setOperationAmount] = useState(0);
    const [operationPaidAmount, setOperationPaidAmount] = useState(0);
    const [operationNote, setOperationNote] = useState('');
    const [isEncodingModalOpen, setIsEncodingModalOpen] = useState(false);
    const [selectedEncoding, setSelectedEncoding] =
        useState<CharacterEncoding>('gb18030');
    const [selectedCommand, setSelectedCommand] = useState<Command>('escpos');
    const [selectedReceiptWidth, setSelectedReceiptWidth] = useState(42);
    const [encodingAction, setEncodingAction] = useState<
        'connect' | 'checkout' | null
    >(null);

    const employeeNameById = useMemo(
        () =>
            new Map(
                (employees ?? []).map((employee) => [
                    employee.userId,
                    employee.user?.name ?? employee.userId,
                ])
            ),
        [employees]
    );

    const rows = useMemo(
        () =>
            (treatments ?? [])
                .filter((treatment) => dateKey(treatment.startAt) === date)
                .filter((treatment) =>
                    status === 'all' ? true : treatment.status === status
                )
                .filter((treatment) => {
                    const customer = treatment.getRelation(Customer)[0];
                    return customer?.name
                        .toLowerCase()
                        .includes(search.trim().toLowerCase());
                })
                .sort(
                    (a, b) =>
                        new Date(a.startAt).getTime() -
                        new Date(b.startAt).getTime()
                ),
        [date, search, status, treatments]
    );

    const selectedTreatment =
        rows.find((treatment) => treatment.id === selectedTreatmentId) ??
        rows[0] ??
        null;
    const customer = selectedTreatment?.getRelation(Customer)[0] ?? null;
    const menus =
        selectedTreatment
            ?.getRelation(TreatmentMenu)
            .sort((a, b) => a.displayOrder - b.displayOrder) ?? [];
    const paymentRecords =
        selectedTreatment
            ?.getRelation(PaymentRecord)
            .sort(
                (a, b) =>
                    new Date(a.occurredAt).getTime() -
                    new Date(b.occurredAt).getTime()
            ) ?? [];
    const treatmentTotal = menus.reduce(
        (sum, menu) =>
            sum +
            menu.quantity *
                Math.max(0, menu.regularPrice - menu.discountAmount),
        0
    );
    const currentSales = selectedTreatment?.currentSales ?? 0;
    const canCancel = currentSales > 0;
    const canRefund = currentSales > 0;
    const staffName = selectedTreatment
        ? (employeeNameById.get(selectedTreatment.staffId) ?? null)
        : null;

    const buildReceipt = (
        paymentRecord:
            | PaymentRecord
            | {
                  ID: string;
                  種別: '精算' | '取消' | '返金';
                  金額: number;
                  支払方法: '現金';
                  発生日時: string;
              },
        tenderedAmount?: number
    ): ReceiptData | null => {
        const isPaymentRecordEntity = paymentRecord instanceof PaymentRecord;
        const paymentRecordType = isPaymentRecordEntity
            ? paymentRecord.type
            : paymentRecord.種別;

        if (!selectedTreatment || paymentRecordType !== '精算') {
            return null;
        }

        const paymentRecordId = isPaymentRecordEntity
            ? paymentRecord.id
            : paymentRecord.ID;
        const paidAt = isPaymentRecordEntity
            ? paymentRecord.occurredAt
            : paymentRecord.発生日時;
        const recordAmount = isPaymentRecordEntity
            ? paymentRecord.amount
            : paymentRecord.金額;
        const paymentMethod = isPaymentRecordEntity
            ? paymentRecord.paymentMethod
            : paymentRecord.支払方法;
        const itemSubtotal = menus.reduce(
            (sum, menu) => sum + menu.quantity * menu.regularPrice,
            0
        );
        const discountTotal = menus.reduce(
            (sum, menu) => sum + menu.quantity * menu.discountAmount,
            0
        );

        return {
            receiptNo: receiptNo(paymentRecordId, paidAt),
            paymentRecordId,
            treatmentId: selectedTreatment.id,
            issuedAt: new Date().toISOString(),
            paidAt,
            paymentMethod,
            customerName: customer?.name,
            staffName,
            store: storeInfo(),
            items: menus.map((menu) => ({
                name: menu.menuName,
                quantity: menu.quantity,
                regularPrice: menu.regularPrice,
                discountAmount: menu.discountAmount,
                subtotal:
                    menu.quantity *
                    Math.max(0, menu.regularPrice - menu.discountAmount),
            })),
            subtotal: itemSubtotal,
            discountTotal,
            total: itemSubtotal - discountTotal,
            paidAmount: tenderedAmount ?? recordAmount,
        };
    };

    const openPrinterConfig = (action: 'connect' | 'checkout' | null) => {
        setSelectedEncoding(receiptPrinter.characterEncoding ?? 'gb18030');
        setSelectedCommand(receiptPrinter.command ?? 'escpos');
        setSelectedReceiptWidth(receiptPrinter.receiptWidth || 42);
        setEncodingAction(action);
        setIsEncodingModalOpen(true);
    };

    const startOperation = (nextOperation: RegisterOperation) => {
        if (!selectedTreatment) return;
        setOperation(nextOperation);
        setOperationNote('');
        const nextAmount =
            nextOperation === '精算'
                ? Math.max(0, treatmentTotal)
                : currentSales;
        setOperationAmount(nextAmount);
    };

    const submitOperation = async (isPrinterConfigConfigured = false) => {
        if (!selectedTreatment || !operation) return;
        const shouldPrintReceipt = operation === '精算';
        let canPrintReceipt = receiptPrinter.isConnected;

        if (
            shouldPrintReceipt &&
            (!receiptPrinter.characterEncoding || !receiptPrinter.command) &&
            !isPrinterConfigConfigured
        ) {
            openPrinterConfig('checkout');
            return;
        }

        if (shouldPrintReceipt && !canPrintReceipt) {
            try {
                await receiptPrinter.connect();
                canPrintReceipt = true;
            } catch {
                canPrintReceipt = false;
            }
        }

        const targetPaymentRecordId =
            operation === '精算'
                ? null
                : (paymentRecords.find((record) => record.isPaid)?.id ?? null);

        const response = await createPaymentRecord.mutateAsync({
            施術ID: selectedTreatment.id,
            種別: operation,
            金額: operationAmount,
            支払方法: '現金',
            備考: operationNote.trim() || null,
            対象精算ID: targetPaymentRecordId,
        });
        const receipt = buildReceipt(
            response.paymentRecord,
            operation === '精算' ? operationPaidAmount : undefined
        );
        if (receipt) {
            receiptPrinter.rememberReceipt(receipt);
            if (canPrintReceipt) {
                try {
                    await receiptPrinter.print(receipt);
                } catch {
                    // 精算レコードは登録済みなので、印字失敗時も処理は完了させる。
                }
            }
        }

        setOperation(null);
        setOperationAmount(0);
        setOperationPaidAmount(0);
        setOperationNote('');
    };

    const savePrinterConfig = () => {
        receiptPrinter.savePrinterConfig({
            characterEncoding: selectedEncoding,
            command: selectedCommand,
            receiptWidth: selectedReceiptWidth,
        });
        setIsEncodingModalOpen(false);

        if (encodingAction === 'checkout') {
            void submitOperation(true);
        }
        if (encodingAction === 'connect') {
            void receiptPrinter.connect();
        }
        setEncodingAction(null);
    };

    const reprintRecord = (record: PaymentRecord) => {
        const receipt = buildReceipt(record);
        if (receipt) {
            void receiptPrinter.print(receipt);
        }
    };

    if (!treatments || !employees) {
        return (
            <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center">
                <p className="text-sm text-on-surface-variant">
                    レジ情報を取得中...
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f7fafc] text-[#181c1e]">
            <main className="grid h-full min-h-0 grid-rows-[minmax(220px,32%)_minmax(0,1fr)_auto] overflow-hidden md:grid-cols-[390px_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)_auto]">
                <CashRegisterTreatmentList
                    date={date}
                    search={search}
                    status={status}
                    rows={rows}
                    selectedTreatment={selectedTreatment}
                    employeeNameById={employeeNameById}
                    onDateChange={setDate}
                    onSearchChange={setSearch}
                    onStatusChange={setStatus}
                    onTreatmentSelect={setSelectedTreatmentId}
                />

                <CashRegisterTreatmentDetail
                    selectedTreatment={selectedTreatment}
                    customerName={customer?.name ?? null}
                    staffName={staffName}
                    menus={menus}
                    paymentRecords={paymentRecords}
                    isPrinterPrinting={receiptPrinter.isPrinting}
                    onOpenPrinterConfig={() => openPrinterConfig(null)}
                    onReprintRecord={reprintRecord}
                />

                <CashRegisterTreatmentSummary
                    treatmentTotal={treatmentTotal}
                    currentSales={currentSales}
                    canCancel={canCancel}
                    canRefund={canRefund}
                    hasSelectedTreatment={!!selectedTreatment}
                    onStartOperation={startOperation}
                />
            </main>

            {operation && (
                <CashRegisterModal
                    operation={operation}
                    amount={operationAmount}
                    paidAmount={operationPaidAmount}
                    note={operationNote}
                    isPending={createPaymentRecord.isPending}
                    onAmountChange={setOperationAmount}
                    onPaidAmountChange={setOperationPaidAmount}
                    onNoteChange={setOperationNote}
                    onClose={() => setOperation(null)}
                    onSubmit={submitOperation}
                />
            )}
            {isEncodingModalOpen && (
                <PrinterConfigModal
                    deviceName={receiptPrinter.deviceName}
                    encodings={printerCharacterEncodings}
                    commands={printerCommands}
                    selectedEncoding={selectedEncoding}
                    selectedCommand={selectedCommand}
                    receiptWidth={selectedReceiptWidth}
                    isConnected={receiptPrinter.isConnected}
                    isConnecting={receiptPrinter.isConnecting}
                    isPrinting={receiptPrinter.isPrinting}
                    hasLastReceipt={!!receiptPrinter.lastReceipt}
                    action={encodingAction}
                    onEncodingChange={setSelectedEncoding}
                    onCommandChange={setSelectedCommand}
                    onReceiptWidthChange={setSelectedReceiptWidth}
                    onConnectPrinter={() => void receiptPrinter.connect()}
                    onReprintLast={receiptPrinter.reprintLast}
                    onSave={savePrinterConfig}
                    onClose={() => {
                        setIsEncodingModalOpen(false);
                        setEncodingAction(null);
                    }}
                    removeDevice={() => {
                        receiptPrinter.removeDevice();
                    }}
                />
            )}
        </div>
    );
};
