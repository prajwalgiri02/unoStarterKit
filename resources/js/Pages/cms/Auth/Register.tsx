import PrimaryButton from "@/components/buttons/primary-button";
import EmailInput from "@/components/inputs/email-input";
import PasswordInput from "@/components/inputs/password-input";
import TextInput from "@/components/inputs/text-input";
import AuthLayout from "@/layouts/auth-layout";
import { Form, Link } from "@inertiajs/react";

const Register = () => {
    return (
        <Form
            id="registerForm"
            action="/cms/register"
            method="post"
            validationTimeout={500}
            disableWhileProcessing
        >
            {({ processing }) => (
                <>
                    <div className="d-flex flex-column gap-4">
                        <TextInput
                            id="name"
                            name="name"
                            label="Full Name"
                            placeholder="Enter your full name"
                            autoComplete="name"
                            required
                        />
                        <EmailInput
                            className="input-giant body-xs"
                            skipBlurValidation
                        />
                        <PasswordInput confirmed />
                    </div>
                    <div className="d-flex flex-column gap-4 mt-40">
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? "Creating account..." : "Register"}
                        </PrimaryButton>
                    </div>
                </>
            )}
        </Form>
    );
};

Register.layout = (page: React.ReactNode) => (
    <AuthLayout
        headerTitle="Create your account"
        headerDescription="Enter your details to create a new account."
        goBack={true}
        goBackLabelText="Back to Login"
        goBackUrl="/cms/login"
    >
        {page}
    </AuthLayout>
);

export default Register;
