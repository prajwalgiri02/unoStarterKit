import type { PageProps } from "../index";

/** Mirrors PhaseResource.php */
export interface Phase {
    id: number;
    name: string;
    description: string;
    child_copy: string;
    parent_copy: string;
    age_from: number | null;
    age_to: number | null;
    icon_url?: string | null;
    color_configuration: string | Record<string, string>;
}

/** Phase list item (lighter shape used in index) */
export type PhaseListItem = Pick<
    Phase,
    | "id"
    | "name"
    | "description"
    | "age_from"
    | "age_to"
    | "icon_url"
    | "color_configuration"
>;

/** Phase summary (used in GGI, User dropdowns) */
export interface PhaseSummary {
    id: number;
    name: string;
    age_from?: number;
    age_to?: number;
}

export type PhaseIndexPageProps = PageProps & {
    phases: PhaseListItem[] | { data: PhaseListItem[] };
};

export type PhaseDetailPageProps = PageProps & {
    phase: Phase | { data: Phase };
};
