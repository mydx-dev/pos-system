import { Button } from '@/components/ui/button';
import { CharacterEncoding, Command } from '@/lib/printer/core/PrinterConfig';
import { Printer, Save, Usb } from 'lucide-react';
import { inputClassName } from './cashRegisterUtils';

export const PrinterConfigModal = ({
    encodings,
    commands,
    selectedEncoding,
    selectedCommand,
    receiptWidth,
    isConnected,
    isConnecting,
    isPrinting,
    hasLastReceipt,
    action,
    deviceName,
    onEncodingChange,
    onCommandChange,
    onReceiptWidthChange,
    onConnectPrinter,
    onReprintLast,
    onSave,
    onClose,
    removeDevice,
}: {
    encodings: CharacterEncoding[];
    commands: Command[];
    selectedEncoding: CharacterEncoding | null;
    selectedCommand: Command | null;
    receiptWidth: number;
    isConnected: boolean;
    isConnecting: boolean;
    isPrinting: boolean;
    hasLastReceipt: boolean;
    action: 'connect' | 'checkout' | null;
    deviceName: string;
    onEncodingChange: (encoding: CharacterEncoding) => void;
    onCommandChange: (command: Command) => void;
    onReceiptWidthChange: (width: number) => void;
    onConnectPrinter: () => void;
    onReprintLast: () => void;
    onSave: () => void;
    onClose: () => void;
    removeDevice: () => void;
}) => (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 p-4">
        <div className="w-full max-w-[560px] rounded-xl bg-white p-5 shadow-2xl">
            <h2 className="text-lg font-bold text-primary">プリンター設定</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-on-surface-variant">
                    文字コード
                    <select
                        className={`${inputClassName} mt-1`}
                        value={selectedEncoding ?? ''}
                        onChange={(event) =>
                            onEncodingChange(
                                event.target.value as CharacterEncoding
                            )
                        }
                    >
                        {encodings.map((encoding) => (
                            <option key={encoding} value={encoding ?? ''}>
                                {encoding?.toUpperCase()}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block text-xs font-bold text-on-surface-variant">
                    コマンド種別
                    <select
                        className={`${inputClassName} mt-1`}
                        value={selectedCommand ?? ''}
                        onChange={(event) =>
                            onCommandChange(event.target.value as Command)
                        }
                    >
                        {commands.map((command) => (
                            <option key={command} value={command ?? ''}>
                                {command}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="block text-xs font-bold text-on-surface-variant">
                    レシート幅
                    <input
                        className={`${inputClassName} mt-1`}
                        min={1}
                        type="number"
                        value={receiptWidth}
                        onChange={(event) =>
                            onReceiptWidthChange(Number(event.target.value))
                        }
                    />
                </label>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button
                    className="h-10 gap-2 rounded-lg"
                    disabled={isConnecting}
                    variant="outline"
                    onClick={onConnectPrinter}
                >
                    <Usb className="size-4" />
                    {isConnected ? 'プリンター接続済み' : 'プリンター接続'}
                </Button>
                <Button
                    className="h-10 gap-2 rounded-lg"
                    disabled={!hasLastReceipt || isPrinting}
                    variant="outline"
                    onClick={onReprintLast}
                >
                    <Printer className="size-4" />
                    直前のレシート
                </Button>
            </div>

            <div className="mt-5 flex gap-2">
                <Button
                    className="h-10 gap-2 rounded-lg"
                    variant="outline"
                    onClick={removeDevice}
                >
                    <Usb className="size-4" />
                    {deviceName
                        ? `${deviceName}のデバイスを削除`
                        : 'デバイスを削除'}
                </Button>
            </div>

            <div className="mt-5 flex gap-2">
                <Button
                    className="h-10 flex-1 gap-2 rounded-lg"
                    onClick={onSave}
                >
                    <Save className="size-4" />
                    {action === 'checkout' ? '保存して精算する' : '保存する'}
                </Button>
                <Button
                    className="h-10 flex-1 rounded-lg"
                    variant="outline"
                    onClick={onClose}
                >
                    戻る
                </Button>
            </div>
        </div>
    </div>
);
