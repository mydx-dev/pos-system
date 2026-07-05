import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { RefreshCcw } from 'lucide-react';
import { useSyncDatabaseRegisterTerminal } from '../../hooks/useSyncDatabaseRegisterTerminal';

export const SyncButtonRegisterTerminal = () => {
    const { mutate, isPending } = useSyncDatabaseRegisterTerminal();

    return (
        <>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => mutate()}
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Spinner data-icon="inline-start" />
                            ) : (
                                <RefreshCcw className="text-primary-container" />
                            )}
                        </Button>
                    }
                />
                <TooltipContent>データを同期</TooltipContent>
            </Tooltip>
        </>
    );
};
