/**
 * Shared shape for PrivacyPolicyResource, TermsConditionResource,
 * and ParentConsentResource — all return the same structure.
 */
export interface LegalContent {
    id: number;
    title: string;
    content: string;
    status: "published" | "draft";
}

export interface LegalContentPageProps {
    published: LegalContent | null;
    draft: LegalContent | null;
}
