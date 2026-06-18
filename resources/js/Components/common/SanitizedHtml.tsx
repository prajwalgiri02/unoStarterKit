// fallow-ignore-file security-sink
import { sanitizeRichHtml } from "@/lib/security";

type SanitizedHtmlProps = {
    html: string;
    className?: string;
};

export default function SanitizedHtml({ html, className }: SanitizedHtmlProps) {
    const safeHtml = sanitizeRichHtml(html);

    return (
        <div
            className={className}
            dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
    );
}
