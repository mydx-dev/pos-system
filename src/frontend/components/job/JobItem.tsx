import { Button } from '../ui/button';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Item, ItemActions, ItemContent, ItemTitle } from '../ui/item';
import { Spinner } from '../ui/spinner';

type JobStatus = 'pending' | 'running' | 'failed' | 'success' | 'unknown';

type ButtonView = {
    label: string;
    disabled?: boolean;
    spinner?: boolean;
    action?: 'retry' | 'cancel';
};

type JobView = {
    disabled: boolean;
    buttons: ButtonView[];
};

const JOB_VIEW: Record<JobStatus, JobView> = {
    pending: {
        disabled: true,
        buttons: [
            {
                label: '実行待ち',
                disabled: true,
            },
        ],
    },

    running: {
        disabled: true,
        buttons: [
            {
                label: '実行中',
                disabled: true,
                spinner: true,
            },
        ],
    },

    failed: {
        disabled: false,
        buttons: [
            {
                label: 'リトライ',
                action: 'retry',
            },
            {
                label: 'キャンセル',
                action: 'cancel',
            },
        ],
    },

    success: {
        disabled: false,
        buttons: [],
    },

    unknown: {
        disabled: false,
        buttons: [],
    },
};

export const JobItem = ({
    label,
    status,
    onRetry,
    onCancel,
}: {
    label: string;
    status: JobStatus;
    onRetry: () => void;
    onCancel: () => void;
}) => {
    const view = JOB_VIEW[status];

    const handleClick = (action?: ButtonView['action']) => {
        switch (action) {
            case 'retry':
                onRetry();
                break;

            case 'cancel':
                onCancel();
                break;
        }
    };

    return (
        <DropdownMenuItem disabled={view.disabled}>
            <Item size="sm">
                <ItemContent>
                    <ItemTitle>{label}</ItemTitle>
                </ItemContent>

                <ItemActions>
                    {view.buttons.map((button) => (
                        <Button
                            key={button.label}
                            variant="outline"
                            size="sm"
                            disabled={button.disabled}
                            onClick={() => handleClick(button.action)}
                        >
                            {button.label}

                            {button.spinner && (
                                <Spinner data-icon="inline-end" />
                            )}
                        </Button>
                    ))}
                </ItemActions>
            </Item>
        </DropdownMenuItem>
    );
};
