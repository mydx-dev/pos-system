import { Tablet } from 'lucide-react';

type RegisterTerminalCardProps = {
    name: string;
    enabled: boolean;
    issuedAt?: string | null;
    lastUsedAt?: string | null;
};

const formatDateTime = (value?: string | null) => {
    if (!value) return '未使用';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

const DeviceIcon = () => {
    return <Tablet className="size-6" />;
};

export const RegisterTerminalCard = ({
    name,
    enabled,
    issuedAt,
    lastUsedAt,
}: RegisterTerminalCardProps) => {
    return (
        <article
            className={`flex min-h-64 flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-lg shadow-[0_4px_12px_rgba(26,32,44,0.05)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(26,32,44,0.08)] ${enabled ? '' : 'opacity-75'}`}
        >
            <div className="mb-md flex items-start justify-between gap-md">
                <div
                    className={
                        enabled
                            ? 'rounded-lg bg-primary-container p-sm text-on-primary'
                            : 'rounded-lg bg-surface-variant p-sm text-on-surface-variant'
                    }
                >
                    <DeviceIcon />
                </div>
                <span
                    className={
                        enabled
                            ? 'inline-flex items-center gap-xs rounded-full bg-secondary-fixed px-sm py-xs text-label-md font-label-md text-on-secondary-fixed'
                            : 'inline-flex items-center gap-xs rounded-full bg-surface-variant px-sm py-xs text-label-md font-label-md text-on-surface-variant'
                    }
                >
                    <span
                        className={
                            enabled
                                ? 'size-2 rounded-full bg-primary'
                                : 'size-2 rounded-full bg-outline'
                        }
                    />
                    {enabled ? '有効' : '無効'}
                </span>
            </div>

            <h3 className="mb-xs font-headline-md text-headline-md text-primary">
                {name}
            </h3>
            <p className="mb-xl text-label-md font-label-md text-on-surface-variant">
                レジ端末
            </p>

            <dl className="mt-auto space-y-sm text-body-sm font-body-sm">
                <div className="flex items-center justify-between gap-md">
                    <dt className="text-on-surface-variant">発行日時</dt>
                    <dd className="text-right text-on-surface">
                        {formatDateTime(issuedAt)}
                    </dd>
                </div>
                <div className="flex items-center justify-between gap-md">
                    <dt className="text-on-surface-variant">最終利用日時</dt>
                    <dd className="text-right text-on-surface">
                        {formatDateTime(lastUsedAt)}
                    </dd>
                </div>
            </dl>
        </article>
    );
};
