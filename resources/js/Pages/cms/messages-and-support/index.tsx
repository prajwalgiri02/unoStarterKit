import CmsLayout from "@/layouts/cms-layout";
import { useState, useEffect } from "react";
import ConversationList from "@/components/cms/messages/ConversationList";
import MessageDetail from "@/components/cms/messages/MessageDetail";
import type {
    Conversation,
    MessageType,
    MessageListPageProps as MessagesProps,
} from "@/types/cms/message";
import { router, usePage } from "@inertiajs/react";
import type { PageProps } from "@/types";
import { toast } from "sonner";

function MessagesAndSupport() {
    const { props } = usePage<PageProps & MessagesProps>();
    const { tickets = { data: [] }, filters = {} } = props;

    const conversations = tickets.data;
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const activeFilter: MessageType | "all" = (filters.type as any) || "all";

    useEffect(() => {
        if (conversations.length > 0) {
            if (!selectedId || !conversations.find((m) => m.id === selectedId)) {
                if (window.innerWidth > 1200) {
                    setSelectedId(conversations[0].id);
                }
            }
        } else {
            setSelectedId(null);
        }
    }, [conversations, selectedId]);

    const selectedConversation =
        conversations.find((c) => c.id === selectedId) || null;

    const handleFilterChange = (filter: MessageType | "all") => {
        router.get(
            "/cms/messages",
            { ...filters, type: filter === "all" ? undefined : filter },
            { preserveState: true },
        );
    };

    const handleSortChange = (sort: string) => {
        router.get(
            "/cms/messages",
            { ...filters, sort },
            { preserveState: true },
        );
    };

    const handleMarkAction = (id: number) => {
        router.patch(
            `/cms/messages/${id}/resolve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Ticket marked as resolved");
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        router.delete(`/cms/messages/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Ticket deleted successfully");
                if (selectedId === id) {
                    setSelectedId(null);
                }
            },
        });
    };

    return (
        <div className="messages-layout">
            <ConversationList
                conversations={conversations}
                selectedId={selectedId}
                onSelect={setSelectedId}
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                currentSort={filters.sort || "newest"}
                onSortChange={handleSortChange}
                onDelete={handleDelete}
            />

            <MessageDetail
                conversation={selectedConversation}
                onBack={() => setSelectedId(null)}
                onMarkResolved={handleMarkAction}
                onDelete={handleDelete}
            />
        </div>
    );
}

MessagesAndSupport.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Messages & Support"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="messages-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default MessagesAndSupport;
