import type ReceiptLine from 'receiptline';

export type CharacterEncoding = ReceiptLine.Encoding | null;
export type Command = keyof ReceiptLine.Commands | null;
export type PrinterConfigData = {
    characterEncoding: string;
    command: string;
    isSupportedFont: string;
    receiptWidth: string;
};

export class PrinterConfig {
    private _characterEncoding: CharacterEncoding;
    private _command: Command;
    private _receiptWidth: number;

    private static readonly key: string = 'printerConfig';

    static read(): PrinterConfig {
        const storedConfig = localStorage.getItem(PrinterConfig.key);
        if (!storedConfig) {
            return new PrinterConfig(null, null, 0);
        }
        const { characterEncoding, command, receiptWidth } = JSON.parse(
            storedConfig
        ) as PrinterConfigData;

        return new PrinterConfig(
            characterEncoding as CharacterEncoding,
            command as Command,
            parseInt(receiptWidth, 10)
        );
    }

    private constructor(
        characterEncoding: CharacterEncoding,
        command: Command,
        receiptWidth: number
    ) {
        this._characterEncoding = characterEncoding;
        this._command = command;
        this._receiptWidth = receiptWidth;
    }

    public get characterEncoding(): CharacterEncoding {
        return this._characterEncoding;
    }

    public get command(): Command {
        return this._command;
    }

    public get receiptWidth(): number {
        return this._receiptWidth;
    }

    public changeCharacterEncoding(encoding: CharacterEncoding) {
        this._characterEncoding = encoding;
    }

    public changeCommand(command: Command) {
        this._command = command;
    }

    public changeReceiptWidth(width: number) {
        this._receiptWidth = width;
    }

    save(): void {
        localStorage.setItem(
            PrinterConfig.key,
            JSON.stringify({
                characterEncoding: this._characterEncoding,
                command: this._command,
                receiptWidth: this._receiptWidth,
            })
        );
    }
}
