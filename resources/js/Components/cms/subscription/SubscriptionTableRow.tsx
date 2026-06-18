type SubscriptionTableRowProps = {
    id: string;
    initials: string;
    avatarClass: string;
    name: string;
    email: string;
    plan: string;
    planClass: string;
    joinDate: string;
};

export default function SubscriptionTableRow({
    id,
    initials,
    avatarClass,
    name,
    email,
    plan,
    planClass,
    joinDate,
}: SubscriptionTableRowProps) {
    return (
        <tr data-id={id}>
            <td>
                <div className="user-cell">
                    <div className={`user-avatar ${avatarClass}`}>
                        {initials}
                    </div>
                    <div className="user-info">
                        <div className="user-name body-xs">{name}</div>
                        <div className="user-email caption-md">{email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span className={`subscription-badge link-sm ${planClass}`}>
                    {plan}
                </span>
            </td>
            <td className="date-cell body-xs">{joinDate}</td>
            <td>
                <span className="badge-tiny link-sm status-badge-sub user-status-badge active">
                    Active
                </span>
            </td>
            <td className="actions-cell">
                <button className="actions-btn" data-id={id}>
                    <img
                        src="/icons/three-dots.svg"
                        alt="Actions"
                        width="20"
                        height="20"
                    />
                </button>
                <div className="context-menu">
                    <div
                        className="context-menu-item body-xs"
                        data-action="cancel"
                    >
                        Cancel
                    </div>
                    <div
                        className="context-menu-item body-xs"
                        data-action="delete"
                    >
                        Delete
                    </div>
                </div>
            </td>
        </tr>
    );
}
