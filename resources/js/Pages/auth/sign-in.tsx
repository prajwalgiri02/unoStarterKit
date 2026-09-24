import Button from "@/Components/buttons/button";
import TextButton from "@/Components/buttons/text-button";
import Checkbox from "@/Components/inputs/checkbox";
import Input from "@/Components/inputs/input";
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
                        <Input name="email" type="email" label="Email" autoComplete="email" />
                        <Input name="password" type="password" label="Password" autoComplete="current-password" />
                        <div className="auth-row">
                            <Checkbox
                                id="rememberme"
                                name="remember"
                                value="1"
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
