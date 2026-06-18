import PrimaryButton from "@/components/buttons/primary-button";
import TextButton from "@/components/buttons/text-button";
import TextInput from "@/components/inputs/text-input";
import CKEditorInput from "@/components/inputs/ckeditor-input";

type PrivacyPolicyFormProps = {
    title: string;
    isProcessing: boolean;
    initialValues?: {
        title?: string;
        content?: string;
    };
    onSavePublished: () => void;
    onSaveDraft: () => void;
    onCancel?: () => void;
    showCancel?: boolean;
    onChange?: (field: string, value: string) => void;
    errors?: Record<string, string>;
};

export default function PrivacyPolicyForm({
    title,
    isProcessing,
    initialValues,
    onSavePublished,
    onSaveDraft,
    onCancel,
    showCancel = false,
    onChange,
    errors,
}: PrivacyPolicyFormProps) {
    return (
        <div className="legal-content-card">
            <div className="legal-card-content">
                <h2 className="legal-section-title subtitle-md">{title}</h2>
                <form
                    className="legal-form"
                    onSubmit={(e) => e.preventDefault()}
                >
                    <TextInput
                        name="title"
                        label="Enter Title"
                        placeholder="Enter Title"
                        id="policy-title"
                        value={initialValues?.title || ""}
                        onChange={(e) => onChange?.("title", e.target.value)}
                        error={errors?.title}
                    />

                    <CKEditorInput
                        name="content"
                        label="Enter Content"
                        id="policy-content"
                        value={initialValues?.content || ""}
                        onChange={(value) => onChange?.("content", value)}
                        error={errors?.content}
                    />

                    <div className="d-flex gap-3">
                        <button
                            type="button"
                            className="btns btn-gaints btns-primary text-btn-500"
                            onClick={onSavePublished}
                            disabled={isProcessing}
                        >
                            Save and Publish
                        </button>
                        <button
                            type="button"
                            className="btns btn-gaints btns-secondary text-btn-500"
                            onClick={onSaveDraft}
                            disabled={isProcessing}
                        >
                            Save Draft
                        </button>
                        {showCancel && onCancel && (
                            <button
                                type="button"
                                className="btns btn-gaints btns-secondary text-btn-500"
                                onClick={onCancel}
                                disabled={isProcessing}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
