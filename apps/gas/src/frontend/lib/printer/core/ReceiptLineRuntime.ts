import type ReceiptLine from 'receiptline';
import receiptLineSource from 'receiptline/lib/receiptline.js?raw';

type ReceiptLineRuntimeModule = {
    transform: (doc: string, printer?: ReceiptLine.Printer) => string;
};

export class ReceiptLineRuntime {
    private static runtime: ReceiptLineRuntimeModule | null = null;

    public readonly runtime: ReceiptLineRuntimeModule;

    constructor() {
        ReceiptLineRuntime.runtime ??= ReceiptLineRuntime.createRuntime();
        this.runtime = ReceiptLineRuntime.runtime;
    }

    private static createRuntime(): ReceiptLineRuntimeModule {
        const browserWindow = {} as { receiptline?: ReceiptLineRuntimeModule };
        const runtime = new Function(
            'window',
            'module',
            'exports',
            'require',
            `${receiptLineSource}\nreturn window.receiptline;`
        )(
            browserWindow,
            undefined,
            undefined,
            undefined
        ) as ReceiptLineRuntimeModule;

        if (!runtime?.transform) {
            throw new Error('レシートコンパイラの初期化に失敗しました');
        }

        return runtime;
    }
}
