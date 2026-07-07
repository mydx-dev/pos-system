import { PrinterEscPosCommand } from '../command/PrinterEscPosCommand';
import { PrinterImage } from '../command/PrinterImage';
import { PrinterSvg } from '../command/PrinterSvg';
import { PrinterDriver } from '../driver/PrinterDriver';
import { WebUsbPrinterDriver } from '../driver/WebUsbPrinterDriver';
import { PrinterConfig } from './PrinterConfig';
import { PrinterConnection } from './PrinterConnection';
import { ReceiptLineRuntime } from './ReceiptLineRuntime';

export interface Printable {
    contents: string;
}

export class Printer {
    static async connect(): Promise<Printer> {
        const connection = new PrinterConnection();
        const usbDevice = await connection.getUsbPrinter();

        if (!usbDevice) {
            throw new Error('USBプリンターが見つかりませんでした');
        }

        const config = PrinterConfig.read();
        const compiler = new ReceiptLineRuntime();
        const printer = new Printer(
            new WebUsbPrinterDriver(usbDevice),
            config,
            compiler
        );

        await printer.driver.connect();
        return printer;
    }

    private constructor(
        private driver: PrinterDriver,
        public config: PrinterConfig,
        private compiler: ReceiptLineRuntime
    ) {}

    public async print(receipt: Printable) {
        if (!this.config.characterEncoding) {
            throw new Error('プリンター文字コードを設定してください');
        }

        if (!this.config.command) {
            throw new Error('プリンターコマンドを設定してください');
        }

        if (!this.compiler.runtime) {
            throw new Error('レシートコンパイラが初期化されていません');
        }

        if (this.config.command !== 'escpos') {
            throw new Error('ESC/POS以外には対応していません');
        }

        const cpl =
            this.config.receiptWidth > 0 ? this.config.receiptWidth : undefined;

        const src = this.compiler.runtime.transform(receipt.contents, {
            encoding: this.config.characterEncoding,
            command: 'svg',
            cpl,
        });

        const imageData = await new PrinterImage(new PrinterSvg(src)).data;
        const escPosCommand = PrinterEscPosCommand.fromImageData(imageData);
        await this.driver.send(escPosCommand.binary);
    }

    async disconnect() {
        await this.driver.disconnect();
    }

    clearConnection() {
        const connection = new PrinterConnection();
        connection.clear();
    }
}
