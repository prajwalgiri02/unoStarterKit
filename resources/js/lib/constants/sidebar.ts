export type SidebarItem = {
    label: string;
    icon: string;
    path?: string;
};

export const CMS_AUTH_SIGN_OUT_PATH = '/cms/logout';

export const sidebar: SidebarItem[] = [
    {
        label: 'Dashboard',
        icon: "/images/sidebar/dashboard.svg",
        path: '/cms/dashboard',
    },
    {
        label: 'User Manager',
        icon: "/images/sidebar/user-manager.svg",
        path: '/cms/user-manager',
    },
    {
        label: 'Messages & Support',
        icon: "/images/sidebar/message-support.svg",
        path: '/cms/messages',
    },
    {
        label: 'Static Content',
        icon: "/images/sidebar/static-content.svg",
        path: '/cms/static-content',
    },
    {
        label: 'FAQs',
        icon: "/images/sidebar/faqs.svg",
        path: '/cms/faqs',
    },
    {
        label: 'Notification',
        icon: "/images/sidebar/notifications.svg",
        path: '/cms/notifications',
    },
    {
        label: 'Settings',
        icon: "/images/sidebar/settings.svg",
        path: '/cms/settings',
    },
    {
        label: 'Logout',
        icon: "/images/sidebar/logout.svg",
        path: CMS_AUTH_SIGN_OUT_PATH,
    },
];
