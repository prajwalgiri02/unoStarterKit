/** Mirrors ContactMessageResource.php */
export type MessageType = "contact" | "report";
export type MessageStatus = "pending" | "resolved";

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject?: string;
    message: string;
    is_read: boolean;
    status: MessageStatus;
    type: MessageType;
    date: string;
    avatar_text: string;
    avatar_color: "orange" | "teal" | "blue" | "pink";
}

export interface MessagesPageProps {
    messages: ContactMessage[];
    filters: {
        type?: string;
        status?: string;
        search?: string;
        sort?: string;
    };
}
export type Conversation = ContactMessage;
export type MessageListPageProps = MessagesPageProps;
