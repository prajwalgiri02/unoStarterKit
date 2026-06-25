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
        label: 'Delivery Manager',
        icon: "/images/sidebar/delivery-manager.svg",
        path: '/cms/delivery-manager',
    },
    {
        label: 'Category Manager',
        icon: "/images/sidebar/category-manager.svg",
        path: '/cms/category-manager',
    },
    {
        label: 'Vehicle Manager',
        icon: "/images/sidebar/vehicle-manager.svg",
        path: '/cms/vehicle-manager',
    },
    {
        label: 'Subscription',
        icon: "/images/sidebar/subscription.svg",
        path: '/cms/subscription',
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
