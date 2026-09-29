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
                    <Input
                        name="password"
                        type="password"
                        label="Password"
                        size="medium"
                        autoComplete="current-password"
                    />
                    <div className="flex items-center justify-between gap-4">
                        <Checkbox
                            id="rememberme"
                            name="remember"
                            value="1"
                            label={
                                <span className="text-link-sm font-normal text-neutral-800">
                                    Remember Me
                                </span>
                            }
                        />
                        <TextButton
                            type="link"
                            href="/cms/forgot-password"
                            className="text-link-sm font-semibold text-primary-300 transition-colors hover:text-primary-500"
                        >
                            Forgot Password ?
                        </TextButton>
                    </div>
                    <Button type="submit" disabled={processing} className="w-full">
                        {processing ? "Signing in..." : "Sign In"}
                    </Button>
                </>
            )}
        </Form>
    );
};

SignIn.layout = (page: React.ReactNode) => <AuthLayout pageTitle="Log In">{page}</AuthLayout>;

export default SignIn;
