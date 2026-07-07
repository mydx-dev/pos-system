import { BottomNavItem } from '../authed/BottomNavItem';
import { navigations } from './RegisterNavigation';

export const BottomNav = () => {
    return (
        <>
            {/* BottomNavBar */}
            <nav className="fixed bottom-0 left-0 z-50 flex h-16 w-full items-center justify-around bg-background p-2 pb-safe shadow-[0_-12px_32px_-4px_rgba(0,32,69,0.08)]">
                {navigations.map((nav) => (
                    <BottomNavItem
                        key={nav.label}
                        icon={<nav.icon size={20} />}
                        label={nav.label}
                        to={nav.to}
                    />
                ))}
            </nav>
        </>
    );
};
