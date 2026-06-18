export type User = {
    id: number;
    name: string;
    email: string;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    cms: {
        sessionLifetimeMinutes: number;
        sessionExpireOnBrowserClose: boolean;
        assetBaseUrl: string;
    };
    flash: {
        success: string | null;
        error: string | null;
    };
};
