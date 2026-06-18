import { Link } from "@inertiajs/react";
import type {
    AnchorHTMLAttributes,
    ButtonHTMLAttributes,
    ReactNode,
} from "react";

type TextButtonShared = {
    children: ReactNode;
    className?: string;
};

type TextButtonLinkProps = TextButtonShared & {
    type: "link";
    href: string;
    /** Use a plain `<a>` (e.g. static `.html` or external URLs). Default: Inertia `<Link>`. */
    native?: boolean;
    target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    rel?: AnchorHTMLAttributes<HTMLAnchorElement>["rel"];
    id?: string;
    title?: string;
    "aria-label"?: string;
    /** Only used with `native` (plain anchor). */
    onClick?: AnchorHTMLAttributes<HTMLAnchorElement>["onClick"];
};

type TextButtonButtonProps = TextButtonShared & {
    type: "button";
    onClick: () => void;
} & Pick<
        ButtonHTMLAttributes<HTMLButtonElement>,
        "disabled" | "id" | "title" | "aria-label"
    >;

export type TextButtonProps = TextButtonLinkProps | TextButtonButtonProps;

const baseClass =
    "body-md text-primary-500 no-underline inline-block border-0 bg-transparent p-0 cursor-pointer";

export default function TextButton(props: TextButtonProps) {
    const { children, className = "" } = props;
    const composed = `${baseClass} ${className}`.trim();

    if (props.type === "link") {
        const {
            href,
            native,
            type: _t,
            children: _c,
            className: _cl,
            onClick,
            ...rest
        } = props;
        if (native) {
            return (
                <a href={href} className={composed} onClick={onClick} {...rest}>
                    {children}
                </a>
            );
        }
        return (
            <Link href={href} className={composed} {...rest}>
                {children}
            </Link>
        );
    }

    const {
        onClick,
        type: _t,
        children: _c,
        className: _cl,
        ...buttonRest
    } = props;
    return (
        <button
            type="button"
            className={composed}
            onClick={onClick}
            {...buttonRest}
        >
            {children}
        </button>
    );
}
