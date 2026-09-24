import IconButton from "@/Components/buttons/icon-button";
import Card from "@/Components/common/card";
import DetailField from "@/Components/common/detail-field";
import { CloseCircleIcon, ViewIcon } from "@/Components/icons";
import Modal from "@/Components/modals/modal";
import ComposeNotification, { locationOptions } from "@/Components/notifications/compose-notification";
import DataTable, { type Column } from "@/Components/table/data-table";
import Pagination from "@/Components/table/pagination";
import AppLayout from "@/Layouts/app-layout";
import { formatDate } from "@/lib/helper";
import type { BroadcastNotification, BroadcastNotificationPageProps } from "@/Pages/types/cms/notification";
import { useId, useState } from "react";

function audience(notification: BroadcastNotification) {
    if (notification.send_to_all || !notification.location) return "All users";
    return locationOptions.find((option) => option.value === notification.location)?.label ?? notification.location;
}

function BroadcastNotifications({ notifications }: BroadcastNotificationPageProps) {
    const [viewing, setViewing] = useState<BroadcastNotification | null>(null);
    const titleId = useId();

    const columns: Column<BroadcastNotification>[] = [
        {
            key: "date",
            header: "Date & Time",
            className: "w-44",
            render: (n) => formatDate(n.sent_at ?? n.created_at, true),
        },
        {
            key: "message",
            header: "Message",
            render: (n) => (
                <div className="max-w-md">
                    <p className="truncate font-medium text-neutral-800">{n.title}</p>
                    <p className="line-clamp-1 text-neutral-500">{n.message}</p>
                </div>
            ),
        },
        { key: "state", header: "State", className: "w-40", render: audience },
        {
            key: "action",
            header: "Action",
            className: "w-16",
            render: (n) => (
                <IconButton label={`View ${n.title}`} onClick={() => setViewing(n)}>
                    <ViewIcon />
                </IconButton>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-5">
            <ComposeNotification />

            <Card title="Broadcast History">
                <DataTable
                    columns={columns}
                    rows={notifications.data}
                    rowKey={(n) => n.id}
                    caption="Broadcast history"
                    emptyMessage="No notifications sent yet"
                />
                <Pagination links={notifications.links} from={notifications.from} to={notifications.to} total={notifications.total} />
            </Card>

            <Modal open={viewing !== null} onClose={() => setViewing(null)} size="medium" labelledBy={titleId}>
                {viewing && (
                    <div className="flex flex-col gap-6">
                        <div className="flex items-start justify-between gap-4">
                            <h2 id={titleId} className="text-subtitle-lg font-medium text-neutral-900">
                                {viewing.title}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setViewing(null)}
                                aria-label="Close"
                                className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 outline-none hover:text-neutral-700 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                            >
                                <CloseCircleIcon className="size-6" />
                            </button>
                        </div>
                        <dl className="flex flex-col gap-5">
                            <DetailField label="Sent">{formatDate(viewing.sent_at ?? viewing.created_at, true)}</DetailField>
                            <DetailField label="Audience">{audience(viewing)}</DetailField>
                            <DetailField label="Message">
                                <span className="block text-body-xs whitespace-pre-line">{viewing.message}</span>
                            </DetailField>
                        </dl>
                    </div>
                )}
            </Modal>
        </div>
    );
}

BroadcastNotifications.layout = (page: React.ReactNode) => (
    <AppLayout title="Broadcast Notifications">{page}</AppLayout>
);

export default BroadcastNotifications;
