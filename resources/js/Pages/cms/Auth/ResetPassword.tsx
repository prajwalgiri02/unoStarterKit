import PrimaryButton from "@/components/buttons/primary-button";
import PasswordInput from "@/components/inputs/password-input";
import SuccessModal from "@/components/modals/success-modal";
import AuthLayout from "@/layouts/auth-layout";
import { Form, usePage } from "@inertiajs/react";

type ChangePasswordPageProps = {
    passwordChanged?: boolean;
    email?: string;
    token: string;
};

const ResetPassword = () => {
    const { passwordChanged, email, token } =
        usePage<ChangePasswordPageProps>().props;

    if (passwordChanged) {
        return (
            <SuccessModal
                title="Password changed"
                description="Your password has been changed successfully."
                buttonText="Back to Sign In"
                buttonLink="/cms/login"
            />
        );
    }

    return (
        <Form
            id="changePasswordForm"
            action={`/cms/reset-password/${token}`}
            method="post"
            validationTimeout={500}
            disableWhileProcessing
        >
            {({ processing }) => (
                <>
                    <input type="hidden" name="email" value={email} />
                    <div className="d-flex flex-column gap-4">
                        <PasswordInput confirmed />
                    </div>
                    <div className="d-flex flex-column gap-4 mt-40">
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing
                                ? "Resetting password..."
                                : "Reset password"}
                        </PrimaryButton>
                    </div>
                </>
            )}
        </Form>
    );
};

ResetPassword.layout = (page: React.ReactNode) => (
    <AuthLayout
        headerTitle="Set new password"
        headerDescription="Your previous password has been reseted. Please set a new password for your account."
        goBack={true}
        goBackLabelText="Back to signin"
        goBackUrl="/cms/login"
    >
        {page}
    </AuthLayout>
);

export default ResetPassword;
