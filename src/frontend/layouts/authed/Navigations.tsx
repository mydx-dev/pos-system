import {
    CircleQuestionMark,
    CalendarClock,
    ClipboardList,
    Settings,
    UserRoundPlus,
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
        icon: UserRoundPlus,
        label: '顧客登録',
        to: routes.customer.create,
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
