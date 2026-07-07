import { Button } from '@/components/ui/button';
import { navigations, primaryActions, subNavigations } from './Navigations';
import { SidebarNavItem } from './SidebarNavItem';

export const Sidebar = () => {
    return (
        <aside className="hidden md:flex sticky top-16 h-[calc(100vh-4rem)] w-64 flex-col dark:bg-slate-950 font-manrope text-sm font-semibold tracking-wide shadow-2xl shadow-slate-950/20 overflow-y-auto">
            <nav className="flex-1">
                {navigations.map((nav) => (
                    <SidebarNavItem
                        key={nav.label}
                        to={nav.to}
                        icon={<nav.icon size={20} />}
                    >
                        {nav.label}
                    </SidebarNavItem>
                ))}
            </nav>

            <div className="px-6 py-8">
                {primaryActions.map((action) => (
                    <Button
                        key={action.label}
                        variant="default"
                        size="lg"
                        className="w-full mb-4"
                        onClick={action.onClick}
                    >
                        {<action.icon className="mr-2" />}
                        {action.label}
                    </Button>
                ))}
            </div>
            <div className="mt-auto border-t border-slate-800/50 py-6">
                {subNavigations.map((nav) => (
                    <SidebarNavItem
                        key={nav.label}
                        to={nav.to}
                        icon={<nav.icon size={20} />}
                    >
                        {nav.label}
                    </SidebarNavItem>
                ))}
            </div>
        </aside>
    );
};
