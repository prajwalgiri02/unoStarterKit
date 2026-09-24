import { ArrowLeftIcon } from "@/Components/icons";
import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";

type BackLinkProps = {
    href: string;
    children: ReactNode;
};

export default function BackLink({ href, children }: BackLinkProps) {
    return (
        <Link
            href={href}
            className="inline-flex w-fit items-center gap-1.5 rounded text-body-md text-neutral-900 outline-none transition-colors hover:text-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-50"
        >
            <ArrowLeftIcon className="size-6" />
            {children}
        </Link>
    );
}
