import type { PrinterSvg } from './PrinterSvg';

export class PrinterImage {
    public readonly data: Promise<ImageData>;
    constructor(svg: PrinterSvg) {
        this.data = (async (): Promise<ImageData> => {
            const image = new Image();

            image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.src)}`;

            await new Promise<void>((resolve, reject) => {
                image.onload = () => resolve();
                image.onerror = () =>
                    reject(new Error('レシート画像の生成に失敗しました'));
            });

            const canvas = document.createElement('canvas');
            canvas.width = svg.width.value || image.naturalWidth || image.width;
            canvas.height =
                svg.height.value || image.naturalHeight || image.height;

            const context = canvas.getContext('2d');
            if (!context) {
                throw new Error('レシート画像を描画できませんでした');
            }

            context.fillStyle = '#fff';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0);

            return context.getImageData(0, 0, canvas.width, canvas.height);
        })();
    }
}
