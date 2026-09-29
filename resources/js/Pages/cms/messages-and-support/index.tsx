import TicketDetail from "@/Components/messages/ticket-detail";
import TicketList, { type TicketFilter } from "@/Components/messages/ticket-list";
import ConfirmModal from "@/Components/modals/confirm-modal";
import AppLayout from "@/Layouts/app-layout";
import type { Conversation, MessageListPageProps } from "@/Pages/types/cms/message";
import { router } from "@inertiajs/react";
import { useState } from "react";

function MessagesAndSupport({ tickets, filters }: MessageListPageProps) {
    const list = tickets.data;
    const [selectedId, setSelectedId] = useState<number | null>(list[0]?.id ?? null);
    const [ticketToDelete, setTicketToDelete] = useState<Conversation | null>(null);
    const [deleting, setDeleting] = useState(false);

    const selected = list.find((ticket) => ticket.id === selectedId) ?? list[0] ?? null;
    const filter = (filters.type as TicketFilter | undefined) ?? "all";
    const sort = filters.sort;

    const visit = (params: Record<string, string | undefined>) => {
        router.get("/cms/messages", { type: filter === "all" ? undefined : filter, sort, ...params }, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resolve = (ticket: Conversation) => {
        router.patch(`/cms/messages/${ticket.id}/resolve`, {}, { preserveScroll: true });
    };

    const confirmDelete = () => {
        if (!ticketToDelete) return;
        setDeleting(true);
        router.delete(`/cms/messages/${ticketToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setTicketToDelete(null),
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <div className="grid grid-cols-1 items-start gap-6 xl:h-[calc(100dvh-90px-3rem)] xl:min-h-120 xl:grid-cols-[minmax(0,598fr)_minmax(0,491fr)] xl:grid-rows-[minmax(0,1fr)] xl:items-stretch">
            <TicketList
                tickets={list}
                selectedId={selected?.id ?? null}
                onSelect={setSelectedId}
                filter={filter}
                onFilterChange={(value) => visit({ type: value === "all" ? undefined : value })}
                sort={sort}
                onSortChange={(value) => visit({ sort: value })}
                onResolve={resolve}
                onDelete={setTicketToDelete}
            />
            <TicketDetail ticket={selected} onResolve={resolve} onDelete={setTicketToDelete} />

            <ConfirmModal
                open={ticketToDelete !== null}
                onClose={() => setTicketToDelete(null)}
                onConfirm={confirmDelete}
                processing={deleting}
                title="Delete message?"
                description={`This will permanently remove the message from ${ticketToDelete?.name ?? "this user"}.`}
                warning="This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
    );
}

MessagesAndSupport.layout = (page: React.ReactNode) => (
    <AppLayout title="Messages & Support">{page}</AppLayout>
);

export default MessagesAndSupport;
