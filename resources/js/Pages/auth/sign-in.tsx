import Button from "@/Components/buttons/button";
import TextButton from "@/Components/buttons/text-button";
import CheckboxInput from "@/Components/inputs/checkbox-input";
import FormInput from "@/Components/inputs/email-input";
import AuthLayout from "@/Layouts/auth-layout";
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
                        <FormInput name="email" type="email" skipBlurValidation />
                        <FormInput name="password" type="password" skipBlurValidation />
                        <div className="auth-row">
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
                    <div className="flex flex-col gap-4 mt-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? "Logging in..." : "Login"}
                        </Button>
                    </div>
                </>
            )}
        </Form>
    );
};

SignIn.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;

export default SignIn;
