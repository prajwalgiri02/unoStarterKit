import SanitizedHtml from "@/components/common/SanitizedHtml";

type LegalContentCardProps = {
    sectionTitle: string;
    title: string;
    content: string;
    status: "published" | "draft";
    onEdit: () => void;
};

export default function LegalContentCard({
    sectionTitle,
    title,
    content,
    status,
    onEdit,
}: LegalContentCardProps) {
    const statusLabel =
        (status || "draft").charAt(0).toUpperCase() +
        (status || "draft").slice(1);

    return (
        <div className="legal-content-card">
            <div className="legal-card-content">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                    <h2 className="legal-section-title subtitle-md m-0">
                        {sectionTitle}
                    </h2>
                    <span className="btns btn-small btns-secondary w-fit">
                        {statusLabel}
                    </span>
                </div>

                <p className="body-md text-neutral-900 mb-3 font-semibold">
                    {title}
                </p>

                <SanitizedHtml
                    className="body-xs text-neutral-700 mb-4 rich-text-content"
                    html={content}
                />

                <button
                    className="btns btn-gaints btns-secondary mt-4"
                    style={{ minWidth: "164px" }}
                    onClick={onEdit}
                >
                    Edit Details
                </button>
            </div>
        </div>
    );
}
