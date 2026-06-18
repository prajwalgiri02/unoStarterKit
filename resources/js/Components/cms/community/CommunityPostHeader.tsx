type CommunityPostHeaderProps = {
    avatar: string;
    name: string;
    email: string;
    category?: string;
    categoryClassName?: string;
    time: string;
    actions: React.ReactNode;
};

export default function CommunityPostHeader({
    avatar,
    name,
    email,
    category,
    categoryClassName,
    time,
    actions,
}: CommunityPostHeaderProps) {
    return (
        <div className="post-header">
            <div className="post-user">
                <div className="user-avatar">{avatar}</div>
                <div className="user-info">
                    <p className="user-name">{name}</p>
                    <p className="user-email">{email}</p>
                    <div className="post-meta">
                        {category && (
                            <span
                                className={`category-badge ${categoryClassName ?? ""}`}
                            >
                                {category}
                            </span>
                        )}
                        <span className="post-time">{time}</span>
                    </div>
                </div>
            </div>
            <div className="post-actions">{actions}</div>
        </div>
    );
}
