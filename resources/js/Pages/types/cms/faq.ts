/** Mirrors cms/FaqController::index */
export interface Faq {
    id: number;
    title: string;
    content: string;
    status: "published" | "draft";
}

export interface FaqListPageProps {
    faqs: { data: Faq[] };
}
