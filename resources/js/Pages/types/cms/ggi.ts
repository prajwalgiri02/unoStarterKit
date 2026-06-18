import type { PaginatedResponse } from "../ui/pagination";
import type { GgiFilterState } from "../ui/filters";
import type { PhaseSummary } from "./phase";
import type { PillarSummary } from "./pillar";

/** Mirrors GgiQuestionResource option shape */
export interface GgiQuestionOption {
    id: number;
    option_text: string;
    points: number;
}

/** Mirrors GgiQuestionResource.php */
export interface GgiQuestion {
    id: number;
    prompt: string;
    pillar_id: number;
    pillar_name?: string;
    weight: number;
    question_type: string;
    interaction_type: string;
    keywords?: string[];
    order: number;
    options?: GgiQuestionOption[] | null;
}

/** Mirrors GgiFlowResource.php */
export interface GgiFlow {
    id: number;
    name: string;
    phase_id: number;
    phase_name?: string;
    phase_icon_url?: string | null;
    phase_color_configuration?: string | Record<string, string> | null;
    pillar_name?: string;
    tier: string;
    phase_age_range?: string;
    description?: string;
    status?: string;
    question_count: number;
    questions?: GgiQuestion[];
    created_at?: string;
    updated_at?: string;
}

export interface GgiListPageProps {
    flows: PaginatedResponse<GgiFlow>;
    phases: PhaseSummary[];
    pillars: PillarSummary[];
    tiers: string[];
    filters: GgiFilterState;
}

export interface GgiFormPageProps {
    phases: PhaseSummary[];
    pillars: PillarSummary[];
    tiers: string[];
    questionTypes: string[];
    interactionTypes: string[];
    statuses: string[];
}

export type GgiCreatePageProps = GgiFormPageProps;

export interface GgiEditPageProps extends GgiFormPageProps {
    flow: GgiFlow;
}

export interface GgiViewPageProps {
    flow: GgiFlow;
    pillars: PillarSummary[];
    questionTypes: string[];
    interactionTypes: string[];
}
