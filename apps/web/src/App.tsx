import {
    AlertCircle,
    Ban,
    CheckCircle2,
    HelpCircle,
    Loader2,
    LogOut,
    MonitorCheck,
    Printer as PrinterIcon,
    RefreshCcw,
    Search,
    Settings,
    Usb,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Printer,
    PrinterConfig,
    PrinterConnection,
    Receipt,
    type CharacterEncoding,
    type Command,
    type ReceiptData,
} from '@mydx-pos/printer';
import type {
    CreatePaymentRecordRequest,
    CreatePaymentRecordResponse,
} from '@mydx-pos/shared/api/paymentRecord';
import type {
    GetRegisterTreatmentDetailResponse,
    ListRegisterTreatmentsResponse,
} from '@mydx-pos/shared/api/register';
import type {
    LoginRegisterTerminalRequest,
    LoginRegisterTerminalResponse,
} from '@mydx-pos/shared/api/registerTerminal';
import type { PaymentRecordType } from '@mydx-pos/shared/domain/entity/PaymentRecord';

type ApiSuccess<T> = {
    ok: true;
    data: T;
};

type ApiFailure = {
    ok: false;
    error: {
        code: string;
        message: string;
    };
};

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
type RegisterTerminal = LoginRegisterTerminalResponse['registerTerminal'];
type TreatmentRow = ListRegisterTreatmentsResponse['treatments'][number];
type TreatmentDetail = GetRegisterTreatmentDetailResponse;
type PaymentRecord = TreatmentDetail['paymentRecords'][number];
type TreatmentMenu = TreatmentDetail['treatmentMenus'][number];
type Operation = PaymentRecordType;
type StatusFilter = '来店済み' | '予約済み' | '精算済み' | 'all';
type SelectedCharacterEncoding = NonNullable<CharacterEncoding>;
type SelectedCommand = NonNullable<Command>;

const terminalStorageKey = 'registerTerminal';
const defaultEncoding: SelectedCharacterEncoding = 'shiftjis';
const defaultCommand: SelectedCommand = 'escpos';
const defaultReceiptWidth = 42;
const printerCharacterEncodings: SelectedCharacterEncoding[] = [
    'gb18030',
    'cp932',
    'shiftjis',
];
const printerCommands: SelectedCommand[] = [
    'escpos',
    'epson',
    'sii',
    'citizen',
    'starsbcs',
    'starmbcs',
    'starmbcs2',
];

class WorkerApiError extends Error {
    constructor(
        readonly code: string,
        message: string,
        readonly status?: number
    ) {
        super(message);
        this.name = 'WorkerApiError';
    }
}

const apiBaseUrl = () =>
    (import.meta.env.VITE_WORKER_API_BASE_URL || 'http://localhost:8787')
        .toString()
        .replace(/\/+$/, '');

