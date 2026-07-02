import {
    CircleQuestionMark,
    CalendarClock,
    ClipboardList,
    Settings,
    UsersRound,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { routes } from '../../../shared/routes';

export interface NavigationItem {
    icon: LucideIcon;
    label: string;
    to: string;
}

export interface PrimaryAction {
    icon: LucideIcon;
    label: string;
    onClick: () => void;
}

export const navigations: NavigationItem[] = [
    {
        icon: Users,
        label: 'スタッフ',
        to: routes.employee.list,
    },
    {
        icon: UsersRound,
        label: '顧客',
        to: routes.customer.list,
    },
    {
        icon: CalendarClock,
        label: '予約',
        to: routes.treatment.create,
    },
    {
        icon: ClipboardList,
        label: 'メニュー',
        to: routes.menu.list,
    },
];

export const subNavigations: NavigationItem[] = [
    {
        icon: Settings,
        label: '設定',
        to: routes.system.settings,
    },
    {
        icon: CircleQuestionMark,
        label: 'サポート',
        to: routes.system.support,
    },
];

export const primaryActions: PrimaryAction[] = [];
