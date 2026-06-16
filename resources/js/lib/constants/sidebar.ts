import {
    LayoutDashboard,
    Users,
    CalendarDays,
    ListOrdered,
    Layers,
    BarChart3,
    MessageSquare,
    FileText,
    HelpCircle,
    Bell,
    Settings,
    LogOut,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type SidebarSubItem = {
    label: string;
    icon: LucideIcon;
    path?: string;
};

export type SidebarItem = {
    label: string;
    icon: LucideIcon;
    path?: string;
    sub_items?: SidebarSubItem[];
};

export const CMS_AUTH_SIGN_OUT_PATH = '/cms/logout';

export const sidebar: SidebarItem[] = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        path: '/cms/dashboard',
    },
    {
        label: 'User Manager',
        icon: Users,
        path: '/cms/user-manager',
    },
    {
        label: 'Messages & Support',
        icon: MessageSquare,
        path: '/cms/messages',
    },
    {
        label: 'Static Content',
        icon: FileText,
        path: '/cms/static-content',
    },
    {
        label: 'FAQs',
        icon: HelpCircle,
        path: '/cms/faqs',
    },
    {
        label: 'Broadcast Notification',
        icon: Bell,
        path: '/cms/notifications',
    },
    {
        label: 'Settings',
        icon: Settings,
        path: '/cms/settings',
    },
    {
        label: 'Logout',
        icon: LogOut,
        path: CMS_AUTH_SIGN_OUT_PATH,
    },
];
