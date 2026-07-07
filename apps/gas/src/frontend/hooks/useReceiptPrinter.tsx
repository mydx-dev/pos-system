import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
    Printer,
    PrinterConnection,
    Receipt,
    type CharacterEncoding,
    type Command,
    PrinterConfig,
} from '@mydx-pos/printer';
import { ReceiptData } from '@mydx-pos/shared/domain/valueObject/Receipt';

type PrinterConfigInput = {
    characterEncoding: CharacterEncoding;
    command: Command;
    receiptWidth: number;
};

export const useReceiptPrinter = () => {
    const savedConfig = PrinterConfig.read();
    const printerRef = useRef<Printer | null>(null);
    const [printer, setPrinter] = useState<Printer | null>(null);
    const [deviceName, setDeviceName] = useState<string>('');
    const [lastReceipt, setLastReceipt] = useState<ReceiptData | null>(null);
    const [characterEncoding, setCharacterEncodingState] = useState<
        CharacterEncoding | undefined
    >(savedConfig.characterEncoding);
    const [command, setCommandState] = useState<Command | undefined>(
        savedConfig.command
    );
    const [receiptWidth, setReceiptWidthState] = useState<number | undefined>(
        savedConfig.receiptWidth
    );
    const [isConnecting, setIsConnecting] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const connect = useCallback(async () => {
        setIsConnecting(true);
        try {
            const connectedPrinter = await Printer.connect();
            printerRef.current = connectedPrinter;
            setPrinter(connectedPrinter);
            toast.success('プリンターに接続しました');
            return connectedPrinter;
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'プリンター接続に失敗しました'
            );
            throw error;
        } finally {
            setIsConnecting(false);
        }
    }, []);

    const rememberReceipt = useCallback((receipt: ReceiptData) => {
        setLastReceipt(receipt);
    }, []);

    const setCharacterEncoding = useCallback((encoding: CharacterEncoding) => {
        setCharacterEncodingState(encoding);
        printerRef.current?.config.changeCharacterEncoding(encoding);
    }, []);

    const setCommand = useCallback((nextCommand: Command) => {
        setCommandState(nextCommand);
        printerRef.current?.config.changeCommand(nextCommand);
    }, []);

    const setReceiptWidth = useCallback((width: number) => {
        setReceiptWidthState(width);
        printerRef.current?.config.changeReceiptWidth(width);
    }, []);

    const print = useCallback(
        async (receiptData: ReceiptData) => {
            setLastReceipt(receiptData);
            setIsPrinting(true);
            try {
                const activePrinter = printerRef.current ?? (await connect());
                await activePrinter.print(new Receipt(receiptData));
                toast.success('レシートを出力しました');
            } catch (error) {
                toast.error(
                    error instanceof Error
                        ? error.message
                        : 'レシート出力に失敗しました'
                );
                throw error;
            } finally {
                setIsPrinting(false);
            }
        },
        [connect]
    );

    const reprintLast = useCallback(async () => {
        if (!lastReceipt) {
            toast.error('再出力できるレシートがありません');
            return;
        }

        await print(lastReceipt);
    }, [lastReceipt, print]);

    const savePrinterConfig = useCallback((config: PrinterConfigInput) => {
        const targetConfig = printerRef.current?.config ?? PrinterConfig.read();

        targetConfig.changeCharacterEncoding(config.characterEncoding);
        targetConfig.changeCommand(config.command);
        targetConfig.changeReceiptWidth(config.receiptWidth);
        targetConfig.save();

        setCharacterEncodingState(config.characterEncoding);
        setCommandState(config.command);
        setReceiptWidthState(config.receiptWidth);
    }, []);

    const removeDevice = useCallback(() => {
        const connection = new PrinterConnection();
        connection.clear();
        setPrinter(null);
        setDeviceName('');
        toast.success('プリンター接続をクリアしました');
    }, []);

    return {
        isConnected: !!printer,
        isConnecting,
        isPrinting,
        deviceName,
        characterEncoding,
        command,
        lastReceipt,
        receiptWidth,
        connect,
        rememberReceipt,
        setCharacterEncoding,
        setCommand,
        setReceiptWidth,
        print,
        reprintLast,
        savePrinterConfig,
        removeDevice,
    };
};
