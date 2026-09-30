import Button from "@/Components/buttons/button";
import IconButton from "@/Components/buttons/icon-button";
import Card from "@/Components/common/card";
import { ArrowDownIcon, DeleteBinIcon, EditPenIcon } from "@/Components/icons";
import Input from "@/Components/inputs/input";
import Textarea from "@/Components/inputs/textarea";
import ConfirmModal from "@/Components/modals/confirm-modal";
import AppLayout from "@/Layouts/app-layout";
import type { Faq, FaqListPageProps } from "@/Pages/types/cms/faq";
import { router } from "@inertiajs/react";
import useFieldForm from "@/lib/use-field-form";
import { useState, type FormEvent } from "react";

function FaqItem({ faq, onEdit, onDelete }: { faq: Faq; onEdit: () => void; onDelete: () => void }) {
    const [open, setOpen] = useState(false);
    const panelId = `faq-${faq.id}`;

    return (
        <article className="flex flex-col gap-5 rounded-[20px] border border-neutral-200 bg-base-white px-5 py-5 sm:px-[30px]">
            <div className="flex items-start justify-between gap-4">
                <h2 className="min-w-0 flex-1 text-subtitle-lg font-medium text-neutral-900">
                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpen((v) => !v)}
                        className="w-full cursor-pointer rounded-lg text-left outline-none focus-visible:ring-[3px] focus-visible:ring-primary-50"
                    >
                        {faq.title}
                    </button>
                </h2>
                <div className="flex shrink-0 items-center gap-1">
                    <IconButton label="Edit question" tone="primary" onClick={onEdit}>
                        <EditPenIcon />
                    </IconButton>
                    <IconButton label="Delete question" tone="primary" onClick={onDelete}>
                        <DeleteBinIcon />
                    </IconButton>
                    <IconButton
                        label={open ? "Hide answer" : "Show answer"}
                        tone="primary"
                        aria-expanded={open}
                        aria-controls={panelId}
                        onClick={() => setOpen((v) => !v)}
                    >
                        <ArrowDownIcon className={`transition-transform ${open ? "rotate-180" : ""}`} />
                    </IconButton>
                </div>
            </div>
            {open && (
                <p id={panelId} className="text-body-xs whitespace-pre-line text-neutral-600">
                    {faq.content}
                </p>
            )}
        </article>
    );
}

function FaqPage({ faqs }: FaqListPageProps) {
    const [editing, setEditing] = useState<Faq | null>(null);
    const [toDelete, setToDelete] = useState<Faq | null>(null);
    const [deleting, setDeleting] = useState(false);

    const { data, setData, setField, post, put, processing, errors, reset, clearErrors } = useFieldForm({
        question: "",
        answer: "",
    });

    const startEdit = (faq: Faq) => {
        setEditing(faq);
        clearErrors();
        setData({ question: faq.title, answer: faq.content });
    };

    const cancel = () => {
        setEditing(null);
        clearErrors();
        reset();
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        const options = { preserveScroll: true, onSuccess: cancel };
        if (editing) put(`/cms/faqs/${editing.id}`, options);
        else post("/cms/faqs", options);
    };

    const confirmDelete = () => {
        if (!toDelete) return;
        setDeleting(true);
        router.delete(`/cms/faqs/${toDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (editing?.id === toDelete.id) cancel();
                setToDelete(null);
            },
            onFinish: () => setDeleting(false),
        });
    };

    return (
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,586fr)_minmax(0,494fr)]">
            <div className="flex flex-col gap-5">
                {faqs.data.length === 0 ? (
                    <Card>
                        <p className="py-6 text-center text-body-xs text-neutral-500">No questions yet</p>
                    </Card>
                ) : (
                    faqs.data.map((faq) => (
                        <FaqItem key={faq.id} faq={faq} onEdit={() => startEdit(faq)} onDelete={() => setToDelete(faq)} />
                    ))
                )}
            </div>

            <Card title={editing ? "Edit Question and Answer" : "Add Questions and Answers"} className="xl:sticky xl:top-28">
                <form onSubmit={submit} className="flex flex-col gap-5">
                    <Input
                        label="Enter Question"
                        name="question"
                        value={data.question}
                        onChange={(e) => setField("question", e.target.value)}
                        error={errors.question}
                    />
                    <Textarea
                        label="Enter Answer"
                        name="answer"
                        rows={10}
                        value={data.answer}
                        onChange={(e) => setField("answer", e.target.value)}
                        error={errors.answer}
                    />
                    <div className="flex flex-wrap gap-5">
                        <Button type="submit" disabled={processing}>
                            {editing ? "Save" : "Upload"}
                        </Button>
                        <Button variant="outline" onClick={cancel} disabled={processing}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </Card>

            <ConfirmModal
                open={toDelete !== null}
                onClose={() => setToDelete(null)}
                onConfirm={confirmDelete}
                processing={deleting}
                title="Delete question?"
                description="This question and its answer will be removed from the app."
                warning="This action cannot be undone."
                confirmLabel="Delete"
            />
        </div>
    );
}

FaqPage.layout = (page: React.ReactNode) => <AppLayout title="Frequently Asked Questions">{page}</AppLayout>;

export default FaqPage;
