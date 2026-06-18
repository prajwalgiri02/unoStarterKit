import LegalContentCard from "@/components/common/LegalContentCard";

type ParentConsentCardProps = {
    title: string;
    content: string;
    status: "published" | "draft";
    onEdit: () => void;
};

export default function ParentConsentCard(props: ParentConsentCardProps) {
    return (
        <LegalContentCard sectionTitle="Parent Consent Contents" {...props} />
    );
}
