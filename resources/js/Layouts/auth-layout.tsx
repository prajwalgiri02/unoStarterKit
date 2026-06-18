import type { PageProps } from "@/types/index";
import { Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export default function AuthLayout({
    children,
    headerTitle = "Sign In",
    headerDescription = "Continue nurturing hearts with purpose.",
    goBack = false,
    goBackLabelText = "Go Back",
    goBackUrl = "/",
}: {
    children: React.ReactNode;
    headerTitle?: string;
    headerDescription?: string;
    goBack?: boolean;
    goBackLabelText?: string;
    goBackUrl?: string;
}) {
    const leftImageUrl = "/images/d2.png";
    const leftLogoUrl = "/images/logo/logo4.svg";
    const logoUrl = "/images/logo/logo1.png";
    const crCircleUrl = "/images/circle.png";

    const { props } = usePage<PageProps>();

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success, {
                id: props.flash.success,
            });
        }
        if (props.flash?.error) {
            toast.error(props.flash.error, {
                id: props.flash.error,
            });
        }
    }, [props.flash]);

    return (
        <div className="main container-fluid signin-container">
            <div className="row g-0 signin-rows">
                <div className="col-46 background-col">
                    <div className="background">
                        <div className="fadedbackground d-flex justify-content-center align-items-center">
                            <div>
                                <img src="/images/logo4.svg" alt="" />
                            </div>
                            <div className="dotsposition">
                                <img src="/icons/dots.svg" alt="" />
                            </div>
                            <div className="circleposition">
                                <img src="/icons/circle.svg" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col d-flex justify-content-center align-items-center">
                    <div className="form">
                        <div>
                            <img src="/images/logo2.svg" alt="" />
                        </div>
                        <div className="mt-5">
                            <div className="d-flex flex-column gap-3 mb-40">
                                {goBack && (
                                    <div className="d-flex align-items-center gap-8">
                                        <Link
                                            className="body-xs text-neutral-700"
                                            style={{ textDecoration: "none" }}
                                            href={goBackUrl}
                                        >
                                            <span
                                                style={{ marginRight: "5px" }}
                                            >
                                                <img
                                                    src="/icons/back-arrow.svg"
                                                    alt=""
                                                />
                                            </span>

                                            <span className="backtosigninfonts">
                                                {goBackLabelText}
                                            </span>
                                        </Link>
                                    </div>
                                )}
                                <p className="title-md text-neutral-900">
                                    {headerTitle}
                                </p>
                                <p className="body-md text-neutral-700">
                                    {headerDescription}
                                </p>
                            </div>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            <Toaster richColors position="bottom-right" />
        </div>
    );
}
