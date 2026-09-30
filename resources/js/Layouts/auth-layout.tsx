import type { PageProps } from "@/Pages/types/index";
import { Head, Link, usePage } from "@inertiajs/react";
import { ArrowLeftIcon } from "@/Components/icons";
import { useEffect, type ReactNode } from "react";
import { notify } from "@/lib/toast";
import { Toaster } from "sonner";

type AuthLayoutProps = {
    children: ReactNode;
    title?: ReactNode;
    pageTitle?: string;
    description?: ReactNode;
    backHref?: string;
    backLabel?: string;
    wide?: boolean;
};

export default function AuthLayout({
    children,
    title = "Welcome 👋",
    pageTitle,
    description,
    backHref,
    backLabel = "Back",
    wide = false,
}: AuthLayoutProps) {
    const { props } = usePage<PageProps>();

    useEffect(() => {
        if (props.flash?.success) {
            notify.success(props.flash.success);
        }
        if (props.flash?.error) {
            notify.error(props.flash.error);
        }
    }, [props.flash]);

    return (
        <main className="flex min-h-dvh bg-auth-background lg:p-8">
            <Head title={pageTitle ?? (typeof title === "string" ? title : undefined)} />
            <aside className="hidden shrink-0 items-center justify-center rounded-[30px] bg-auth-panel lg:flex lg:w-[56.5%]">
                <img
                    src="/images/auth-logo.svg"
                    alt="Borrowed"
                    className="w-[305px] max-w-[60%]"
                />
            </aside>

            <section className="flex flex-1 items-center justify-center px-6 py-12">
                <div className={`flex w-full flex-col gap-10 ${wide ? "max-w-96" : "max-w-[327px]"}`}>
                    {backHref && (
                        <Link
                            href={backHref}
                            className="inline-flex w-fit items-center gap-3 text-body-md font-bold text-neutral-400 transition-colors hover:text-neutral-600"
                        >
                            <ArrowLeftIcon className="size-5" />
                            {backLabel}
                        </Link>
                    )}

                    <div className="flex flex-col gap-[30px]">
                        <h1 className="text-title-md text-primary-500">{title}</h1>

                        <div className="flex flex-col gap-6">
                            {description && (
                                <p className="text-body-xs text-neutral-700">
                                    {description}
                                </p>
                            )}
                            {children}
                        </div>
                    </div>
                </div>
            </section>

            <Toaster position="bottom-right" />
        </main>
    );
}
