export interface PrinterDriver {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(command: BufferSource): Promise<void>;
}
