import { PrinterSvgSize } from './PrinterSvgSize';

export class PrinterSvg {
    public readonly width: PrinterSvgSize;
    public readonly height: PrinterSvgSize;

    constructor(public readonly src: string) {
        this.width = new PrinterSvgSize(src, 'width');
        this.height = new PrinterSvgSize(src, 'height');
        this.src = this.src.replace(
            /font-family="[^"]*"/,
            'font-family="BIZ UDGothic, Hiragino Sans, Yu Gothic, Meiryo, MS Gothic, Noto Sans CJK JP, Noto Sans CJK SC, sans-serif"'
        );
    }
}
