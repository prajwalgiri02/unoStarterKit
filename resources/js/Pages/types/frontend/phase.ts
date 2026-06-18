/** Data sent when editing a phase */
export interface PhaseFormData {
    name: string;
    description: string;
    child_copy: string;
    parent_copy: string;
    age_from: string;
    age_to: string;
    primary_color: string;
    light_color: string;
    dark_color: string;
    color_configuration: string;
    icon: File | null;
}
