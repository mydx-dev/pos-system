export class PrinterSvgSize {
    public readonly value: number;
    constructor(svg: string, attribute: 'width' | 'height') {
        const match = svg.match(new RegExp(`${attribute}="([\\d.]+)px"`));
        this.value = match ? Math.ceil(Number(match[1])) : 0;
    }
}
