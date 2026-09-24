import {
    DocumentTextIcon,
    HomeIcon,
    MessageQuestionIcon,
    MessagesIcon,
    PeopleIcon,
    SettingIcon,
    UsersIcon,
    type IconProps,
} from "@/Components/icons";
import type { ComponentType } from "react";

export type SidebarItem = {
    label: string;
    icon: ComponentType<IconProps>;
    path: string;
};

export const CMS_AUTH_SIGN_OUT_PATH = "/cms/logout";

export const sidebar: SidebarItem[] = [
    { label: "Dashboard", icon: HomeIcon, path: "/cms/dashboard" },
    { label: "User Manager", icon: UsersIcon, path: "/cms/user-manager" },
    { label: "Messages & Support", icon: MessagesIcon, path: "/cms/messages" },
    { label: "Static Content", icon: DocumentTextIcon, path: "/cms/static-content" },
    { label: "FAQs", icon: MessageQuestionIcon, path: "/cms/faqs" },
    { label: "Notifications", icon: PeopleIcon, path: "/cms/notifications" },
    { label: "Settings", icon: SettingIcon, path: "/cms/settings" },
];
