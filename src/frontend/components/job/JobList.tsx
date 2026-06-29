import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { job } from '@/lib/AppsScriptClient';
import { useAppsScriptJob } from '@mydx-dev/gas-boost-react-apps-script';
import { EllipsisVertical } from 'lucide-react';
import { JobItem } from './JobItem';

export const JobList = () => {
    const jobs = useAppsScriptJob(job.store);

    return (
        <>
            <DropdownMenu>
                {jobs.length > 0 && (
                    <DropdownMenuTrigger
                        className="relative"
                        render={
                            <Button
                                variant="ghost"
                                size="lg"
                                className="relative"
                            >
                                <EllipsisVertical />
                                <Badge className="absolute -top-2 -right-1 bg-primary-container">
                                    {jobs.length}
                                </Badge>
                            </Button>
                        }
                    />
                )}
                <DropdownMenuContent className="w-80">
                    <DropdownMenuGroup>
                        {jobs.map((j) => (
                            <JobItem
                                key={j.id}
                                label={j.label}
                                status={j.status}
                                onRetry={() => job.retry(j.id)}
                                onCancel={() => job.cancel(j.id)}
                            />
                        ))}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
