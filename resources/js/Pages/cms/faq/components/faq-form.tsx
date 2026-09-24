import Button from "@/Components/buttons/button";
import FormInput from "@/Components/inputs/email-input";
import TextareaInput from "@/Components/inputs/textarea-input";

type FaqFormProps = {
    title: string;
    isProcessing: boolean;
    isEditing?: boolean;
    values: {
        title: string;
        content: string;
    };
    onChange: (field: "title" | "content", value: string) => void;
    errors: {
        title?: string;
        content?: string;
    };
    onCancel?: () => void;
};

export default function FaqForm({
    title,
    isProcessing,
    isEditing,
    values,
    onChange,
    errors,
    onCancel,
}: FaqFormProps) {
    return (
        <>
            <FormInput
                name="title"
                label="Enter Question"
                placeholder="Enter Question"
                id="faq-question"
                value={values.title}
                onChange={(e) => onChange("title", e.target.value)}
                error={errors.title}
            />

            <TextareaInput
                name="content"
                label="Enter Content"
                placeholder="Enter Content"
                id="faq-content"
                rows={5}
                className="textarea-large"
                value={values.content}
                onChange={(e) => onChange("content", e.target.value)}
                error={errors.content}
            />

            <div className="form-buttons d-flex gap-3">
                <button
                    type="submit"
                    className="btns btn-gaints btns-primary text-btn-500"
                    disabled={isProcessing}
                >
                    {isEditing ? "Update FAQ" : "Add FAQ"}
                </button>

                {isEditing && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btns btn-gaints btns-secondary text-btn-500"
                    >
                        Cancel
                    </button>
                )}
            </div>
        </>
    );
}
