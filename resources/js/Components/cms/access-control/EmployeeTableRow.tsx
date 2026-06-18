type EmployeeTableRowProps = {
    id: string;
    avatar: string;
    name: string;
    email: string;
    role: string;
    roleClass: string;
    joinDate: string;
    lastActive: string;
    showDelete?: boolean;
};

export default function EmployeeTableRow({
    id,
    avatar,
    name,
    email,
    role,
    roleClass,
    joinDate,
    lastActive,
    showDelete = false,
}: EmployeeTableRowProps) {
    return (
        <tr data-id={id}>
            <td>
                <div className="user-cell">
                    <div className="user-role-avatar bg-primary-100 text-neutral-900">
                        {avatar}
                    </div>
                    <div className="user-info">
                        <div className="user-name body-xs">{name}</div>
                        <div className="user-email caption-md">{email}</div>
                    </div>
                </div>
            </td>
            <td>
                <span className={`badge-tiny role-badge link-sm ${roleClass}`}>
                    {role}
                </span>
            </td>
            <td className="body-xs text-neutral-900">{joinDate}</td>
            <td>
                <span className="body-xs text-neutral-900">{lastActive}</span>
            </td>
            <td className={showDelete ? "" : undefined}>
                <div className="d-flex gap-14 justify-content-end">
                    <button
                        className="phase-action-btn edit"
                        data-id={id}
                        title="Edit"
                        data-bs-toggle="modal"
                        data-bs-target="#editpermissionModal"
                    >
                        <img src="/icons/edit1.svg" alt="edit" />
                    </button>
                    <button
                        className="phase-action-btn view"
                        data-id={id}
                        title="View"
                        data-bs-toggle="modal"
                        data-bs-target="#roleDetailsModal"
                    >
                        <img src="/icons/eye.svg" alt="view" />
                    </button>
                    {showDelete && (
                        <button
                            className="phase-action-btn delete"
                            data-id={id}
                            title="Delete"
                            data-bs-toggle="modal"
                            data-bs-target="#deletepermissionModal"
                        >
                            <img src="/icons/delete-3.svg" alt="delete" />
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
}
