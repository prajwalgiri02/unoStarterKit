import CmsLayout from "@/layouts/cms-layout";

function RolesPermission() {
    return (
        <>
            <div className="d-flex flex-column flex-md-row gap-3">
                <div className="search-box-md">
                    <img
                        src="/icons/search.svg"
                        alt="search"
                        className="search-icon-header"
                    />
                    <input
                        className="header-search-inputs"
                        type="text"
                        placeholder="Search by roles"
                    />
                </div>
                <div className="dropdown-select-xs">
                    <select className="body-xs text-neutral-600">
                        <option value="all-roles">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="parents">Parents</option>
                    </select>
                    <img src="/icons/dropdown.svg" alt="Arrow Down" />
                </div>
            </div>
            <div id="listView">
                <div className="phase-table-card roles-card table-responsive">
                    <table className="roles-table table">
                        <thead>
                            <tr>
                                <th>Role</th>
                                <th>Description</th>
                                <th>Employees Count</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="phaseTableBody">
                            <tr data-id="1">
                                <td>
                                    <span className="phase-name body-xs">
                                        Admin
                                    </span>
                                </td>
                                <td className="description-cell body-xs">
                                    Full system access - can manage everything
                                    including employees, roles, and system
                                    settings
                                </td>
                                <td className="age-cell body-xs">2</td>
                                <td>
                                    <div className="phase-actions">
                                        <button
                                            className="phase-action-btn view"
                                            data-id="1"
                                            title="View"
                                            data-bs-toggle="modal"
                                            data-bs-target="#roleDetailsModal"
                                        >
                                            <img
                                                src="/icons/eye.svg"
                                                alt="view"
                                            />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr data-id="2">
                                <td>
                                    <span className="phase-name body-xs">
                                        Content Editor
                                    </span>
                                </td>
                                <td className="description-cell body-xs">
                                    Can ceate and manage all content (waypoints,
                                    phase, pillar)
                                </td>
                                <td className="age-cell body-xs">2</td>
                                <td>
                                    <div className="phase-actions">
                                        <button
                                            className="phase-action-btn view"
                                            data-id="2"
                                            title="View"
                                            data-bs-toggle="modal"
                                            data-bs-target="#roleDetailsModal"
                                        >
                                            <img
                                                src="/icons/eye.svg"
                                                alt="view"
                                            />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr data-id="3">
                                <td>
                                    <span className="phase-name body-xs">
                                        Moderator
                                    </span>
                                </td>
                                <td className="description-cell body-xs">
                                    Can moderate community, and manage Godly
                                    Moments
                                </td>
                                <td className="age-cell body-xs">2</td>
                                <td>
                                    <div className="phase-actions">
                                        <button
                                            className="phase-action-btn view"
                                            data-id="3"
                                            title="View"
                                            data-bs-toggle="modal"
                                            data-bs-target="#roleDetailsModal"
                                        >
                                            <img
                                                src="/icons/eye.svg"
                                                alt="view"
                                            />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

RolesPermission.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Roles & Permissions"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="access-control-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default RolesPermission;
