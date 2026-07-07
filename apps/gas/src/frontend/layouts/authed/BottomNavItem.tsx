import { NavLink } from 'react-router-dom';

export const BottomNavItem = ({
    icon,
    label,
    to,
}: {
    icon: React.ReactNode;
    label: string;
    to: string;
}) => {
    return (
        <>
            <NavLink
                className={({ isActive }) =>
                    `flex flex-col items-center justify-center px-2 py-2 duration-150 ${
                        isActive
                            ? 'bg-primary-container/10 text-primary-container'
                            : 'text-slate-400 hover:bg-primary-container/5 hover:text-primary-container'
                    }`
                }
                to={to}
            >
                {icon}
                <span className="font-inter text-[11px] font-semibold uppercase tracking-wider">
                    {label}
                </span>
            </NavLink>
        </>
    );
};
