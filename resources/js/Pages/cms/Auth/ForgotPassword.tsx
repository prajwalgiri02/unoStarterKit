import PrimaryButton from "@/components/buttons/primary-button";
import EmailInput from "@/components/inputs/email-input";
import PasswordInput from "@/components/inputs/password-input";
import AuthLayout from "@/layouts/auth-layout";
import { Form } from "@inertiajs/react";

const ForgotPassword = () => {
    return (
        <Form
            id="signinForm"
            action="/cms/forgot-password"
            method="post"
            validationTimeout={500}
            disableWhileProcessing
        >
            {({ processing }) => (
                <>
                    <div className="d-flex flex-column gap-4">
                        <EmailInput
                            className="input-giant body-xs"
                            skipBlurValidation
                        />
                    </div>
                    <div className="d-flex flex-column gap-4 mt-40">
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing
                                ? "Sending reset link..."
                                : "Send Reset Link"}
                        </PrimaryButton>
                    </div>
                </>
            )}
        </Form>
    );
};

ForgotPassword.layout = (page: React.ReactNode) => (
    <AuthLayout
        headerTitle="Forgot Your Password?"
        headerDescription="Don’t worry, it happens to all of us. Enter your email below to recover your password."
        goBack={true}
        goBackLabelText="Back to Login"
        goBackUrl="/cms/login"
    >
        {page}
    </AuthLayout>
);

export default ForgotPassword;
