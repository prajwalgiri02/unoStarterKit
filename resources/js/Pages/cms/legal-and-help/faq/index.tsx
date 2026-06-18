import { useState, useEffect } from "react";
import CmsLayout from "@/layouts/cms-layout";
import { useForm, router } from "@inertiajs/react";
import FaqForm from "./components/faq-form";
import FaqItem from "./components/faq-item";
import DeleteModal from "@/components/modals/DeleteModal";
import { z } from "zod";

import type {
    Faq as FaqData,
    FaqListPageProps as Props,
} from "@/types/cms/faq";

const faqSchema = z.object({
    title: z
        .string()
        .min(1, "Question is required")
        .max(255, "Question is too long"),
    content: z.string().min(1, "Content is required"),
});

function Faq({ faqs }: Props) {
    const [editingFaq, setEditingFaq] = useState<FaqData | null>(null);
    const [faqToDelete, setFaqToDelete] = useState<FaqData | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const {
        data,
        setData,
        post,
        patch,
        processing,
        errors,
        clearErrors,
        setError,
        reset,
    } = useForm({
        title: "",
        content: "",
    });

    const handleEdit = (faq: FaqData) => {
        setEditingFaq(faq);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        if (editingFaq) {
            setData({
                title: editingFaq.title,
                content: editingFaq.content,
            });
        } else {
            setData({
                title: "",
                content: "",
            });
        }
        clearErrors();
    }, [editingFaq]);

    const handleDelete = (faq: FaqData) => {
        setFaqToDelete(faq);
    };

    const confirmDelete = () => {
        if (!faqToDelete) return;

        setIsDeleting(true);
        router.delete(`/cms/legal-and-help/faq/${faqToDelete.id}`, {
            onSuccess: () => {
                setFaqToDelete(null);
            },
            onFinish: () => {
                setIsDeleting(false);
            },
        });
    };

    const validate = () => {
        clearErrors();
        const result = faqSchema.safeParse(data);

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                setError(issue.path[0] as any, issue.message);
            });
            return false;
        }
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const url = editingFaq
            ? `/cms/legal-and-help/faq/${editingFaq.id}`
            : "/cms/legal-and-help/faq";

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setEditingFaq(null);
                reset();
            },
        };

        if (editingFaq) {
            patch(url, options);
        } else {
            post(url, options);
        }
    };

    return (
        <>
            {/* Add FAQ Form */}
            <div className="legal-content-card">
                <div className="legal-card-content">
                    <h2 className="legal-section-title subtitle-md">
                        {editingFaq
                            ? "Edit Questions and Answers"
                            : "Add Questions and Answers"}
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="legal-form"
                        id="faqForm"
                    >
                        <FaqForm
                            title={editingFaq ? "Edit FAQ" : "Add FAQ"}
                            isProcessing={processing}
                            isEditing={!!editingFaq}
                            values={{
                                title: data.title,
                                content: data.content,
                            }}
                            onChange={(field, val) => setData(field, val)}
                            errors={errors}
                            onCancel={() => setEditingFaq(null)}
                        />
                    </form>
                </div>
            </div>

            {/* FAQ List */}
            <div className="">
                <div className="faq-list" id="faqList">
                    {faqs.data.map((faq) => (
                        <FaqItem
                            key={faq.id}
                            id={faq.id}
                            title={faq.title}
                            content={faq.content}
                            status={faq.status}
                            onEdit={() => handleEdit(faq)}
                            onDelete={() => handleDelete(faq)}
                        />
                    ))}
                </div>
            </div>

            <DeleteModal
                isOpen={!!faqToDelete}
                onClose={() => setFaqToDelete(null)}
                onConfirm={confirmDelete}
                isDeleting={isDeleting}
                itemName="this FAQ"
            />
        </>
    );
}

Faq.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="FAQ's"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="legal-help-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default Faq;
