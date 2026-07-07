import {
    Printer,
    PrinterConfig,
    PrinterConnection,
    type CharacterEncoding,
    type Command,
} from '@mydx-pos/printer';
import {
    CheckCircle2,
    Printer as PrinterIcon,
    RotateCcw,
    Usb,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type FeaturePolicyDocument = Document & {
    featurePolicy?: {
        allowsFeature?: (feature: string) => boolean;
    };
};

type Diagnostics = {
    hasNavigatorUsb: boolean;
    allowsUsb: boolean | null;
    isTopLevel: boolean;
    isSecureContext: boolean;
};

const defaultEncoding: CharacterEncoding = 'shiftjis';
const defaultCommand: Command = 'escpos';
const defaultReceiptWidth = 42;

const createDiagnostics = (): Diagnostics => ({
    hasNavigatorUsb: 'usb' in navigator,
    allowsUsb:
        (document as FeaturePolicyDocument).featurePolicy?.allowsFeature?.(
            'usb'
        ) ?? null,
    isTopLevel: window.top === window.self,
    isSecureContext: window.isSecureContext,
});

const formatDateTime = (date: Date) =>
    [
        [
            date.getFullYear(),
            `${date.getMonth() + 1}`.padStart(2, '0'),
            `${date.getDate()}`.padStart(2, '0'),
        ].join('-'),
        [
            `${date.getHours()}`.padStart(2, '0'),
            `${date.getMinutes()}`.padStart(2, '0'),
        ].join(':'),
    ].join(' ');

const buildTestReceipt = () =>
    [
        'MYDX POS',
        'WebUSB Print Test',
        formatDateTime(new Date()),
        '',
        'TEST OK',
    ].join('\n');

const saveDefaultPrinterConfig = () => {
    const config = PrinterConfig.read();
    config.changeCharacterEncoding(config.characterEncoding ?? defaultEncoding);
    config.changeCommand(config.command ?? defaultCommand);
    config.changeReceiptWidth(config.receiptWidth || defaultReceiptWidth);
    config.save();
};

const resultClassName = (value: boolean | null) => {
    if (value === true || value === null) return 'diagnostic-value ok';
    return 'diagnostic-value ng';
};

export const PrinterTestPanel = () => {
    const [diagnostics, setDiagnostics] = useState(createDiagnostics);
    const [printer, setPrinter] = useState<Printer | null>(null);
    const [status, setStatus] = useState('プリンター未接続');
    const [error, setError] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const diagnosticsEntries = useMemo(
        () =>
            Object.entries(diagnostics) as [
                keyof Diagnostics,
                boolean | null,
            ][],
        [diagnostics]
    );

    const connectPrinter = async () => {
        setIsConnecting(true);
        setError('');
        setStatus('プリンターを選択してください');

        try {
            saveDefaultPrinterConfig();
            const connectedPrinter = await Printer.connect();
            setPrinter(connectedPrinter);
            setStatus('プリンター接続済み');
        } catch (caught) {
            setStatus('プリンター未接続');
            setError(
                caught instanceof Error
                    ? caught.message
                    : 'プリンター接続に失敗しました'
            );
        } finally {
            setIsConnecting(false);
            setDiagnostics(createDiagnostics());
        }
    };

    const printTestReceipt = async () => {
        setIsPrinting(true);
        setError('');

        try {
            saveDefaultPrinterConfig();
            const activePrinter = printer ?? (await Printer.connect());
            setPrinter(activePrinter);
            await activePrinter.print({ contents: buildTestReceipt() });
            setStatus('テストレシートを印刷しました');
        } catch (caught) {
            setError(
                caught instanceof Error
                    ? caught.message
                    : 'テスト印刷に失敗しました'
            );
        } finally {
            setIsPrinting(false);
            setDiagnostics(createDiagnostics());
        }
    };

    const clearPrinter = async () => {
        setError('');
        await printer?.disconnect();
        new PrinterConnection().clear();
        setPrinter(null);
        setStatus('プリンター接続をクリアしました');
    };

    return (
        <section className="panel">
            <div className="panel-column">
                <div className="section-heading">
                    <CheckCircle2 aria-hidden="true" />
                    <h2>WebUSB Diagnostics</h2>
                </div>
                <dl className="diagnostics">
                    {diagnosticsEntries.map(([key, value]) => (
                        <div className="diagnostic-row" key={key}>
                            <dt>{key}</dt>
                            <dd className={resultClassName(value)}>
                                {String(value)}
                            </dd>
                        </div>
                    ))}
                </dl>
            </div>

            <div className="panel-column">
                <div className="section-heading">
                    <PrinterIcon aria-hidden="true" />
                    <h2>Printer Test</h2>
                </div>
                <p className="status">{status}</p>
                {error ? <p className="error">{error}</p> : null}

                <div className="button-row">
                    <button
                        className="button secondary"
                        disabled={isConnecting}
                        type="button"
                        onClick={connectPrinter}
                    >
                        <Usb aria-hidden="true" />
                        {isConnecting ? '接続中' : '接続'}
                    </button>
                    <button
                        className="button primary"
                        disabled={isConnecting || isPrinting}
                        type="button"
                        onClick={printTestReceipt}
                    >
                        <PrinterIcon aria-hidden="true" />
                        {isPrinting ? '印刷中' : 'テスト印刷'}
                    </button>
                    <button
                        className="icon-button"
                        title="接続をクリア"
                        type="button"
                        onClick={() => void clearPrinter()}
                    >
                        <RotateCcw aria-hidden="true" />
                    </button>
                </div>

                <pre className="receipt-preview">{buildTestReceipt()}</pre>
            </div>
        </section>
    );
};
