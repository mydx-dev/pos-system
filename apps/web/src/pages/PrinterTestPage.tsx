import { PrinterTestPanel } from '../components/PrinterTestPanel';

export const PrinterTestPage = () => (
    <main className="app-shell">
        <section className="page-header">
            <p className="eyebrow">MYDX POS</p>
            <h1>WebUSB Print Test</h1>
            <p>
                トップレベルReactアプリからUSBプリンターを選択し、テストレシートを送信します。
            </p>
        </section>
        <PrinterTestPanel />
    </main>
);
