import Badge from "@/Components/badges/badge";
import React from "react";

interface UserProfileCardProps {
    name: string;
    email: string;
    status: string;
    tier: string;
    onEdit: () => void;
}

const UserProfileCard = ({
    name,
    email,
    status,
    tier,
    onEdit,
}: UserProfileCardProps) => {
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className="user-detail-sl-card flex flex-col md:flex-row justify-between items-center">
            <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="user-details-avatar subtitle-md">
                    {initials}
                </div>
                <div className="">
                    <div className="flex gap-3 items-center justify-center">
                        <p className="user-name subtitle-xs">{name}</p>
                        <Badge size="tiny" color="success">
                            {status}
                        </Badge>
                    </div>
                    <div className="user-email body-xs">{email}</div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-3">
                <h1 className="body-sm text-neutral-900">{tier}</h1>
                <button
                    className="btn-small btns btns-secondary"
                    onClick={onEdit}
                >
                    Edit Details
                </button>
            </div>
        </div>
    );
};

export default UserProfileCard;
