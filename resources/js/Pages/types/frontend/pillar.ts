/** Data sent when creating/editing a pillar */
export interface PillarFormData {
    origin_name: string;
    ikthus_name: string;
    description: string;
    icon: File | null;
}
