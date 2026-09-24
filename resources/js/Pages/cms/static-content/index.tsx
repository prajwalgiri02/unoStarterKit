import Button from "@/Components/buttons/button";
import Card from "@/Components/common/card";
import Input from "@/Components/inputs/input";
import Textarea from "@/Components/inputs/textarea";
import AppLayout from "@/Layouts/app-layout";
import { useForm } from "@inertiajs/react";
import { useState, type FormEvent } from "react";

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
    const { data, setData, put, processing, errors } = useForm({
        title: content.title,
        description: content.description,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/cms/static-content/${content.id}`, { preserveScroll: true, onSuccess: onDone });
    };

    return (
        <form onSubmit={submit} className="flex max-w-146 flex-col gap-6">
            <Input
                label="Title"
                name="title"
                value={data.title}
                onChange={(e) => setData("title", e.target.value)}
                error={errors.title}
            />
            <Textarea
                label="Content"
                name="description"
                rows={6}
                value={data.description}
                onChange={(e) => setData("description", e.target.value)}
                error={errors.description}
            />
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
    const [editingId, setEditingId] = useState<number | null>(null);

    return (
        <div className="flex flex-col gap-5">
            {contents.map((content) => {
                const editing = editingId === content.id;

                return (
                    <Card
                        key={content.id}
                        title={content.label}
                        actions={
                            !editing && (
                                <Button size="medium" variant="outline" onClick={() => setEditingId(content.id)}>
                                    Edit Details
                                </Button>
                            )
                        }
                    >
                        {editing ? (
                            <ContentForm content={content} onDone={() => setEditingId(null)} />
                        ) : (
                            <div className="flex flex-col gap-2">
                                <h3 className="text-body-lg text-neutral-900">{content.title}</h3>
                                <p className="text-body-xs whitespace-pre-line text-neutral-600">{content.description}</p>
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
