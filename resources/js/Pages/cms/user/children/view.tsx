import React, { useState } from "react";
import CmsLayout from "@/layouts/cms-layout";
import UserProfileCard from "@/components/cms/user/UserProfileCard";
import FilePreviewModal from "@/components/modals/FilePreviewModal";
import "../../../css/user-management.css";

import type { ChildDetailPageProps, Waypoint } from "@/types/cms/user";

const ChildView = ({ child }: ChildDetailPageProps) => {
    const [selectedFiles, setSelectedFiles] = useState<string[] | null>(null);

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest(".actions-btn")) {
                document
                    .querySelectorAll(".context-menu.active")
                    .forEach((m) => {
                        m.classList.remove("active");
                    });
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // Mock static data for waypoints until backend is ready
    const waypointsData: Waypoint[] =
        child?.waypoints?.length > 0
            ? child.waypoints
            : [
                  {
                      id: 1,
                      name: "Emotions & Expression",
                      lesson: "Exploring Feelings",
                      status: "Completed",
                      assessment: "3 Stars",
                      files: ["Worksheet 1.pdf", "Drawing.png"],
                  },
                  {
                      id: 2,
                      name: "Self-Regulation",
                      lesson: "Calming Techniques",
                      status: "Pending",
                      assessment: "N/A",
                      files: ["Techniques.pdf"],
                  },
                  {
                      id: 3,
                      name: "Social Skills",
                      lesson: "Active Listening",
                      status: "Pending",
                      assessment: "N/A",
                      files: [],
                  },
              ];

    return (
        <>
            {/* Parent Info Card (shared component) */}
            <UserProfileCard
                name={child?.parent?.name || ""}
                email={child?.parent?.email || ""}
                status={child?.parent?.status || "Active"}
                tier={child?.parent?.tier || ""}
                onEdit={() => console.log("Edit Parent")}
            />

            {/* Child Header */}
            <div className="d-flex gap-2 align-items-center">
                <div
                    className={`user-avatar ${
                        child?.gender?.toLowerCase() === "female"
                            ? "orange"
                            : "teal"
                    }`}
                >
                    <img
                        src={child?.avatar || ""}
                        alt={child?.name || ""}
                        width="23"
                        height="23"
                    />
                </div>
                <h1 className="subtitle-md text-neutral-900">
                    {child?.name || ""}
                </h1>
            </div>

            {/* Waypoints Table */}
            <div className="user-table-card user-details-card">
                <div className="user-table-content">
                    <div className="table-wrapper table-responsive">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Waypoint</th>
                                    <th>Lesson</th>
                                    <th>Status</th>
                                    <th>Assessment</th>
                                    <th>File Uploaded</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {waypointsData.map((wp) => (
                                    <tr key={wp.id} data-id={wp.id}>
                                        <td>
                                            <span className="body-xs text-neutral-900">
                                                {wp.name}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="body-xs text-neutral-900">
                                                {wp.lesson}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge-tiny all-badge link-sm ${
                                                    wp.status.toLowerCase() ===
                                                    "completed"
                                                        ? "bg-success-100 text-success-500"
                                                        : "bg-warning-100 text-warning-500"
                                                }`}
                                            >
                                                {wp.status}
                                            </span>
                                        </td>
                                        <td className="body-xs text-neutral-900">
                                            {wp.assessment}
                                        </td>
                                        <td className="body-xs text-primary-500">
                                            {wp.files.length > 0 ? (
                                                <button
                                                    onClick={() =>
                                                        setSelectedFiles(
                                                            wp.files,
                                                        )
                                                    }
                                                    className="text-decoration-underline text-primary-500 p-0 border-0 bg-transparent body-xs"
                                                >
                                                    View Files
                                                </button>
                                            ) : (
                                                <span className="text-neutral-400">
                                                    No Files
                                                </span>
                                            )}
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="actions-btn"
                                                data-id={wp.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const menu =
                                                        e.currentTarget
                                                            .nextElementSibling;
                                                    if (menu) {
                                                        menu.classList.toggle(
                                                            "active",
                                                        );
                                                    }
                                                    // Close other menus
                                                    document
                                                        .querySelectorAll(
                                                            ".context-menu.active",
                                                        )
                                                        .forEach((m) => {
                                                            if (m !== menu)
                                                                m.classList.remove(
                                                                    "active",
                                                                );
                                                        });
                                                }}
                                            >
                                                <img
                                                    src="/icons/three-dots.svg"
                                                    alt="Actions"
                                                    width="20"
                                                    height="20"
                                                />
                                            </button>
                                            <div className="context-menu">
                                                <a
                                                    href="#"
                                                    className="context-menu-item body-xs"
                                                    data-action="view"
                                                >
                                                    View Details
                                                </a>
                                                <a
                                                    href="#"
                                                    className="context-menu-item body-xs"
                                                    data-action="delete"
                                                >
                                                    Delete
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* File Preview Modal */}
            <FilePreviewModal
                isOpen={!!selectedFiles}
                onClose={() => setSelectedFiles(null)}
                files={selectedFiles || []}
            />
        </>
    );
};

ChildView.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="User Details"
        showSearchBar={true}
        backUrl="/cms/user" // Should ideally back to parent view if possible, but /cms/user is safe
        wrapperClass="user-management-content-wrapper"
        showNotificationButton={true}
    >
        {page}
    </CmsLayout>
);

export default ChildView;
