import Button from "@/Components/buttons/button";
import Popover from "@/Components/common/popover";
import { richTextClasses } from "@/Components/common/rich-text-styles";
import {
    BoldIcon,
    ClearFormatIcon,
    ItalicIcon,
    LinkIcon,
    ListBulletIcon,
    ListOrderedIcon,
    NavArrowDownIcon,
    UnderlineIcon,
} from "@/Components/icons";
import { fieldError } from "@/Components/inputs/first-error-message";
import Input from "@/Components/inputs/input";
import { useFormContext } from "@inertiajs/react";
import Link from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

type RichTextEditorProps = {
    label?: ReactNode;
    name?: string;
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    helperText?: ReactNode;
    error?: string;
    disabled?: boolean;
    className?: string;
};

type Chain = ReturnType<Editor["chain"]>;

const HTML_PATTERN = /<[a-z][\s\S]*>/i;
const SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i;

const headingOptions = [
    { level: 0, label: "Normal", className: "text-body-xs" },
    { level: 2, label: "Heading 2", className: "text-subtitle-sm" },
    { level: 3, label: "Heading 3", className: "text-body-lg" },
] as const;

const EditorLink = Link.extend({ inclusive: () => false });

function normalizeUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed || SCHEME_PATTERN.test(trimmed) || /^[/#?]/.test(trimmed)) return trimmed;
    if (/^[^\s@/]+@[^\s@/]+\.[^\s@/]+$/.test(trimmed)) return `mailto:${trimmed}`;
    return `https://${trimmed}`;
}

