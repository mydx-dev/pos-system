import { HandCoins, type LucideIcon } from 'lucide-react';
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
        icon: HandCoins,
        label: 'レジ',
        to: routes.register.cashier,
    },
];

export const primaryActions: PrimaryAction[] = [];
