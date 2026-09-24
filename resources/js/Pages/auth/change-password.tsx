import Button from "@/Components/buttons/button";
import Input from "@/Components/inputs/input";
import SuccessModal from "@/Components/modals/success-modal";
import AuthLayout from "@/Layouts/auth-layout";
import { Form, usePage } from "@inertiajs/react";

type ChangePasswordPageProps = {
    passwordChanged?: boolean;
    email?: string;
    token: string;
};

const ChangePassword = () => {
    const { passwordChanged, email, token } =
        usePage<ChangePasswordPageProps>().props;

    return (
        <>
            {passwordChanged && (
                <SuccessModal
                    title="Password Reset"
                    description="Your password has been updated. You can now log in using your new password."
                    buttonText="Go Back to Log In"
                    buttonLink="/cms/login"
                />
            )}
            <Form
                id="changePasswordForm"
                action={`/cms/reset-password/${token}`}
                method="post"
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing }) => (
                    <>
                        <input type="hidden" name="email" value={email} />
                        <Input
                            type="password"
                            name="password"
                            label="New Password"
                            size="medium"
                            autoComplete="new-password"
                        />
                        <Input
                            type="password"
                            name="password_confirmation"
                            label="Confirm New Password"
                            size="medium"
                            autoComplete="new-password"
                        />
                        <Button type="submit" disabled={processing} className="w-full">
                            {processing ? "Confirming..." : "Confirm Password"}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
};

ChangePassword.layout = (page: React.ReactNode) => (
    <AuthLayout title="Reset Password" backHref="/cms/login">
        {page}
    </AuthLayout>
);

export default ChangePassword;
