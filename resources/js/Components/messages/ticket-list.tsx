import Avatar from "@/Components/common/avatar";
import DropdownMenu from "@/Components/common/dropdown-menu";
import SortMenu from "@/Components/common/sort-menu";
import Tabs from "@/Components/common/tabs";
import { DotsVerticalIcon, TickCircleIcon, TrashLinearIcon } from "@/Components/icons";
import TicketBadges from "@/Components/messages/ticket-badges";
import type { Conversation, MessageType } from "@/Pages/types/cms/message";

export type TicketFilter = MessageType | "all";

const filterTabs: { value: TicketFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "contact_us", label: "Contact Us" },
    { value: "dispute", label: "Disputes" },
];

const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "name_asc", label: "Name A–Z" },
    { value: "name_desc", label: "Name Z–A" },
];

type TicketListProps = {
    tickets: Conversation[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    filter: TicketFilter;
    onFilterChange: (filter: TicketFilter) => void;
    sort?: string;
    onSortChange: (sort: string) => void;
    onResolve: (ticket: Conversation) => void;
    onDelete: (ticket: Conversation) => void;
};

export default function TicketList({
    tickets,
    selectedId,
    onSelect,
    filter,
    onFilterChange,
    sort,
    onSortChange,
    onResolve,
    onDelete,
}: TicketListProps) {
    return (
        <section aria-label="Inbox" className="flex flex-col gap-5 rounded-3xl bg-base-white pt-7 pb-3">
            <div className="flex items-center justify-between gap-4 px-6">
                <h2 className="text-subtitle-lg font-medium text-neutral-800">Inbox</h2>
                <SortMenu options={sortOptions} value={sort} onChange={onSortChange} />
            </div>

            <div className="px-6">
                <Tabs label="Filter messages" items={filterTabs} value={filter} onChange={onFilterChange} />
            </div>

            {tickets.length === 0 ? (
                <p className="px-6 py-10 text-center text-body-xs text-neutral-500">No messages found</p>
            ) : (
                <ul className="flex flex-col">
                    {tickets.map((ticket) => {
                        const selected = ticket.id === selectedId;

                        return (
                            <li
                                key={ticket.id}
                                className={`grid h-14 grid-cols-[minmax(0,1fr)_auto_20px] items-center gap-7 pr-7 transition-colors sm:grid-cols-[minmax(0,1fr)_100px_112px_auto_20px] ${selected ? "bg-neutral-25" : "hover:bg-neutral-25"}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelect(ticket.id)}
                                    aria-current={selected ? "true" : undefined}
                                    className="col-span-2 grid h-full cursor-pointer grid-cols-subgrid items-center pl-6 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-primary-50 focus-visible:ring-inset sm:col-span-4"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        <Avatar name={ticket.name} />
                                        <span className="truncate text-link-sm text-neutral-900">{ticket.name}</span>
                                    </span>
                                    <TicketBadges ticket={ticket} columns className="hidden sm:block" />
                                    <span className="text-body-xs whitespace-nowrap text-neutral-600">{ticket.date}</span>
                                </button>
                                <span className="-mx-1.5 flex">
                                    <DropdownMenu
                                        label={`Options for ${ticket.name}`}
                                        trigger={<DotsVerticalIcon />}
                                        items={[
                                            {
                                                label: "Mark as completed",
                                                icon: <TickCircleIcon />,
                                                disabled: ticket.status !== "pending",
                                                onSelect: () => onResolve(ticket),
                                            },
                                            { label: "Delete message", icon: <TrashLinearIcon />, tone: "danger", onSelect: () => onDelete(ticket) },
                                        ]}
                                    />
                                </span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
