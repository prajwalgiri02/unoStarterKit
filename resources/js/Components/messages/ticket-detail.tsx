import Button from "@/Components/buttons/button";
import Avatar from "@/Components/common/avatar";
import DetailField from "@/Components/common/detail-field";
import DropdownMenu from "@/Components/common/dropdown-menu";
import { DotsVerticalIcon, TrashLinearIcon } from "@/Components/icons";
import TicketBadges from "@/Components/messages/ticket-badges";
import type { Conversation } from "@/Pages/types/cms/message";

type TicketDetailProps = {
    ticket: Conversation | null;
    onResolve: (ticket: Conversation) => void;
    onDelete: (ticket: Conversation) => void;
};

export default function TicketDetail({ ticket, onResolve, onDelete }: TicketDetailProps) {
    if (!ticket) {
        return (
            <section className="flex min-h-80 items-center justify-center rounded-3xl xl:h-full bg-base-white p-6 text-body-xs text-neutral-500 shadow-panel">
                Select a message to view its details
            </section>
        );
    }

    return (
        <section aria-label="Message details" className="flex min-h-0 flex-col gap-8 overflow-y-auto scrollbar-none rounded-3xl bg-base-white pb-8 shadow-panel xl:h-full">
            <header className="sticky top-0 z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-neutral-100 bg-base-white py-3 pr-2 pl-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={ticket.name} size="medium" />
                    <div className="min-w-0">
                        <p className="truncate text-body-lg font-semibold text-neutral-800">{ticket.name}</p>
                        <p className="truncate text-link-sm font-normal text-neutral-500">{ticket.email}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <TicketBadges ticket={ticket} />
                    <DropdownMenu
                        label="Message options"
                        trigger={<DotsVerticalIcon />}
                        items={[{ label: "Delete message", icon: <TrashLinearIcon />, tone: "danger", onSelect: () => onDelete(ticket) }]}
                    />
                </div>
            </header>

            <dl className="flex flex-col gap-5 px-6">
                <DetailField label="Date">{ticket.date}</DetailField>
                <DetailField label={ticket.type_label}>
                    <span className="block text-body-xs whitespace-pre-line">{ticket.message}</span>
                </DetailField>
                {ticket.resolved_at && <DetailField label="Resolved On">{ticket.resolved_at}</DetailField>}
            </dl>

            {ticket.status === "pending" && (
                <div className="px-6">
                    <Button size="medium" onClick={() => onResolve(ticket)}>
                        Mark as Completed
                    </Button>
                </div>
            )}
        </section>
    );
}
