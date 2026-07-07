import { PrinterCommand } from './PrinterCommand';

export class PrinterEscPosCommand implements PrinterCommand {
    static fromImageData(imageData: ImageData): PrinterEscPosCommand {
        const { data, width, height } = imageData;
        const bytesPerRow = Math.ceil(width / 8);
        const imageBytes = new Uint8Array(bytesPerRow * height);

        for (let y = 0; y < height; y += 1) {
            for (let x = 0; x < width; x += 1) {
                const offset = (y * width + x) * 4;
                const alpha = data[offset + 3];
                const luminance =
                    data[offset] * 0.299 +
                    data[offset + 1] * 0.587 +
                    data[offset + 2] * 0.114;

                if (alpha > 0 && luminance < 180) {
                    imageBytes[y * bytesPerRow + (x >> 3)] |= 0x80 >> (x & 7);
                }
            }
        }

        const command = new Uint8Array(8 + imageBytes.length + 9);
        let index = 0;

        command.set([0x1b, 0x40], index);
        index += 2;
        command.set(
            [
                0x1d,
                0x76,
                0x30,
                0x00,
                bytesPerRow & 0xff,
                (bytesPerRow >> 8) & 0xff,
                height & 0xff,
                (height >> 8) & 0xff,
            ],
            index
        );
        index += 8;
        command.set(imageBytes, index);
        index += imageBytes.length;
        command.set([0x0a, 0x0a, 0x0a, 0x1d, 0x56, 0x42, 0x00], index);

        return new PrinterEscPosCommand(command);
    }

    static fromString(command: string): PrinterEscPosCommand {
        const binary = Uint8Array.from(command, (char) => char.charCodeAt(0));
        return new PrinterEscPosCommand(binary);
    }
    private constructor(public readonly binary: Uint8Array<ArrayBuffer>) {}
}
