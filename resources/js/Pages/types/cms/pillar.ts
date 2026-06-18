import type { PageProps } from "../index";

/** Mirrors PillarResource.php */
export interface Pillar {
    id: number;
    origin_name: string;
    ikthus_name: string;
    description: string;
    icon_url?: string | null;
    color_configuration?: string | Record<string, string> | null;
    created_at?: string;
    updated_at?: string;
}

/** Pillar list item */
export type PillarListItem = Pick<
    Pillar,
    | "id"
    | "origin_name"
    | "ikthus_name"
    | "description"
    | "icon_url"
    | "color_configuration"
>;

/** Pillar summary (used in GGI dropdowns) */
export interface PillarSummary {
    id: number;
    origin_name: string;
    ikthus_name: string;
}

export type PillarIndexPageProps = PageProps & {
    pillars: PillarListItem[] | { data: PillarListItem[] };
};

export type PillarFormPageProps = PageProps & {
    pillar?: Pillar | { data: Pillar };
};

export type PillarDetailPageProps = PageProps & {
    pillar: Pillar | { data: Pillar };
};
