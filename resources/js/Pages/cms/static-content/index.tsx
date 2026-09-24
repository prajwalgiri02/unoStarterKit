import CmsLayout from "@/Layouts/cms-layout";
import { useForm } from "@inertiajs/react";
import { useState } from "react";
import Input from "@/Components/inputs/input";
import TextareaInput from "@/Components/inputs/textarea-input";
import Button from "@/Components/buttons/button";

interface StaticContent {
    id: number;
    type: string;
    label: string;
    title: string;
    description: string;
}

interface StaticContentPageProps {
    contents: StaticContent[];
}

interface EditFormProps {
    content: StaticContent;
    onCancel: () => void;
}

function EditForm({ content, onCancel }: EditFormProps) {
    const { data, setData, put, processing, errors } = useForm({
        title: content.title,
        description: content.description,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/static-content/${content.id}`, {
            preserveScroll: true,
            onSuccess: () => onCancel(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <Input
                id={`title-${content.id}`}
                name="title"
                label="Title"
                placeholder="Enter title"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                error={errors.title}
            />
            <TextareaInput
                id={`description-${content.id}`}
                name="description"
                label="Content"
                placeholder="Enter content"
                rows={6}
                value={data.description}
                className="textarea-large"
                onChange={(e) => setData("description", e.target.value)}
                error={errors.description}
            />
            <div className="flex items-center gap-3">
                <Button type="submit" size="giant" disabled={processing}>
                    {processing ? "Saving..." : "Save"}
                </Button>
                <button
                    type="button"
                    className="btns btn-large btns-secondary"
                    onClick={onCancel}
                    disabled={processing}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

function StaticContentItem({ content }: { content: StaticContent }) {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="legal-content-card">
            <div className="legal-card-content">
                <div className="flex items-center justify-between">
                    <h2 className="subtitle-md">{content.label}</h2>
                    {!isEditing && (
                        <button
                            type="button"
                            className="btns btn-small btns-secondary"
                            onClick={() => setIsEditing(true)}
                        >
                            Edit
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <EditForm
                        content={content}
                        onCancel={() => setIsEditing(false)}
                    />
                ) : (
                    <div className="mt-3 flex flex-col gap-2">
                        {content.title && (
                            <p className="body-sm text-neutral-900">
                                {content.title}
                            </p>
                        )}
                        <p className="body-xs text-neutral-600 whitespace-pre-line">
                            {content.description || "No content yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function StaticContent({ contents }: StaticContentPageProps) {
    return (
        <>
            {contents.map((content) => (
                <StaticContentItem key={content.id} content={content} />
            ))}
            {contents.length === 0 && (
                <div className="legal-content-card">
                    <div className="legal-card-content">
                        <p className="body-xs text-neutral-500 text-center py-4">
                            No static content found.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

StaticContent.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Static Content"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="legal-help-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default StaticContent;
