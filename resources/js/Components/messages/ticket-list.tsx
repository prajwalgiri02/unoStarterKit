import Avatar from "@/Components/common/avatar";
import DropdownMenu from "@/Components/common/dropdown-menu";
import Tabs from "@/Components/common/tabs";
import { DotsVerticalIcon, NavArrowDownIcon, TickCircleIcon, TrashLinearIcon } from "@/Components/icons";
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
    sort: string;
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
        <section aria-label="Inbox" className="flex flex-col gap-5 rounded-3xl bg-base-white pt-5 pb-3">
            <div className="flex items-center justify-between gap-4 px-6">
                <h2 className="text-subtitle-lg font-medium text-neutral-800">Inbox</h2>
                <label className="relative flex items-center text-body-xs text-neutral-500">
                    <span className="sr-only">Sort messages</span>
                    <select
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value)}
                        className="cursor-pointer appearance-none rounded-lg bg-transparent py-1 pr-6 pl-2 outline-none focus-visible:ring-[3px] focus-visible:ring-primary-50"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                Sort by: {option.label}
                            </option>
                        ))}
                    </select>
                    <NavArrowDownIcon className="pointer-events-none absolute right-0 size-4" />
                </label>
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
                                className={`flex items-center gap-2 pr-3 transition-colors ${selected ? "bg-neutral-50" : "hover:bg-neutral-25"}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => onSelect(ticket.id)}
                                    aria-current={selected ? "true" : undefined}
                                    className="grid min-w-0 flex-1 cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-3 pl-6 text-left outline-none focus-visible:ring-[3px] focus-visible:ring-primary-50 sm:grid-cols-[minmax(0,1fr)_auto_auto]"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        <Avatar name={ticket.name} />
                                        <span className="truncate text-link-sm text-neutral-900">{ticket.name}</span>
                                    </span>
                                    <span className="hidden items-center gap-2 sm:flex">
                                        <TicketBadges ticket={ticket} />
                                    </span>
                                    <span className="text-body-xs text-neutral-600">{ticket.date}</span>
                                </button>
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
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
