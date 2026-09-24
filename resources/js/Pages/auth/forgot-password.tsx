import Button from "@/Components/buttons/button";
import Input from "@/Components/inputs/input";
import AuthLayout from "@/Layouts/auth-layout";
import { Form } from "@inertiajs/react";

const ForgotPassword = () => {
    return (
        <Form
            id="forgotPasswordForm"
            action="/cms/forgot-password"
            method="post"
            validationTimeout={500}
            disableWhileProcessing
            className="flex flex-col gap-6"
        >
            {({ processing }) => (
                <>
                    <Input
                        name="email"
                        type="email"
                        label="Email"
                        size="medium"
                        placeholder="yourname@gmail.com"
                        autoComplete="email"
                    />
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing
                            ? "Sending verification code..."
                            : "Send Verification Code"}
                    </Button>
                </>
            )}
        </Form>
    );
};

ForgotPassword.layout = (page: React.ReactNode) => (
    <AuthLayout
        title="Forgot Password"
        description="Enter your email address to reset your password. We'll send you a verification code to proceed."
        backHref="/cms/login"
    >
        {page}
    </AuthLayout>
);

export default ForgotPassword;