const rpc = async <TResponse, TRequest = unknown>(
    name: string,
    input?: TRequest
) => {
    let response: Response;

    try {
        response = await fetch(`${apiBaseUrl()}/rpc/${name}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(input ?? {}),
        });
    } catch (caught) {
        throw new WorkerApiError(
            'network_error',
            caught instanceof Error
                ? caught.message
                : 'Worker API に接続できませんでした'
        );
    }

    const body = (await response.json().catch(() => null)) as
        | ApiResponse<TResponse>
        | null;

    if (!body) {
        throw new WorkerApiError(
            'invalid_response',
            'Worker API の応答を読み取れませんでした',
            response.status
        );
    }

    if (!body.ok) {
        throw new WorkerApiError(
            body.error.code,
            body.error.message,
            response.status
        );
    }

    return body.data;
};

const registerApi = {
    loginRegisterTerminal: (input: LoginRegisterTerminalRequest) =>
        rpc<LoginRegisterTerminalResponse, LoginRegisterTerminalRequest>(
            'loginRegisterTerminal',
            input
        ),
    listRegisterTreatments: () =>
        rpc<ListRegisterTreatmentsResponse>('listRegisterTreatments'),
    getRegisterTreatmentDetail: (treatmentId: string) =>
        rpc<
            GetRegisterTreatmentDetailResponse,
            { treatmentId: string }
        >('getRegisterTreatmentDetail', {
            treatmentId,
        }),
    createPaymentRecord: (
        paymentRecord: CreatePaymentRecordRequest['paymentRecord']
    ) =>
        rpc<
            CreatePaymentRecordResponse,
            { paymentRecord: CreatePaymentRecordRequest['paymentRecord'] }
        >(
            'createPaymentRecord',
            { paymentRecord }
        ),
    logoutRegisterTerminal: () =>
        rpc<{ ok: true }>('logoutRegisterTerminal'),
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);

const formatDateTime = (iso: string) =>
    new Intl.DateTimeFormat('ja-JP', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));

const timeText = (iso: string) =>
    new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));

const dateKey = (iso: string) => {
    const date = new Date(iso);
    return [
        date.getFullYear(),
        `${date.getMonth() + 1}`.padStart(2, '0'),
        `${date.getDate()}`.padStart(2, '0'),
    ].join('-');
};

const today = dateKey(new Date().toISOString());

const normalizeTokenPart = (value: string) =>
    value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 4);

const errorMessage = (caught: unknown) => {
    if (caught instanceof WorkerApiError) {
        if (caught.code === 'unauthorized') {
            return 'レジ端末の認証に失敗しました。トークンを確認してください。';
        }
        if (caught.code === 'validation_error') {
            return '入力内容または対象データを確認してください。';
        }
        return caught.message;
    }

    if (caught instanceof Error) {
        return caught.message;
    }

    return '予期しないエラーが発生しました。';
};

const readStoredTerminal = () => {
    const value = localStorage.getItem(terminalStorageKey);
    if (!value) return null;

    try {
        return JSON.parse(value) as RegisterTerminal;
    } catch {
        return null;
    }
};

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
    name: import.meta.env.VITE_STORE_NAME || 'MYDX POS',
    postalCode: import.meta.env.VITE_STORE_POSTAL_CODE || null,
    address1: import.meta.env.VITE_STORE_ADDRESS1 || null,
    address2: import.meta.env.VITE_STORE_ADDRESS2 || null,
    phoneNumber: import.meta.env.VITE_STORE_PHONE || null,
    message: import.meta.env.VITE_STORE_MESSAGE || null,
});

const paymentRecordsSales = (records: PaymentRecord[]) =>
    records.reduce((total, record) => {
        if (record.種別 === '精算') return total + record.金額;
        if (record.種別 === '取消' || record.種別 === '返金') {
            return total - record.金額;
        }
        return total;
    }, 0);

const treatmentMenusTotal = (menus: TreatmentMenu[]) =>
    menus.reduce(
        (sum, menu) =>
            sum + menu.数量 * Math.max(0, menu.通常価格 - menu.値引き額),
        0
    );

const useReceiptPrinter = () => {
    const savedConfig = PrinterConfig.read();
    const printerRef = useRef<Printer | null>(null);
    const [printer, setPrinter] = useState<Printer | null>(null);
    const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
    const [characterEncoding, setCharacterEncoding] = useState<
        CharacterEncoding | undefined
    >(savedConfig.characterEncoding);
    const [command, setCommand] = useState<Command | undefined>(
        savedConfig.command
    );
    const [receiptWidth, setReceiptWidth] = useState<number | undefined>(
        savedConfig.receiptWidth
    );
    const [isConnecting, setIsConnecting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const [error, setError] = useState('');

    const connect = useCallback(async () => {
        setIsConnecting(true);
        setError('');

        try {
            const config = PrinterConfig.read();
            config.changeCharacterEncoding(characterEncoding ?? defaultEncoding);
            config.changeCommand(command ?? defaultCommand);
            config.changeReceiptWidth(receiptWidth || defaultReceiptWidth);
            config.save();

            const connectedPrinter = await Printer.connect();
            printerRef.current = connectedPrinter;
            setPrinter(connectedPrinter);
            return connectedPrinter;
        } catch (caught) {
            const message =
                caught instanceof Error
                    ? caught.message
                    : 'プリンター接続に失敗しました。';
            setError(message);
            throw caught;
        } finally {
            setIsConnecting(false);
        }
    }, [characterEncoding, command, receiptWidth]);

    const print = useCallback(
        async (receiptData: ReceiptData) => {
            setLastReceipt(receiptData);
            setIsPrinting(true);
            setError('');

            try {
                const activePrinter = printerRef.current ?? (await connect());
                await activePrinter.print(new Receipt(receiptData));
            } catch (caught) {
                const message =
                    caught instanceof Error
                        ? caught.message
                        : 'レシート出力に失敗しました。';
                setError(message);
                throw caught;
            } finally {
                setIsPrinting(false);
            }
        },
        [connect]
    );

    const saveConfig = useCallback((config: PrinterConfigInput) => {
        const targetConfig = printerRef.current?.config ?? PrinterConfig.read();
        targetConfig.changeCharacterEncoding(config.characterEncoding);
        targetConfig.changeCommand(config.command);
        targetConfig.changeReceiptWidth(config.receiptWidth);
        targetConfig.save();
        setCharacterEncoding(config.characterEncoding);
        setCommand(config.command);
        setReceiptWidth(config.receiptWidth);
    }, []);

    const clear = useCallback(() => {
        new PrinterConnection().clear();
        printerRef.current = null;
        setPrinter(null);
        setError('');
    }, []);

    return {
        isConnected: !!printer,
        isConnecting,
        isPrinting,
        error,
        lastReceipt,
        characterEncoding,
        command,
        receiptWidth,
        connect,
        print,
        reprintLast: () => (lastReceipt ? print(lastReceipt) : undefined),
        rememberReceipt: setLastReceipt,
        saveConfig,
        clear,
    };
};

type PrinterConfigInput = {
    characterEncoding: SelectedCharacterEncoding;
    command: SelectedCommand;
    receiptWidth: number;
};

const LoginPage = ({
    onLogin,
}: {
    onLogin: (token: string, terminal: RegisterTerminal) => void;
}) => {
    const [tokenParts, setTokenParts] = useState(['', '', '']);
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = [
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
        useRef<HTMLInputElement>(null),
    ];
    const token = `RGT-${tokenParts.join('-')}`;
    const canSubmit = tokenParts.every((part) => part.length === 4);

    const submit = async () => {
        if (!canSubmit || isPending) return;
        setIsPending(true);
        setError('');

        try {
            const response = await registerApi.loginRegisterTerminal({ token });
            onLogin(token, response.registerTerminal);
        } catch (caught) {
            setError(errorMessage(caught));
        } finally {
            setIsPending(false);
        }
    };

    return (
        <main className="login-screen">
            <section className="login-panel">
                <MonitorCheck aria-hidden="true" className="login-icon" />
                <div className="login-copy">
                    <p className="eyebrow">MYDX POS</p>
                    <h1>レジ端末認証</h1>
                    <p>管理画面で発行された端末トークンを入力してください。</p>
                </div>

                <form
                    className="login-form"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void submit();
                    }}
                >
                    <label className="field-label">認証トークン</label>
                    <div className="token-inputs">
                        {tokenParts.map((part, index) => (
                            <input
                                key={index}
                                ref={inputRefs[index]}
                                autoFocus={index === 0}
                                inputMode="text"
                                maxLength={4}
                                placeholder="XXXX"
                                value={part}
                                onChange={(event) => {
                                    const value = normalizeTokenPart(
                                        event.target.value
                                    );
                                    setTokenParts((current) =>
                                        current.map((currentPart, partIndex) =>
                                            partIndex === index
                                                ? value
                                                : currentPart
                                        )
                                    );
                                    if (value.length === 4) {
                                        inputRefs[index + 1]?.current?.focus();
                                    }
                                }}
                                onKeyDown={(event) => {
                                    if (
                                        event.key === 'Backspace' &&
                                        part.length === 0 &&
                                        index > 0
                                    ) {
                                        inputRefs[index - 1]?.current?.focus();
                                    }
                                }}
                            />
                        ))}
                    </div>
                    <p className="token-preview">
                        RGT-{tokenParts[0] || 'XXXX'}-
                        {tokenParts[1] || 'XXXX'}-{tokenParts[2] || 'XXXX'}
                    </p>
                    {error ? <ErrorMessage message={error} /> : null}
                    <button
                        className="button primary wide"
                        disabled={!canSubmit || isPending}
                        type="submit"
                    >
                        {isPending ? (
                            <Loader2 aria-hidden="true" className="spin" />
                        ) : (
                            <CheckCircle2 aria-hidden="true" />
                        )}
                        {isPending ? '認証中' : '認証する'}
                    </button>
                    <p className="login-help">
                        <HelpCircle aria-hidden="true" />
                        トークンを忘れた場合は管理者に再発行を依頼してください。
                    </p>
                </form>
            </section>
        </main>
    );
};

const ErrorMessage = ({ message }: { message: string }) => (
    <div className="error" role="alert">
        <AlertCircle aria-hidden="true" />
        <span>{message}</span>
    </div>
);

const RegisterPage = ({
    terminal,
    onLogout,
}: {
    terminal: RegisterTerminal | null;
    onLogout: () => void;
}) => {
    const printer = useReceiptPrinter();
    const [date, setDate] = useState(today);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('来店済み');
    const [rows, setRows] = useState<TreatmentRow[]>([]);
    const [selectedTreatmentId, setSelectedTreatmentId] = useState('');
    const [detail, setDetail] = useState<TreatmentDetail | null>(null);
    const [isLoadingRows, setIsLoadingRows] = useState(false);
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');
    const [operation, setOperation] = useState<Operation | null>(null);
    const [operationAmount, setOperationAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);
    const [operationNote, setOperationNote] = useState('');
    const [isPrinterConfigOpen, setIsPrinterConfigOpen] = useState(false);
    const [selectedEncoding, setSelectedEncoding] =
        useState<SelectedCharacterEncoding>(
            printer.characterEncoding ?? defaultEncoding
        );
    const [selectedCommand, setSelectedCommand] = useState<SelectedCommand>(
        printer.command ?? defaultCommand
    );
    const [selectedReceiptWidth, setSelectedReceiptWidth] = useState(
        printer.receiptWidth || defaultReceiptWidth
    );

    const loadRows = useCallback(async () => {
        setIsLoadingRows(true);
        setError('');

        try {
            const response = await registerApi.listRegisterTreatments();
            setRows(response.treatments);
            setSelectedTreatmentId((current) => {
                if (
                    current &&
                    response.treatments.some((row) => row.ID === current)
                ) {
                    return current;
                }
                return response.treatments[0]?.ID ?? '';
            });
        } catch (caught) {
            if (caught instanceof WorkerApiError && caught.status === 401) {
                onLogout();
                return;
            }
            setError(errorMessage(caught));
        } finally {
            setIsLoadingRows(false);
        }
    }, [onLogout]);

    const loadDetail = useCallback(
        async (treatmentId: string) => {
            if (!treatmentId) {
                setDetail(null);
                return;
            }

            setIsLoadingDetail(true);
            setError('');

            try {
                setDetail(
                    await registerApi.getRegisterTreatmentDetail(treatmentId)
                );
            } catch (caught) {
                if (caught instanceof WorkerApiError && caught.status === 401) {
                    onLogout();
                    return;
                }
                setError(errorMessage(caught));
            } finally {
                setIsLoadingDetail(false);
            }
        },
        [onLogout]
    );

    useEffect(() => {
        void loadRows();
    }, [loadRows]);

    useEffect(() => {
        void loadDetail(selectedTreatmentId);
    }, [loadDetail, selectedTreatmentId]);

    const filteredRows = useMemo(
        () =>
            rows
                .filter((row) => dateKey(row.開始日時) === date)
                .filter((row) =>
                    status === 'all' ? true : row.状態 === status
                )
                .filter((row) =>
                    row.顧客名.toLowerCase().includes(
                        search.trim().toLowerCase()
                    )
                )
                .sort(
                    (a, b) =>
                        new Date(a.開始日時).getTime() -
                        new Date(b.開始日時).getTime()
                ),
        [date, rows, search, status]
    );

    useEffect(() => {
        if (filteredRows.length === 0) {
            if (selectedTreatmentId) {
                setSelectedTreatmentId('');
            }
            setDetail(null);
            return;
        }

        if (!filteredRows.some((row) => row.ID === selectedTreatmentId)) {
            setSelectedTreatmentId(filteredRows[0].ID);
        }
    }, [filteredRows, selectedTreatmentId]);

    const menus = detail?.treatmentMenus ?? [];
    const paymentRecords = detail?.paymentRecords ?? [];
    const treatmentTotal = treatmentMenusTotal(menus);
    const currentSales = paymentRecordsSales(paymentRecords);
    const paidRecord = paymentRecords.find((record) => record.種別 === '精算');

    const buildReceipt = (
        paymentRecord: Pick<
            PaymentRecord,
            'ID' | '種別' | '金額' | '支払方法' | '発生日時'
        >,
        tenderedAmount?: number
    ): ReceiptData | null => {
        if (!detail || paymentRecord.種別 !== '精算') return null;

        const subtotal = menus.reduce(
            (sum, menu) => sum + menu.数量 * menu.通常価格,
            0
        );
        const discountTotal = menus.reduce(
            (sum, menu) => sum + menu.数量 * menu.値引き額,
            0
        );

        return {
            receiptNo: receiptNo(paymentRecord.ID, paymentRecord.発生日時),
            paymentRecordId: paymentRecord.ID,
            treatmentId: detail.treatment.ID,
            issuedAt: new Date().toISOString(),
            paidAt: paymentRecord.発生日時,
            paymentMethod: paymentRecord.支払方法,
            customerName: detail.customer.氏名,
            staffName: detail.staff.氏名,
            registerTerminalId: terminal?.ID ?? null,
            store: storeInfo(),
            items: menus.map((menu) => ({
                name: menu.メニュー名,
                quantity: menu.数量,
                regularPrice: menu.通常価格,
                discountAmount: menu.値引き額,
                subtotal:
                    menu.数量 * Math.max(0, menu.通常価格 - menu.値引き額),
            })),
            subtotal,
            discountTotal,
            total: subtotal - discountTotal,
            paidAmount: tenderedAmount ?? paymentRecord.金額,
        };
    };

    const openOperation = (nextOperation: Operation) => {
        if (!detail) return;
        setOperation(nextOperation);
        setOperationNote('');
        const amount = nextOperation === '精算' ? treatmentTotal : currentSales;
        setOperationAmount(Math.max(0, amount));
        setPaidAmount(nextOperation === '精算' ? Math.max(0, amount) : 0);
    };

    const savePrinterConfig = () => {
        printer.saveConfig({
            characterEncoding: selectedEncoding,
            command: selectedCommand,
            receiptWidth: selectedReceiptWidth,
        });
        setIsPrinterConfigOpen(false);
        setNotice('プリンター設定を保存しました。');
    };

    const submitOperation = async () => {
        if (!detail || !operation || isSaving) return;
        const isSettlement = operation === '精算';
        const targetPaymentRecordId = isSettlement
            ? null
            : (paidRecord?.ID ?? null);

        if (!isSettlement && !targetPaymentRecordId) {
            setError('取消または返金の対象となる精算履歴がありません。');
            return;
        }

        setIsSaving(true);
        setError('');
        setNotice('');

        let canPrint = printer.isConnected;
        if (isSettlement && !canPrint) {
            try {
                await printer.connect();
                canPrint = true;
            } catch {
                canPrint = false;
            }
        }

        try {
            const response = await registerApi.createPaymentRecord({
                施術ID: detail.treatment.ID,
                種別: operation,
                金額: operationAmount,
                支払方法: '現金',
                備考: operationNote.trim() || null,
                対象精算ID: targetPaymentRecordId,
            });

            const receipt = buildReceipt(
                response.paymentRecord,
                isSettlement ? paidAmount : undefined
            );
            if (receipt) {
                printer.rememberReceipt(receipt);
                if (canPrint) {
                    try {
                        await printer.print(receipt);
                        setNotice('精算履歴を登録し、レシートを印刷しました。');
                    } catch {
                        setNotice(
                            '精算履歴を登録しました。印刷に失敗したため、再印刷してください。'
                        );
                    }
                } else {
                    setNotice(
                        '精算履歴を登録しました。プリンター接続後に再印刷してください。'
                    );
                }
            } else {
                setNotice('精算履歴を登録しました。');
            }

            setOperation(null);
            setOperationAmount(0);
            setPaidAmount(0);
            setOperationNote('');
            await loadRows();
            await loadDetail(detail.treatment.ID);
        } catch (caught) {
            if (caught instanceof WorkerApiError && caught.status === 401) {
                onLogout();
                return;
            }
            setError(errorMessage(caught));
        } finally {
            setIsSaving(false);
        }
    };

    const reprintRecord = async (record: PaymentRecord) => {
        const receipt = buildReceipt(record);
        if (!receipt) return;

        try {
            await printer.print(receipt);
            setNotice('レシートを再印刷しました。');
        } catch {
            setError('レシート再印刷に失敗しました。');
        }
    };

    return (
        <main className="register-shell">
            <header className="register-header">
                <div>
                    <p className="eyebrow">MYDX POS</p>
                    <h1>レジ</h1>
                    <p>
                        {terminal?.端末名 ?? 'レジ端末'} / API:{' '}
                        {apiBaseUrl()}
                    </p>
                </div>
                <div className="header-actions">
                    <button
                        className="button secondary"
                        type="button"
                        onClick={() => void loadRows()}
                    >
                        <RefreshCcw aria-hidden="true" />
                        更新
                    </button>
                    <button
                        className="button secondary"
                        type="button"
                        onClick={() => {
                            setSelectedEncoding(
                                printer.characterEncoding ?? defaultEncoding
                            );
                            setSelectedCommand(
                                printer.command ?? defaultCommand
                            );
                            setSelectedReceiptWidth(
                                printer.receiptWidth || defaultReceiptWidth
                            );
                            setIsPrinterConfigOpen(true);
                        }}
                    >
                        <Settings aria-hidden="true" />
                        プリンター
                    </button>
                    <button
                        className="icon-button"
                        title="ログアウト"
                        type="button"
                        onClick={onLogout}
                    >
                        <LogOut aria-hidden="true" />
                    </button>
                </div>
            </header>

            {error ? <ErrorMessage message={error} /> : null}
            {printer.error ? <ErrorMessage message={printer.error} /> : null}
            {notice ? <p className="notice">{notice}</p> : null}

            <section className="register-grid">
                <TreatmentList
                    date={date}
                    isLoading={isLoadingRows}
                    rows={filteredRows}
                    search={search}
                    selectedTreatmentId={selectedTreatmentId}
                    status={status}
                    onDateChange={setDate}
                    onSearchChange={setSearch}
                    onStatusChange={setStatus}
                    onTreatmentSelect={setSelectedTreatmentId}
                />

                <TreatmentDetailPanel
                    currentSales={currentSales}
                    detail={detail}
                    isLoading={isLoadingDetail}
                    isPrinterPrinting={printer.isPrinting}
                    paymentRecords={paymentRecords}
                    treatmentTotal={treatmentTotal}
                    onOpenOperation={openOperation}
                    onReprintRecord={(record) => void reprintRecord(record)}
                />
            </section>

            {operation ? (
                <OperationModal
                    amount={operationAmount}
                    isPending={isSaving || printer.isConnecting}
                    note={operationNote}
                    operation={operation}
                    paidAmount={paidAmount}
                    onAmountChange={setOperationAmount}
                    onClose={() => setOperation(null)}
                    onNoteChange={setOperationNote}
                    onPaidAmountChange={setPaidAmount}
                    onSubmit={() => void submitOperation()}
                />
            ) : null}

            {isPrinterConfigOpen ? (
                <PrinterConfigModal
                    characterEncoding={selectedEncoding}
                    command={selectedCommand}
                    hasLastReceipt={!!printer.lastReceipt}
                    isConnected={printer.isConnected}
                    isConnecting={printer.isConnecting}
                    isPrinting={printer.isPrinting}
                    receiptWidth={selectedReceiptWidth}
                    onCharacterEncodingChange={setSelectedEncoding}
                    onClose={() => setIsPrinterConfigOpen(false)}
                    onCommandChange={setSelectedCommand}
                    onConnect={() => void printer.connect()}
                    onReceiptWidthChange={setSelectedReceiptWidth}
                    onReprintLast={() => void printer.reprintLast()}
                    onSave={savePrinterConfig}
                    onClear={printer.clear}
                />
            ) : null}
        </main>
    );
};

const TreatmentList = ({
    date,
    isLoading,
    rows,
    search,
    selectedTreatmentId,
    status,
    onDateChange,
    onSearchChange,
    onStatusChange,
    onTreatmentSelect,
}: {
    date: string;
    isLoading: boolean;
    rows: TreatmentRow[];
    search: string;
    selectedTreatmentId: string;
    status: StatusFilter;
    onDateChange: (value: string) => void;
    onSearchChange: (value: string) => void;
    onStatusChange: (value: StatusFilter) => void;
    onTreatmentSelect: (id: string) => void;
}) => (
    <aside className="treatment-list">
        <div className="filters">
            <label>
                <span>日付</span>
                <input
                    type="date"
                    value={date}
                    onChange={(event) => onDateChange(event.target.value)}
                />
            </label>
            <label>
                <span>顧客名</span>
                <div className="search-box">
                    <Search aria-hidden="true" />
                    <input
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                    />
                </div>
            </label>
            <div className="segmented">
                {[
                    ['来店済み', '来店済み'],
                    ['予約中', '予約済み'],
                    ['精算済み', '精算済み'],
                    ['すべて', 'all'],
                ].map(([label, value]) => (
                    <button
                        key={value}
                        className={status === value ? 'active' : ''}
                        type="button"
                        onClick={() => onStatusChange(value as StatusFilter)}
                    >
                        {label}
                    </button>
                ))}
            </div>
        </div>

        <div className="treatment-scroll">
            {isLoading ? (
                <p className="empty-state">施術情報を取得中...</p>
            ) : null}
            {!isLoading && rows.length === 0 ? (
                <p className="empty-state">対象の施術はありません</p>
            ) : null}
            {rows.map((row) => (
                <button
                    key={row.ID}
                    className={`treatment-card ${
                        row.ID === selectedTreatmentId ? 'selected' : ''
                    }`}
                    type="button"
                    onClick={() => onTreatmentSelect(row.ID)}
                >
                    <div>
                        <strong>{row.顧客名} 様</strong>
                        <span>{row.状態}</span>
                    </div>
                    <dl>
                        <dt>担当</dt>
                        <dd>{row.担当スタッフ名}</dd>
                        <dt>時刻</dt>
                        <dd>{timeText(row.開始日時)}</dd>
                        <dt>合計</dt>
                        <dd>{formatCurrency(row.合計金額)}</dd>
                    </dl>
                </button>
            ))}
        </div>
    </aside>
);

const TreatmentDetailPanel = ({
    currentSales,
    detail,
    isLoading,
    isPrinterPrinting,
    paymentRecords,
    treatmentTotal,
    onOpenOperation,
    onReprintRecord,
}: {
    currentSales: number;
    detail: TreatmentDetail | null;
    isLoading: boolean;
    isPrinterPrinting: boolean;
    paymentRecords: PaymentRecord[];
    treatmentTotal: number;
    onOpenOperation: (operation: Operation) => void;
    onReprintRecord: (record: PaymentRecord) => void;
}) => {
    if (isLoading) {
        return <section className="detail-panel empty">詳細を取得中...</section>;
    }

    if (!detail) {
        return (
            <section className="detail-panel empty">
                施術を選択してください
            </section>
        );
    }

    return (
        <section className="detail-panel">
            <div className="detail-header">
                <div>
                    <h2>{detail.customer.氏名} 様</h2>
                    <p>
                        担当: {detail.staff.氏名} / 来店:{' '}
                        {formatDateTime(detail.treatment.開始日時)}
                    </p>
                </div>
                <span className="status-badge">{detail.treatment.状態}</span>
            </div>

            <div className="detail-scroll">
                <section>
                    <h3>メニュー明細</h3>
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>メニュー名</th>
                                    <th>数量</th>
                                    <th>単価</th>
                                    <th>値引き</th>
                                    <th>小計</th>
                                </tr>
                            </thead>
                            <tbody>
                                {detail.treatmentMenus.map((menu) => (
                                    <tr key={menu.ID}>
                                        <td>{menu.メニュー名}</td>
                                        <td>{menu.数量}</td>
                                        <td>{formatCurrency(menu.通常価格)}</td>
                                        <td>{formatCurrency(menu.値引き額)}</td>
                                        <td>
                                            {formatCurrency(
                                                menu.数量 *
                                                    Math.max(
                                                        0,
                                                        menu.通常価格 -
                                                            menu.値引き額
                                                    )
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3>精算履歴</h3>
                    <div className="payment-list">
                        {paymentRecords.length === 0 ? (
                            <p className="empty-state">履歴なし</p>
                        ) : null}
                        {paymentRecords.map((record) => (
                            <div className="payment-row" key={record.ID}>
                                <span className="payment-type">
                                    {record.種別}
                                </span>
                                <span>{timeText(record.発生日時)}</span>
                                <span>{record.備考 || record.支払方法}</span>
                                <strong>{formatCurrency(record.金額)}</strong>
                                {record.種別 === '精算' ? (
                                    <button
                                        className="button secondary compact"
                                        disabled={isPrinterPrinting}
                                        type="button"
                                        onClick={() => onReprintRecord(record)}
                                    >
                                        <PrinterIcon aria-hidden="true" />
                                        再印刷
                                    </button>
                                ) : null}
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <footer className="summary-bar">
                <div>
                    <p>請求額</p>
                    <strong>{formatCurrency(treatmentTotal)}</strong>
                </div>
                <div>
                    <p>現在売上</p>
                    <strong>{formatCurrency(currentSales)}</strong>
                </div>
                <div className="summary-actions">
                    <button
                        className="button primary"
                        disabled={treatmentTotal <= 0}
                        type="button"
                        onClick={() => onOpenOperation('精算')}
                    >
                        精算
                    </button>
                    <button
                        className="button secondary"
                        disabled={currentSales <= 0}
                        type="button"
                        onClick={() => onOpenOperation('取消')}
                    >
                        <Ban aria-hidden="true" />
                        取消
                    </button>
                    <button
                        className="button secondary"
                        disabled={currentSales <= 0}
                        type="button"
                        onClick={() => onOpenOperation('返金')}
                    >
                        <RefreshCcw aria-hidden="true" />
                        返金
                    </button>
                </div>
            </footer>
        </section>
    );
};

const OperationModal = ({
    amount,
    isPending,
    note,
    operation,
    paidAmount,
    onAmountChange,
    onClose,
    onNoteChange,
    onPaidAmountChange,
    onSubmit,
}: {
    amount: number;
    isPending: boolean;
    note: string;
    operation: Operation;
    paidAmount: number;
    onAmountChange: (value: number) => void;
    onClose: () => void;
    onNoteChange: (value: string) => void;
    onPaidAmountChange: (value: number) => void;
    onSubmit: () => void;
}) => {
    const isSettlement = operation === '精算';
    const canSubmit =
        amount > 0 && (!isSettlement || paidAmount >= amount) && !isPending;

    return (
        <div className="modal-backdrop">
            <section className="modal">
                <header>
                    <h2>{operation}</h2>
                    <p>支払方法: 現金</p>
                </header>
                <div className="amount-panel">
                    <span>金額</span>
                    <strong>{formatCurrency(amount)}</strong>
                </div>
                {operation === '返金' ? (
                    <label className="form-field">
                        返金額
                        <input
                            min={1}
                            type="number"
                            value={amount}
                            onChange={(event) =>
                                onAmountChange(
                                    Math.max(0, Number(event.target.value) || 0)
                                )
                            }
                        />
                    </label>
                ) : null}
                {isSettlement ? (
                    <>
                        <label className="form-field">
                            お預かり金額
                            <input
                                min={0}
                                type="number"
                                value={paidAmount || ''}
                                onChange={(event) =>
                                    onPaidAmountChange(
                                        Math.max(
                                            0,
                                            Number(event.target.value) || 0
                                        )
                                    )
                                }
                            />
                        </label>
                        <div className="change-row">
                            <span>お釣り</span>
                            <strong>
                                {formatCurrency(
                                    Math.max(0, paidAmount - amount)
                                )}
                            </strong>
                        </div>
                    </>
                ) : null}
                <label className="form-field">
                    備考
                    <textarea
                        value={note}
                        onChange={(event) => onNoteChange(event.target.value)}
                    />
                </label>
                <footer className="modal-actions">
                    <button
                        className="button secondary wide"
                        type="button"
                        onClick={onClose}
                    >
                        戻る
                    </button>
                    <button
                        className="button primary wide"
                        disabled={!canSubmit}
                        type="button"
                        onClick={onSubmit}
                    >
                        {isPending ? (
                            <Loader2 aria-hidden="true" className="spin" />
                        ) : (
                            <CheckCircle2 aria-hidden="true" />
                        )}
                        確定する
                    </button>
                </footer>
            </section>
        </div>
    );
};

const PrinterConfigModal = ({
    characterEncoding,
    command,
    hasLastReceipt,
    isConnected,
    isConnecting,
    isPrinting,
    receiptWidth,
    onCharacterEncodingChange,
    onClear,
    onClose,
    onCommandChange,
    onConnect,
    onReceiptWidthChange,
    onReprintLast,
    onSave,
}: {
    characterEncoding: SelectedCharacterEncoding;
    command: SelectedCommand;
    hasLastReceipt: boolean;
    isConnected: boolean;
    isConnecting: boolean;
    isPrinting: boolean;
    receiptWidth: number;
    onCharacterEncodingChange: (value: SelectedCharacterEncoding) => void;
    onClear: () => void;
    onClose: () => void;
    onCommandChange: (value: SelectedCommand) => void;
    onConnect: () => void;
    onReceiptWidthChange: (value: number) => void;
    onReprintLast: () => void;
    onSave: () => void;
}) => (
    <div className="modal-backdrop">
        <section className="modal printer-modal">
            <header>
                <h2>プリンター設定</h2>
                <p>{isConnected ? '接続済み' : '未接続'}</p>
            </header>
            <label className="form-field">
                文字コード
                <select
                    value={characterEncoding}
                    onChange={(event) =>
                        onCharacterEncodingChange(
                            event.target.value as SelectedCharacterEncoding
                        )
                    }
                >
                    {printerCharacterEncodings.map((encoding) => (
                        <option key={encoding} value={encoding}>
                            {encoding}
                        </option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                コマンド
                <select
                    value={command}
                    onChange={(event) =>
                        onCommandChange(event.target.value as SelectedCommand)
                    }
                >
                    {printerCommands.map((nextCommand) => (
                        <option key={nextCommand} value={nextCommand}>
                            {nextCommand}
                        </option>
                    ))}
                </select>
            </label>
            <label className="form-field">
                レシート幅
                <input
                    min={24}
                    max={64}
                    type="number"
                    value={receiptWidth}
                    onChange={(event) =>
                        onReceiptWidthChange(
                            Math.max(24, Number(event.target.value) || 42)
                        )
                    }
                />
            </label>
            <div className="button-row">
                <button
                    className="button secondary"
                    disabled={isConnecting}
                    type="button"
                    onClick={onConnect}
                >
                    {isConnecting ? (
                        <Loader2 aria-hidden="true" className="spin" />
                    ) : (
                        <Usb aria-hidden="true" />
                    )}
                    接続
                </button>
                <button
                    className="button secondary"
                    disabled={!hasLastReceipt || isPrinting}
                    type="button"
                    onClick={onReprintLast}
                >
                    <PrinterIcon aria-hidden="true" />
                    最後のレシート
                </button>
                <button className="button secondary" type="button" onClick={onClear}>
                    <RefreshCcw aria-hidden="true" />
                    クリア
                </button>
            </div>
            <footer className="modal-actions">
                <button className="button secondary wide" type="button" onClick={onClose}>
                    閉じる
                </button>
                <button className="button primary wide" type="button" onClick={onSave}>
                    保存
                </button>
            </footer>
        </section>
    </div>
);

export const App = () => {
    const [terminal, setTerminal] = useState<RegisterTerminal | null>(() =>
        readStoredTerminal()
    );

    const login = (_nextToken: string, nextTerminal: RegisterTerminal) => {
        localStorage.setItem(terminalStorageKey, JSON.stringify(nextTerminal));
        setTerminal(nextTerminal);
    };

    const logout = useCallback(() => {
        localStorage.removeItem(terminalStorageKey);
        setTerminal(null);
    }, []);

    const logoutWithServer = useCallback(() => {
        void registerApi.logoutRegisterTerminal().finally(logout);
    }, [logout]);

    return terminal ? (
        <RegisterPage terminal={terminal} onLogout={logoutWithServer} />
    ) : (
        <LoginPage onLogin={login} />
    );
};
