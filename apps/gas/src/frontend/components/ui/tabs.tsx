import { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
import { cva } from 'class-variance-authority';

import { cn } from '@/lib/utils';

function Tabs({
    className,
    orientation = 'horizontal',
    ...props
}: TabsPrimitive.Root.Props) {
    return (
        <TabsPrimitive.Root
            data-slot="tabs"
            data-orientation={orientation}
            className={cn(
                'group/tabs flex gap-2 data-horizontal:flex-col',
                className
            )}
            {...props}
        />
    );
}

const tabsListVariants = cva(
    'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
    {
        variants: {
            variant: {
                default: 'bg-muted',
                line: 'gap-1 bg-transparent',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
    return (
        <TabsPrimitive.List
            className={cn('flex gap-8 border-b', className)}
            {...props}
        />
    );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
    return (
        <TabsPrimitive.Tab
            data-slot="tabs-trigger"
            className={cn(
                // layout
                'relative inline-flex items-center justify-center',
                'pb-4 text-sm transition-all whitespace-nowrap',

                // inactive
                'font-medium text-muted-foreground',
                'hover:text-primary-container',

                // active
                'data-active:text-primary-container',
                'data-active:font-bold',

                // underline
                'after:absolute after:left-0 after:bottom-0',
                'after:h-0.5 after:w-full',
                'after:bg-primary-container',
                'after:scale-x-0 after:transition-transform',
                'data-active:after:scale-x-100',

                // remove shadcn default look
                'rounded-none border-0 bg-transparent shadow-none',

                className
            )}
            {...props}
        />
    );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
    return (
        <TabsPrimitive.Panel
            data-slot="tabs-content"
            className={cn('flex-1 text-sm outline-none', className)}
            {...props}
        />
    );
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger };
