import Badge from "@/Components/badges/badge";
import type { Conversation } from "@/Pages/types/cms/message";

type TicketBadgesProps = {
    ticket: Conversation;
    columns?: boolean;
    className?: string;
};

export default function TicketBadges({ ticket, columns = false, className = "" }: TicketBadgesProps) {
    const typeBadge = (
        <Badge size="tiny" variant="soft" color={ticket.type === "contact_us" ? "info" : "secondary"}>
            {ticket.type_label}
        </Badge>
    );
    const statusBadge = (
        <Badge size="tiny" variant="soft" color={ticket.status === "pending" ? "warning" : "success"}>
            {ticket.status_label}
        </Badge>
    );

    if (!columns) {
        return (
            <span className={`flex items-center gap-2 ${className}`.trim()}>
                {typeBadge}
                {statusBadge}
            </span>
        );
    }

    return (
        <>
            <span className={`w-25 shrink-0 px-1.5 ${className}`.trim()}>{typeBadge}</span>
            <span className={`w-28 shrink-0 px-1.5 ${className}`.trim()}>{statusBadge}</span>
        </>
    );
}
