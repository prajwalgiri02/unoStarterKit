export const STORAGE_KEYS = {
    SIDEBAR_COLLAPSED: 'sidebar_collapsed',
    SIDEBAR_OPEN_GROUPS: 'sidebar_open_groups',
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
