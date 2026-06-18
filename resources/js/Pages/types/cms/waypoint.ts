import type { PhaseSummary } from "./phase";
import type { PillarSummary } from "./pillar";

// ── Shared form data shape ───────────────────────────────────────────────────

export interface EvidenceField {
    [key: string]: any;
    parent_approval_needed: boolean;
    parent_facing_label: string;
    additional_guidance: string;
    collect_at: string;
    uploads_allowed: string[];
}

/** Full typed shape of the Inertia useForm data for create and edit pages. */
export interface WaypointFormData {
    [key: string]: any;
    title: string;
    banner_scripture: string;
    phase_id: number;
    tier: string;
    pillar_id: number;
    description: string;
    development_rationale: string;
    waypoint_image: File | string | null;
    waypoint_image_url?: string;
    curriculum_outcomes: string[];
    term: string;
    week: string;
    conversation_starters: string[];
    reflection_prompts: string[];
    parent_note_type: string;
    parent_note_block: string;
    parent_note_author: string;
    parent_note_meaning: string;
    lessons: any[];
    status: string;
    // Step 3
    assessable: boolean;
    rubric_pdf: File | string | null;
    rubric_pdf_url?: string;
    parent_approval_needed: boolean;
    parent_facing_label: string;
    additional_guidance: string;
    collect_at: string;
    uploads_allowed: string[];
    // Step 4
    wall_name: string;
    wall_description: string;
    badge_name: string;
    badge_icon: File | string | null;
    badge_icon_url?: string;
    badge_unlock_message: string;
}

// ── Page prop types ──────────────────────────────────────────────────────────

export interface WaypointFormProps {
    phases: PhaseSummary[];
    pillars: PillarSummary[];
    tiers: string[];
    terms: string[];
    weeks: (number | string)[];
    parent_note_types: string[];
    draftWaypointId?: number | null;
}

/** Named interface for the waypoint data passed to the edit page (I15). */
export interface WaypointDetail {
    id: number;
    title: string;
    banner_scripture?: string;
    phase_id: number;
    phase?: {
        id: number;
        name: string;
        color_configuration?: any;
        icon_url?: string;
    } | null;
    pillar_id: number;
    pillar?: {
        id: number;
        origin_name: string;
    } | null;
    tier: string;
    status: string;
    description: string;
    development_rationale: string;
    term: string;
    week: string;
    parent_note_type: string;
    parent_note_block: string;
    parent_note_author: string;
    parent_note_meaning: string;
    curriculum_outcomes: string[];
    conversation_starters: string[];
    reflection_prompts: string[];
    waypoint_image_url: string;
    rubric_pdf_url: string;
    badge_icon_url: string;
    assessable?: boolean;
    parent_approval_needed?: boolean;
    parent_facing_label?: string;
    additional_guidance?: string;
    collect_at?: string;
    uploads_allowed?: string[];
    wall_name?: string;
    wall_description?: string;
    badge_name?: string;
    badge_unlock_message?: string;
    lessons?: any[];
}

export interface EditWaypointProps extends WaypointFormProps {
    waypoint: WaypointDetail;
    initialStep?: number;
}
