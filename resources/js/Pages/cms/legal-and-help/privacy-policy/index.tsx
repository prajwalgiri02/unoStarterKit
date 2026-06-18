import CmsLayout from "@/layouts/cms-layout";
import { useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import PrivacyPolicyForm from "./components/privacy-policy-form";
import PrivacyPolicyCard from "./components/privacy-policy-card";

import type {
    LegalContent as PrivacyPolicyData,
    LegalContentPageProps as Props,
} from "@/types/cms/legal";

function PrivacyPolicy({ published, draft }: Props) {
    const [editingPolicy, setEditingPolicy] =
        useState<PrivacyPolicyData | null>(
            !published && !draft
                ? { id: 0, title: "", content: "", status: "draft" }
                : null,
        );

    const { data, setData, processing, errors, setError, clearErrors } =
        useForm({
            title: editingPolicy?.title || "",
            content: editingPolicy?.content || "",
            status: editingPolicy?.status || "published",
        });

    // Update form when editingPolicy changes
    useEffect(() => {
        if (editingPolicy) {
            setData({
                title: editingPolicy.title,
                content: editingPolicy.content,
                status: editingPolicy.status,
            });
        }
    }, [editingPolicy]);

    const handleEdit = (policy: PrivacyPolicyData) => {
        setEditingPolicy(policy);
    };

    const handleCancel = () => {
        setEditingPolicy(null);
        clearErrors();
    };

    const handleSubmit = (statusValue: "published" | "draft") => {
        const payload = { ...data, status: statusValue };

        if (editingPolicy?.id) {
            router.patch(
                `/cms/legal-and-help/privacy-policy/${editingPolicy.id}`,
                payload as any,
                {
                    onStart: () => clearErrors(),
                    onSuccess: () => setEditingPolicy(null),
                    onError: (errs) => {
                        Object.keys(errs).forEach((key) => {
                            setError(key as any, errs[key]);
                        });
                    },
                },
            );
        } else {
            router.post("/cms/legal-and-help/privacy-policy", payload as any, {
                onStart: () => clearErrors(),
                onSuccess: () => setEditingPolicy(null),
                onError: (errs) => {
                    Object.keys(errs).forEach((key) => {
                        setError(key as any, errs[key]);
                    });
                },
            });
        }
    };

    return (
        <>
            {editingPolicy ? (
                <div id="privacyPolicyForm">
                    <PrivacyPolicyForm
                        title={
                            editingPolicy.id
                                ? `Edit ${editingPolicy.status.charAt(0).toUpperCase() + editingPolicy.status.slice(1)} Privacy Policy`
                                : "Add Privacy Policy"
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
                        <PrivacyPolicyCard
                            title={draft.title}
                            content={draft.content}
                            status={draft.status}
                            onEdit={() => handleEdit(draft)}
                        />
                    )}
                    {published && (
                        <PrivacyPolicyCard
                            title={published.title}
                            content={published.content}
                            status={published.status}
                            onEdit={() => handleEdit(published)}
                        />
                    )}
                    {!published && !draft && (
                        <div className="text-center py-5">
                            <p className="text-muted">
                                No privacy policy found.
                            </p>
                            <button
                                className="btns btn-gaints btns-primary"
                                onClick={() =>
                                    setEditingPolicy({
                                        id: 0,
                                        title: "",
                                        content: "",
                                        status: "draft",
                                    })
                                }
                            >
                                Create Privacy Policy
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

PrivacyPolicy.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Privacy Policy"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="legal-help-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default PrivacyPolicy;
