import { BottomNavItem } from './BottomNavItem';
import { navigations } from './Navigations';

export const BottomNav = () => {
    return (
        <>
            {/* BottomNavBar */}
            <nav className="fixed bottom-0 left-0 w-full flex p-2 justify-around items-center pb-safe bg-background shadow-[0_-12px_32px_-4px_rgba(0,32,69,0.08)] z-50 md:hidden">
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
