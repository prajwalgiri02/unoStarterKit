export default function CommunityModerationActions() {
    return (
        <>
            <button className="action-btn approve">
                <img src="/icons/approve.svg" alt="approve" />
                <span>Approve</span>
            </button>
            <button className="action-btn reject">
                <img src="/icons/decline.svg" alt="reject" />
                <span>Reject</span>
            </button>
        </>
    );
}
