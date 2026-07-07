import { PrinterDriver } from './PrinterDriver';

export class WebUsbPrinterDriver implements PrinterDriver {
    private endpointNumber: number | null = null;

    constructor(private readonly device: USBDevice) {}

    async connect() {
        if (!this.device.opened) {
            await this.device.open();
        }
        if (!this.device.configuration) {
            await this.device.selectConfiguration(1);
        }
        const configuration = this.device.configuration;

        if (!configuration) {
            throw new Error('USBプリンターのConfigurationが見つかりません');
        }

        const iface = this.device.configuration.interfaces.find((i) =>
            i.alternates.some((a) =>
                a.endpoints.some(
                    (e) => e.direction === 'out' && e.type === 'bulk'
                )
            )
        );

        if (!iface) {
            throw new Error('USBプリンター用Interfaceが見つかりません');
        }

        await this.device.claimInterface(iface.interfaceNumber);

        const endpoint = iface.alternates
            .flatMap((a) => [...a.endpoints])
            .find((e) => e.direction === 'out' && e.type === 'bulk');

        if (!endpoint) {
            throw new Error('OUT endpoint が見つかりません');
        }

        this.endpointNumber = endpoint.endpointNumber;
    }

    async disconnect() {
        if (this.device.opened) {
            await this.device.close();
        }
        this.endpointNumber = null;
    }

    async send(command: BufferSource) {
        if (this.endpointNumber === null) {
            throw new Error('PrinterDriver が接続されていません');
        }

        await this.device.transferOut(this.endpointNumber, command);
    }
}
