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
    const { messages = [], filters = {} } = props;

    const [selectedId, setSelectedId] = useState<number | null>(null);

    const activeFilter: MessageType | "all" = (filters.type as any) || "all";

    useEffect(() => {
        if (messages.length > 0) {
            if (!selectedId || !messages.find((m) => m.id === selectedId)) {
                if (window.innerWidth > 1200) {
                    setSelectedId(messages[0].id);
                }
            }
        } else {
            setSelectedId(null);
        }
    }, [messages, selectedId]);

    const selectedConversation =
        messages.find((c) => c.id === selectedId) || null;

    const handleFilterChange = (filter: MessageType | "all") => {
        router.get(
            "/cms/messages-and-support",
            { ...filters, type: filter === "all" ? undefined : filter },
            { preserveState: true },
        );
    };

    const handleSortChange = (sort: string) => {
        router.get(
            "/cms/messages-and-support",
            { ...filters, sort },
            { preserveState: true },
        );
    };

    const handleMarkAction = (id: number, status: string) => {
        router.put(
            `/cms/messages/${id}`,
            {
                status: status,
                is_read: true,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Mail marked as read");
                },
            },
        );
    };

    const handleDelete = (id: number) => {
        router.delete(`/cms/messages/${id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success("Message deleted successfully");
                if (selectedId === id) {
                    setSelectedId(null);
                }
            },
        });
    };

    return (
        <div className="messages-layout">
            <ConversationList
                conversations={messages}
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
                onMarkAction={handleMarkAction}
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
