import CmsLayout from "@/layouts/cms-layout";
import { useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import TermsConditionForm from "./components/terms-condition-form";
import TermsConditionCard from "./components/terms-condition-card";

import type {
    LegalContent as TermsConditionData,
    LegalContentPageProps as Props,
} from "@/types/cms/legal";

function TermsAndCondition({ published, draft }: Props) {
    const [editingTerms, setEditingTerms] = useState<TermsConditionData | null>(
        !published && !draft
            ? { id: 0, title: "", content: "", status: "draft" }
            : null,
    );

    const { data, setData, processing, errors, setError, clearErrors } =
        useForm({
            title: editingTerms?.title || "",
            content: editingTerms?.content || "",
            status: editingTerms?.status || "published",
        });

    // Update form when editingTerms changes
    useEffect(() => {
        if (editingTerms) {
            setData({
                title: editingTerms.title,
                content: editingTerms.content,
                status: editingTerms.status,
            });
        }
    }, [editingTerms]);

    const handleEdit = (terms: TermsConditionData) => {
        setEditingTerms(terms);
    };

    const handleCancel = () => {
        setEditingTerms(null);
        clearErrors();
    };

    const handleSubmit = (statusValue: "published" | "draft") => {
        const payload = { ...data, status: statusValue };

        if (editingTerms?.id) {
            router.patch(
                `/cms/legal-and-help/terms-and-condition/${editingTerms.id}`,
                payload as any,
                {
                    onStart: () => clearErrors(),
                    onSuccess: () => setEditingTerms(null),
                    onError: (errs) => {
                        Object.keys(errs).forEach((key) => {
                            setError(key as any, errs[key]);
                        });
                    },
                },
            );
        } else {
            router.post(
                "/cms/legal-and-help/terms-and-condition",
                payload as any,
                {
                    onStart: () => clearErrors(),
                    onSuccess: () => setEditingTerms(null),
                    onError: (errs) => {
                        Object.keys(errs).forEach((key) => {
                            setError(key as any, errs[key]);
                        });
                    },
                },
            );
        }
    };

    return (
        <>
            {editingTerms ? (
                <div id="termsForm">
                    <TermsConditionForm
                        title={
                            editingTerms.id
                                ? `Edit ${editingTerms.status.charAt(0).toUpperCase() + editingTerms.status.slice(1)} Terms & Conditions`
                                : "Add Terms & Conditions"
                        }
                        isProcessing={processing}
                        initialValues={data}
                        onSavePublished={() => handleSubmit("published")}
                        onSaveDraft={() => handleSubmit("draft")}
                        onCancel={handleCancel}
                        showCancel={published !== null || draft !== null}
                        onChange={(field, value) =>
                            setData(field as any, value)
                        }
                        errors={errors}
                    />
                </div>
            ) : (
                <div className="faq-list">
                    {draft && (
                        <TermsConditionCard
                            title={draft.title}
                            content={draft.content}
                            status={draft.status}
                            onEdit={() => handleEdit(draft)}
                        />
                    )}
                    {published && (
                        <TermsConditionCard
                            title={published.title}
                            content={published.content}
                            status={published.status}
                            onEdit={() => handleEdit(published)}
                        />
                    )}
                    {!published && !draft && (
                        <div className="text-center py-5">
                            <p className="text-muted">
                                No terms and conditions found.
                            </p>
                            <button
                                className="btns btn-gaints btns-primary"
                                onClick={() =>
                                    setEditingTerms({
                                        id: 0,
                                        title: "",
                                        content: "",
                                        status: "draft",
                                    })
                                }
                            >
                                Create Terms & Conditions
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

TermsAndCondition.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Terms & Conditions"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="legal-help-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default TermsAndCondition;
