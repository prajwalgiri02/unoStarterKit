import Badge from "@/Components/badges/badge";
import type { Conversation } from "@/Pages/types/cms/message";

export default function TicketBadges({ ticket }: { ticket: Conversation }) {
    return (
        <>
            <Badge size="tiny" variant="soft" color={ticket.type === "contact_us" ? "info" : "secondary"}>
                {ticket.type_label}
            </Badge>
            <Badge size="tiny" variant="soft" color={ticket.status === "pending" ? "warning" : "success"}>
                {ticket.status_label}
            </Badge>
        </>
    );
}
