import CmsLayout from "@/layouts/cms-layout";
import { useForm, router } from "@inertiajs/react";
import { useState, useEffect } from "react";


import type {
    LegalContent as ParentConsentData,
    LegalContentPageProps as Props,
} from "@/types/cms/legal";

function ParentConsent({ published, draft }: Props) {
    const [editingConsent, setEditingConsent] =
        useState<ParentConsentData | null>(
            !published && !draft
                ? { id: 0, title: "", content: "", status: "draft" }
                : null,
        );

    const { data, setData, processing, errors, setError, clearErrors } =
        useForm({
            title: editingConsent?.title || "",
            content: editingConsent?.content || "",
            status: editingConsent?.status || "published",
        });

    // Update form when editingConsent changes
    useEffect(() => {
        if (editingConsent) {
            setData({
                title: editingConsent.title,
                content: editingConsent.content,
                status: editingConsent.status,
            });
        }
    }, [editingConsent]);

    const handleEdit = (consent: ParentConsentData) => {
        setEditingConsent(consent);
    };

    const handleCancel = () => {
        setEditingConsent(null);
        clearErrors();
    };

    const handleSubmit = (statusValue: "published" | "draft") => {
        const payload = { ...data, status: statusValue };

        if (editingConsent?.id) {
            router.patch(
                `/cms/legal-and-help/parent-consent/${editingConsent.id}`,
                payload as any,
                {
                    onStart: () => clearErrors(),
                    onSuccess: () => setEditingConsent(null),
                    onError: (errs) => {
                        Object.keys(errs).forEach((key) => {
                            setError(key as any, errs[key]);
                        });
                    },
                },
            );
        } else {
            router.post("/cms/legal-and-help/parent-consent", payload as any, {
                onStart: () => clearErrors(),
                onSuccess: () => setEditingConsent(null),
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
        hellp
        </>
    );
}

ParentConsent.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Parent Consent"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="legal-help-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default ParentConsent;
