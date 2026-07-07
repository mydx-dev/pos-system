export interface UsbPrinterConfig {
    vendorId: number;
    productId: number;
    serialNumber?: string | null;
}

export class PrinterConnection {
    private readonly key = 'printerUsbDevice';

    constructor() {}

    async getUsbPrinter(): Promise<USBDevice> {
        if (!navigator.usb) {
            throw new Error('このブラウザはWebUSBに対応していません');
        }

        const stored = localStorage.getItem(this.key);

        if (!stored) {
            return await this.requestUsbPrinter();
        }

        const saved: UsbPrinterConfig = JSON.parse(stored);

        const devices = await navigator.usb.getDevices();

        const device = devices.find(
            (d) =>
                d.vendorId === saved.vendorId &&
                d.productId === saved.productId &&
                (saved.serialNumber === null ||
                    d.serialNumber === saved.serialNumber)
        );

        if (!device) {
            this.clear();
            return await this.requestUsbPrinter();
        }
        return device;
    }

    clear() {
        localStorage.removeItem(this.key);
    }

    private async requestUsbPrinter(): Promise<USBDevice> {
        const device = await navigator.usb.requestDevice({ filters: [] });

        localStorage.setItem(
            this.key,
            JSON.stringify({
                vendorId: device.vendorId,
                productId: device.productId,
                productName: device.productName,
                serialNumber: device.serialNumber ?? null,
            })
        );

        return device;
    }
}
