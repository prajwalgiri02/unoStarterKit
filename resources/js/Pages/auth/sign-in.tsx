import PrimaryButton from "@/components/buttons/primary-button";
import TextButton from "@/components/buttons/text-button";
import CheckboxInput from "@/components/inputs/checkbox-input";
import EmailInput from "@/components/inputs/email-input";
import PasswordInput from "@/components/inputs/password-input";
import AuthLayout from "@/layouts/auth-layout";
import { Form } from "@inertiajs/react";

const SignIn = () => {
    return (
        <Form
            id="signinForm"
            action="/cms/login"
            method="post"
            validationTimeout={500}
            disableWhileProcessing
        >
            {({ processing }) => (
                <>
                    <div className="flex flex-col gap-4">
                        <EmailInput
                            className="input-giant body-xs"
                            skipBlurValidation
                        />
                        <PasswordInput skipBlurValidation />
                        <div className="flex justify-between items-start">
                            <CheckboxInput
                                id="rememberme"
                                name="remember"
                                label="Remember Me"
                            />
                            <TextButton
                                type="link"
                                href="/cms/forgot-password"
                            >
                                Forgot Password ?
                            </TextButton>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 mt-10">
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? "Logging in..." : "Login"}
                        </PrimaryButton>
                    </div>
                </>
            )}
        </Form>
    );
};

SignIn.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;

export default SignIn;
