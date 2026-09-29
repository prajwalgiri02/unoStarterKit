import { richTextClasses } from "@/Components/common/rich-text-styles";
import DOMPurify from "dompurify";
import { useMemo } from "react";

const HTML_PATTERN = /<[a-z][\s\S]*>/i;

export default function RichText({ html, className = "" }: { html: string; className?: string }) {
    const isHtml = HTML_PATTERN.test(html);
    const clean = useMemo(
        () => (isHtml ? DOMPurify.sanitize(html, { ADD_ATTR: ["target"] }) : ""),
        [html, isHtml],
    );

    if (!isHtml) {
        return <p className={`${richTextClasses} whitespace-pre-line text-neutral-600 ${className}`.trim()}>{html}</p>;
    }

    return (
        <div
            className={`${richTextClasses} text-neutral-600 ${className}`.trim()}
            dangerouslySetInnerHTML={{ __html: clean }}
        />
    );
}
