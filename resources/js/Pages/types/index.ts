export type User = {
    id: number;
    name: string;
    email: string;
};

export type AppNotification = {
    id: number;
    title: string;
    message: string;
    read: boolean;
    created_at: string | null;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    inboxNotifications?: AppNotification[];
    cms: {
        // sessionLifetimeMinutes: number;
        // sessionExpireOnBrowserClose: boolean;
        assetBaseUrl: string;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
};
