import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';

type SidebarNavItemProps = {
    to: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    end?: boolean;
};

export const SidebarNavItem = ({
    to,
    icon,
    children,
    end,
}: SidebarNavItemProps) => {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                cn(
                    'flex items-center space-x-3 px-6 py-4 transition-all duration-200',
                    isActive
                        ? 'bg-primary-container/10 text-primary-container border-r-4 border-primary-container active:scale-100'
                        : 'text-slate-400 hover:bg-primary-container/5 hover:text-primary-container'
                )
            }
            end={end}
        >
            {icon}

            <span>{children}</span>
        </NavLink>
    );
};