function escapeHtml(text: string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toHtml(value: string) {
    if (!value || HTML_PATTERN.test(value)) return value;
    return value
        .split(/\r?\n/)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join("");
}

const editorClasses = [
    richTextClasses,
    "min-h-32 px-4 py-3 text-neutral-900 outline-none",
    "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-neutral-500 [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
].join(" ");

function ToolbarButton({
    label,
    active = false,
    disabled = false,
    onClick,
    children,
}: {
    label: string;
    active?: boolean;
    disabled?: boolean;
    onClick: () => void;
    children: ReactNode;
}) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            aria-pressed={active}
            disabled={disabled}
            onMouseDown={(e) => e.preventDefault()}
            onClick={onClick}
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-link-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-50 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-[18px] ${
                active ? "bg-primary-50 text-primary-500" : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-500"
            }`}
        >
            {children}
        </button>
    );
}

function Divider() {
    return <span aria-hidden="true" className="mx-1 h-5 w-px bg-neutral-200" />;
}

function LinkControl({ editor, active, disabled }: { editor: Editor; active: boolean; disabled: boolean }) {
    const [open, setOpen] = useState(false);
    const [url, setUrl] = useState("");

    const toggle = () => {
        if (!open) setUrl(editor.getAttributes("link").href ?? "");
        setOpen((v) => !v);
    };

    const apply = () => {
        const href = normalizeUrl(url);
        const chain = editor.chain().focus().extendMarkRange("link");
        if (href) chain.setLink({ href }).run();
        else chain.unsetLink().run();
        setOpen(false);
    };

    const remove = () => {
        editor.chain().focus().extendMarkRange("link").unsetLink().run();
        setOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            apply();
        }
    };

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            align="start"
            trigger={
                <ToolbarButton label="Link" active={active || open} disabled={disabled} onClick={toggle}>
                    <LinkIcon />
                </ToolbarButton>
            }
        >
            <div className="flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-3 rounded-[20px] border border-neutral-200 bg-base-white p-4 shadow-panel">
                <Input
                    label="Link URL"
                    size="medium"
                    type="text"
                    inputMode="url"
                    placeholder="example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                />
                <div className="flex justify-end gap-2">
                    {active && (
                        <Button size="small" variant="clear" tone="danger" onClick={remove}>
                            Remove
                        </Button>
                    )}
                    <Button size="small" onClick={apply}>
                        Apply
                    </Button>
                </div>
            </div>
        </Popover>
    );
}

function HeadingSelect({ editor, level, disabled }: { editor: Editor; level: number; disabled: boolean }) {
    const [open, setOpen] = useState(false);
    const current = headingOptions.find((option) => option.level === level) ?? headingOptions[0];

    const choose = (next: number) => {
        const chain = editor.chain().focus();
        if (next === 0) chain.setParagraph().run();
        else chain.setHeading({ level: next as 2 | 3 }).run();
        setOpen(false);
    };

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            align="start"
            trigger={
                <button
                    type="button"
                    aria-label="Text style"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    disabled={disabled}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setOpen((v) => !v)}
                    className={`flex h-8 w-30 shrink-0 cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 text-link-sm font-semibold outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-50 disabled:cursor-not-allowed disabled:opacity-50 ${
                        open ? "bg-primary-50 text-primary-500" : "text-neutral-600 hover:bg-neutral-50 hover:text-primary-500"
                    }`}
                >
                    {current.label}
                    <NavArrowDownIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
            }
        >
            <ul
                role="listbox"
                aria-label="Text style"
                className="flex w-44 flex-col gap-1 rounded-[20px] border border-neutral-200 bg-base-white p-2 shadow-panel"
            >
                {headingOptions.map((option) => {
                    const selected = option.level === current.level;

                    return (
                        <li key={option.level} role="option" aria-selected={selected}>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => choose(option.level)}
                                className={`w-full cursor-pointer rounded-lg px-3 py-1.5 text-left outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 ${option.className} ${
                                    selected ? "text-primary-500" : "text-neutral-900"
                                }`}
                            >
                                {option.label}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </Popover>
    );
}

function Toolbar({ editor, disabled }: { editor: Editor; disabled: boolean }) {
    const state = useEditorState({
        editor,
        selector: ({ editor: current }) => ({
            heading: current.isActive("heading", { level: 2 }) ? 2 : current.isActive("heading", { level: 3 }) ? 3 : 0,
            bold: current.isActive("bold"),
            italic: current.isActive("italic"),
            underline: current.isActive("underline"),
            bulletList: current.isActive("bulletList"),
            orderedList: current.isActive("orderedList"),
            link: current.isActive("link"),
        }),
    });

    const run = (command: (chain: Chain) => Chain) => () => command(editor.chain().focus()).run();

    return (
        <div
            role="toolbar"
            aria-label="Formatting"
            className="flex flex-wrap items-center gap-1 border-b border-neutral-200/50 px-3 py-2"
        >
            <HeadingSelect editor={editor} level={state.heading} disabled={disabled} />
            <Divider />
            <ToolbarButton label="Bold" active={state.bold} disabled={disabled} onClick={run((c) => c.toggleBold())}>
                <BoldIcon />
            </ToolbarButton>
            <ToolbarButton label="Italic" active={state.italic} disabled={disabled} onClick={run((c) => c.toggleItalic())}>
                <ItalicIcon />
            </ToolbarButton>
            <ToolbarButton label="Underline" active={state.underline} disabled={disabled} onClick={run((c) => c.toggleUnderline())}>
                <UnderlineIcon />
            </ToolbarButton>
            <Divider />
            <ToolbarButton label="Bullet list" active={state.bulletList} disabled={disabled} onClick={run((c) => c.toggleBulletList())}>
                <ListBulletIcon />
            </ToolbarButton>
            <ToolbarButton label="Numbered list" active={state.orderedList} disabled={disabled} onClick={run((c) => c.toggleOrderedList())}>
                <ListOrderedIcon />
            </ToolbarButton>
            <Divider />
            <LinkControl editor={editor} active={state.link} disabled={disabled} />
            <ToolbarButton label="Clear formatting" disabled={disabled} onClick={run((c) => c.unsetAllMarks().clearNodes())}>
                <ClearFormatIcon />
            </ToolbarButton>
        </div>
    );
}

export default function RichTextEditor({
    label,
    name,
    value,
    onChange,
    placeholder = "",
    helperText,
    error,
    disabled = false,
    className = "",
}: RichTextEditorProps) {
    const labelId = useId();
    const helperId = useId();
    const lastValue = useRef(value);
    const onChangeRef = useRef(onChange);
    const form = useFormContext();

    const errorMessage =
        error || (form && name ? fieldError(form.errors as Record<string, unknown>, name) : undefined);
    const helper = errorMessage || helperText;

    onChangeRef.current = (html: string) => {
        onChange(html);
        if (form && name) form.clearErrors(name);
    };

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3] },
                code: false,
                codeBlock: false,
                blockquote: false,
                horizontalRule: false,
                strike: false,
                link: false,
            }),
            EditorLink.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
            Placeholder.configure({ placeholder }),
        ],
        content: toHtml(value),
        editable: !disabled,
        editorProps: { attributes: { class: editorClasses } },
        onUpdate: ({ editor: current }) => {
            const html = current.isEmpty ? "" : current.getHTML();
            lastValue.current = html;
            onChangeRef.current(html);
        },
    });

    useEffect(() => {
        if (value === lastValue.current) return;
        lastValue.current = value;
        editor.commands.setContent(toHtml(value), { emitUpdate: false });
    }, [editor, value]);

    useEffect(() => {
        editor.setEditable(!disabled);
    }, [editor, disabled]);

    useEffect(() => {
        const attributes: Record<string, string> = {
            class: editorClasses,
            role: "textbox",
            "aria-multiline": "true",
        };
        if (label) attributes["aria-labelledby"] = labelId;
        if (helper) attributes["aria-describedby"] = helperId;
        if (errorMessage) attributes["aria-invalid"] = "true";
        editor.setOptions({ editorProps: { attributes } });
    }, [editor, label, labelId, helper, helperId, errorMessage]);

    const stateClasses = disabled
        ? "cursor-not-allowed bg-neutral-50 text-neutral-400"
        : errorMessage
          ? "border-error-500 bg-error-50"
          : "border-neutral-200 bg-base-white hover:not-focus-within:bg-neutral-25 focus-within:border-primary-500";

    return (
        <div className={`group flex w-full flex-col gap-2 ${className}`.trim()}>
            {label && (
                <span id={labelId} className="text-link-sm text-neutral-600">
                    {label}
                </span>
            )}
            <div className={`rounded-[20px] border-[1.5px] transition-colors ${stateClasses}`}>
                <Toolbar editor={editor} disabled={disabled} />
                <EditorContent editor={editor} />
            </div>
            {helper && (
                <p
                    id={helperId}
                    className={`text-link-sm font-normal ${errorMessage ? "text-error-500" : "text-neutral-600 group-focus-within:text-primary-500"}`}
                >
                    {helper}
                </p>
            )}
        </div>
    );
}
