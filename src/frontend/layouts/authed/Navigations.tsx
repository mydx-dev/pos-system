import {
    CircleQuestionMark,
    Settings,
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
        label: 'ユーザー',
        to: routes.user.list,
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
