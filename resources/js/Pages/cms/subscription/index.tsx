import React from "react";
import CmsLayout from "@/layouts/cms-layout";
import SubscriptionStats from "@/components/cms/subscription/SubscriptionStats";
import SubscriptionCharts from "@/components/cms/subscription/SubscriptionCharts";
import SubscriptionTableRow from "@/components/cms/subscription/SubscriptionTableRow";
import FilterRow from "@/components/common/FilterRow";

const subscriptionRows = [
    {
        id: "1",
        initials: "SJ",
        avatarClass: "orange",
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        plan: "Premium",
        planClass: "premium",
        joinDate: "28/10/2025",
    },
    {
        id: "2",
        initials: "MC",
        avatarClass: "teal",
        name: "Michael Chen",
        email: "michael.chen@email.com",
        plan: "Freemium",
        planClass: "freemium",
        joinDate: "28/10/2025",
    },
    {
        id: "3",
        initials: "DM",
        avatarClass: "pink",
        name: "David Martinez",
        email: "david.martinez@email.com",
        plan: "Premium",
        planClass: "premium",
        joinDate: "28/10/2025",
    },
    {
        id: "4",
        initials: "EW",
        avatarClass: "blue",
        name: "Emma Wilson",
        email: "emma.wilson@email.com",
        plan: "Family",
        planClass: "family",
        joinDate: "15/09/2025",
    },
];

function Subscription() {
    return (
        <>
            <SubscriptionStats />
            <SubscriptionCharts />

            <FilterRow
                label="Filter by"
                className="d-flex flex-wrap align-items-center gap-3 filter-row"
                dropdownContainerClassName="dropdown-select-md"
                iconSrc="/icons/dropdown.svg"
                items={[
                    {
                        value: "all-plans",
                        onChange: (val) => {},
                        options: [
                            { value: "all-plans", label: "All Plans" },
                            { value: "plans", label: "plans" },
                        ],
                    },
                    {
                        value: "all-status",
                        onChange: (val) => {},
                        options: [
                            { value: "all-status", label: "All Status" },
                            { value: "active", label: "Active" },
                            { value: "inactive", label: "Inactive" },
                        ],
                    },
                ]}
            />

            <div className="subscriptions-table-card">
                <div className="table-wrapper table-responsive">
                    <table className="subscriptions-table table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Subscription</th>
                                <th>Join Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subscriptionRows.map((row) => (
                                <SubscriptionTableRow key={row.id} {...row} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="table-pagination">
                    <div className="pagination-info">
                        <div className="items-per-page">
                            <span className="caption-md">Items per page</span>
                            <div className="dropdown-select-sm">
                                <select className="body-xs text-neutral-600">
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50" selected>
                                        50
                                    </option>
                                    <option value="100">100</option>
                                </select>
                                <img
                                    src="/icons/small-drop.svg"
                                    alt="Arrow Down"
                                />
                            </div>
                        </div>
                        <span className="records-count caption-md">
                            Records of 50 of 1000
                        </span>
                    </div>
                    <div className="pagination-controls d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                        <button
                            className="pagination-btn caption-md"
                            id="prevPageBtn"
                        >
                            First
                        </button>
                        <button className="pagination-btn active caption-md">
                            1
                        </button>
                        <button className="pagination-btn caption-md">2</button>
                        <button className="pagination-btn caption-md">3</button>
                        <button
                            className="pagination-btn caption-md"
                            id="nextPageBtn"
                        >
                            Last
                        </button>
                        <div className="pagination-nav">
                            <button
                                className="pagination-nav-btn"
                                id="firstPageBtn"
                            >
                                <img src="/icons/prev.svg" alt="prev" />
                            </button>
                            <button
                                className="pagination-nav-btn"
                                id="lastPageBtn"
                            >
                                <img src="/icons/next.svg" alt="next" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Subscription.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Subscription Management"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="subscriptions-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default Subscription;
