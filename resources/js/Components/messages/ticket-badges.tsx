import Badge from "@/Components/badges/badge";
import type { Conversation } from "@/Pages/types/cms/message";

export default function TicketBadges({ ticket, className = "" }: { ticket: Conversation; className?: string }) {
    return (
        <>
            <span className={`w-25 shrink-0 px-1.5 ${className}`.trim()}>
                <Badge size="tiny" variant="soft" color={ticket.type === "contact_us" ? "info" : "secondary"}>
                    {ticket.type_label}
                </Badge>
            </span>
            <span className={`w-28 shrink-0 px-1.5 ${className}`.trim()}>
                <Badge size="tiny" variant="soft" color={ticket.status === "pending" ? "warning" : "success"}>
                    {ticket.status_label}
                </Badge>
            </span>
        </>
    );
}
