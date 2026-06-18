/** Question as composed in the frontend form before submission */
export interface GgiQuestionFormItem {
    id?: number;
    order: number;
    prompt: string;
    pillar_id: string;
    pillar_name?: string;
    weight: number;
    question_type: string;
    interaction_type: string;
    keywords: string[];
    options: { id?: number; option_text: string; points: number }[];
    local_key: string;
}

/** GGI form data sent to backend on create/edit */
export interface GgiFormData {
    name: string;
    phase_id: string;
    tier: string;
    description: string;
    questions: GgiQuestionFormItem[];
    status: string;
}
