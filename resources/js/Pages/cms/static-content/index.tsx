import Button from "@/Components/buttons/button";
import Card from "@/Components/common/card";
import RichText from "@/Components/common/rich-text";
import Input from "@/Components/inputs/input";
import AppLayout from "@/Layouts/app-layout";
import useFieldForm from "@/lib/use-field-form";
import { lazy, Suspense, useState, type FormEvent } from "react";

const RichTextEditor = lazy(() => import("@/Components/inputs/rich-text-editor"));

type StaticContent = {
    id: number;
    type: string;
    label: string;
    title: string;
    description: string;
};

type StaticContentPageProps = {
    contents: StaticContent[];
};

function ContentForm({ content, onDone }: { content: StaticContent; onDone: () => void }) {
    const { data, setField, put, processing, errors } = useFieldForm({
        title: content.title,
        description: content.description,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/cms/static-content/${content.id}`, { preserveScroll: true, preserveState: true, onSuccess: onDone });
    };

    return (
        <form onSubmit={submit} className="flex max-w-146 flex-col gap-6">
            <Input
                label="Title"
                name="title"
                value={data.title}
                onChange={(e) => setField("title", e.target.value)}
                error={errors.title}
            />
            <Suspense fallback={<div aria-hidden="true" className="h-[200px] animate-pulse rounded-[20px] bg-neutral-50" />}>
                <RichTextEditor
                    label="Content"
                    name="description"
                    value={data.description}
                    onChange={(html) => setField("description", html)}
                    error={errors.description}
                />
            </Suspense>
            <div className="flex flex-wrap gap-6">
                <Button type="submit" disabled={processing}>
                    {processing ? "Publishing..." : "Save & Publish"}
                </Button>
                <Button variant="outline" onClick={onDone} disabled={processing}>
                    Cancel
                </Button>
            </div>
        </form>
    );
}

function StaticContentPage({ contents }: StaticContentPageProps) {
    const [editingIds, setEditingIds] = useState<Set<number>>(() => new Set());

    const setEditing = (id: number, editing: boolean) => {
        setEditingIds((current) => {
            const next = new Set(current);
            if (editing) next.add(id);
            else next.delete(id);
            return next;
        });
    };

    return (
        <div className="flex flex-col gap-5">
            {contents.map((content) => {
                const editing = editingIds.has(content.id);

                return (
                    <Card
                        key={content.id}
                        title={content.label}
                        actions={
                            !editing && (
                                <Button size="medium" variant="outline" onClick={() => setEditing(content.id, true)}>
                                    Edit Details
                                </Button>
                            )
                        }
                    >
                        {editing ? (
                            <ContentForm content={content} onDone={() => setEditing(content.id, false)} />
                        ) : (
                            <div className="flex flex-col gap-2">
                                <h3 className="text-body-lg text-neutral-900">{content.title}</h3>
                                <RichText html={content.description} />
                            </div>
                        )}
                    </Card>
                );
            })}
        </div>
    );
}

StaticContentPage.layout = (page: React.ReactNode) => <AppLayout title="Static Content">{page}</AppLayout>;

export default StaticContentPage;
