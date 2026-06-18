import CmsLayout from "@/layouts/cms-layout";
import EmployeeTableRow from "@/components/cms/access-control/EmployeeTableRow";

const employees = [
    {
        id: "1",
        avatar: "J",
        name: "Johnson smith",
        email: "sarah.johnson@email.com",
        role: "Admin",
        roleClass: "admin",
        joinDate: "28/10/2025",
        lastActive: "2 hours ago",
        showDelete: false,
    },
    {
        id: "2",
        avatar: "S",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        role: "Content Editor",
        roleClass: "content-editor",
        joinDate: "28/10/2025",
        lastActive: "2 hours ago",
        showDelete: true,
    },
    {
        id: "3",
        avatar: "S",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        role: "Moderator",
        roleClass: "moderator",
        joinDate: "28/10/2025",
        lastActive: "2 hours ago",
        showDelete: true,
    },
];

function Employee() {
    return (
        <>
            <div className="info-pillar-container">
                <img
                    src="/icons/warning.svg"
                    alt="warning"
                    width="24"
                    height="24"
                />
                <span className="body-xs text-neutral-900">
                    Click “Add Employee” to invite new team members. Assign
                    roles to control access levels.
                </span>
            </div>
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
                        placeholder="Search by name or email"
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
                <div className="user-table-card">
                    <div className="user-table-content">
                        <div className="table-wrapper table-responsive">
                            <table className="employee-table">
                                <thead>
                                    <tr>
                                        <th>Employees</th>
                                        <th>Role</th>
                                        <th>Join Date</th>
                                        <th>Last Active</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((employee) => (
                                        <EmployeeTableRow
                                            key={employee.id}
                                            {...employee}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Employee.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Employee Management"
        showSearchBar={false}
        showNotificationButton={true}
        wrapperClass="access-control-content-wrapper"
        actionButton={{
            show: true,
            label: "Add Employee",
            route: "#",
            showIcon: true,
        }}
    >
        {page}
    </CmsLayout>
);

export default Employee;
