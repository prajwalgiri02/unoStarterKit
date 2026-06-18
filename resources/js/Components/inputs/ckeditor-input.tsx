import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
    ClassicEditor,
    Essentials,
    Paragraph,
    Heading,
    Bold,
    Italic,
    Underline,
    Alignment,
    FontColor,
    List,
    Image,
    ImageToolbar,
    ImageCaption,
    ImageStyle,
    BlockQuote,
    Code,
    Undo,
    Base64UploadAdapter,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";

type CKEditorInputProps = {
    id?: string;
    name?: string;
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
};

/**
 * CKEditor component for rich text editing.
 * Integrates with Inertia form context for error handling.
 */
export default function CKEditorInput({
    id = "ckeditor-input",
    name = "content",
    label = "Content",
    value = "",
    onChange,
    error: propError,
}: CKEditorInputProps) {
    const form = useFormContext<Record<string, unknown>>();
    const msg =
        propError ||
        (form
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    return (
        <div className="flex flex-col gap-2 ckeditor-wrapper">
            <label className="caption-md text-neutral-700 mb-2" htmlFor={id}>
                {label}
            </label>
            <div className={`ckeditor-container ${msg ? "error" : ""}`}>
                <CKEditor
                    editor={ClassicEditor}
                    config={{
                        licenseKey: "GPL",
                        plugins: [
                            Essentials,
                            Paragraph,
                            Heading,
                            Bold,
                            Italic,
                            Underline,
                            Alignment,
                            FontColor,
                            List,
                            Image,
                            ImageToolbar,
                            ImageCaption,
                            ImageStyle,
                            BlockQuote,
                            Code,
                            Undo,
                            Base64UploadAdapter,
                        ],
                        toolbar: [
                            "undo",
                            "redo",
                            "|",
                            "heading",
                            "|",
                            "alignment",
                            "fontColor",
                            "|",
                            "bold",
                            "italic",
                            "underline",
                            "|",
                            "bulletedList",
                            "numberedList",
                            "|",
                            "imageUpload",
                            "code",
                            "blockQuote",
                        ],
                    }}
                    data={value}
                    onReady={(editor) => {}}
                    onChange={(event, editor) => {
                        const data = editor.getData();
                        onChange?.(data);
                        form?.clearErrors(name);
                    }}
                />
            </div>
            {msg ? (
                <p
                    id={`${id}-error`}
                    className="caption-md text-red-500 mt-1 mb-0"
                >
                    {msg}
                </p>
            ) : null}
        </div>
    );
}
