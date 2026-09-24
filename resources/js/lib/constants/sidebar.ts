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
    // @module:user_manager
    { label: "User Manager", icon: UsersIcon, path: "/cms/user-manager" },
    // @endmodule:user_manager
    // @module:support
    { label: "Messages & Support", icon: MessagesIcon, path: "/cms/messages" },
    // @endmodule:support
    // @module:static_content
    { label: "Static Content", icon: DocumentTextIcon, path: "/cms/static-content" },
    // @endmodule:static_content
    // @module:faqs
    { label: "FAQs", icon: MessageQuestionIcon, path: "/cms/faqs" },
    // @endmodule:faqs
    // @module:notifications
    { label: "Notifications", icon: PeopleIcon, path: "/cms/notifications" },
    // @endmodule:notifications
    { label: "Settings", icon: SettingIcon, path: "/cms/settings" },
];
