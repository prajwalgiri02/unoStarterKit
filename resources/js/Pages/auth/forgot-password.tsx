import PrimaryButton from "@/Components/buttons/primary-button";
import FormInput from "@/Components/inputs/email-input";
import AuthLayout from "@/Layouts/auth-layout";
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
                    <div className="flex flex-col gap-4">
                    <FormInput name="email" type="email" skipBlurValidation />
                    </div>
                    <div className="flex flex-col gap-4 mt-10">
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing
                                ? "Sending verification code..."
                                : "Send Verification Code"}
                        </PrimaryButton>
                    </div>
                </>
            )}
        </Form>
    );
};

ForgotPassword.layout = (page: React.ReactNode) => (
    <AuthLayout
        headerTitle="Forgot Password"
        headerDescription="Enter your email address to reset your password. We'll send you a verification code to proceed."
        goBack={true}
        goBackLabelText="Back"
        goBackUrl="/cms/login"
    >
        {page}
    </AuthLayout>
);

export default ForgotPassword;
