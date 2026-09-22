import type { PageProps } from "@/Pages/types/index";
import { Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { Toaster, toast } from "sonner";

export default function AuthLayout({
  children,
  headerTitle = "Welcome👋",
  headerDescription = "",
  goBack = false,
  goBackLabelText = "Go Back",
  goBackUrl = "/",
}: { 
  children: React.ReactNode;
  headerTitle?: string;
  headerDescription?: React.ReactNode;
  goBack?: boolean;
  goBackLabelText?: string;
  goBackUrl?: string;
}) {
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
    <main className="auth-shell">
      <aside className="auth-brand">
        <img className="logo-large" src="/images/logoLogin.svg" alt="Yesterday logo" />
      </aside>
      <section className="auth-form-wrap">
        <div className="auth-form">
        {goBack && (
          <Link className="auth-back"  href={goBackUrl}>
            <img src="/icons/back.svg" />
            <p>{goBackLabelText}</p>
          </Link>

)}
          <h1 className="auth-title">{headerTitle}</h1>
          {headerDescription && (
                      <p className="auth-subtitle">{headerDescription}</p>

          )}
          {children}
        </div>
        <Toaster richColors position="bottom-right" />
      </section>
    </main>
  );
}
