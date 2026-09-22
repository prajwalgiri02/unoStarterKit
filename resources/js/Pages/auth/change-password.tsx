import PrimaryButton from "@/Components/buttons/primary-button";
import FormInput from "@/Components/inputs/email-input";
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
            >
                {({ processing }) => (
                    <>
                        <input type="hidden" name="email" value={email} />
                        <div className="flex flex-col gap-4">
                            <FormInput type="password" name="password" confirmed label="New Password" confirmLabel="Confirm New Password" skipBlurValidation />
                        </div>
                        <div className="flex flex-col gap-4 mt-10">
                            <PrimaryButton type="submit" disabled={processing}>
                                {processing
                                    ? "Resetting password..."
                                    : "Reset password"}
                            </PrimaryButton>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
};

ChangePassword.layout = (page: React.ReactNode) => (
    <AuthLayout
        headerTitle="Reset Password"
        headerDescription=""
        goBack={true}
        goBackLabelText="Back"
        goBackUrl="/cms/login"
    >
        {page}
    </AuthLayout>
);

export default ChangePassword;
