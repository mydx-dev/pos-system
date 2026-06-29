import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/hooks/useAuth';
import { RefreshCcw } from 'lucide-react';
import { useSyncDatabase } from '../../hooks/useSyncDatabase';

export const SyncButton = () => {
    const { sessionToken, userId, syncUser } = useAuth();
    const { mutate, isPending } = useSyncDatabase({
        userId,
        syncUser: syncUser,
    });

    return (
        <>
            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => mutate(sessionToken!)}
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
