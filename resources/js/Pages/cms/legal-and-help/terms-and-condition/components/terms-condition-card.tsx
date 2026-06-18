import LegalContentCard from "@/components/common/LegalContentCard";

type TermsConditionCardProps = {
    title: string;
    content: string;
    status: "published" | "draft";
    onEdit: () => void;
};

export default function TermsConditionCard(props: TermsConditionCardProps) {
    return (
        <LegalContentCard
            sectionTitle="Terms & Conditions Contents"
            {...props}
        />
    );
}
