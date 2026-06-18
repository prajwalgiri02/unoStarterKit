import LegalContentCard from "@/components/common/LegalContentCard";

type PrivacyPolicyCardProps = {
    title: string;
    content: string;
    status: "published" | "draft";
    onEdit: () => void;
};

export default function PrivacyPolicyCard(props: PrivacyPolicyCardProps) {
    return (
        <LegalContentCard sectionTitle="Privacy Policy Contents" {...props} />
    );
}
