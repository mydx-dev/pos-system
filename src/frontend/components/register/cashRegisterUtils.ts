export type RegisterOperation = '精算' | '取消' | '返金';

export const formatCurrency = (value: number) =>
    new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);

export const timeText = (iso: string) =>
    new Intl.DateTimeFormat('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));

export const dateTimeText = (iso: string) =>
    new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(iso));

export const numberValue = (value: string) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

export const operationLabel = {
    精算: '精算',
    取消: '精算取消',
    返金: '返金',
} as const;

export const inputClassName =
    'h-10 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-3 text-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20';

export const today = () => {
    const date = new Date();
    return [
        date.getFullYear(),
        `${date.getMonth() + 1}`.padStart(2, '0'),
        `${date.getDate()}`.padStart(2, '0'),
    ].join('-');
};

export const dateKey = (iso: string) => {
    const date = new Date(iso);
    return [
        date.getFullYear(),
        `${date.getMonth() + 1}`.padStart(2, '0'),
        `${date.getDate()}`.padStart(2, '0'),
    ].join('-');
};
