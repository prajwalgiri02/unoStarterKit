declare module "@ckeditor/ckeditor5-react" {
    import React from "react";
    import { ClassicEditor } from "ckeditor5";

    export interface CKEditorProps {
        editor: typeof ClassicEditor;
        config?: {
            licenseKey?: string;
            [key: string]: any;
        };
        data?: string;
        onReady?: (editor: any) => void;
        onChange?: (event: any, editor: any) => void;
        onBlur?: (event: any, editor: any) => void;
        onFocus?: (event: any, editor: any) => void;
        disabled?: boolean;
    }

    export const CKEditor: React.FC<CKEditorProps>;
}

declare module "ckeditor5" {
    export const ClassicEditor: any;
    export const Essentials: any;
    export const Paragraph: any;
    export const Heading: any;
    export const Bold: any;
    export const Italic: any;
    export const Underline: any;
    export const Alignment: any;
    export const FontColor: any;
    export const List: any;
    export const Image: any;
    export const ImageToolbar: any;
    export const ImageCaption: any;
    export const ImageStyle: any;
    export const BlockQuote: any;
    export const Code: any;
    export const Undo: any;
    export const Base64UploadAdapter: any;
}
