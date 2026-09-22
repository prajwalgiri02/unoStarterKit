import DashboardCharts from "@/Components/cms/dashboard/DashboardCharts";
import StatsGrid from "@/Components/cms/dashboard/StatsGrid";
import CmsLayout from "@/Layouts/cms-layout";
import { router, usePage } from "@inertiajs/react";
import FilterRow from "@/Components/common/FilterRow";

type DashboardProps = {
    auth: {
        user: { id: number; name: string; email: string } | null;
    };
    // cms: {
    //     sessionExpireOnBrowserClose: boolean;
    // };
};

const Dashboard = () => {
    const {
        auth: { user },
    } = usePage<DashboardProps>().props;

    return (
        <>
            <FilterRow
                className="filters-row"
                labelClassName="filter-label link-md-400"
                dropdownContainerClassName="dropdown-select"
                dropdownClassName="link-md-400 text-neutral-500"
                items={[
                    {
                        value: "date",
                        onChange: (val) => {},
                        options: [
                            { value: "date", label: "Date" },
                            { value: "name", label: "Name" },
                        ],
                    },
                    {
                        value: "city",
                        onChange: (val) => {},
                        options: [
                            { value: "city", label: "City" },
                            { value: "state", label: "State" },
                        ],
                    },
                ]}
            >
                <button className="btns btns-primary btn-small1 link-md-700">
                    Export
                </button>
            </FilterRow>

            <StatsGrid />

            <DashboardCharts />
        </>
    );
};

Dashboard.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Dashboard"
        showSearchBar={true}
        showActionButton={false}
        showNotificationButton={true}
    >
        {page}
    </CmsLayout>
);

export default Dashboard;
