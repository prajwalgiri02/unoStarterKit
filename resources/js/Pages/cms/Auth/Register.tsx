import { Form, Link } from '@inertiajs/react'

import AuthLayout from '@/Layouts/AuthLayout'
import Input from '@/Components/Form/Input'
import Button from '@/Components/Form/Button'

export default function Register() {
  return (
    <AuthLayout>
      <h2 className="mb-2 text-lg font-semibold text-gray-900">
        Create your account
      </h2>

      <p className="mb-6 text-sm text-gray-500">
        Enter your details to create a new account.
      </p>

      <Form
        action="/cms/register"
        method="post"
        resetOnSuccess={['password', 'password_confirmation']}
      >
        {({ errors, processing }) => (
          <div className="space-y-4">
            <Input
              name="name"
              label="Full name"
              placeholder="Enter your full name"
              autoComplete="name"
              error={errors.name}
              autoFocus
              required
            />

            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
              required
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                name="password"
                type="password"
                label="Password"
                placeholder="Enter your password"
                autoComplete="new-password"
                error={errors.password}
                required
              />

              <Input
                name="password_confirmation"
                type="password"
                label="Confirm password"
                placeholder="Confirm your password"
                autoComplete="new-password"
                error={errors.password_confirmation}
                required
              />
            </div>

            <Button
              type="submit"
              loading={processing}
              loadingText="Creating account..."
              fullWidth
            >
              Create account
            </Button>
          </div>
        )}
      </Form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link
          href="/cms/login"
          className="font-medium text-gray-900 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}