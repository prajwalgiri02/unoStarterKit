/** Mirrors SupportTicketResource.php */
export type MessageType = "contact_us" | "dispute";
export type MessageStatus = "pending" | "resolved";

export interface Conversation {
    id: number;
    name: string;
    email: string;
    message: string;
    type: MessageType;
    type_label: string;
    type_badge_class: string;
    status: MessageStatus;
    status_label: string;
    status_badge_class: string;
    resolved_at: string | null;
    date: string;
    created_at: string;
}

export interface TicketType {
    value: string;
    label: string;
    badge_class: string;
}

export interface MessagesPageProps {
    tickets: { data: Conversation[] };
    ticket_types: TicketType[];
    filters: {
        type?: string;
        sort?: string;
    };
}
export type MessageListPageProps = MessagesPageProps;
