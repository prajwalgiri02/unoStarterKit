const RICH_TEXT_ALLOWED_TAGS = new Set([
    "a",
    "b",
    "blockquote",
    "br",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "i",
    "li",
    "ol",
    "p",
    "span",
    "strong",
    "u",
    "ul",
]);

const BLOCKED_URI_SCHEMES = /^(javascript|data|vbscript):/i;

export function decodePaginationLabel(label: string): string {
    const withoutTags = label.replace(/<[^>]*>/g, "");

    return withoutTags
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&laquo;/g, "«")
        .replace(/&raquo;/g, "»")
        .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
        .replace(/&#x([0-9a-f]+);/gi, (_, code) =>
            String.fromCharCode(parseInt(code, 16)),
        );
}

export function sanitizeRichHtml(html: string): string {
    if (!html) {
        return "";
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const sanitizeNode = (node: Node): void => {
        for (const child of [...node.childNodes]) {
            if (child.nodeType === Node.TEXT_NODE) {
                continue;
            }

            if (child.nodeType !== Node.ELEMENT_NODE) {
                child.remove();
                continue;
            }

            const element = child as HTMLElement;
            const tag = element.tagName.toLowerCase();

            if (!RICH_TEXT_ALLOWED_TAGS.has(tag)) {
                element.replaceWith(...element.childNodes);
                continue;
            }

            for (const attr of [...element.attributes]) {
                const name = attr.name.toLowerCase();
                const value = attr.value.trim();

                if (name.startsWith("on") || name === "style") {
                    element.removeAttribute(attr.name);
                    continue;
                }

                if (
                    (name === "href" || name === "src") &&
                    BLOCKED_URI_SCHEMES.test(value)
                ) {
                    element.removeAttribute(attr.name);
                }
            }

            sanitizeNode(element);
        }
    };

    sanitizeNode(doc.body);
    return doc.body.innerHTML;
}

export function isSafeOpenUrl(url: string): boolean {
    if (!url || typeof url !== "string") {
        return false;
    }

    const trimmed = url.trim();

    if (BLOCKED_URI_SCHEMES.test(trimmed)) {
        return false;
    }

    if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
        return true;
    }

    try {
        const parsed = new URL(trimmed, window.location.origin);

        if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
            return false;
        }

        return parsed.origin === window.location.origin;
    } catch {
        return false;
    }
}

export function openSafeUrl(url: string, target = "_blank"): boolean {
    if (!isSafeOpenUrl(url)) {
        return false;
    }

    const opened = globalThis.open(url, target, "noopener,noreferrer");
    return opened !== null;
}
